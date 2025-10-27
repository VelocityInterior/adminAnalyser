"use client";

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { CreditCard, Loader2, Calendar, Clock } from "lucide-react";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";
import moment from "moment";

export default function PlanChangeDialog({
  open,
  onClose,
  onSuccess,
  tenant,
  plans,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activationType, setActivationType] = useState("scheduled");
  const [calculatedDates, setCalculatedDates] = useState({
    startDate: null,
    endDate: null,
  });

  const plansArray = Array.isArray(plans) ? plans : [];

  // Preselect first plan when dialog opens
  useEffect(() => {
    if (!tenant) return;
    setSelectedPlanId(plansArray[0]?._id || "");
    setActivationType(tenant?.planId ? "scheduled" : "immediate");
  }, [tenant, plansArray]);

  const selectedPlan = plansArray.find((p) => p._id === selectedPlanId);

  // Calculate new plan start/end date
  useEffect(() => {
    if (!selectedPlan || !tenant) return;

    const today = moment();
    let startDate, endDate;

    const daysToAdd =
      selectedPlan.billingCycle === "monthly"
        ? 30
        : selectedPlan.billingCycle === "quarterly"
        ? 90
        : 365;

    if (activationType === "immediate" || !tenant.planId) {
      startDate = today;
    } else {
      startDate = moment(tenant.planEndDate);
    }
    endDate = startDate.clone().add(daysToAdd, "days");

    setCalculatedDates({
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    });
  }, [selectedPlan, activationType, tenant]);

  // Handle form submit
  const handleSubmit = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        newPlanId: selectedPlanId,
        immediateActivation: activationType === "immediate",
      };

      // Include custom dates only if user changed them
      if (calculatedDates.startDate && calculatedDates.endDate) {
        payload.customStartDate = calculatedDates.startDate;
        payload.customEndDate = calculatedDates.endDate;
      }

      const res = await axiosInstance.post(
        `/tenants/${tenant.id}/shift-plan`,
        payload
      );

      if (res.data.activationType === "immediate") {
        toast.success("✅ Plan activated successfully!");
      } else {
        toast.success(
          `📅 Plan scheduled to start on ${moment(
            res.data.newPlanStartDate
          ).format("DD MMM YYYY")}`
        );
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to change plan");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPlanId("");
    setActivationType(tenant?.planId ? "scheduled" : "immediate");
    setCalculatedDates({ startDate: null, endDate: null });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Change Subscription Plan
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="space-y-4 py-4 overflow-y-auto">
          {/* Company Info */}
          <div className="space-y-2">
            <Label>Company</Label>
            <div className="p-3 border rounded bg-gray-50 font-medium">
              {tenant?.name || ""}
            </div>
          </div>

          {/* Current Plan */}
          {tenant?.plan && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-black">
              <h4 className="font-medium text-blue-900">Current Plan</h4>
              <div className="mt-1 text-sm">
                <div>
                  <strong>{tenant.plan}</strong>
                </div>
                <div>
                  Ends on:{" "}
                  {moment(tenant.planEndDate).format("DD MMM YYYY")}
                </div>
                <div className="text-blue-600 font-medium mt-1">
                  {moment(tenant.planEndDate).diff(moment(), "days")} days
                  remaining
                </div>
              </div>
            </div>
          )}

          {/* Select New Plan */}
          <div className="space-y-2">
            <Label>Select New Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {plansArray.map((plan) => (
                  <SelectItem key={plan._id} value={plan._id}>
                    <div className="flex justify-between w-full">
                      <span>{plan.name}</span>
                      <span className="text-gray-500 ml-2">
                        ₹{plan.price}/{plan.billingCycle}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activation Type */}
          {tenant?.planId && selectedPlan && (
            <div className="space-y-3">
              <Label>Activation Type</Label>
              <RadioGroup
                value={activationType}
                onValueChange={setActivationType}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Schedule for later</div>
                        <div className="text-sm text-gray-500">
                          Start after current plan ends on{" "}
                          {moment(tenant.planEndDate).format("DD MMM YYYY")}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Activate immediately</div>
                        <div className="text-sm text-gray-500">
                          Replace current plan now
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Plan Preview */}
          {selectedPlan && (
            <div className="p-4 bg-gray-50 border rounded-lg space-y-3 text-black">
              <h4 className="font-medium text-gray-900">Plan Details</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Price</div>
                  <div className="font-medium">
                    ₹{selectedPlan.price}/{selectedPlan.billingCycle}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Users</div>
                  <div className="font-medium">
                    {selectedPlan.maxUsers || "Unlimited"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Projects</div>
                  <div className="font-medium">
                    {selectedPlan.maxProjects || "Unlimited"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Storage</div>
                  <div className="font-medium">
                    {selectedPlan.maxStorageMB
                      ? `${selectedPlan.maxStorageMB} MB`
                      : "Unlimited"}
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div className="border-t pt-3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Auto Start Date:</span>
                  <span className="font-medium">
                    {calculatedDates.startDate
                      ? moment(calculatedDates.startDate).format("DD MMM YYYY")
                      : "Calculating..."}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Auto End Date:</span>
                  <span className="font-medium">
                    {calculatedDates.endDate
                      ? moment(calculatedDates.endDate).format("DD MMM YYYY")
                      : "Calculating..."}
                  </span>
                </div>

                {/* Custom date pickers */}
                <div className="space-y-2 mt-3">
                  <Label>Custom Subscription Dates (optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={
                          calculatedDates.startDate
                            ? moment(calculatedDates.startDate).format(
                                "YYYY-MM-DD"
                              )
                            : ""
                        }
                        onChange={(e) =>
                          setCalculatedDates((prev) => ({
                            ...prev,
                            startDate: moment(e.target.value).toDate(),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={
                          calculatedDates.endDate
                            ? moment(calculatedDates.endDate).format(
                                "YYYY-MM-DD"
                              )
                            : ""
                        }
                        onChange={(e) =>
                          setCalculatedDates((prev) => ({
                            ...prev,
                            endDate: moment(e.target.value).toDate(),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Leave blank to auto-calculate based on billing cycle.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-0 mt-4 flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedPlanId}
            className="min-w-24"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : activationType === "immediate" ? (
              "Change Now"
            ) : (
              "Schedule Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 