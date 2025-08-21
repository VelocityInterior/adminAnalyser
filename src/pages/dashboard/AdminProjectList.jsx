import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Flag,
  Calendar,
  Building2,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  FileText,
  Image,
  Box,
} from "lucide-react";

const AdminProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    company: "",
    status: "",
    projectType: "",
    timeline: "",
  });

  // Mock data - replace with actual API call
  const mockProjects = [
    {
      id: 1,
      name: "Luxury Villa Renovation",
      company: "DesignCorp Ltd",
      client: "Rajesh Sharma",
      projectType: "4BHK Villa",
      startDate: "2024-01-15",
      estimatedEndDate: "2024-06-30",
      currentStage: "Site Work",
      status: "On Track",
      progress: 65,
      budgetUsed: 1200000,
      budgetAllocated: 1800000,
      lastUpdate: "2024-07-15",
      flagged: false,
      assignedUsers: 8,
      fileCount: { images: 45, docs: 12, models: 3 },
      healthScore: 85,
    },
    {
      id: 2,
      name: "Corporate Office Design",
      company: "Interior Solutions",
      client: "TechCorp Pvt Ltd",
      projectType: "Office",
      startDate: "2024-02-01",
      estimatedEndDate: "2024-07-15",
      currentStage: "Finishing",
      status: "Delayed",
      progress: 78,
      budgetUsed: 950000,
      budgetAllocated: 1200000,
      lastUpdate: "2024-07-10",
      flagged: true,
      assignedUsers: 12,
      fileCount: { images: 67, docs: 8, models: 5 },
      healthScore: 62,
    },
    {
      id: 3,
      name: "Retail Store Setup",
      company: "Creative Spaces",
      client: "Fashion Hub",
      projectType: "Retail",
      startDate: "2024-03-01",
      estimatedEndDate: "2024-05-30",
      currentStage: "Completed",
      status: "Completed",
      progress: 100,
      budgetUsed: 800000,
      budgetAllocated: 850000,
      lastUpdate: "2024-05-30",
      flagged: false,
      assignedUsers: 6,
      fileCount: { images: 34, docs: 15, models: 2 },
      healthScore: 95,
    },
    {
      id: 4,
      name: "Modern Apartment Design",
      company: "DesignCorp Ltd",
      client: "Priya Patel",
      projectType: "2BHK",
      startDate: "2024-04-01",
      estimatedEndDate: "2024-08-15",
      currentStage: "Design",
      status: "On Track",
      progress: 35,
      budgetUsed: 450000,
      budgetAllocated: 1100000,
      lastUpdate: "2024-07-16",
      flagged: false,
      assignedUsers: 5,
      fileCount: { images: 23, docs: 6, models: 1 },
      healthScore: 78,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.company) {
      filtered = filtered.filter(
        (project) => project.company === filters.company
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (project) => project.status === filters.status
      );
    }

    if (filters.projectType) {
      filtered = filtered.filter(
        (project) => project.projectType === filters.projectType
      );
    }

    setFilteredProjects(filtered);
  }, [searchTerm, filters, projects]);

  const getStatusColor = (status) => {
    switch (status) {
      case "On Track":
        return "text-green-600 bg-green-50";
      case "Delayed":
        return "text-red-600 bg-red-50";
      case "Completed":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getProgressColor = (progress, status) => {
    if (status === "Completed") return "bg-blue-500";
    if (status === "Delayed") return "bg-red-500";
    return "bg-green-500";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFlagProject = (projectId) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? { ...project, flagged: !project.flagged }
          : project
      )
    );
  };

  const openDetailDrawer = (project) => {
    setSelectedProject(project);
    setShowDetailDrawer(true);
  };

  const exportData = () => {
    // Simulate CSV export
    const csvData = filteredProjects.map((p) => ({
      "Project Name": p.name,
      Company: p.company,
      Client: p.client,
      Type: p.projectType,
      Status: p.status,
      Progress: `${p.progress}%`,
      "Budget Used": formatCurrency(p.budgetUsed),
      "Budget Allocated": formatCurrency(p.budgetAllocated),
    }));

    console.log("Exporting data:", csvData);
    alert("Export functionality would be implemented here");
  };

  const companies = [...new Set(projects.map((p) => p.company))];
  const statuses = [...new Set(projects.map((p) => p.status))];
  const projectTypes = [...new Set(projects.map((p) => p.projectType))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Global Project Monitoring
          </h1>
          <p className="text-gray-600">
            Monitor all projects across tenant companies
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter((p) => p.status === "On Track").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter((p) => p.status === "Delayed").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Flag className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter((p) => p.flagged).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects or clients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.company}
                onChange={(e) =>
                  setFilters({ ...filters, company: e.target.value })
                }
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.projectType}
                onChange={(e) =>
                  setFilters({ ...filters, projectType: e.target.value })
                }
              >
                <option value="">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className={`hover:bg-gray-50 ${
                      project.flagged ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {project.flagged && (
                          <Flag className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.client}
                          </div>
                          <div className="text-xs text-gray-400">
                            {project.projectType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.currentStage}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {new Date(
                          project.estimatedEndDate
                        ).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(
                              project.progress,
                              project.status
                            )}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(project.budgetUsed)}
                      </div>
                      <div className="text-xs text-gray-500">
                        of {formatCurrency(project.budgetAllocated)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailDrawer(project)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFlagProject(project.id)}
                          className={`p-1 ${
                            project.flagged
                              ? "text-yellow-600"
                              : "text-gray-400"
                          } hover:text-yellow-600`}
                          title={
                            project.flagged ? "Unflag Project" : "Flag Project"
                          }
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Drawer */}
        {showDetailDrawer && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Project Details
                  </h2>
                  <button
                    onClick={() => setShowDetailDrawer(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Project Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProject.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProject.company}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProject.client}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProject.projectType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Stage</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProject.currentStage}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Health Score</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProject.healthScore}/100
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Start Date
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            selectedProject.startDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Estimated End Date
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            selectedProject.estimatedEndDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Progress
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                selectedProject.progress,
                                selectedProject.status
                              )}`}
                              style={{ width: `${selectedProject.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {selectedProject.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Financials
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Budget Used
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(selectedProject.budgetUsed)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Budget Allocated
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(selectedProject.budgetAllocated)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Budget Utilization
                        </p>
                        <p className="text-sm text-gray-500">
                          {Math.round(
                            (selectedProject.budgetUsed /
                              selectedProject.budgetAllocated) *
                              100
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Assigned Team
                  </h3>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Team Members
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedProject.assignedUsers} members
                      </p>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Project Files
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedProject.fileCount.images}
                        </p>
                        <p className="text-xs text-gray-500">Images</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedProject.fileCount.docs}
                        </p>
                        <p className="text-xs text-gray-500">Documents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Box className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedProject.fileCount.models}
                        </p>
                        <p className="text-xs text-gray-500">3D Models</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Activity Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        Last updated:{" "}
                        {new Date(
                          selectedProject.lastUpdate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        Status: {selectedProject.status}
                      </p>
                    </div>
                    {selectedProject.flagged && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <p className="text-sm text-gray-600">
                          Flagged for review
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjectList;
