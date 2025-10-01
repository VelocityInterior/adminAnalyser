"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import axiosInstance from "../../api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Search, Building, CreditCard, Calendar, Users, Database, Eye } from "lucide-react";

export default function AdminBillingConsole() {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/tenants");

      const formattedTenants = (res.data || []).map((item) => ({
        ...item.tenant,
        admin: item.admin,
      }));

      setTenants(formattedTenants);
      await fetchPaymentHistory();
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const res = await axiosInstance.get("/payment-history");
      setPayments(res.data || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t?.name?.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus === "all"
        ? true
        : filterStatus === "Active"
        ? t.isSubscriptionActive
        : !t.isSubscriptionActive)
  );

  const getTenantPayments = (tenantId) => {
    return payments.filter((payment) => payment.tenantId?._id === tenantId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing Console</h1>
        <p className="text-gray-600 mt-1">
          Manage {tenants.length} tenant subscriptions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              placeholder="Search company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => {
                const tenantPayments = getTenantPayments(tenant._id);
                const successfulPayments = tenantPayments.filter(
                  (p) => p.paymentStatus === "success"
                );

                return (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.admin?.email}</div>
                        {tenant.admin?.phone && (
                          <div className="text-xs text-gray-400">{tenant.admin.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.planId?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          tenant.isSubscriptionActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tenant.isSubscriptionActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.subscriptionStartDate ? (
                        <div>
                          <div>Start: {moment(tenant.subscriptionStartDate).format("DD MMM YYYY")}</div>
                          {tenant.subscriptionEndDate && (
                            <div>End: {moment(tenant.subscriptionEndDate).format("DD MMM YYYY")}</div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.createdUsers || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.usedStorageMB ? `${tenant.usedStorageMB} MB` : "0 MB"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="text-center">
                        <div className="font-medium">{successfulPayments.length}</div>
                        <div className="text-xs text-gray-500">successful</div>
                        <div className="text-xs text-gray-400">Total: {tenantPayments.length}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTenant(tenant)}
                        disabled={tenantPayments.length === 0}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {tenants.length === 0 ? "No tenants found." : "No tenants matching your criteria."}
          </div>
        )}
      </div>

{/* Payment History Dialog */}
{/* Payment History Dialog */}
<Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
  <DialogContent className="max-w-10xl max-h-[90vh] flex flex-col">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>Payment History – {selectedTenant?.name}</DialogTitle>
      <p className="text-sm text-gray-600 mt-1">
        {getTenantPayments(selectedTenant?._id).length} payment records found
      </p>
    </DialogHeader>

    {/* Scrollable Table Container */}
    <div className="flex-1 overflow-auto mt-4 border border-gray-200 rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {["Payment ID", "Plan", "Amount", "Currency", "Status", "Date", "Order ID"].map(
              (header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {getTenantPayments(selectedTenant?._id)
            .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
            .map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {payment.razorpayPaymentId || payment._id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {payment.planId?.name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                  ₹{payment.amount?.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {payment.currency || "INR"}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      payment.paymentStatus === "success"
                        ? "bg-green-100 text-green-800"
                        : payment.paymentStatus === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {moment(payment.transactionDate).format("DD MMM YYYY HH:mm")}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {payment.razorpayOrderId}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {getTenantPayments(selectedTenant?._id).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No payment history found for this tenant.
        </div>
      )}
    </div>

    {/* Fixed Footer */}
    <div className="flex-shrink-0 flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Total Amount: ₹
        {getTenantPayments(selectedTenant?._id)
          .filter((p) => p.paymentStatus === "success")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0)
          .toLocaleString()}
      </div>
      <DialogClose asChild>
        <Button>Close</Button>
      </DialogClose>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
}