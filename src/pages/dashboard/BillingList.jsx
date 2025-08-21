import { useState, useEffect } from "react";

const STATUS_COLORS = {
  Active: "bg-green-100 text-green-800",
  Trial: "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-gray-100 text-gray-600",
  Overdue: "bg-red-100 text-red-800",
};

// Dummy demo data
const demoBillingData = [
  {
    id: "1",
    companyName: "DesignCo",
    planName: "Pro",
    status: "Active",
    startDate: "2024-01-01",
    renewalDate: "2024-07-01",
    monthlyCost: 100,
    lastPaymentDate: "2024-06-01",
    nextPaymentDue: "2024-07-01",
  },
  {
    id: "2",
    companyName: "InteriorWorks",
    planName: "Enterprise",
    status: "Overdue",
    startDate: "2023-05-10",
    renewalDate: "2024-05-10",
    monthlyCost: 500,
    lastPaymentDate: "2024-04-10",
    nextPaymentDue: "2024-05-10",
  },
  {
    id: "3",
    companyName: "HomeStyler",
    planName: "Trial",
    status: "Trial",
    startDate: "2024-06-10",
    renewalDate: "2024-07-10",
    monthlyCost: 0,
    lastPaymentDate: null,
    nextPaymentDue: "2024-07-10",
  },
];

export default function BillingList() {
  const [billingData, setBillingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    // In real app: fetch('/admin/tenants/billing')
    setBillingData(demoBillingData);
  }, []);

  const filteredData = billingData.filter((tenant) => {
    const matchSearch = tenant.companyName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? tenant.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Subscription & Billing Management
        </h2>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Billing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">
                  Company Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Plan Name</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Start Date</th>
                <th className="border border-gray-300 px-4 py-2">
                  Renewal Date
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Monthly Cost
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Last Payment
                </th>
                <th className="border border-gray-300 px-4 py-2">Next Due</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    No companies found.
                  </td>
                </tr>
              )}
              {filteredData.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {tenant.companyName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {tenant.planName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        STATUS_COLORS[tenant.status]
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {tenant.startDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {tenant.renewalDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    ₹{tenant.monthlyCost}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {tenant.lastPaymentDate || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {tenant.nextPaymentDue}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTenant(tenant);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedTenant && (
        <BillingDetailDrawer
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      )}
    </>
  );
}

// BillingDetailDrawer component below (can also be split into separate file)
function BillingDetailDrawer({ tenant, onClose }) {
  // Placeholder usage stats - replace with API data
  const usage = {
    users: { used: 8, limit: 10 },
    projects: { used: 25, limit: 30 },
    storage: { used: 4.5, limit: 10 }, // GB
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-40 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {tenant.companyName} - Billing Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Plan Info */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Current Plan</h4>
          <p>
            <strong>{tenant.planName}</strong> plan with limits:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Users: {usage.users.limit}</li>
            <li>Projects: {usage.projects.limit}</li>
            <li>Storage: {usage.storage.limit} GB</li>
          </ul>
        </section>

        {/* Usage Stats */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Current Usage</h4>
          <UsageBar
            label="Users"
            used={usage.users.used}
            limit={usage.users.limit}
          />
          <UsageBar
            label="Projects"
            used={usage.projects.used}
            limit={usage.projects.limit}
          />
          <UsageBar
            label="Storage (GB)"
            used={usage.storage.used}
            limit={usage.storage.limit}
          />
        </section>

        {/* Billing & Payment Info */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Billing Info</h4>
          <p>
            <strong>Subscription Status:</strong>{" "}
            <span
              className={`inline-block px-2 py-1 rounded text-sm ${
                tenant.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : tenant.status === "Trial"
                  ? "bg-yellow-100 text-yellow-800"
                  : tenant.status === "Overdue"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tenant.status}
            </span>
          </p>
          <p>
            <strong>Payment Method:</strong> **** **** **** 1234
          </p>
          <p>
            <strong>Billing Address:</strong> 123 Design St, Creativity City,
            45678
          </p>
          <p>
            <strong>GST Number:</strong> 22AAAAA0000A1Z5
          </p>
        </section>

        {/* Invoice History */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Invoice History</h4>
          <ul className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
            {/* Dummy invoice items */}
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b border-gray-100 pb-1"
              >
                <span>
                  Invoice #{1000 + i} - 2024-06-0{i}
                </span>
                <button className="text-blue-600 hover:underline">
                  Download PDF
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Admin Actions */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Admin Actions</h4>
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Upgrade / Downgrade Plan
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              Extend Trial Period
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Pause Billing
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Resend Invoice
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Refund Last Payment
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Apply Discount
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// UsageBar component for showing usage visually
function UsageBar({ label, used, limit }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-4 rounded bg-blue-600`}
          style={{ width: `${percent}%` }}
          title={`${percent}% used`}
        ></div>
      </div>
    </div>
  );
}
