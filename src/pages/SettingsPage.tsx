import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { CandidateStatusesSection } from "@/components/settings/CandidateStatusesSection";
import { TagsSection } from "@/components/settings/TagsSection";
import { TeamMembersSection } from "@/components/settings/TeamMembersSection";
import { usePageTitle } from "@/hooks/usePageTitle";

const SECTIONS = [
  { key: "statuses", label: "Candidate Statuses" },
  { key: "tags", label: "Tags" },
  { key: "team", label: "Team Members" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function SettingsPage() {
  usePageTitle("Settings");
  const user = useAuthStore((s) => s.user);
  const [active, setActive] = useState<SectionKey>("statuses");

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen">
      <nav className="shrink-0" style={{ width: '200px', backgroundColor: '#f9fafb', borderRight: '1px solid #e9eaec', padding: '16px 8px' }}>
        <h3 style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', padding: '0 12px', marginBottom: '8px' }}>Settings</h3>
        {SECTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className="w-full text-left rounded-[5px] transition-colors"
            style={{
              fontSize: '13px',
              padding: '6px 12px',
              marginBottom: '1px',
              fontWeight: active === key ? 600 : 400,
              color: active === key ? '#1a1a1a' : '#6b7280',
              backgroundColor: active === key ? '#ffffff' : 'transparent',
              boxShadow: active === key ? 'inset 2px 0 0 #7c3aed' : 'none',
            }}
            onMouseEnter={(e) => { if (active !== key) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { if (active !== key) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 32px', maxWidth: '800px' }}>
        {active === "statuses" && <CandidateStatusesSection />}
        {active === "tags" && <TagsSection />}
        {active === "team" && <TeamMembersSection />}
      </div>
    </div>
  );
}
