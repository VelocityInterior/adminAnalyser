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
import { Plus, Pencil, Trash, ArrowUpDown } from "lucide-react";
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    maxUsers: "",
    maxProjects: "",
    maxStorageMB: "",
    price: "",
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
      setError(
        err.response?.data?.message || "Failed to load plans. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this plan? This might affect existing tenants."
      )
    )
      return;
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
    });
    setFormError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  if (loading && plans.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-500">Plan Management</h1>
        <div className="flex space-x-2">
          <Button onClick={toggleSort} variant="outline" size="sm">
            <ArrowUpDown className="w-4 h-4 mr-1" />
            {sortAsc ? "Price Desc" : "Price Asc"}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Plan
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button className="mt-2" onClick={fetchPlans}>
            Try Again
          </Button>
        </div>
      )}

      {/* Plans Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan._id}
            className="border hover:shadow-lg transition-all duration-200"
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-xl font-semibold mt-2">
                ₹{plan.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <ul className="mb-4 space-y-2">
                <li className="text-sm text-gray-700">• {plan.maxUsers} Users</li>
                <li className="text-sm text-gray-700">
                  • {plan.maxProjects} Projects
                </li>
                <li className="text-sm text-gray-700">
                  • {plan.maxStorageMB}MB Storage
                </li>
              </ul>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plan._id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Add New Plan"}</DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users *</Label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxProjects">Max Projects *</Label>
                  <Input
                    id="maxProjects"
                    name="maxProjects"
                    type="number"
                    min="1"
                    value={formData.maxProjects}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStorageMB">Storage (MB) *</Label>
                  <Input
                    id="maxStorageMB"
                    name="maxStorageMB"
                    type="number"
                    min="1"
                    value={formData.maxStorageMB}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleFormClose}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Plan;
