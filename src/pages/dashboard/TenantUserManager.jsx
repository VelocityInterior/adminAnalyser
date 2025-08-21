import { useState, useEffect } from "react";

const DUMMY_USERS = [
  {
    id: "u1",
    tenant: "DesignCo",
    fullName: "Alice Johnson",
    email: "alice@designco.com",
    role: "Admin",
    lastLogin: "2024-07-15",
    status: "Active",
    phone: "+91-1234567890",
    permissions: {
      projects: true,
      billing: true,
      chat: true,
      files: false,
      tasks: true,
      reports: false,
    },
    logins: [
      { date: "2024-07-15", ip: "192.168.1.1", device: "desktop" },
      { date: "2024-07-12", ip: "192.168.1.2", device: "mobile" },
    ],
  },
  {
    id: "u2",
    tenant: "InteriorWorks",
    fullName: "Bob Smith",
    email: "bob@interiorworks.com",
    role: "Designer",
    lastLogin: "2024-07-10",
    status: "Suspended",
    phone: "+91-9876543210",
    permissions: {
      projects: true,
      billing: false,
      chat: true,
      files: true,
      tasks: false,
      reports: false,
    },
    logins: [],
  },
];

const ROLE_COLORS = {
  Admin: "bg-blue-100 text-blue-800",
  Designer: "bg-green-100 text-green-800",
  Viewer: "bg-gray-100 text-gray-800",
};

export default function TenantUserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setUsers(DUMMY_USERS); // Simulated API fetch
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tenant User Manager</h2>

      <input
        className="mb-4 px-3 py-2 border rounded w-full max-w-sm"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 text-sm font-semibold">
            <tr>
              <th className="px-4 py-2">Company</th>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Last Login</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-2">{u.tenant}</td>
                <td className="px-4 py-2">{u.fullName}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      ROLE_COLORS[u.role]
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2">{u.lastLogin || "N/A"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-sm font-medium ${
                      u.status === "Active"
                        ? "text-green-600"
                        : u.status === "Suspended"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="text-blue-600 hover:underline"
                  >
                    View / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Panel */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
          <div
            className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xl text-gray-600 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p>
                <strong>Name:</strong> {selectedUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone || "—"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="inline-block ml-1 font-medium text-sm">
                  {selectedUser.status}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Primary Role</label>
              <select
                className="border px-3 py-2 rounded w-full"
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="Admin">Admin</option>
                <option value="Designer">Designer</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Module Permissions
              </label>
              {Object.entries(selectedUser.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={value}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [key]: e.target.checked,
                        },
                      }))
                    }
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-1">Recent Logins</h4>
              {selectedUser.logins.length === 0 && (
                <p className="text-gray-500 text-sm">No logins yet.</p>
              )}
              <ul>
                {selectedUser.logins.map((log, idx) => (
                  <li
                    key={idx}
                    className="text-sm flex justify-between border-b py-1"
                  >
                    <span>{log.date}</span>
                    <span className="text-gray-600">
                      {log.device} • {log.ip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Reset Password
              </button>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                Re-send Invite
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                {selectedUser.status === "Suspended"
                  ? "Activate Account"
                  : "Suspend Account"}
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
