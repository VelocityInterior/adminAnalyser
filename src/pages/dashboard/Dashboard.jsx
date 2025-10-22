// CompanyPlanManagement.jsx - UI Only (No functional changes)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaSync,
  FaEye,
  FaExclamationTriangle,
  FaClock,
  FaBan,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import PageContainer from "../../components/pageLayout/PageContainer";
import PlanChangeDialog from "./tenantPlans";
import { toast } from "react-hot-toast";
import { Skeleton } from "../../components/ui/skeleton";

// --- Enhanced Subscription Status Function ---
const getSubscriptionStatus = (tenant) => {
  const now = new Date();
  const endDate = new Date(tenant.subscriptionEndDate);

  // --- Plan inactive check ---
  if (!tenant.planId?.isActive) {
    return {
      status: "Plan Inactive",
      variant: "secondary",
      color: "bg-gray-500 text-white",
      icon: FaBan,
      textColor: "text-white",
    };
  }

  // --- Tenant inactive check ---
  if (!tenant.isSubscriptionActive) {
    return {
      status: "Inactive",
      variant: "destructive",
      color: "bg-red-500 text-white",
      icon: FaBan,
      textColor: "text-white",
    };
  }

  // --- Subscription expired ---
  if (endDate < now) {
    return {
      status: "Expired",
      variant: "destructive",
      color: "bg-red-600 text-white",
      icon: FaExclamationCircle,
      textColor: "text-white",
    };
  }

  // --- Expiring soon ---
  const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 7) {
    return {
      status: "Expiring Soon",
      variant: "default",
      color: "bg-orange-500 text-white",
      icon: FaClock,
      textColor: "text-orange-700",
    };
  }

  // --- Active subscription ---
  return {
    status: "Active",
    variant: "default",
    color: "bg-green-500 text-white",
    icon: FaCheckCircle,
    textColor: "text-green-700",
  };
};

// --- Main Component ---
export default function CompanyPlanManagement() {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const result = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
        c.ownerName.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, companies]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);
      setError(null);

      const [tenantRes, planRes] = await Promise.all([
        axiosInstance.get("/tenants"),
        axiosInstance.get("/plans"),
      ]);

      const mapped = tenantRes.data.map(({ tenant, admin }) => {
        const statusInfo = getSubscriptionStatus(tenant);
        return {
          id: tenant._id,
          name: tenant.name,
          plan: tenant.planId?.name || "Free",
          planId: tenant.planId?._id || null,
          planStartDate: tenant.subscriptionStartDate
            ? moment(tenant.subscriptionStartDate)
            : moment(),
          planEndDate: tenant.subscriptionEndDate
            ? moment(tenant.subscriptionEndDate)
            : moment().add(1, "month"),
          isSubscriptionActive: tenant.isSubscriptionActive,
          planIsActive: tenant.planId?.isActive ?? true,

          // Upcoming plan
          upcomingPlan: tenant.nextPlanId?.name || null,
          upcomingPlanStart: tenant.nextPlanStartDate
            ? moment(tenant.nextPlanStartDate)
            : null,
          upcomingPlanEnd: tenant.nextPlanEndDate
            ? moment(tenant.nextPlanEndDate)
            : null,

          maxUsers: tenant.planId?.maxUsers || "Unlimited",
          maxProjects: tenant.planId?.maxProjects || "Unlimited",
          ownerName: admin?.name || "",
          ownerEmail: admin?.email || "",
          ownerPhone: admin?.phone || "",
          status: statusInfo.status.toLowerCase(),
          statusInfo: statusInfo, // Store full status info
          createdAt: tenant.createdAt ? moment(tenant.createdAt) : moment(),
        };
      });

      setCompanies(mapped);
      setFiltered(mapped);
      setPlans(planRes.data.plans || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load company data. Please try again.");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/tenants/${selectedCompany.id}`);
      const updatedCompanies = companies.filter(
        (c) => c.id !== selectedCompany.id
      );
      setCompanies(updatedCompanies);
      setFiltered(updatedCompanies);
      setShowDeleteDialog(false);
      setSelectedCompany(null);
      toast.success("Company deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.error || "Failed to delete company");
    }
  };

  const refreshData = async () => {
    await fetchData(false);
    toast.success("Data refreshed successfully");
  };

  const calculateDaysLeft = (endDate, status) => {
    const now = moment();
    const diff = moment(endDate).diff(now, "days");
    
    if (status === 'expired' || diff < 0) {
      return (
        <Badge variant="destructive" className="whitespace-nowrap bg-red-600 text-white">
          <FaExclamationCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    } else if (diff <= 7) {
      return (
        <Badge
          variant="outline"
          className="bg-orange-500 text-white border-orange-600 whitespace-nowrap"
        >
          <FaClock className="w-3 h-3 mr-1" />
          {diff} days
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-green-500 text-white border-green-600 whitespace-nowrap"
        >
          <FaCheckCircle className="w-3 h-3 mr-1" />
          {diff} days
        </Badge>
      );
    }
  };

  const getPlanBadgeVariant = (planName) => {
    const planVariants = {
      Free: "outline",
      Basic: "secondary",
      Pro: "default",
      Enterprise: "destructive",
    };
    return planVariants[planName] || "outline";
  };

  // Enhanced Status Badge with Icons
  const getStatusBadge = (company) => {
    const statusConfig = {
      active: {
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
        icon: FaCheckCircle
      },
      "plan inactive": {
        variant: "secondary", 
        className: "bg-gray-500 text-white border-gray-600",
        icon: FaBan
      },
      expired: {
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700",
        icon: FaExclamationCircle
      },
      "expiring soon": {
        variant: "default",
        className: "bg-orange-500 text-white border-orange-600",
        icon: FaClock
      },
      inactive: {
        variant: "destructive",
        className: "bg-red-500 text-white border-red-600",
        icon: FaBan
      }
    };

    const config = statusConfig[company.status] || statusConfig.inactive;
    const IconComponent = config.icon;

    return (
      <Badge 
        variant={config.variant} 
        className={`capitalize flex items-center gap-1 w-fit ${config.className}`}
      >
        <IconComponent className="w-3 h-3" />
        {company.status}
      </Badge>
    );
  };

  // Enhanced Stats with better visibility
  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
    expiring: companies.filter((c) => c.status === "expiring soon").length,
    expired: companies.filter((c) => c.status === "expired").length,
    inactive: companies.filter((c) => c.status === "inactive").length,
    planInactive: companies.filter((c) => c.status === "plan inactive").length,
  };

  // Status Summary Cards
  const StatusSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        <div className="text-sm text-gray-600">Total Companies</div>
      </div>
      <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        <div className="text-sm text-green-600">Active</div>
      </div>
      <div className="bg-white border border-orange-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
        <div className="text-sm text-orange-600">Expiring Soon</div>
      </div>
      <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
        <div className="text-sm text-red-600">Expired</div>
      </div>
      <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
        <div className="text-sm text-red-600">Inactive</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-600">{stats.planInactive}</div>
        <div className="text-sm text-gray-600">Plan Inactive</div>
      </div>
    </div>
  );

  const CompanySkeleton = () => (
    <TableRow>
      {Array.from({ length: 11 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-28" />
        </TableCell>
      ))}
    </TableRow>
  );

  if (loading) {
    return (
      <PageContainer className="bg-white min-h-screen p-6 text-black">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="bg-black min-h-screen p-6 text-white">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Company Plan Management</h1>
          <p className="text-gray-700">
            Manage and update subscription plans for your tenants.
          </p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2 text-black"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Status Summary */}
      <StatusSummary />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search companies, owners, or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Company</TableHead>
                <TableHead className="font-semibold text-gray-900">Owner</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Current Plan</TableHead>
                <TableHead className="font-semibold text-gray-900">Upcoming Plan</TableHead>
                <TableHead className="font-semibold text-gray-900">Users</TableHead>
                <TableHead className="font-semibold text-gray-900">Projects</TableHead>
                <TableHead className="font-semibold text-gray-900">Start Date</TableHead>
                <TableHead className="font-semibold text-gray-900">End Date</TableHead>
                <TableHead className="font-semibold text-gray-900">Days Left</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FaSearch className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-500">No companies found</p>
                      <p className="text-gray-400">Try adjusting your search terms</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((company) => (
                  <TableRow 
                    key={company.id} 
                    className={`group hover:bg-gray-50 ${
                      company.status === 'expired' || company.status === 'inactive' 
                        ? 'bg-red-50 hover:bg-red-100' 
                        : ''
                    }`}
                  >
                    <TableCell
                      className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => navigate(`/tenant/${company.id}`)}
                    >
                      <div className="flex items-center gap-2 text-black">
                        {company.name}
                        <FaEye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{company.ownerName}</div>
                        <div className="text-xs text-gray-500">{company.ownerEmail}</div>
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(company)}</TableCell>

                    {/* Current Plan */}
                    <TableCell>
                      <Badge
                        variant={getPlanBadgeVariant(company.plan)}
                        className="capitalize"
                      >
                        {company.plan}
                      </Badge>
                    </TableCell>

                    {/* Upcoming Plan */}
                    <TableCell>
                      {company.upcomingPlan ? (
                        <div className="flex flex-col">
                          <Badge
                            variant="secondary"
                            className="capitalize bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {company.upcomingPlan}
                          </Badge>
                          {company.upcomingPlanStart && (
                            <span className="text-xs text-gray-600 mt-1">
                              Starts {company.upcomingPlanStart.format("DD MMM")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">None</span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-gray-900">{company.maxUsers}</TableCell>
                    <TableCell className="text-sm text-gray-900">{company.maxProjects}</TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {company.planStartDate.format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {company.planEndDate.format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>
                      {calculateDaysLeft(company.planEndDate, company.status)}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Change Plan"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowPlanModal(true);
                          }}
                          className="hover:bg-blue-50 hover:text-blue-600 text-black"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete Company"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowDeleteDialog(true);
                          }}
                          className="hover:bg-red-50 hover:text-red-600 text-black"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <strong className="text-red-600">{selectedCompany?.name}</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCompany(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      {selectedCompany && (
        <PlanChangeDialog
          open={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedCompany(null);
          }}
          onSuccess={refreshData}
          tenant={selectedCompany}
          plans={plans}
        />
      )}
    </PageContainer>
  );
}