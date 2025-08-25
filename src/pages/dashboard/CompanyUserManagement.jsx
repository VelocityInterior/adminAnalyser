import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { FaRedo, FaUserShield, FaUserTimes, FaUserCheck, FaUserSecret } from "react-icons/fa";
import moment from "moment";

// Role colors mapping for shadcn Badge variants
const roleColor = {
  Owner: "blue",
  Designer: "purple",
  Admin: "green",
  Viewer: "gray",
  "Site Manager": "yellow",
};

export default function CompanyUserManagement() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/tenants");
        const tenantsData = response.data;

        const mappedUsers = tenantsData.map((item) => ({
          id: item.admin._id,
          full_name: item.admin.name,
          email: item.admin.email,
          phone: item.admin.phone,
          role: item.admin.role?.charAt(0).toUpperCase() + item.admin.role?.slice(1) || "Admin",
          status: item.admin.status || "Active",
          last_login: item.admin.last_login,
          device: item.admin.device || "N/A",
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching tenants/users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "All" || user.role === filterRole;
    const matchesStatus = filterStatus === "All" || user.status === filterStatus;
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const toggleUserStatus = async (id) => {
    // Optionally call API to update user status
    // await axiosInstance.patch(`/users/${id}/status`, { status: newStatus });

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="p-6 space-y-4 bg-white">
      <h2 className="text-2xl font-bold">User Management</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Owner">Owner</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Designer">Designer</SelectItem>
            <SelectItem value="Viewer">Viewer</SelectItem>
            <SelectItem value="Site Manager">Site Manager</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <Badge variant={roleColor[user.role] || "gray"}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                {user.status === "Active" ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="destructive">Suspended</Badge>
                )}
              </TableCell>
              <TableCell>{user.last_login ? moment(user.last_login).fromNow() : "Never"}</TableCell>
              <TableCell>{user.device}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="icon" title="Reset Password">
                  <FaRedo />
                </Button>
                <Button
                  variant={user.status === "Active" ? "destructive" : "success"}
                  size="icon"
                  onClick={() => toggleUserStatus(user.id)}
                  title={
                    user.status === "Active" ? "Suspend User" : "Reactivate User"
                  }
                >
                  {user.status === "Active" ? <FaUserTimes /> : <FaUserCheck />}
                </Button>
                <Button variant="secondary" size="icon" title="Change Role">
                  <FaUserShield />
                </Button>
                <Button variant="secondary" size="icon" title="Impersonate">
                  <FaUserSecret />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}