import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Plus,
  Pencil,
  Trash,
  Search,
  AlertCircle,
  RefreshCw,
  Calendar,
  Loader2,
  Building,
  Download,
} from "lucide-react";
import axiosInstance from "../../api/axios.js";
import TenantForm from "./TenantForm";

export default function TenantP() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Fetch tenants, plans, and tenant stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch tenants and plans
      const [tenantsRes, plansRes] = await Promise.all([
        axiosInstance.get("/tenants"),
        axiosInstance.get("/plans"),
      ]);

      const fetchedTenants = tenantsRes.data;
      const fetchedPlans = plansRes.data.plans || [];

      // Fetch users/project stats for each tenant
      const tenantsWithStats = await Promise.all(
        fetchedTenants.map(async (item) => {
          try {
            const statsRes = await axiosInstance.get(
              `/tenants/${item.tenant._id}/stats`
            );
            console.log(statsRes.data.stats);
            const stats = statsRes.data.stats;
            return {
              ...item,
              createdUsers: stats.usersCount,
              createdProjects: stats.projectCount,
            };
          } catch (err) {
            console.error("Failed to fetch stats for tenant:", item.tenant._id);
            return { ...item, createdUsers: 0, createdProjects: 0 };
          }
        })
      );

      // Assign default plan if missing
      const defaultPlan =
        fetchedPlans.find((plan) => plan.isDefault) ||
        fetchedPlans.find((plan) => plan.name?.toLowerCase() === "free") ||
        null;

      const tenantsWithDefault = tenantsWithStats.map((item) => {
        if (!item.tenant.planId && defaultPlan) item.tenant.planId = defaultPlan;
        return item;
      });

      setTenants(tenantsWithDefault);
      setPlans(fetchedPlans);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 401
          ? "Authentication failed. Please check your credentials."
          : "Failed to load data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete Tenant
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant and all associated users?"))
      return;

    try {
      setDeletingId(id);
      await axiosInstance.delete(`/tenants/${id}`);
      setTenants((prev) => prev.filter((t) => t.tenant._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete tenant");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTenant(null);
  };

  const handleFormSuccess = () => {
    fetchData();
    handleFormClose();
  };

  // Determine Subscription Status
  const getSubscriptionStatus = (tenant) => {
    if (!tenant.isSubscriptionActive) {
      return { status: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-300" };
    }
    const now = new Date();
    const endDate = new Date(tenant.subscriptionEndDate);
    if (endDate < now) return { status: "Expired", color: "bg-red-100 text-red-700 border-red-300" };
    const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) return { status: "Expiring Soon", color: "bg-orange-100 text-orange-700 border-orange-300" };
    return { status: "Active", color: "bg-green-100 text-green-700 border-green-300" };
  };

  // Filtered tenants
  const filteredTenants = tenants.filter((item) => {
    const term = (search ?? "").toLowerCase();
    const tenant = item.tenant;
    const admin = item.admin;
    const matchesSearch =
      String(tenant?.name ?? "").toLowerCase().includes(term) ||
      String(admin?.name ?? "").toLowerCase().includes(term) ||
      String(admin?.email ?? "").toLowerCase().includes(term);

    const status = getSubscriptionStatus(tenant).status;
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats calculation
  const stats = {
    total: tenants.length,
    active: tenants.filter((item) => getSubscriptionStatus(item.tenant).status === "Active").length,
    expiring: tenants.filter((item) => getSubscriptionStatus(item.tenant).status === "Expiring Soon").length,
    expired: tenants.filter((item) => getSubscriptionStatus(item.tenant).status === "Expired").length,
  };

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading tenants...
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={fetchData} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-black">Tenant Management</h1>
            <p className="text-black">Manage all tenants and their subscription plans</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Tenant
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building className="w-6 h-6 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">{stats.expiring}</p>
              </div>
              <Calendar className="w-6 h-6 text-orange-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-600" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tenants by name, admin, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>{filteredTenants.length} tenants found</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((item) => {
                    const tenant = item.tenant;
                    const admin = item.admin;
                    const status = getSubscriptionStatus(tenant);
                    return (
                      <TableRow key={tenant._id}>
                        <TableCell>
                          <div className="font-semibold">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.location || "No location"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{admin?.name}</div>
                          <div className="text-sm text-gray-500">{admin?.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-50">
                            {tenant.planId?.name || "Default Plan"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {tenant.subscriptionStartDate ? (
                            <>
                              <div>Start: {new Date(tenant.subscriptionStartDate).toLocaleDateString()}</div>
                              <div>End: {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : "N/A"}</div>
                            </>
                          ) : (
                            "No subscription"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            Users: {item.createdUsers || 0}/{tenant.planId?.maxUsers || "∞"}
                          </div>
                          <div className="text-sm">
                            Projects: {item.createdProjects || 0}/{tenant.planId?.maxProjects || "∞"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${status.color}`}>{status.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(tenant._id)}
                              disabled={deletingId === tenant._id}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              {deletingId === tenant._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredTenants.length === 0 && (
              <div className="text-center py-12 text-gray-500">No tenants found</div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Form */}
        <TenantForm
          open={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          tenant={editingTenant}
          plans={plans}
        />
      </div>
    </div>
  );
}
