import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { FaRedo, FaUserShield, FaUserTimes, FaUserCheck, FaUserSecret, FaSearch, FaFilter } from "react-icons/fa";
import moment from "moment";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

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
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  };

  const changeUserRole = async (id, role) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role } : u
      )
    );
    setSelectedUser(null);
    setNewRole("");
  };

  const resetFilters = () => {
    setFilterRole("All");
    setFilterStatus("All");
    setSearch("");
  };

  const UserSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-white text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2 text-black">
              <FaSearch />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-gray-300 text-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-filter" className="flex items-center gap-2 text-black">
              <FaFilter className="text-gray-500" />
              Role
            </Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger id="role-filter" className="w-full bg-white border-gray-300">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
                <SelectItem value="Site Manager">Site Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter" className="flex items-center gap-2 text-black">
              <FaFilter className="text-gray-500" />
              Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-full bg-white border-gray-300">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => <UserSkeleton key={index} />)
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={roleColor[user.role] || "gray"} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === "Active" ? (
                        <Badge variant="success" className="capitalize">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="capitalize">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.last_login ? moment(user.last_login).fromNow() : "Never"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
