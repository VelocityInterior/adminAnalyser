import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { FaRedo, FaUserShield, FaUserTimes, FaUserCheck, FaUserSecret, FaSearch, FaFilter } from "react-icons/fa";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
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
    // Optionally call API to update user role
    // await axiosInstance.patch(`/users/${id}/role`, { role });
    
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

  // Skeleton loading component
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
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-black text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs text-black"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2">
              <FaSearch className="text-white" />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-filter" className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              Role
            </Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger id="role-filter" className="w-full bg-black">
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
            <Label htmlFor="status-filter" className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-full bg-black">
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
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-black">
              <TableRow>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Phone</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Last Login</TableHead>
                <TableHead className="text-gray-300">Device</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <UserSkeleton key={index} />
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="text-gray-300">{user.email}</TableCell>
                    <TableCell className="text-gray-300">{user.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={roleColor[user.role] || "gray"} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === "Active" ? (
                        <Badge variant="success" className="capitalize">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="capitalize">
                          Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.last_login ? moment(user.last_login).fromNow() : "Never"}
                    </TableCell>
                    <TableCell className="text-gray-300">{user.device}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" title="Reset Password" className="h-8 w-8 text-black">
                          <FaRedo className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant={user.status === "Active" ? "destructive" : "success"}
                              size="icon"
                              title={user.status === "Active" ? "Suspend User" : "Reactivate User"}
                              className="h-8 w-8"
                            >
                              {user.status === "Active" ? (
                                <FaUserTimes className="h-4 w-4" />
                              ) : (
                                <FaUserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.status === "Active" ? "Suspend User" : "Activate User"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to {user.status === "Active" ? "suspend" : "activate"} {user.full_name}?
                                {user.status === "Active" ? " They will no longer have access to the system." : " They will regain access to the system."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => toggleUserStatus(user.id)}
                                className={user.status === "Active" ? "bg-destructive text-destructive-foreground" : "bg-green-600"}
                              >
                                {user.status === "Active" ? "Suspend" : "Activate"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              title="Change Role"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                              }}
                            >
                              <FaUserShield className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change User Role</DialogTitle>
                              <DialogDescription>
                                Change the role for {selectedUser?.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                  Role
                                </Label>
                                <Select value={newRole} onValueChange={setNewRole} className="col-span-3">
                                  <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Owner">Owner</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Designer">Designer</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                    <SelectItem value="Site Manager">Site Manager</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                onClick={() => changeUserRole(selectedUser?.id, newRole)}
                                disabled={!newRole || newRole === selectedUser?.role}
                              >
                                Update Role
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button variant="secondary" size="icon" title="Impersonate" className="h-8 w-8">
                          <FaUserSecret className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <FaUserTimes className="h-12 w-12" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter parameters
                      </p>
                    </div>
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