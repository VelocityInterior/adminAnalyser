import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaProjectDiagram,
  FaChartBar,
  FaHdd,
  FaTicketAlt,
  FaBullhorn,
  FaSignOutAlt,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slice/authSlice"; // ✅ make sure path is correct

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
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
    { icon: FaChartBar, label: "Tenant", path: "/tenantP", category: "main" },
    { icon: FaTachometerAlt, label: "Dashboard", path: "/dashboard", category: "main" },
    { icon: FaUsers, label: "User Management", path: "/usermanagement", category: "main" },
    { icon: FaProjectDiagram, label: "Project List", path: "/AdminProjectList", category: "main" },
    { icon: FaChartBar, label: "Billing List", path: "/BillingList", category: "reports" },
    { icon: FaHdd, label: "Tenant Manager", path: "/TenantUserManager", category: "system" },
    { icon: FaTicketAlt, label: "Support Desk", path: "/AdminSupportDesk", category: "support" },
    { icon: FaBullhorn, label: "Billing Console", path: "/AdminBillingConsole", category: "communication" },
    { icon: FaBars, label: "Plan", path: "/plan", category: "system" },
  ];

  // ✅ Proper logout handler
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/superadmin/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/superadmin/login", { replace: true }); // fallback
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) closeMobileMenu();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-4 bg-gradient-to-br from-zinc-900/95 to-black/95 text-white rounded-2xl border border-zinc-600/30 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? "fixed" : "relative"}
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          ${!isMobile && isCollapsed ? "w-20" : "w-64"}
          ${isMobile ? "w-64" : ""}
          h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white flex flex-col
          border-r border-zinc-800/20 transition-all duration-300 ease-in-out z-40
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/15 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              V
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="ml-4">
                <span className="text-2xl font-extralight tracking-[0.15em]">Velocity</span>
              </div>
            )}
          </div>
          {!isMobile && (
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2">
              <FaChevronRight className={`transition-transform ${isCollapsed ? "rotate-0" : "rotate-180"}`} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 ${
                    activeItem === item.path
                      ? "bg-zinc-800/70 text-white"
                      : "text-zinc-300 hover:bg-zinc-800/40 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {(!isCollapsed || isMobile) && <span className="ml-4 text-sm">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User (Mobile only) */}
        {isMobile && (
          <div className="mt-auto p-4 border-t border-zinc-800/20">
            <div className="flex items-center mb-4">
              <FaUserCircle className="w-9 h-9 text-zinc-400" />
              <div className="ml-3">
                <p className="text-sm font-semibold text-white">{user?.name || "Admin User"}</p>
                <p className="text-xs text-zinc-400">{user?.email || "admin@velocity.io"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/60"
            >
              <FaSignOutAlt className="w-5 h-5 mr-3 text-zinc-300" />
              <span className="text-sm font-medium text-zinc-200">Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
