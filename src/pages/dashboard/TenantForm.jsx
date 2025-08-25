import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../api/axios.js";

export default function TenantForm({ open, onClose, onSuccess, tenant, plans }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: "",
    location: "",
    planId: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: ""
  });
  const plansArray = useMemo(() => {
    if (!plans) return [];
    if (plans.plans && Array.isArray(plans.plans)) {
      return plans.plans;
    }
    if (Array.isArray(plans)) {
      return plans;
    }
    
    console.warn("Unexpected plans structure:", plans);
    return [];
  }, [plans]);

  const filteredPlans = useMemo(() => {
    if (!plansArray || plansArray.length === 0) return [];
    
    // Group plans by name
    const planGroups = {};
    plansArray.forEach(plan => {
      if (!planGroups[plan.name]) {
        planGroups[plan.name] = [];
      }
      planGroups[plan.name].push(plan);
    });
    
    const result = [];
    Object.keys(planGroups).forEach(planName => {
      const groupPlans = planGroups[planName];
      groupPlans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      result.push(groupPlans[0]);
    });
    
    return result;
  }, [plansArray]);

  useEffect(() => {
    if (tenant && open) {
      setFormData({
        tenantName: tenant.tenant?.name || "",
        location: tenant.tenant?.location || "",
        planId: tenant.tenant?.planId?._id || "",
        adminName: tenant.admin?.name || "",
        adminEmail: tenant.admin?.email || "",
        adminPhone: tenant.admin?.phone || "",
        adminPassword: ""
      });
    } else if (open) {
      // Reset form when opening for a new tenant
      setFormData({
        tenantName: "",
        location: "",
        planId: "",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminPassword: ""
      });
    }
    setError("");
  }, [tenant, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, planId: value }));
  };

  const validateForm = () => {
    if (!formData.tenantName.trim()) {
      setError("Company name is required");
      return false;
    }
    if (!formData.planId) {
      setError("Please select a plan");
      return false;
    }
    if (!formData.adminName.trim()) {
      setError("Admin name is required");
      return false;
    }
    if (!formData.adminEmail.trim()) {
      setError("Admin email is required");
      return false;
    }
    if (!formData.adminPhone.trim()) {
      setError("Admin phone is required");
      return false;
    }
    
    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.adminPhone.replace(/\D/g, ''))) {
      setError("Please enter a valid phone number");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.adminEmail)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!tenant && !formData.adminPassword) {
      setError("Password is required for new tenants");
      return false;
    }
    
    // Password strength validation for new tenants
    if (!tenant && formData.adminPassword && formData.adminPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");

    // Match the payload structure to your backend API
    const payload = {
      tenantName: formData.tenantName, // Changed from "name" to "tenantName"
      location: formData.location,
      planId: formData.planId,
      adminUserData: {
        name: formData.adminName,
        email: formData.adminEmail,
        phone: formData.adminPhone,
        password: formData.adminPassword
      }
    };

    // Log the payload for debugging
    console.log("Submitting payload:", payload);

    try {
      let response;
      if (tenant) {
        // For updates, remove password if not provided
        if (!formData.adminPassword) {
          delete payload.adminUserData.password;
        }
        response = await axiosInstance.put(`/tenants/${tenant.tenant._id}`, payload);
        console.log("Update response:", response);
      } else {
        response = await axiosInstance.post("/tenants/create", payload);
        console.log("Create response:", response);
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving tenant:", err);
      
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        
        // Try to extract a more specific error message
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error ||
                            (err.response.data?.errors ? JSON.stringify(err.response.data.errors) : null) ||
                            "Failed to save tenant. Please try again.";
        
        setError(errorMessage);
      } else if (err.request) {

        console.error("Request data:", err.request);
        setError("No response received from server. Please check your connection.");
      } else {
        console.error("Error message:", err.message);
        setError("An unexpected error occurred: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{tenant ? "Edit Tenant" : "Add New Tenant"}</DialogTitle>
          <DialogDescription>
            {tenant ? "Update tenant and admin information." : "Fill in details to create a new tenant."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName" className="font-medium">Company Name *</Label>
              <Input 
                id="tenantName" 
                name="tenantName" 
                value={formData.tenantName} 
                onChange={handleChange} 
                placeholder="Enter company name"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="font-medium">Location</Label>
              <Input 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Enter location"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planId" className="font-medium">Subscription Plan *</Label>
            <Select 
              value={formData.planId} 
              onValueChange={handleSelectChange}
              disabled={loading || !filteredPlans || filteredPlans.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={filteredPlans && filteredPlans.length > 0 ? "Select a plan" : "Loading plans..."} />
              </SelectTrigger>
              <SelectContent>
                {filteredPlans && filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.name} - {(plan.price)}/mo - {plan.maxUsers} Users, {plan.maxProjects} Projects, {plan.maxStorageMB}MB Storage
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No plans available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {plansArray && plansArray.length > filteredPlans.length && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing the latest version of each plan ({filteredPlans.length} of {plansArray.length} total plans)
              </p>
            )}
            {(!filteredPlans || filteredPlans.length === 0) && (
              <p className="text-sm text-muted-foreground mt-1">
                No plans found. Please create plans first before adding tenants.
              </p>
            )}
          </div>

          <div className="pt-4 mt-2 border-t">
            <h3 className="font-medium text-lg mb-4">Admin User Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="font-medium">Full Name *</Label>
                <Input 
                  id="adminName" 
                  name="adminName" 
                  value={formData.adminName} 
                  onChange={handleChange} 
                  placeholder="Enter admin's full name"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="font-medium">Email *</Label>
                <Input 
                  id="adminEmail" 
                  name="adminEmail" 
                  type="email" 
                  value={formData.adminEmail} 
                  onChange={handleChange} 
                  placeholder="Enter admin's email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="adminPhone" className="font-medium">Phone *</Label>
                <Input 
                  id="adminPhone" 
                  name="adminPhone" 
                  value={formData.adminPhone} 
                  onChange={handleChange} 
                  placeholder="Enter admin's phone number"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="font-medium">
                  {tenant ? "New Password" : "Password *"}
                </Label>
                <div className="relative">
                  <Input 
                    id="adminPassword" 
                    name="adminPassword" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.adminPassword} 
                    onChange={handleChange} 
                    placeholder={tenant ? "Leave blank to keep current" : "Enter password (min. 8 characters)"}
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {tenant ? (
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to keep current password</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !filteredPlans || filteredPlans.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tenant ? "Update Tenant" : "Create Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


