import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddTenant() {
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    city: "",
    plan: "Free",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.companyName ||
      !form.ownerName ||
      !form.ownerEmail ||
      !form.phone ||
      !form.city
    ) {
      setError("Please fill all fields.");
      return;
    }

    // Submit to backend or mock save
    console.log("Tenant created:", form);

    // Redirect to tenant list or dashboard
    navigate("/dashboard"); // or /tenants
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">Add New Tenant</h2>

      {error && (
        <p className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Owner Name</label>
          <input
            type="text"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Owner Email
          </label>
          <input
            type="email"
            name="ownerEmail"
            value={form.ownerEmail}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Plan</label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Tenant
          </button>
        </div>
      </form>
    </div>
  );
}
