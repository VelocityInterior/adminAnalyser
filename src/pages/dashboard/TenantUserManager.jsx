import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";

const ROLE_COLORS = {
  admin: "bg-blue-100 text-blue-800",
  designer: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
  employee: "bg-purple-100 text-purple-800",
};

export default function TenantUserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTenantUsers();
  }, []);

  const fetchTenantUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/tenants");
      const transformedUsers = transformApiData(response.data);
      setUsers(transformedUsers);
    } catch (err) {
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const transformApiData = (apiData) => {
    return apiData.map((item, index) => {
      const tenant = item.tenant;
      const admin = item.admin;
      return {
        id: admin._id || `user-${index}`,
        tenant: tenant.name,
        fullName: admin.name,
        email: admin.email,
        role: admin.role || "employee",
        lastLogin: admin.last_login ? new Date(admin.last_login).toISOString().split("T")[0] : "Never",
        status: tenant.isActive ? "Active" : "Suspended",
        phone: admin.phone,
        permissions: transformPermissions(admin.accessControl),
        logins: admin.last_login
          ? [
              {
                date: new Date(admin.last_login).toISOString().split("T")[0],
                ip: "N/A",
                device: "Unknown",
              },
            ]
          : [],
        rawData: { tenant, admin },
      };
    });
  };

  const transformPermissions = (accessControl) => {
    if (!accessControl) {
      return {
        projects: false,
        billing: false,
        chat: false,
        files: false,
        tasks: false,
        reports: false,
      };
    }
    return {
      projects: accessControl.newProject?.view || false,
      billing: accessControl.finance?.view || accessControl.companyFinance?.view || false,
      chat: accessControl.notification?.view || false,
      files: accessControl.files?.view || accessControl.companyFiles?.view || false,
      tasks: accessControl.daily?.view || false,
      reports: accessControl.timeline?.view || false,
    };
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.tenant.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 min-h-screen flex items-center justify-center">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <Button onClick={fetchTenantUsers}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-white">
      <h2 className="text-2xl font-bold mb-4">Tenant User Manager</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search by name, email, or company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchTenantUsers}>Refresh</Button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white p-4 rounded border">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="overflow-auto border rounded bg-white">
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
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{u.tenant}</td>
                  <td className="px-4 py-2">{u.fullName}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <Badge className={ROLE_COLORS[u.role.toLowerCase()] || ROLE_COLORS.viewer}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">{u.lastLogin}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-sm font-medium ${
                        u.status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="link" onClick={() => setSelectedUser(u)}>
                      View / Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <p><strong>Name:</strong> {selectedUser.fullName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || "—"}</p>
              <p><strong>Company:</strong> {selectedUser.tenant}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>

              <div>
                <label className="block font-semibold mb-1">Primary Role</label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) =>
                    setSelectedUser((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Module Permissions</label>
                {Object.entries(selectedUser.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 mb-1">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) =>
                        setSelectedUser((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [key]: checked,
                          },
                        }))
                      }
                    />
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-4 flex gap-3">
              <Button onClick={() => console.log("Saving user:", selectedUser)}>Save Changes</Button>
              <Button variant="secondary">Re-send Invite</Button>
              <Button variant="destructive">
                {selectedUser.status === "Suspended" ? "Activate Account" : "Suspend Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
