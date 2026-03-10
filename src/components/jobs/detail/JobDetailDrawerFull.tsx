import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { InlineEdit } from "../InlineEdit";
import { StatusBadge } from "../StatusBadge";
import { HoursChip } from "../HoursChip";
import { CandidatesTab } from "./CandidatesTab";
import { IntelligenceTab } from "./IntelligenceTab";
import { DetailsTab } from "./DetailsTab";
import { ActivityFeed } from "./ActivityFeed";
import type { Job, JobStatus } from "@/hooks/useJobs";

const TABS = ["Candidates", "Intelligence", "Details", "Activity"] as const;
type Tab = typeof TABS[number];

interface JobDetailDrawerProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  statuses: JobStatus[];
  onUpdate: (id: string, data: Partial<Job>) => void;
}

export function JobDetailDrawer({ job, open, onClose, statuses, onUpdate }: JobDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Candidates");
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className={`flex-1 bg-foreground/20 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`flex flex-col bg-background border-l border-border transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "75vw", maxWidth: "100vw" }}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge
                currentStatus={job.status}
                statuses={statuses}
                onChangeStatus={(s) => onUpdate(job.id, { status: s })}
              />
              <HoursChip
                value={job.workingHours}
                onSave={(v) => onUpdate(job.id, { workingHours: v } as any)}
              />
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors duration-fast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <InlineEdit
            value={job.roleTitle}
            onSave={(v) => onUpdate(job.id, { roleTitle: v })}
            className="text-xl font-bold text-foreground"
          />
          <InlineEdit
            value={job.clientName}
            onSave={(v) => onUpdate(job.id, { clientName: v })}
            className="text-sm text-muted-foreground mt-0.5"
          />

          {/* Tabs */}
          <div className="flex gap-0 mt-4 -mb-[1px]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-fast ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body: split into left (tabs) and right (activity) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — Tab content (65%) */}
          <div className="flex-1 overflow-hidden" style={{ flex: "0 0 65%" }}>
            {activeTab === "Candidates" && <CandidatesTab jobId={job.id} />}
            {activeTab === "Intelligence" && <IntelligenceTab jobId={job.id} />}
            {activeTab === "Details" && <DetailsTab job={job} statuses={statuses} />}
            {activeTab === "Activity" && <ActivityFeed jobId={job.id} />}
          </div>

          {/* Right — Activity feed (35%) */}
          <div className="border-l border-border flex flex-col overflow-hidden" style={{ flex: "0 0 35%" }}>
            <div className="px-4 py-2.5 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</p>
            </div>
            <ActivityFeed jobId={job.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
