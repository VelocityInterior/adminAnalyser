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
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Plus,
  Pencil,
  Trash,
  Search,
  AlertCircle,
  RefreshCw,
  Calendar,
  CreditCard,
  Loader2,
  Building,
  Users,
  Folder,
  Database,
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import axiosInstance from "../../api/axios.js";
import TenantForm from "./TenantForm";
import PlanChangeDialog from "./tenantPlans";

export default function TenantP() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planUpdating, setPlanUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tenantsRes, plansRes] = await Promise.all([
        axiosInstance.get("/tenants"),
        axiosInstance.get("/plans"),
      ]);
      setTenants(tenantsRes.data);
      setPlans(plansRes.data.plans);
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

  const handlePlanChange = (tenant) => {
    setSelectedTenant(tenant);
    setShowPlanDialog(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTenant(null);
  };

  const handlePlanDialogClose = () => {
    setShowPlanDialog(false);
    setSelectedTenant(null);
  };

  const handleFormSuccess = () => {
    fetchData();
    handleFormClose();
  };

  const handlePlanChangeSuccess = async () => {
    setPlanUpdating(true);
    setTimeout(async () => {
      await fetchData();
      setPlanUpdating(false);
      handlePlanDialogClose();
    }, 5000);
  };

  const getSubscriptionStatus = (tenant) => {
    if (!tenant.isSubscriptionActive) {
      return {
        status: "Inactive",
        variant: "secondary",
        color: "bg-gray-100 text-gray-700 border-gray-300",
        textColor: "text-gray-700",
      };
    }
    const now = new Date();
    const endDate = new Date(tenant.subscriptionEndDate);
    if (endDate < now) {
      return {
        status: "Expired",
        variant: "destructive",
        color: "bg-red-100 text-red-700 border-red-300",
        textColor: "text-red-700",
      };
    }
    const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) {
      return {
        status: "Expiring Soon",
        variant: "default",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        textColor: "text-orange-700",
      };
    }
    return {
      status: "Active",
      variant: "default",
      color: "bg-green-100 text-green-700 border-green-300",
      textColor: "text-green-700",
    };
  };

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
    active: tenants.filter(item => getSubscriptionStatus(item.tenant).status === "Active").length,
    expiring: tenants.filter(item => getSubscriptionStatus(item.tenant).status === "Expiring Soon").length,
    expired: tenants.filter(item => getSubscriptionStatus(item.tenant).status === "Expired").length,
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(8)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <LoadingSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
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
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Tenant
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiring}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Filters and Search */}
        {/* <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tenants by name, admin, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-50 border-none"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Main Table */}
        <Card className="bg-white border">
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>
                  {filteredTenants.length} {filteredTenants.length === 1 ? 'tenant' : 'tenants'} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Company</TableHead>
                    <TableHead className="font-semibold text-gray-700">Admin</TableHead>
                    <TableHead className="font-semibold text-gray-700">Plan</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subscription</TableHead>
                    <TableHead className="font-semibold text-gray-700">Usage</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((item) => {
                    const tenant = item.tenant;
                    const admin = item.admin;
                    const subscriptionStatus = getSubscriptionStatus(tenant);
                    const subscriptionEndDate = tenant.subscriptionEndDate
                      ? new Date(tenant.subscriptionEndDate).toLocaleDateString()
                      : "N/A";

                    return (
                      <TableRow key={tenant._id} className="border-b hover:bg-gray-50/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{tenant.name}</div>
                              <div className="text-sm text-gray-500">{tenant.location || "No location"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{admin?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{admin?.email || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                              {tenant.planId?.name || "No Plan"}
                            </Badge>
                            {tenant.planId?.billingCycle && (
                              <div className="text-xs text-gray-500 capitalize">
                                {tenant.planId.billingCycle}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {tenant.subscriptionStartDate ? (
                              <>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  <span>Start: {new Date(tenant.subscriptionStartDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <CreditCard className="w-3 h-3" />
                                  <span>End: {subscriptionEndDate}</span>
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-500">No subscription</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span>{tenant.createdUsers || 0}/{tenant.planId?.maxUsers || "∞"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Folder className="w-3 h-3 text-gray-400" />
                              <span>{tenant.createdProjects || 0}/{tenant.planId?.maxProjects || "∞"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={subscriptionStatus.color}>
                            {subscriptionStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePlanChange(item)}
                              className="h-8 w-8 p-0"
                              title="Change Plan"
                            >
                              <CreditCard className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0"
                              title="Edit Tenant"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(tenant._id)}
                              disabled={deletingId === tenant._id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Tenant"
                            >
                              {deletingId === tenant._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash className="h-3 w-3" />
                              )}
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
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-sm">No tenants found</div>
                {(search || statusFilter !== "all") && (
                  <div className="text-gray-400 text-xs mt-1">
                    Try adjusting your search or filters
                  </div>
                )}
              </div>
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

        {/* Plan Change Dialog */}
        <PlanChangeDialog
          open={showPlanDialog}
          onClose={handlePlanDialogClose}
          onSuccess={handlePlanChangeSuccess}
          tenant={selectedTenant}
          plans={Array.isArray(plans) ? plans : []}
        />

        {/* Plan Update Overlay */}
        {/* {planUpdating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="p-6 w-80 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Updating Plan</h3>
              <p className="text-gray-600 text-sm">Please wait while we update the subscription plan...</p>
            </Card>
          </div>
        )} */}
      </div>
    </div>
  );
}