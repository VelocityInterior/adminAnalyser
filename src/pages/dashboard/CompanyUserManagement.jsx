import { useState, useEffect } from "react";
import {
  FaRedo,
  FaUserShield,
  FaUserTimes,
  FaUserCheck,
  FaUserSecret,
} from "react-icons/fa";
import moment from "moment";

// 🧪 Mock users data
const mockUsers = [
  {
    id: "u1",
    full_name: "Riya Kapoor",
    email: "riya@studioa.com",
    phone: "+1 555-1234",
    role: "Owner",
    status: "Active",
    last_login: "2025-07-15T10:30:00Z",
    device: "Chrome on macOS",
  },
  {
    id: "u2",
    full_name: "David Chen",
    email: "david@studioa.com",
    phone: "+1 555-5678",
    role: "Designer",
    status: "Suspended",
    last_login: "2025-06-28T15:00:00Z",
    device: "Firefox on Windows",
  },
  {
    id: "u3",
    full_name: "Ayesha Khan",
    email: "ayesha@studioa.com",
    phone: "+1 555-9999",
    role: "Viewer",
    status: "Active",
    last_login: "2025-07-16T12:00:00Z",
    device: "Safari on iOS",
  },
];

// Role colors
const roleColor = {
  Owner: "bg-blue-700",
  Designer: "bg-purple-600",
  Admin: "bg-green-600",
  Viewer: "bg-gray-500",
  "Site Manager": "bg-yellow-600",
};

export default function CompanyUserManagement() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "All" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "All" || user.status === filterStatus;
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "Active" ? "Suspended" : "Active",
            }
          : u
      )
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option>All</option>
          <option>Owner</option>
          <option>Admin</option>
          <option>Designer</option>
          <option>Viewer</option>
          <option>Site Manager</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded border">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Login</th>
              <th className="p-3">Device</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-50 transition text-sm"
              >
                <td className="p-3 text-left font-medium">{user.full_name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      roleColor[user.role]
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  {user.status === "Active" ? (
                    <span className="text-green-600 font-bold">✅</span>
                  ) : (
                    <span className="text-red-600 font-bold">❌</span>
                  )}
                </td>
                <td className="p-3">{moment(user.last_login).fromNow()}</td>
                <td className="p-3">
                  <span className="text-gray-500" title={user.device}>
                    {user.device}
                  </span>
                </td>
                <td className="p-3 flex gap-2 justify-center">
                  <button title="Reset Password" className="text-blue-600">
                    <FaRedo />
                  </button>
                  <button
                    title={
                      user.status === "Active"
                        ? "Suspend User"
                        : "Reactivate User"
                    }
                    className={
                      user.status === "Active"
                        ? "text-red-500"
                        : "text-green-600"
                    }
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === "Active" ? (
                      <FaUserTimes />
                    ) : (
                      <FaUserCheck />
                    )}
                  </button>
                  <button title="Change Role" className="text-yellow-600">
                    <FaUserShield />
                  </button>
                  <button title="Impersonate" className="text-purple-600">
                    <FaUserSecret />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
