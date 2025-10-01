import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash,
  ArrowUpDown,
  Users,
  Folder,
  Database,
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import axiosInstance from "../../api/axios.js";

function Plan() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    maxUsers: "",
    maxProjects: "",
    maxStorageMB: "",
    price: "",
    currency: "INR",
    billingCycle: "monthly",
    razorpayPlanId: "",
    isActive: true,
  });

  // Fetch plans
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/plans");
      const sortedPlans = (response.data.plans || response.data).sort(
        (a, b) => a.price - b.price
      );
      setPlans(sortedPlans);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.response?.data?.message || "Failed to load plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axiosInstance.delete(`/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting plan:", err);
      alert(err.response?.data?.message || "Failed to delete plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorageMB: plan.maxStorageMB,
      price: plan.price,
      currency: plan.currency || "INR",
      billingCycle: plan.billingCycle || "monthly",
      razorpayPlanId: plan.razorpayPlanId || "",
      isActive: plan.isActive ?? true,
    });
    setShowForm(true);
    setFormError("");
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      name: "",
      maxUsers: "",
      maxProjects: "",
      maxStorageMB: "",
      price: "",
      currency: "INR",
      billingCycle: "monthly",
      razorpayPlanId: "",
      isActive: true,
    });
    setFormError("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      if (editingPlan) {
        await axiosInstance.put(`/plans/${editingPlan._id}`, formData);
      } else {
        await axiosInstance.post("/plans", formData);
      }
      fetchPlans();
      handleFormClose();
    } catch (err) {
      console.error("Error saving plan:", err);
      setFormError(err.response?.data?.message || "Failed to save plan");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleSort = () => {
    setSortAsc(!sortAsc);
    setPlans((prev) =>
      [...prev].sort((a, b) => (sortAsc ? b.price - a.price : a.price - b.price))
    );
  };

  // Filter and search plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.razorpayPlanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && plan.isActive) ||
                         (statusFilter === "inactive" && !plan.isActive);
    return matchesSearch && matchesStatus;
  });

  const getBillingCycleColor = (cycle) => {
    switch (cycle) {
      case "monthly": return "bg-blue-100 text-blue-800";
      case "quarterly": return "bg-green-100 text-green-800";
      case "annually": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Loading Skeleton
  const PlanCardSkeleton = () => (
    <Card className="border border-gray-200 animate-pulse">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading && plans.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Plan Management</h1>
          <p className="text-gray-600">
            Create and manage subscription plans for your tenants
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={toggleSort} variant="outline" className="gap-2">
            <ArrowUpDown className="w-4 h-4" />
            {sortAsc ? "Price: High to Low" : "Price: Low to High"}
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" />
            Add New Plan
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      {/* <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plans by name or Razorpay ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchPlans} className="border-red-300 text-red-700">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card 
            key={plan._id} 
            className={`border hover:shadow-lg transition-all duration-200 ${
              !plan.isActive ? "opacity-60 bg-gray-50" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                <Badge 
                  variant={plan.isActive ? "default" : "secondary"} 
                  className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <IndianRupee className="w-4 h-4 text-gray-600" />
                <CardDescription className="text-2xl font-bold text-black">
                  {plan.price}
                </CardDescription>
                <Badge variant="outline" className={`ml-2 ${getBillingCycleColor(plan.billingCycle)}`}>
                  {plan.billingCycle}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{plan.maxUsers} Users</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Folder className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{plan.maxProjects} Projects</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{plan.maxStorageMB} MB Storage</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Razorpay: {plan.razorpayPlanId}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(plan)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(plan._id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <Folder className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">No plans found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first plan"
                }
              </p>
              {(searchTerm || statusFilter !== "all") ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Plan Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Starter, Professional, Enterprise"
                  required
                  className="focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers" className="text-sm font-medium">Max Users *</Label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    placeholder="10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxProjects" className="text-sm font-medium">Max Projects *</Label>
                  <Input
                    id="maxProjects"
                    name="maxProjects"
                    type="number"
                    min="0"
                    value={formData.maxProjects}
                    onChange={handleInputChange}
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStorageMB" className="text-sm font-medium">Storage (MB) *</Label>
                  <Input
                    id="maxStorageMB"
                    name="maxStorageMB"
                    type="number"
                    min="0"
                    value={formData.maxStorageMB}
                    onChange={handleInputChange}
                    placeholder="1024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="999.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">Currency *</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCycle" className="text-sm font-medium">Billing Cycle *</Label>
                  <select
                    id="billingCycle"
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="razorpayPlanId" className="text-sm font-medium">Razorpay Plan ID *</Label>
                <Input
                  id="razorpayPlanId"
                  name="razorpayPlanId"
                  value={formData.razorpayPlanId}
                  onChange={handleInputChange}
                  placeholder="plan_XXXXXXXXXXXXXX"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Active Plan
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleFormClose} 
                disabled={formLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {formLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingPlan ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  editingPlan ? "Update Plan" : "Create Plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Plan;