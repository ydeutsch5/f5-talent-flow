import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  return (
    <div className="fixed inset-0 flex" style={{ zIndex: 50 + zOffset }}>
      {/* Backdrop */}
      <div
        className="flex-1 transition-opacity"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', opacity: visible ? 1 : 0, transitionDuration: '260ms' }}
        onClick={onClose}
      />

      {/* Drawer */}
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
            <InlineEdit value={candidate.name} onSave={(v) => onUpdate(candidate.id, { name: v })} className="text-[18px] font-semibold" />
            <InlineEdit value={candidate.title || "No title"} onSave={(v) => onUpdate(candidate.id, { title: v === "No title" ? null : v })} className="text-[13px]" />
          </div>
          <div className="flex items-center gap-3">
            <StatusBadgeInline current={candidate.status} color={statusColor} statuses={statuses} onSave={(s) => onUpdate(candidate.id, { status: s })} />
            <CommChipInline value={candidate.communicationRating} onSave={(v) => onUpdate(candidate.id, { communicationRating: v })} />
            <div style={{ width: '1px', height: '20px', backgroundColor: '#e9eaec' }} />
            <button onClick={onClose} className="rounded-md flex items-center justify-center transition-colors hover:bg-[#f3f4f6]" style={{ width: '28px', height: '28px', color: '#6b7280' }}>
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Tags row */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid #e9eaec' }}>
          <TagPills candidateId={candidate.id} tags={candidate.tags} maxVisible={6} />
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0" style={{ height: '40px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
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
        <div className="flex-1 overflow-auto" style={{ padding: '20px' }}>
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
  const navigate = useNavigate();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full cursor-pointer transition-colors"
          style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color, backgroundColor: `${color}20`, border: `1px solid ${color}35` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}30`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}20`; }}
        >
          {current}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '220px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="px-2.5 pt-1.5 pb-1">
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 500 }}>CHANGE STATUS</span>
        </div>
        {statuses.map((s) => (
          <button key={s.id} onClick={() => { onSave(s.label); setOpen(false); }}
            className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
            <span className="shrink-0" style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
            <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{s.label}</span>
            {s.label === current && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />}
          </button>
        ))}
        <div style={{ borderTop: '1px solid #e9eaec', margin: '4px 0' }} />
        <button onClick={() => { navigate('/settings'); setOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ fontSize: '12px', color: '#7c3aed' }}>
          Manage Statuses
        </button>
      </PopoverContent>
    </Popover>
  );
}

function CommChipInline({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const cc = getCommColor(value);
  const border = cc.bg === '#dcfce7' ? '#bbf7d0' : cc.bg === '#dbeafe' ? '#bfdbfe' : cc.bg === '#fef3c7' ? '#fde68a' : '#fecaca';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full cursor-pointer"
          style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: cc.bg, color: cc.text, border: `1px solid ${border}` }}>
          {commLabel(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '180px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        {COMM_OPTIONS.map((opt) => {
          const oc = getCommColor(opt);
          return (
            <button key={opt} onClick={() => { onSave(opt); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
              <span className="inline-flex items-center rounded-full shrink-0" style={{ padding: '1px 6px', fontSize: '10px', fontWeight: 600, backgroundColor: oc.bg, color: oc.text }}>{commLabel(opt)}</span>
              {value === opt && <Check className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#7c3aed' }} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
