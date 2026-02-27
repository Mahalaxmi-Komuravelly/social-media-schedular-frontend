import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md transition ${isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-300 hover:bg-slate-800"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 
   ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`;


  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col p-6 h-full">
        <h1 className="text-xl font-bold mb-8">
          Social Scheduler
        </h1>

        <nav className="space-y-3">
          <NavLink to="/dashboard" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/posts" className={navLinkClass}>
            Posts
          </NavLink>
          <NavLink to="/dashboard/campaigns" className={navLinkClass}>
            Campaigns
          </NavLink>
          <NavLink to="/dashboard/analytics" className={navLinkClass}>
            Analytics
          </NavLink>
          {/* 🔥 Only for Admin & Manager */}
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <NavLink
              to="/dashboard/users"
              className={navLinkClass}
            >
              Users
            </NavLink>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md"
        >
          Logout
        </button>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full">

        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center relative">

          {/* Left section: Hamburger + Welcome text */}
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Right section: Profile info */}
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
            <span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
              {user?.role[0]}
            </span>
          </div>

          {/* Mobile Nav Links */}
          <nav
            className={`md:hidden bg-slate-900 text-white flex flex-col px-4 py-3 transition-all duration-300 absolute top-full left-0 w-full z-50
            ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          >
            <NavLink
              to="/dashboard"
              end
              className={mobileNavClass}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/posts"
              className={mobileNavClass}
              onClick={() => setMobileOpen(false)}
            >
              Posts
            </NavLink>
            <NavLink
              to="/dashboard/campaigns"
              className={mobileNavClass}
              onClick={() => setMobileOpen(false)}
            >
              Campaigns
            </NavLink>
            <NavLink
              to="/dashboard/analytics"
              className={mobileNavClass}
              onClick={() => setMobileOpen(false)}
            >
              Analytics
            </NavLink>
            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <NavLink
                to="/dashboard/users"
                className={mobileNavClass}
                onClick={() => setMobileOpen(false)}
              >
                Users
              </NavLink>
            )}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="mt-3 text-left px-3 py-2 text-sm font-medium text-red-400 hover:text-red-500 transition"
            >
              Logout
            </button>
          </nav>
        </header>

        {/* Content */}
        <main className="flex-1 w-full overflow-y-auto">
          <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;