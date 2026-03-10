import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Send,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", path: "/jobs", icon: Briefcase },
  { label: "Candidates", path: "/candidates", icon: Users },
  { label: "Submissions", path: "/submissions", icon: Send },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-sidebar flex flex-col z-50" style={{ backgroundColor: '#1e1f21' }}>
      {/* Workspace header */}
      <div className="h-12 flex items-center px-3 shrink-0">
        <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#7c3aed' }}>
          <span className="text-white text-xs font-bold">F5</span>
        </div>
        <span className="text-[13px] font-medium text-white ml-2 truncate">F5 Hiring Solutions</span>
        <ChevronDown className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#ffffff60' }} />
      </div>

      {/* Section label */}
      <div className="px-3 pt-4 pb-1">
        <span className="text-[10px] uppercase font-medium tracking-[0.08em]" style={{ color: '#ffffff50' }}>
          MAIN MENU
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-[1px] overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className="flex items-center gap-2 px-2 rounded-[5px] transition-colors"
              style={{
                height: '32px',
                margin: '1px 0',
                backgroundColor: active ? '#7c3aed18' : 'transparent',
                boxShadow: active ? 'inset 2px 0 0 #7c3aed' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = '#ffffff12';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? '#7c3aed' : '#ffffffaa' }}
              />
              <span
                className="text-[13px] font-medium"
                style={{ color: active ? '#ffffff' : '#ffffffcc' }}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="mx-3 my-2" style={{ borderTop: '1px solid #ffffff12' }} />

        {/* Settings */}
        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-2 px-2 rounded-[5px] transition-colors"
          style={{
            height: '32px',
            backgroundColor: location.pathname.startsWith('/settings') ? '#7c3aed18' : 'transparent',
            boxShadow: location.pathname.startsWith('/settings') ? 'inset 2px 0 0 #7c3aed' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!location.pathname.startsWith('/settings')) e.currentTarget.style.backgroundColor = '#ffffff12';
          }}
          onMouseLeave={(e) => {
            if (!location.pathname.startsWith('/settings')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings
            className="h-4 w-4 shrink-0"
            style={{ color: location.pathname.startsWith('/settings') ? '#7c3aed' : '#ffffffaa' }}
          />
          <span
            className="text-[13px] font-medium"
            style={{ color: location.pathname.startsWith('/settings') ? '#ffffff' : '#ffffffcc' }}
          >
            Settings
          </span>
        </Link>
      </nav>

      {/* User section */}
      <div className="px-2 py-3 flex items-center gap-2" style={{ borderTop: '1px solid #ffffff12' }}>
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#7c3aed' }}
        >
          <span className="text-[10px] font-semibold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
          <p className="text-[11px] capitalize" style={{ color: '#ffffff60' }}>{user?.role}</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-1 transition-colors"
          style={{ color: '#ffffff60' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff60'; }}
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={logout}
          className="p-1 transition-colors"
          style={{ color: '#ffffff60' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff60'; }}
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
