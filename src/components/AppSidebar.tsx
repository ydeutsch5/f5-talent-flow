import { useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Send,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", path: "/jobs", icon: Briefcase },
  { label: "Candidates", path: "/candidates", icon: Users },
  { label: "Submissions", path: "/submissions", icon: Send },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-sidebar bg-[#1e1f21] flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center px-5">
        <span className="text-lg font-bold text-primary">F5</span>
        <span className="text-lg font-semibold text-white ml-1.5">Hiring</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium
                transition-colors duration-fast
                ${active
                  ? "border-l-[3px] border-primary text-primary bg-primary/5 -ml-[3px] pl-[calc(0.75rem+3px)]"
                  : "text-white/70 hover:bg-[#ffffff15] hover:text-white"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-white/50 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="text-white/50 hover:text-white transition-colors duration-fast p-1"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
