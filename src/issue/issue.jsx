// src/pages/BugTracker.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const Issue= () => {
  const [bugs, setBugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attachments: "",
    links: "",
    priority: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchBugs();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // ✅ Fetch all bugs
  const fetchBugs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/bugs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBugs(res.data.bugs || []);
      setError("");
    } catch (error) {
      console.error("Error fetching bugs:", error);
      setError("Failed to fetch bugs");
      setBugs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create bug (NOT allowed for superadmin)
  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post(
        "/bugs",
        {
          ...formData,
          attachments: formData.attachments
            ? formData.attachments.split(",").map(item => item.trim()).filter(item => item)
            : [],
          links: formData.links 
            ? formData.links.split(",").map(item => item.trim()).filter(item => item)
            : [],
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFormData({ title: "", description: "", attachments: "", links: "", priority: "medium" });
      setShowForm(false);
      setSuccess("Bug reported successfully!");
      fetchBugs();
    } catch (error) {
      console.error("Error creating bug:", error);
      setError("Failed to create bug");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete bug
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bug?")) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/bugs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess("Bug deleted successfully!");
      fetchBugs();
    } catch (error) {
      console.error("Error deleting bug:", error);
      setError("Failed to delete bug");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark bug as resolved
  const handleResolve = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.put(
        `/bugs/${id}/status`,
        { status: "resolved" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess("Bug marked as resolved!");
      fetchBugs();
    } catch (error) {
      console.error("Error resolving bug:", error);
      setError("Failed to resolve bug");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reopen bug
  const handleReopen = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.patch(
        `/bugs/${id}/status`,
        { status: "open" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess("Bug reopened!");
      fetchBugs();
    } catch (error) {
      console.error("Error reopening bug:", error);
      setError("Failed to reopen bug");
    } finally {
      setLoading(false);
    }
  };

  // Priority badge component
//   const PriorityBadge = ({ priority }) => {
//     const priorityClasses = {
//       high: "bg-red-100 text-red-800 border-red-200",
//       medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
//       low: "bg-blue-100 text-blue-800 border-blue-200"
//     };
    
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityClasses[priority] || "bg-gray-100 text-gray-800"}`}>
//         {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
//       </span>
//     );
//   };

  // Status badge component
  const StatusBadge = ({ status }) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        status === "resolved" 
          ? "bg-green-100 text-green-800 border-green-200" 
          : "bg-amber-100 text-amber-800 border-amber-200"
      }`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bug Tracker</h1>
            <p className="text-gray-600 mt-1">Report and track software issues</p>
          </div>

          {/* ✅ Only Admin/Head/Junior can raise bugs */}
          {/* {userData?.role !== "superadmin" && userData?.role !== "super-admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {showForm ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Report Bug
                </>
              )}
            </button>
          )} */}
        </div>

        {/* Messages */}
        {/* {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )} */}

        {/* {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Bug Form */}
        {/* {showForm && userData?.role !== "superadmin" && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Report New Bug</h2>
            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Brief description of the bug"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  placeholder="Detailed description of the bug, steps to reproduce, expected behavior, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (comma separated URLs)</label>
                <input
                  type="text"
                  placeholder="https://example.com/screenshot1.png, https://example.com/logs.txt"
                  value={formData.attachments}
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Links (comma separated URLs)</label>
                <input
                  type="text"
                  placeholder="https://example.com/related-issue, https://example.com/documentation"
                  value={formData.links}
                  onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Report Bug"
                  )}
                </button>
              </div>
            </form>
          </div>
        )} */}

        {/* Loading state */}
        {/* {loading && !showForm && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )} */}

        {/* Bugs List */}
        {!loading && bugs.length > 0 ? (
          <div className="grid gap-6">
            {bugs.map((bug) => (
              <div
                key={bug._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${
                  bug.status === "resolved" 
                    ? "border-l-green-500" 
                    : bug.priority === "high" 
                      ? "border-l-red-500" 
                      : bug.priority === "medium" 
                        ? "border-l-yellow-500" 
                        : "border-l-blue-500"
                } p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{bug.title}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{bug.description}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex gap-2">
                      <StatusBadge status={bug.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      Reported on {new Date(bug.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {(bug.attachments && bug.attachments.length > 0) || (bug.links && bug.links.length > 0) ? (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {bug.attachments && bug.attachments.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          Attachments
                        </h4>
                        <ul className="text-sm">
                          {bug.attachments.map((attachment, index) => (
                            <li key={index} className="mb-1">
                              <a 
                                href={attachment} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                {attachment}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {bug.links && bug.links.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                          </svg>
                          Reference Links
                        </h4>
                        <ul className="text-sm">
                          {bug.links.map((link, index) => (
                            <li key={index} className="mb-1">
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                  {bug.status !== "resolved" ? (
                    <button
                      onClick={() => handleResolve(bug._id)}
                      className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Mark Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopen(bug._id)}
                      className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 disabled:opacity-50 flex items-center gap-1"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Reopen Bug
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(bug._id)}
                    className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bugs found</h3>
            <p className="text-gray-500">There are no bugs reported yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Issue;