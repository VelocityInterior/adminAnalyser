import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { CalendarIcon, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";

export default function PlanChangeDialog({ open, onClose, onSuccess, tenant, plans }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plansArray = Array.isArray(plans) ? plans : [];

  useEffect(() => {
    if (!tenant) return;

    const planId = tenant.tenant?.planId?._id;
    const planCycle = tenant.tenant?.planId?.billingCycle || "monthly";

    if (planId) {
      setSelectedPlan(planId);
      setBillingCycle(planCycle);
    } else if (plansArray.length > 0) {
      setSelectedPlan(plansArray[0]._id);
      setBillingCycle(plansArray[0].billingCycle || "monthly");
    }

    if (tenant.tenant?.subscriptionEndDate) {
      setSubscriptionEndDate(new Date(tenant.tenant.subscriptionEndDate));
    } else {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      setSubscriptionEndDate(defaultDate);
    }
  }, [tenant, plansArray]);

  const calculateEndDate = (startDate, cycle) => {
    const date = new Date(startDate);
    switch (cycle) {
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date;
  };

  const handleBillingCycleChange = (cycle) => {
    setBillingCycle(cycle);
    if (subscriptionEndDate) {
      setSubscriptionEndDate(calculateEndDate(new Date(), cycle));
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !subscriptionEndDate) {
      toast.error("Please select a plan and subscription end date");
      return;
    }

    try {
      setLoading(true);
      
      // Add 5-second delay before making the API call
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const updateData = {
        planId: selectedPlan,
        billingCycle,
        subscriptionEndDate: subscriptionEndDate.toISOString(),
        isSubscriptionActive: true,
      };
      const response = await axiosInstance.put(`/tenants/${tenant.tenant._id}`, updateData);

      toast.success("Plan updated successfully! Payment history recorded.");
      onSuccess();

      // Optional: display latest payment history
      if (response.data?.tenant?.planId) {
        console.log("New plan:", response.data.tenant.planId);
      }

    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error.response?.data?.message || "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plansArray.find((plan) => plan._id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Change Subscription Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant</Label>
            <Input
              id="tenant"
              value={tenant?.tenant?.name || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Select Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {plansArray.map((plan) =>
                  plan._id ? (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price}/{plan.billingCycle}
                    </SelectItem>
                  ) : null
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-cycle">Billing Cycle</Label>
            <Select value={billingCycle} onValueChange={handleBillingCycleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subscription End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {subscriptionEndDate ? format(subscriptionEndDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={subscriptionEndDate}
                  onSelect={setSubscriptionEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedPlanData && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Plan Details:</h4>
              <div className="text-sm space-y-1">
                <div>Price: ₹{selectedPlanData.price}/{selectedPlanData.billingCycle}</div>
                <div>Users: {selectedPlanData.maxUsers || "Unlimited"}</div>
                <div>Projects: {selectedPlanData.maxProjects || "Unlimited"}</div>
                <div>Storage: {selectedPlanData.maxStorageMB || "Unlimited"} MB</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedPlan}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Plan...
              </>
            ) : (
              "Update Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}