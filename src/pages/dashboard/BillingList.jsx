"use client";

import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../api/axios";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../../components/ui/dialog";
import { Loader2 } from "lucide-react";

// Map subscription status to colors
const STATUS_COLORS = {
  Active: "bg-green-100 text-green-800",
  Expiring: "bg-yellow-100 text-yellow-800",
  Expired: "bg-red-100 text-red-800",
  Inactive: "bg-gray-100 text-gray-600",
};

export default function BillingList() {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tenants and their stats
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching tenants...");
        const res = await axiosInstance.get("/tenants");
        console.log("Raw tenants API response:", res.data);
        
        // Handle different response structures
        const tenantsData = res.data.data || res.data || [];
        
        if (!Array.isArray(tenantsData)) {
          throw new Error("Invalid response format: expected an array");
        }

        console.log(`Found ${tenantsData.length} tenants`);

        // Fetch stats for each tenant
        const tenantsWithStats = await Promise.all(
          tenantsData.map(async (tenantItem) => {
            try {
              // Handle different response structures
              const tenant = tenantItem.tenant || tenantItem;
              const admin = tenantItem.admin;
              
              if (!tenant || !tenant._id) {
                console.warn("Invalid tenant data:", tenantItem);
                return { 
                  tenant: { 
                    ...tenant, 
                    usersCount: 0, 
                    projectCount: 0,
                    usedStorageMB: 0,
                    isSubscriptionActive: false 
                  }, 
                  admin 
                };
              }

              // Fetch stats for this tenant
              console.log(`Fetching stats for tenant ${tenant._id}...`);
              const statsRes = await axiosInstance.get(`/tenants/${tenant._id}/stats`);
              console.log(`Stats response for ${tenant._id}:`, statsRes.data);
              
              const statsData = statsRes.data;
              
              // Use the actual data structure from the API response
              return { 
                tenant: { 
                  ...tenant,
                  // Use the plan data from stats response if available, otherwise fallback
                  planId: statsData.plan || tenant.planId || { name: "Free Plan", price: 0 },
                  // Use the actual stats field names from the API
                  usersCount: statsData.stats?.usersCount || 0,
                  projectCount: statsData.stats?.projectCount || 0,
                  usedStorageMB: 0, // Not provided in the stats response
                  // Subscription data
                  isSubscriptionActive: tenant.isSubscriptionActive || false,
                  subscriptionStartDate: tenant.subscriptionStartDate,
                  subscriptionEndDate: tenant.subscriptionEndDate,
                }, 
                admin 
              };
            } catch (err) {
              console.error(`Failed to fetch stats for tenant: ${tenant._id}`, err);
              // Return tenant with default stats
              return { 
                tenant: { 
                  ...tenant, 
                  usersCount: 0, 
                  projectCount: 0,
                  usedStorageMB: 0,
                  isSubscriptionActive: tenant.isSubscriptionActive || false,
                  planId: tenant.planId || { name: "Free Plan", price: 0 }
                }, 
                admin 
              };
            }
          })
        );

        console.log("Final processed tenants:", tenantsWithStats);
        setTenants(tenantsWithStats);
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Compute subscription status with safe date handling
  const getStatus = (tenant) => {
    // If subscription is explicitly inactive
    if (tenant.isSubscriptionActive === false) return "Inactive";
    
    try {
      const now = new Date();
      const end = tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate) : null;
      
      // If no end date, check if there's a plan (active subscription)
      if (!end || isNaN(end.getTime())) {
        return tenant.planId && tenant.planId.name !== "Free Plan" ? "Active" : "Inactive";
      }
      
      if (end < now) return "Expired";
      
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7) return "Expiring";
      return "Active";
    } catch (error) {
      console.error("Error calculating subscription status for tenant:", tenant._id, error);
      return "Inactive";
    }
  };

  // Safe value getter with fallbacks
  const getSafeValue = (obj, path, defaultValue = "N/A") => {
    try {
      const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
      return value ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Format price display
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price; // Convert cents to dollars
    }
    return `$${price || 0}`;
  };

  // Filter tenants by search and status
  const filteredTenants = useMemo(() => {
    return tenants.filter(({ tenant, admin }) => {
      const searchMatch =
        getSafeValue(tenant, 'name', '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSafeValue(admin, 'name', '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSafeValue(admin, 'email', '').toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === "all" || getStatus(tenant) === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [tenants, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading tenants...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          Error: {error}
          <Button 
            onClick={() => window.location.reload()} 
            className="ml-4"
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Subscription & Billing Management</h2>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Showing {filteredTenants.length} of {tenants.length} tenants
          {tenants.length > 0 && (
            <>
              <br />
              Sample: {getSafeValue(tenants[0].tenant, 'name')} - 
              Plan: {getSafeValue(tenants[0].tenant, 'planId.name')} - 
              Users: {getSafeValue(tenants[0].tenant, 'usersCount')} - 
              Projects: {getSafeValue(tenants[0].tenant, 'projectCount')}
            </>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          placeholder="Search company or admin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.keys(STATUS_COLORS).map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                  {tenants.length === 0 ? "No tenants available." : "No tenants match your filters."}
                </TableCell>
              </TableRow>
            )}
            {filteredTenants.map(({ tenant, admin }) => {
              const status = getStatus(tenant);
              return (
                <TableRow key={tenant._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{getSafeValue(tenant, 'name', 'Unknown')}</TableCell>
                  <TableCell>{getSafeValue(tenant, 'planId.name', 'Free Plan')}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${STATUS_COLORS[status] || STATUS_COLORS.Inactive}`}>
                      {status}
                    </span>
                  </TableCell>
                  <TableCell>{getSafeValue(tenant, 'usersCount', 0)}</TableCell>
                  <TableCell>{getSafeValue(tenant, 'projectCount', 0)}</TableCell>
                  <TableCell>{getSafeValue(admin, 'name', 'N/A')}</TableCell>
                  <TableCell>{formatPrice(getSafeValue(tenant, 'planId.price', 0))}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedTenant({ tenant, admin })}
                      variant="outline"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      {selectedTenant && (
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="max-w-lg w-full p-6 rounded-lg">
            <DialogHeader>
              <DialogTitle>
                {getSafeValue(selectedTenant.tenant, 'name', 'Unknown')} - Billing Details
              </DialogTitle>
              <DialogClose onClick={() => setSelectedTenant(null)} />
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Plan Details</p>
                  <p><strong>Plan:</strong> {getSafeValue(selectedTenant.tenant, 'planId.name', 'Free Plan')}</p>
                  <p><strong>Max Users:</strong> {getSafeValue(selectedTenant.tenant, 'planId.maxUsers', 1)}</p>
                  <p><strong>Max Projects:</strong> {getSafeValue(selectedTenant.tenant, 'planId.maxProjects', 1)}</p>
                  <p><strong>Max Storage:</strong> {getSafeValue(selectedTenant.tenant, 'planId.maxStorageMB', 500)} MB</p>
                  <p><strong>Price:</strong> {formatPrice(getSafeValue(selectedTenant.tenant, 'planId.price', 0))}</p>
                </div>
                <div>
                  <p className="font-semibold">Usage</p>
                  <p><strong>Current Users:</strong> {getSafeValue(selectedTenant.tenant, 'usersCount', 0)}</p>
                  <p><strong>Current Projects:</strong> {getSafeValue(selectedTenant.tenant, 'projectCount', 0)}</p>
                  <p><strong>Remaining Users:</strong> {getSafeValue(selectedTenant.tenant, 'planId.maxUsers', 1) - getSafeValue(selectedTenant.tenant, 'usersCount', 0)}</p>
                  <p><strong>Remaining Projects:</strong> {getSafeValue(selectedTenant.tenant, 'planId.maxProjects', 1) - getSafeValue(selectedTenant.tenant, 'projectCount', 0)}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold">Subscription & Admin</p>
                <p><strong>Admin:</strong> {getSafeValue(selectedTenant.admin, 'name', 'N/A')} ({getSafeValue(selectedTenant.admin, 'email', 'N/A')})</p>
                <p><strong>Subscription Active:</strong> {getSafeValue(selectedTenant.tenant, 'isSubscriptionActive') ? "Yes" : "No"}</p>
                <p><strong>Start Date:</strong> {selectedTenant.tenant.subscriptionStartDate ? new Date(selectedTenant.tenant.subscriptionStartDate).toLocaleDateString() : "-"}</p>
                <p><strong>End Date:</strong> {selectedTenant.tenant.subscriptionEndDate ? new Date(selectedTenant.tenant.subscriptionEndDate).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}