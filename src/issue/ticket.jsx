import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { Trash2, MessageSquare } from "lucide-react";

const TicketSuperAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all tickets (super-admin only)
  const fetchTickets = async () => {
    try {
      const res = await axiosInstance.get("/superadmin/tickets", {
        headers: { Authorization: `Bearer ${localStorage.getItem("SuperAdminToken")}` },
      });
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update status
  const handleStatusChange = async (id, status) => {
    try {
      await axiosInstance.put(
        `/superadmin/tickets/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("SuperAdminToken")}` } }
      );
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ✅ Delete ticket
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await axiosInstance.delete(`/superadmin/tickets/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("SuperAdminToken")}` },
      });
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (ticketId, commentId) => {
    try {
      await axiosInstance.delete(`/superadmin/tickets/${ticketId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("SuperAdminToken")}` },
      });
      fetchTickets();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ✅ Render attachments
  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-3">
        {attachments.map((att, index) => {
          if (att.type === "image") {
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
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 hover:underline text-sm"
              >
                {att.name}
              </a>
            );
          }
        })}
      </div>
    );
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading Issues...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">📋 All Issues (Super Admin)</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between"
          >
            {/* Title & Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
              <p className="text-gray-600 mt-1">{ticket.description}</p>

              {/* Attachments */}
              {renderAttachments(ticket.attachments)}
            </div>

            {/* Status */}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span
                className={`ml-2 px-3 py-1 text-xs rounded-full font-semibold
                  ${
                    ticket.status === "closed"
                      ? "bg-red-100 text-red-700"
                      : ticket.status === "resolving"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {ticket.status}
              </span>

              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                className="mt-2 block w-full border rounded-md p-2 text-sm focus:ring focus:ring-indigo-200"
              >
                <option value="pending">Pending</option>
                <option value="resolving">Resolving</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Comments */}
            <div className="mt-4">
              <h4 className="font-medium flex items-center gap-1 text-gray-700">
                <MessageSquare size={16} /> Comments
              </h4>
              {ticket.comments?.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {ticket.comments.map((c) => (
                    <li
                      key={c._id}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                    >
                      <span className="text-sm text-gray-700">
                        {c.message}{" "}
                        <span className="text-xs text-gray-500">({c.senderModel})</span>
                      </span>
                      <button
                        onClick={() => handleDeleteComment(ticket._id, c._id)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm mt-1">No comments yet</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleDelete(ticket._id)}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm"
              >
                <Trash2 size={16} /> Delete Issue
              </button>
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">No issues found.</p>
        )}
      </div>
    </div>
  );
};

export default TicketSuperAdmin;
