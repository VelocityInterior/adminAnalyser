import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { toast } from "react-hot-toast";

export default function AddTenant() {
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    city: "",
    planId: "", // store plan _id
  });

  const [plans, setPlans] = useState([]); // list of plans from backend
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosInstance.get("/plans");
        setPlans(res.data); // assume backend returns array of plans [{_id, name}]
      } catch (err) {
        console.error(err);
        toast.error("Failed to load plans");
      }
    };
    fetchPlans();
  }, []);

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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.ownerName || !form.ownerEmail || !form.phone || !form.city || !form.planId) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/tenants/create", form, { withCredentials: true });
      toast.success("Tenant created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">Add New Tenant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <Label>Company Name</Label>
          <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Enter company name" />
        </div>

        <div>
          <Label>Owner Name</Label>
          <Input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Enter owner name" />
        </div>

        <div>
          <Label>Owner Email</Label>
          <Input type="email" name="ownerEmail" value={form.ownerEmail} onChange={handleChange} placeholder="Enter owner email" />
        </div>

        <div>
          <Label>Phone</Label>
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
        </div>

        <div>
          <Label>City</Label>
          <Input name="city" value={form.city} onChange={handleChange} placeholder="Enter city" />
        </div>

        <div>
          <Label>Plan</Label>
          <Select
            value={form.planId}
            onValueChange={(value) => setForm({ ...form, planId: value })}
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
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Tenant"}</Button>
        </div>

      </form>
    </div>
  );
}
