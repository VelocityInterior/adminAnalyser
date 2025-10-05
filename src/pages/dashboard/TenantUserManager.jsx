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
} from "../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Search,
  RefreshCw,
  Mail,
  Building,
  Calendar,
  Phone,
  Shield,
  Eye,
  MoreHorizontal,
  Filter,
  User,
  ChevronDown,
  Settings
} from "lucide-react";

const ROLE_COLORS = {
  admin: "bg-blue-500/10 text-blue-600 border-blue-200",
  designer: "bg-green-500/10 text-green-600 border-green-200",
  viewer: "bg-gray-500/10 text-gray-600 border-gray-200",
  employee: "bg-purple-500/10 text-purple-600 border-purple-200",
};

const STATUS_COLORS = {
  Active: "bg-green-500/10 text-green-600 border-green-200",
  Suspended: "bg-red-500/10 text-red-600 border-red-200",
  Inactive: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function TenantUserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
        tenant: tenant?.name || "—",
        fullName: admin?.name || "—",
        email: admin?.email || "—",
        role: admin?.role || "employee",
        lastLogin: admin?.last_login
          ? new Date(admin.last_login).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })
          : "Never",
        status: tenant?.isActive ? "Active" : "Suspended",
        phone: admin?.phone || "—",
        permissions: transformPermissions(admin?.accessControl),
        createdAt: admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—",
        rawData: { tenant, admin },
      };
    });
  };

  const transformPermissions = (accessControl) => {
    if (!accessControl) return {};
    return Object.keys(accessControl).reduce((acc, key) => {
      acc[key] = accessControl[key]?.view || false;
      return acc;
    }, {});
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.tenant.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-lg border animate-pulse"></div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg border animate-pulse">
            <div className="h-16 border-b"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 border-b last:border-b-0"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <div className="text-center">
              <div className="text-red-600 text-sm font-medium mb-2">Error Loading Users</div>
              <div className="text-gray-600 text-sm mb-4">{error}</div>
              <Button onClick={fetchTenantUsers} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-white">User Management</h1>
            <p className="text-white mt-1">Manage users across all tenants</p>
          </div>
          <Button onClick={fetchTenantUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.status === "Active").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === "admin").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(users.map(u => u.tenant)).size}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Filters */}
        {/* <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-50 border-none"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px] bg-gray-50 border-none">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-gray-50 border-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Table */}
        <Card className="bg-white border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-medium text-gray-600">User</TableHead>
                  <TableHead className="font-medium text-gray-600">Company</TableHead>
                  <TableHead className="font-medium text-gray-600">Role</TableHead>
                  <TableHead className="font-medium text-gray-600">Last Login</TableHead>
                  <TableHead className="font-medium text-gray-600">Status</TableHead>
                  <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">{user.tenant}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${ROLE_COLORS[user.role.toLowerCase()] || ROLE_COLORS.viewer}`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 text-sm">{user.lastLogin}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${STATUS_COLORS[user.status] || STATUS_COLORS.Inactive}`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-sm">No users found</div>
                {(search || roleFilter !== "all" || statusFilter !== "all") && (
                  <div className="text-gray-400 text-xs mt-1">
                    Try adjusting your search or filters
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>User Details</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <div className="text-gray-900 mt-1">{selectedUser.fullName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="text-gray-900 mt-1 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedUser.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <div className="text-gray-900 mt-1 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedUser.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <div className="text-gray-900 mt-1 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedUser.tenant}
                    </div>
                  </div>
                </div>

                {/* Role & Permissions */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-600">Role & Permissions</label>
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Role</label>
                      <Select
                        value={selectedUser.role}
                        onValueChange={(value) =>
                          setSelectedUser((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-3 block">Permissions</label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {Object.entries(selectedUser.permissions).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
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
                            <label className="text-sm text-gray-700">{formatLabel(key)}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => console.log("Saving user:", selectedUser)}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}