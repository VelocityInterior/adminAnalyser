"use client";

import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../components/ui/dialog";

const STATUS_COLORS = {
  Active: "bg-green-100 text-green-800",
  Trial: "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-gray-100 text-gray-600",
  Overdue: "bg-red-100 text-red-800",
};

export default function BillingList() {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Fetch tenants from API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axiosInstance.get("/tenants");
        setTenants(res.data);
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
      }
    };
    fetchTenants();
  }, []);

  // Prepare plans for filter dropdown
  const plansArray = useMemo(() => {
    if (!tenants) return [];
    return tenants.map(({ tenant }) => tenant.planId);
  }, [tenants]);

  const filteredPlans = useMemo(() => {
    const planMap = {};
    plansArray.forEach(plan => {
      if (!planMap[plan.name]) planMap[plan.name] = plan;
      else {
        if (new Date(plan.createdAt) > new Date(planMap[plan.name].createdAt)) {
          planMap[plan.name] = plan;
        }
      }
    });
    return Object.values(planMap);
  }, [plansArray]);

  // Filter tenants by search term and selected plan
  const filteredTenants = tenants.filter(({ tenant }) => {
    const matchSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = statusFilter === "all" ? true : tenant.planId.name === statusFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">Subscription & Billing Management</h2>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          placeholder="Search company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {filteredPlans.map((plan) => (
              <SelectItem key={plan._id} value={plan.name}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Storage (MB)</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                  No tenants found.
                </TableCell>
              </TableRow>
            )}
            {filteredTenants.map(({ tenant, admin }) => (
              <TableRow
                key={tenant._id}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.planId.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      STATUS_COLORS[tenant.planId.name] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tenant.planId.name}
                  </span>
                </TableCell>
                <TableCell>{tenant.createdUsers}</TableCell>
                <TableCell>{tenant.createdProjects}</TableCell>
                <TableCell>{tenant.usedStorageMB}</TableCell>
                <TableCell>{admin?.name}</TableCell>
                <TableCell>{tenant.planId.price}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => setSelectedTenant({ tenant, admin })}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for details */}
      {selectedTenant && (
        <Dialog
          open={!!selectedTenant}
          onOpenChange={() => setSelectedTenant(null)}
        >
          <DialogContent className="max-w-md w-full p-6 rounded-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedTenant.tenant.name} - Billing Details
              </DialogTitle>
              <DialogClose onClick={() => setSelectedTenant(null)} />
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <p><strong>Location:</strong> {selectedTenant.tenant.location}</p>
              <p><strong>Plan:</strong> {selectedTenant.tenant.planId.name}</p>
              <p><strong>Max Users:</strong> {selectedTenant.tenant.planId.maxUsers}</p>
              <p><strong>Max Projects:</strong> {selectedTenant.tenant.planId.maxProjects}</p>
              <p><strong>Max Storage:</strong> {selectedTenant.tenant.planId.maxStorageMB} MB</p>
              <p><strong>Price:</strong> {selectedTenant.tenant.planId.price}</p>
              <p>
                <strong>Admin:</strong> {selectedTenant.admin?.name} ({selectedTenant.admin?.email})
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
