// src/pages/BugTracker.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const Issue = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBugs();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/superAdminBug", {
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bug?")) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/superAdminBug/${id}`);
      setSuccess("Bug deleted successfully!");
      fetchBugs();
    } catch (error) {
      console.error("Error deleting bug:", error);
      setError("Failed to delete bug");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/superAdminBug/${id}/status`, { status: "solved" });
      setSuccess("Bug marked as resolved!");
      fetchBugs();
    } catch (error) {
      console.error("Error resolving bug:", error);
      setError("Failed to resolve bug");
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/superAdminBug/${id}/status`, { status: "raised" });
      setSuccess("Bug reopened!");
      fetchBugs();
    } catch (error) {
      console.error("Error reopening bug:", error);
      setError("Failed to reopen bug");
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${
        status === "solved"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-amber-100 text-amber-800 border-amber-200"
      }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="mt-3 flex flex-wrap gap-3">
        {attachments.map((att, index) => {
          if (att.fileType === "image") {
            return (
              <div key={index} className="flex flex-col items-center">
              <img
                src={att.url}
                alt={att.name}
                className="max-w-xs rounded-md border mb-1"
              />
              <a
                href={att.url}
                download={att.name}
                className="text-blue-600 hover:underline text-xs"
              >
                Download
              </a>
              </div>
            );
          } else {
            return (
              <a
                key={index}
                href={att.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 hover:underline text-sm"
              >
                {att.fileName}
              </a>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bug Tracker</h1>
            <p className="text-gray-600 mt-1">Report and track software issues</p>
          </div>
        </div>

        {!loading && bugs.length > 0 ? (
          <div className="grid gap-6">
            {bugs.map((bug) => (
              <div
                key={bug._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${
                  bug.status === "solved"
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
                    {renderAttachments(bug.attachments)}
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

                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                  {bug.status !== "solved" ? (
                    <button
                      onClick={() => handleResolve(bug._id)}
                      className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                      disabled={loading}
                    >
                      Mark solved
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopen(bug._id)}
                      className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 disabled:opacity-50"
                      disabled={loading}
                    >
                      Reopen Bug
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(bug._id)}
                    className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bugs found</h3>
            <p className="text-gray-500">There are no bugs reported yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Issue;
