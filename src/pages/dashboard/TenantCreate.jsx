
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Plus, Pencil, Trash, Search, AlertCircle, RefreshCw } from "lucide-react";
import axiosInstance from "../../api/axios.js";
import TenantForm from "./TenantForm"

export default function TenantP() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
      setPlans(plansRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 401 
        ? "Authentication failed. Please check your credentials." 
        : "Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  console.log(tenants)

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant and all associated users?")) return;
    
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

  const filteredTenants = tenants.filter((item) => {
    const term = (search ?? "").toLowerCase();
    const tenant = item.tenant;
    const admin = item.admin;
    return (
      String(tenant?.name ?? "").toLowerCase().includes(term) ||
      String(admin?.name ?? "").toLowerCase().includes(term) ||
      String(admin?.email ?? "").toLowerCase().includes(term)
    );
  });

  const LoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(9)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-6 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
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
  );

  if (loading) return (
    <div className="p-6 space-y-6">
      <LoadingSkeleton />
    </div>
  );

  if (error)
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mb-4">
            {error}
          </AlertDescription>
          <Button onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </Alert>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-red-500">Tenant Management</h1>
          <p className="text-muted-foreground">
            Manage all tenants and their subscription plans
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="md:ml-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Tenant
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Tenants</CardTitle>
              <CardDescription>
                {filteredTenants.length} {filteredTenants.length === 1 ? 'tenant' : 'tenants'} found
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((item) => {
                    const tenant = item.tenant;
                    const admin = item.admin;
                    const usagePercentageUsers = tenant.planId?.maxUsers 
                      ? Math.round((tenant.createdUsers / tenant.planId.maxUsers) * 100)
                      : 0;
                    const usagePercentageProjects = tenant.planId?.maxProjects 
                      ? Math.round((tenant.createdProjects / tenant.planId.maxProjects) * 100)
                      : 0;
                    
                    return (
                      <TableRow key={tenant._id}>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell>{admin?.name || "N/A"}</TableCell>
                        <TableCell>{admin?.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tenant.planId?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{tenant.location || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{tenant.createdUsers || 0}/{tenant.planId?.maxUsers || "∞"}</span>
                            {tenant.planId?.maxUsers && (
                              <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    usagePercentageUsers >= 90 ? 'bg-destructive' : 
                                    usagePercentageUsers >= 75 ? 'bg-amber-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(usagePercentageUsers, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{tenant.createdProjects || 0}/{tenant.planId?.maxProjects || "∞"}</span>
                            {tenant.planId?.maxProjects && (
                              <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    usagePercentageProjects >= 90 ? 'bg-destructive' : 
                                    usagePercentageProjects >= 75 ? 'bg-amber-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(usagePercentageProjects, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={admin?.status === "Active" ? "default" : "secondary"}
                            className={
                              admin?.status === "Active" 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {admin?.status || "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(tenant._id)}
                              disabled={deletingId === tenant._id}
                              className="h-8 w-8 p-0"
                            >
                              {deletingId === tenant._id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
                        <Search className="h-10 w-10" />
                        <p className="text-lg font-medium">
                          {search ? "No tenants match your search" : "No tenants found"}
                        </p>
                        <p className="text-sm">
                          {search ? "Try adjusting your search term" : "Get started by adding a new tenant"}
                        </p>
                        {!search && (
                          <Button onClick={() => setShowForm(true)} className="mt-2">
                            <Plus className="w-4 h-4 mr-2" /> Add Tenant
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TenantForm
        open={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        tenant={editingTenant}
        plans={plans}
      />
    </div>
  );
}

