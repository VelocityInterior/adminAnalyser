// src/Components/TopNav.jsx
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";

export default function TopNav() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ✅ Fixed logout handler (async + unwrap)
  const handleLogout = async () => {
    try {
      setShowUserDropdown(false);

      // wait for logout to complete
      await dispatch(logout()).unwrap();

      // redirect
      navigate("/superadmin/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);

      // fallback redirect
      navigate("/superadmin/login", { replace: true });
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown") && !event.target.closest(".notification")) {
        setShowNotifications(false);
        setShowUserDropdown(false);
      }
    };
    if (showNotifications || showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showUserDropdown]);

  // Mock notifications
  const notifications = [
    { id: 1, message: "New tenant registration pending approval", time: "2 minutes ago", unread: true },
    { id: 2, message: "System backup completed successfully", time: "1 hour ago", unread: true },
    { id: 3, message: "Monthly billing report is ready", time: "3 hours ago", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="hidden md:block sticky top-0 bg-black border-b border-zinc-800 shadow-lg z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left Section - Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 shadow"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-300 hover:text-white" />
            </button>
            <button
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 shadow"
              onClick={() => navigate(1)}
              title="Go forward"
            >
              <ChevronRight className="w-5 h-5 text-zinc-300 hover:text-white" />
            </button>
          </div>

          {/* Center Section */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-white">
              Super Admin Dashboard
            </h1>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {/* Notifications */}
            <div className="relative notification">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 shadow relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-zinc-300 hover:text-white" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{unreadCount}</span>
                  </div>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-zinc-800 py-2 max-h-96 overflow-y-auto z-50">
                  <div className="px-4 py-2 text-sm text-gray-400 border-b border-zinc-700 flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="py-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-zinc-800 cursor-pointer border-l-2 ${
                          n.unread ? "border-blue-500 bg-zinc-800/30" : "border-transparent"
                        }`}
                      >
                        <div className="text-sm text-gray-200">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-zinc-700">
                    <button className="text-xs text-blue-400 hover:text-blue-300">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 shadow"
              title="Settings"
              onClick={() => navigate("/superadmin/settings")}
            >
              <Settings className="w-5 h-5 text-zinc-300 hover:text-white" />
            </button>

            {/* User Dropdown */}
            <div className="relative dropdown">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 shadow"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-gray-200">
                    {user?.name || "Admin"}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {user?.role?.replace("-", " ") || "Super Admin"}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-zinc-800 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-zinc-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user?.name || "Admin"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user?.email || "admin@example.com"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center space-x-3"
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate("/superadmin/profile");
                      }}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center space-x-3"
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate("/superadmin/settings");
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-zinc-700 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors flex items-center space-x-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
