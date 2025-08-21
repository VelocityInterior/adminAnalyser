import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import moment from "moment";

// Dummy data (replace with API call later)
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
    signup_date: "2024-06-10T00:00:00Z",
    last_active: "2025-07-15T12:30:00Z",
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
    signup_date: "2024-02-18T00:00:00Z",
    last_active: "2025-07-14T09:00:00Z",
  },
];

export default function TenantDetail() {
  const { id } = useParams(); // Get ID from route
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    // In real case, fetch by ID from API
    const company = demoCompanies.find((c) => c.id === id);
    setTenant(company);
  }, [id]);

  if (!tenant) {
    return <div className="p-6">Loading tenant data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">{tenant.name}</h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <span className="font-semibold block mb-1">Owner Name</span>
          <p>{tenant.owner_name}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">Owner Email</span>
          <p>{tenant.owner_email}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">Phone</span>
          <p>{tenant.phone}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">City</span>
          <p>{tenant.city}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">Plan</span>
          <p>{tenant.plan}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">Status</span>
          <p>{tenant.status}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">Signup Date</span>
          <p>{moment(tenant.signup_date).format("MMM DD, YYYY")}</p>
        </div>
        <div>
          <span className="font-semibold block mb-1">Last Active</span>
          <p>{moment(tenant.last_active).fromNow()}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate("/dashboard")} // Or "/tenants"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}
