// CompanyManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../api/axios"; // ✅ adjust path to your axiosInstance
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { FaEye, FaBan, FaPlay, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import PageContainer from "../../Components/pageLayout/PageContainer";

const statusColor = {
  Active: "bg-green-500",
  Suspended: "bg-red-500",
  Trial: "bg-yellow-500",
};

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch tenants from backend with axiosInstance
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axiosInstance.get("/tenants");
        const mapped = res.data.map(({ tenant, admin }) => ({
          id: tenant._id,
          name: tenant.name,
          city: tenant.location,
          plan: tenant.planId?.name || "Free",
          status: tenant.planId?.name === "Trial" ? "Trial" : "Active", // adjust if backend has real status
          planEndDate: moment(tenant.updatedAt).add(30, "days"),
          owner_name: admin?.name,
          owner_email: admin?.email,
          phone: admin?.phone,
        }));
        setCompanies(mapped);
        setFiltered(mapped);
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
      }
    };

    fetchTenants();
  }, []);

  const handleSearch = () => {
    const result = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.owner_email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  };

  const toggleStatus = async (companyId) => {
    try {
      // ✅ Call backend API to toggle status (adjust endpoint if needed)
      await axiosInstance.patch(`/tenants/${companyId}/toggle-status`);

      setFiltered((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                status: c.status === "Active" ? "Suspended" : "Active",
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/tenants/${selectedCompany.id}`);
      setFiltered((prev) => prev.filter((c) => c.id !== selectedCompany.id));
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to delete tenant:", err);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      await axiosInstance.patch(`/tenants/${selectedCompany.id}/plan`, {
        plan: selectedPlan,
      });
      setFiltered((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id ? { ...c, plan: selectedPlan } : c
        )
      );
      setShowPlanModal(false);
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
  };

  const calculateDaysLeft = (endDate) => {
    const now = moment();
    const diff = moment(endDate).diff(now, "days");
    return diff >= 0 ? `${diff} days` : "Expired";
  };

  return (
    <PageContainer className="bg-white min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Company Management</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search company or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className='bg-white'>
              <TableHead>Company</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="hover:bg-zinc-800/50">
                <TableCell
                  className="font-semibold cursor-pointer"
                  onClick={() => navigate(`/tenant/${c.id}`)}
                >
                  {c.name}
                </TableCell>
                <TableCell>{c.owner_name}</TableCell>
                <TableCell>{c.owner_email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>{c.plan}</TableCell>
                <TableCell>
                  <Badge className={statusColor[c.status]}>{c.status}</Badge>
                </TableCell>
                <TableCell>{calculateDaysLeft(c.planEndDate)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <FaEye />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleStatus(c.id)}
                  >
                    {c.status === "Active" ? <FaBan /> : <FaPlay />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedCompany(c);
                      setSelectedPlan(c.plan);
                      setShowPlanModal(true);
                    }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedCompany(c);
                      setShowConfirm(true);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedCompany?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Plan Dialog */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Plan</DialogTitle>
          </DialogHeader>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowPlanModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
