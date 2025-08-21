import { useState, useEffect, useRef } from "react";
import moment from "moment";

// Dummy data
const demoTenants = [
  {
    id: "t1",
    name: "DesignCo",
    plan: "Pro",
    cycle: "Monthly",
    lastPayment: "2025-06-15",
    nextDue: "2025-07-15",
    status: "Active",
    cardStatus: "Valid",
    overdue: false,
    invoices: [
      { id: "INV-1001", period: "May 2025", amount: 100, status: "Paid" },
      { id: "INV-1002", period: "June 2025", amount: 100, status: "Paid" },
    ],
  },
  {
    id: "t2",
    name: "InteriorWorks",
    plan: "Enterprise",
    cycle: "Annual",
    lastPayment: "2024-07-01",
    nextDue: "2025-07-01",
    status: "Overdue",
    cardStatus: "Expired",
    overdue: true,
    invoices: [
      { id: "INV-2001", period: "2024", amount: 1200, status: "Paid" },
      { id: "INV-2002", period: "2025", amount: 1200, status: "Pending" },
    ],
  },
];

export default function AdminBillingConsole() {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => setTenants(demoTenants), []);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus ? t.status === filterStatus : true)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Widget
          label="Total Paying"
          value={
            tenants.length - tenants.filter((t) => t.status !== "Active").length
          }
        />
        <Widget
          label="Overdue Accounts"
          value={tenants.filter((t) => t.overdue).length}
        />
        <Widget
          label="Upcoming Renewals"
          value={
            tenants.filter(
              (t) =>
                moment(t.nextDue).isAfter(moment()) &&
                moment(t.nextDue).diff(moment(), "days") <= 7
            ).length
          }
        />
        <Widget
          label="MRR"
          value={`₹${tenants.reduce(
            (sum, t) =>
              sum +
              (t.cycle === "Monthly"
                ? t.invoices.at(-1)?.amount || 0
                : (t.invoices.at(-1)?.amount || 0) / 12),
            0
          )}`}
        />
      </div>

      {/* Filters & Table */}
      <div>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            placeholder="Search company..."
            className="border px-3 py-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {["Active", "Overdue"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Company</th>
                <th className="px-4 py-2 border">Plan</th>
                <th className="px-4 py-2 border">Cycle</th>
                <th className="px-4 py-2 border">Last Payment</th>
                <th className="px-4 py-2 border">Next Due</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Card</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{t.name}</td>
                  <td className="px-4 py-2 border">{t.plan}</td>
                  <td className="px-4 py-2 border">{t.cycle}</td>
                  <td className="px-4 py-2 border">{t.lastPayment}</td>
                  <td className="px-4 py-2 border">{t.nextDue}</td>
                  <td className="px-4 py-2 border">{t.status}</td>
                  <td className="px-4 py-2 border">{t.cardStatus}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedTenant(t)}
                    >
                      Invoices
                    </button>
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() =>
                        setShowPlanModal(true) & setSelectedTenant(t)
                      }
                    >
                      Change Plan
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6">
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice / Tenant Modal */}
      {selectedTenant && !showPlanModal && (
        <Modal onClose={() => setSelectedTenant(null)}>
          <h3 className="text-xl font-semibold mb-4">
            Invoices – {selectedTenant.name}
          </h3>
          <table className="min-w-full border mb-4">
            <thead className="bg-gray-100">
              <tr>
                {["ID", "Period", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2 border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedTenant.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{inv.id}</td>
                  <td className="px-4 py-2 border">{inv.period}</td>
                  <td className="px-4 py-2 border">₹{inv.amount}</td>
                  <td className="px-4 py-2 border">{inv.status}</td>
                  <td className="px-4 py-2 border">
                    <button className="text-blue-600 hover:underline">
                      Download
                    </button>
                    {inv.status === "Pending" && (
                      <button className="ml-2 text-red-600 hover:underline">
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* Plan Change Modal */}
      {showPlanModal && selectedTenant && (
        <Modal
          onClose={() => setShowPlanModal(false) && setSelectedTenant(null)}
        >
          <h3 className="text-xl font-semibold mb-4">
            Change Plan – {selectedTenant.name}
          </h3>
          <select
            className="border px-3 py-2 rounded mb-4"
            defaultValue={selectedTenant.plan}
          >
            {["Free Trial", "Basic", "Growth", "Pro", "Enterprise"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowPlanModal(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPlanModal(false) /* save logic */}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Dashboard summary widget
function Widget({ label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  );
}

// Generic modal overlay
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
