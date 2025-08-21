// CompanyManagement.jsx
import { useEffect, useState } from "react";
import { FaEye, FaBan, FaPlay, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../Components/pageLayout/PageContainer";

const demoCompanies = [
  {
    id: "1",
    name: "Studio A Interiors",
    owner_name: "Alice Singh",
    owner_email: "alice@studioa.com",
    phone: "+1 123-456-7890",
    city: "New York",
    plan: "Pro",
    status: "Active",
    planEndDate: "2025-08-25",
  },
  {
    id: "2",
    name: "Design Hive",
    owner_name: "Ravi Patel",
    owner_email: "ravi@designhive.com",
    phone: "+91 999-888-7777",
    city: "Mumbai",
    plan: "Enterprise",
    status: "Suspended",
    planEndDate: "2025-08-10",
  },
  {
    id: "3",
    name: "Modish Living",
    owner_name: "Karen Taylor",
    owner_email: "karen@modish.com",
    phone: "+44 20 7946 0011",
    city: "London",
    plan: "Trial",
    status: "Trial",
    planEndDate: "2025-08-15",
  },
];

const statusColor = {
  Active: "text-green-400",
  Suspended: "text-red-400",
  Trial: "text-yellow-400",
};

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCompanies(demoCompanies);
    setFiltered(demoCompanies);
  }, []);

  const handleSearch = () => {
    const result = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.owner_email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  };

  const toggleStatus = (companyId) => {
    const updateStatus = (status) =>
      status === "Active" ? "Suspended" : "Active";
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, status: updateStatus(c.status) } : c
      )
    );
    setFiltered((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, status: updateStatus(c.status) } : c
      )
    );
  };

  const handleDelete = () => {
    setFiltered((prev) => prev.filter((c) => c.id !== selectedCompany.id));
    setShowConfirm(false);
  };

  const calculateDaysLeft = (endDate) => {
    const now = moment();
    const end = moment(endDate);
    const diff = end.diff(now, "days");
    return diff >= 0 ? `${diff} days` : "Expired";
  };

  const handleRowClick = (id) => {
    navigate(`/tenant/${id}`);
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Company Management</h1>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
          onClick={() => navigate("/tenant/add")}
        >
          <FaPlus /> Add Tenant
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          className="bg-zinc-800 text-white border border-zinc-700 px-4 py-2 w-1/3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search company or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div className="overflow-auto rounded-lg shadow border border-zinc-800">
        <table className="w-full text-sm bg-zinc-900 text-zinc-200">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Company</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">City</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Status</th>
              <th className="p-3">Days Left</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr
                key={company.id}
                className="border-b border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
              >
                <td
                  className="p-3 font-semibold text-left"
                  onClick={() => handleRowClick(company.id)}
                >
                  {company.name}
                </td>
                <td className="p-3" onClick={() => handleRowClick(company.id)}>
                  {company.owner_name}
                </td>
                <td className="p-3" onClick={() => handleRowClick(company.id)}>
                  {company.owner_email}
                </td>
                <td className="p-3" onClick={() => handleRowClick(company.id)}>
                  {company.phone}
                </td>
                <td className="p-3" onClick={() => handleRowClick(company.id)}>
                  {company.city}
                </td>
                <td className="p-3" onClick={() => handleRowClick(company.id)}>
                  {company.plan}
                </td>
                <td
                  className={`p-3 font-semibold ${statusColor[company.status]}`}
                  onClick={() => handleRowClick(company.id)}
                >
                  {company.status}
                </td>
                <td className="p-3" onClick={() => handleRowClick(company.id)}>
                  {calculateDaysLeft(company.planEndDate)}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    className="text-blue-400 hover:text-blue-500"
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button
                    className={
                      company.status === "Active"
                        ? "text-red-400 hover:text-red-500"
                        : "text-green-400 hover:text-green-500"
                    }
                    title={company.status === "Active" ? "Suspend" : "Activate"}
                    onClick={() => toggleStatus(company.id)}
                  >
                    {company.status === "Active" ? <FaBan /> : <FaPlay />}
                  </button>
                  <button
                    className="text-yellow-400 hover:text-yellow-500"
                    title="Edit"
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowPlanModal(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-zinc-400 hover:text-zinc-200"
                    title="Delete"
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowConfirm(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-zinc-900 text-white p-6 rounded shadow border border-zinc-700 w-[300px]">
            <p className="mb-4 text-red-500">
              Delete <strong>{selectedCompany.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-zinc-700 px-3 py-1 rounded hover:bg-zinc-600"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Plan Modal */}
      {showPlanModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-zinc-900 text-white p-6 rounded shadow border border-zinc-700 w-[300px]">
            <h3 className="text-lg font-semibold mb-4">Update Plan</h3>
            <select className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 mb-4 text-white">
              <option>Free</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                className="bg-zinc-700 px-3 py-1 rounded hover:bg-zinc-600"
                onClick={() => setShowPlanModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => setShowPlanModal(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
