import { useState, useEffect } from "react";
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

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 transition-opacity"
        style={{
          backgroundColor: 'rgba(0,0,0,0.15)',
          opacity: visible ? 1 : 0,
          transitionDuration: '260ms',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="flex flex-col bg-white"
        style={{
          width: '78vw',
          minWidth: '1100px',
          maxWidth: '100vw',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 260ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Header */}
        <div className="shrink-0" style={{ height: '56px', borderBottom: '1px solid #e9eaec', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <InlineEdit
                value={job.roleTitle}
                onSave={(v) => onUpdate(job.id, { roleTitle: v })}
                className="text-[18px] font-semibold"
              />
            </div>
            <InlineEdit
              value={job.clientName}
              onSave={(v) => onUpdate(job.id, { clientName: v })}
              className="text-[13px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge currentStatus={job.status} statuses={statuses} onChangeStatus={(s) => onUpdate(job.id, { status: s })} />
            <HoursChip value={job.workingHours} onSave={(v) => onUpdate(job.id, { workingHours: v } as any)} />
            <div style={{ width: '1px', height: '20px', backgroundColor: '#e9eaec' }} />
            <button
              onClick={onClose}
              className="rounded-md flex items-center justify-center transition-colors hover:bg-[#f3f4f6]"
              style={{ width: '28px', height: '28px', color: '#6b7280' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0" style={{ height: '40px', borderBottom: '1px solid #e9eaec', padding: '0 20px', backgroundColor: '#ffffff' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="transition-colors"
              style={{
                padding: '0 16px',
                height: '40px',
                fontSize: '13px',
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? '#1a1a1a' : '#6b7280',
                borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
              }}
              onMouseEnter={(e) => { if (activeTab !== tab) { e.currentTarget.style.color = '#374151'; e.currentTarget.style.backgroundColor = '#f7f8f9'; } }}
              onMouseLeave={(e) => { if (activeTab !== tab) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left content */}
          <div className="overflow-auto" style={{ flex: '0 0 65%', padding: '20px' }}>
            {activeTab === "Candidates" && <CandidatesTab jobId={job.id} />}
            {activeTab === "Intelligence" && <IntelligenceTab jobId={job.id} />}
            {activeTab === "Details" && <DetailsTab job={job} statuses={statuses} />}
            {activeTab === "Activity" && <ActivityFeed jobId={job.id} />}
          </div>

          {/* Right activity panel */}
          <div className="overflow-auto" style={{ flex: '0 0 35%', borderLeft: '1px solid #e9eaec', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '12px' }}>Activity</p>
            <ActivityFeed jobId={job.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
