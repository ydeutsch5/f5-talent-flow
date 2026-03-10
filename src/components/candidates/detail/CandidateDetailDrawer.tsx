import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import { TagPills } from "../TagPills";
import { ProfileTab } from "./ProfileTab";
import { JobsTab } from "./JobsTab";
import { ResumeTab } from "./ResumeTab";
import { CandidateActivityTab } from "./CandidateActivityTab";
import type { Candidate } from "@/hooks/useCandidates";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getCommColor, commLabel, COMM_OPTIONS } from "@/components/jobs/detail/matchUtils";

const TABS = ["Profile", "Jobs", "Resume", "Activity"] as const;
type Tab = typeof TABS[number];

interface CandidateDetailDrawerProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  statuses: CandidateStatus[];
  onUpdate: (id: string, data: Record<string, any>) => void;
  zOffset?: number;
}

export function CandidateDetailDrawer({ candidate, open, onClose, statuses, onUpdate, zOffset = 0 }: CandidateDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !candidate) return null;

  const statusObj = statuses.find((s) => s.label === candidate.status);
  const statusColor = statusObj?.color || "#6b7280";
  const cc = getCommColor(candidate.communicationRating);

  return (
    <div className="fixed inset-0 flex" style={{ zIndex: 50 + zOffset }}>
      {/* Backdrop */}
      <div
        className={`flex-1 bg-foreground/20 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        style={{ marginTop: zOffset * 16, marginLeft: zOffset * 16 }}
      />

      {/* Drawer */}
      <div
        className={`flex flex-col bg-background border-l border-border transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "75vw", maxWidth: "100vw", marginTop: zOffset * 16 }}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status badge */}
              <StatusBadgeInline current={candidate.status} color={statusColor} statuses={statuses} onSave={(s) => onUpdate(candidate.id, { status: s })} />
              {/* Comm chip */}
              <CommChipInline value={candidate.communicationRating} onSave={(v) => onUpdate(candidate.id, { communicationRating: v })} />
            </div>
            <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors duration-fast">
              <X className="h-4 w-4" />
            </button>
          </div>

          <InlineEdit value={candidate.name} onSave={(v) => onUpdate(candidate.id, { name: v })} className="text-xl font-bold text-foreground" />
          <InlineEdit value={candidate.title || "No title"} onSave={(v) => onUpdate(candidate.id, { title: v === "No title" ? null : v })} className="text-sm text-muted-foreground mt-0.5" />

          {/* Tags */}
          <div className="mt-2">
            <TagPills candidateId={candidate.id} tags={candidate.tags} maxVisible={6} />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-4 -mb-[1px]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-fast ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "Profile" && <ProfileTab candidate={candidate} statuses={statuses} />}
          {activeTab === "Jobs" && <JobsTab candidateId={candidate.id} />}
          {activeTab === "Resume" && <ResumeTab candidateId={candidate.id} />}
          {activeTab === "Activity" && <CandidateActivityTab candidateId={candidate.id} />}
        </div>
      </div>
    </div>
  );
}

function StatusBadgeInline({ current, color, statuses, onSave }: { current: string; color: string; statuses: CandidateStatus[]; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer transition-opacity hover:opacity-80" style={{ backgroundColor: `${color}26`, color }}>
          {current}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        {statuses.map((s) => (
          <button key={s.id} onClick={() => { onSave(s.label); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${s.label === current ? "bg-muted font-medium" : "hover:bg-muted/60"}`}>
            <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: s.color }} />
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function CommChipInline({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const cc = getCommColor(value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer" style={{ backgroundColor: cc.bg, color: cc.text }}>
          {commLabel(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1" align="start">
        {COMM_OPTIONS.map((opt) => (
          <button key={opt} onClick={() => { onSave(opt); setOpen(false); }}
            className={`flex items-center w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${value === opt ? "bg-muted font-medium" : "hover:bg-muted/60"}`}>
            {commLabel(opt)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
