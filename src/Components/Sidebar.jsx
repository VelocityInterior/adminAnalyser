import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaProjectDiagram,
  FaChartBar,
  FaHdd,
  FaTicketAlt,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaBook,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaUserCircle, // <-- 1. Import the new icon
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      icon: FaTachometerAlt,
      label: "Dashboard",
      path: "/dashboard",
      category: "main",
    },
    {
      icon: FaUsers,
      label: "User Management",
      path: "/usermanagement",
      category: "main",
    },
    {
      icon: FaProjectDiagram,
      label: "Project List",
      path: "/AdminProjectList",
      category: "main",
    },
    {
      icon: FaChartBar,
      label: "Billing List",
      path: "/BillingList",
      category: "reports",
    },
    {
      icon: FaHdd,
      label: "Tenant Manager",
      path: "/TenantUserManager",
      category: "system",
    },
    {
      icon: FaTicketAlt,
      label: "Support Desk",
      path: "/AdminSupportDesk",
      category: "support",
    },
    {
      icon: FaBullhorn,
      label: "Billing Console",
      path: "/AdminBillingConsole",
      category: "communication",
    },
    {
      icon: FaBook,
      label: "Audit Tracker",
      path: "/AdminAuditTracker",
      category: "system",
    },
    {
      icon: FaCog,
      label: "Settings",
      path: "/settings",
      category: "system",
      disabled: true,
    },
  ];

  const handleLogout = () => {
    // Your logout logic here
    console.log("Logging out...");
    // Example: navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) closeMobileMenu();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-4 bg-gradient-to-br from-zinc-900/95 to-black/95 text-white rounded-2xl border border-zinc-600/30 backdrop-blur-md shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 ring-1 ring-zinc-500/20 hover:scale-105"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="w-5 h-5" />
        ) : (
          <FaBars className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? "fixed" : "relative"}
          ${
            isMobile && !isMobileMenuOpen
              ? "-translate-x-full"
              : "translate-x-0"
          }
          ${!isMobile && isCollapsed ? "w-20" : "w-64"}
          ${isMobile ? "w-64" : ""}
          h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white flex flex-col
          border-r border-zinc-800/20 backdrop-blur-xl
          transition-all duration-300 ease-in-out
          z-40
          ${isMobile ? "shadow-2xl" : "shadow-xl shadow-black/30"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/15 bg-gradient-to-r from-zinc-950/50 to-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center ${
                isCollapsed && !isMobile ? "justify-center" : ""
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl border border-zinc-600/30 shadow-lg shadow-black/50 ring-1 ring-zinc-500/20">
                V
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="ml-4">
                  <span className="text-2xl font-extralight tracking-[0.15em] text-zinc-50 select-none">
                    Velocity
                  </span>
                  <div className="h-px bg-gradient-to-r from-zinc-600 to-transparent mt-1"></div>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-3 hover:bg-zinc-800/30 rounded-xl transition-all duration-300 group border border-zinc-700/20 hover:border-zinc-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-black/20"
              >
                <FaChevronRight
                  className={`transform transition-all duration-300 text-zinc-400 group-hover:text-zinc-200 group-hover:scale-110 ${
                    isCollapsed ? "rotate-0" : "rotate-180"
                  }`}
                  size={14}
                />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.disabled ? (
                    <div
                      className={`group flex items-center px-4 py-3.5 rounded-xl cursor-not-allowed opacity-30 ${
                        isCollapsed && !isMobile ? "justify-center" : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0 text-zinc-600" />
                      {(!isCollapsed || isMobile) && (
                        <span className="ml-4 text-sm font-light tracking-wide text-zinc-600">
                          {item.label}
                        </span>
                      )}
                      {/* Premium tooltip for collapsed state */}
                      {isCollapsed && !isMobile && (
                        <div className="absolute left-full ml-4 px-4 py-3 bg-gradient-to-br from-zinc-900/95 to-black/95 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-zinc-600/30 backdrop-blur-md shadow-xl shadow-black/50 ring-1 ring-zinc-500/20">
                          {item.label}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item.path)}
                      className={`w-full group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                        isCollapsed && !isMobile ? "justify-center" : ""
                      } ${
                        activeItem === item.path
                          ? "bg-gradient-to-r from-zinc-800/80 via-zinc-700/60 to-zinc-800/80 text-white border border-zinc-600/40 shadow-lg shadow-black/30 backdrop-blur-sm ring-1 ring-zinc-500/20"
                          : "text-zinc-300 hover:bg-gradient-to-r hover:from-zinc-900/60 hover:to-zinc-800/40 hover:text-white border border-transparent hover:border-zinc-700/30 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm"
                      }`}
                    >
                      {/* Luxury glow effect for active item */}
                      {activeItem === item.path && (
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 via-zinc-400/5 to-zinc-500/10 rounded-2xl"></div>
                      )}
                      <item.icon className="w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 relative z-10" />
                      {(!isCollapsed || isMobile) && (
                        <span className="ml-4 text-sm font-light tracking-[0.05em] transition-all duration-300 text-left relative z-10">
                          {item.label}
                        </span>
                      )}
                      {/* Elegant active indicator */}
                      {activeItem === item.path &&
                        (!isCollapsed || isMobile) && (
                          <div className="ml-auto flex items-center space-x-1 relative z-10">
                            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full shadow-sm"></div>
                            <div className="w-1 h-1 bg-zinc-400 rounded-full shadow-sm"></div>
                          </div>
                        )}
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && !isMobile && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-zinc-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-zinc-700/50 backdrop-blur-sm">
                          {item.label}
                        </div>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* --- 2. START: User Profile Section (Mobile Only) --- */}
        {isMobile && (
          <div className="mt-auto p-4 border-t border-zinc-800/20">
            <div className="flex items-center mb-4">
              <FaUserCircle className="w-9 h-9 text-zinc-400" />
              <div className="ml-3">
                <p className="text-sm font-semibold text-white">Admin User</p>
                <p className="text-xs text-zinc-400">admin@velocity.io</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/60 border border-zinc-700/30 hover:border-zinc-600/40 transition-all duration-200"
            >
              <FaSignOutAlt className="w-5 h-5 text-zinc-300 mr-3" />
              <span className="text-sm font-medium text-zinc-200">Logout</span>
            </button>
          </div>
        )}
        {/* --- END: User Profile Section --- */}
      </div>
    </>
  );
}
