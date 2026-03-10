import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useGlobalShortcuts();

  // Close mobile sidebar on resize to desktop
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
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <div className="relative w-sidebar h-full">
            <AppSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-sidebar overflow-auto">
        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center h-12 px-4 border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="h-8 w-8 rounded flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 text-sm font-bold text-primary">F5</span>
          <span className="text-sm font-semibold text-foreground ml-1">Hiring</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
