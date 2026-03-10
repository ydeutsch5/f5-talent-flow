import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useGlobalShortcuts();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => { if (mq.matches) setMobileOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }} onClick={() => setMobileOpen(false)} />
          <div className="relative w-sidebar h-full">
            <AppSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-sidebar overflow-auto bg-white">
        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center h-12 px-4" style={{ borderBottom: '1px solid #e9eaec' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
            style={{ color: '#6b7280' }}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-7 w-7 rounded-md flex items-center justify-center ml-2 shrink-0" style={{ backgroundColor: '#7c3aed' }}>
            <span className="text-white text-xs font-bold">F5</span>
          </div>
          <span className="text-[13px] font-medium ml-1.5" style={{ color: '#1a1a1a' }}>F5 Hiring</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
