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
    <div className="flex h-[calc(100vh)]">
      <nav className="w-[200px] shrink-0 bg-secondary border-r border-border py-4 px-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Settings</h3>
        {SECTIONS.map(({ key, label }) => (
          <button key={key} onClick={() => setActive(key)}
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${active === key ? "border-l-[3px] border-primary text-primary font-medium bg-primary/5 -ml-[3px] pl-[calc(0.75rem+3px)]" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            {label}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
        {active === "statuses" && <CandidateStatusesSection />}
        {active === "tags" && <TagsSection />}
        {active === "team" && <TeamMembersSection />}
      </div>
    </div>
  );
}
