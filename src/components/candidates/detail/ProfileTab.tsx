import { useState, useCallback } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import { TagPills } from "../TagPills";
import type { Candidate } from "@/hooks/useCandidates";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getCommColor, commLabel, COMM_OPTIONS } from "@/components/jobs/detail/matchUtils";
import { useUpdateCandidateFull } from "@/hooks/useCandidates";
import { useNavigate } from "react-router-dom";

const SHIFT_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  REGULAR: { label: "Regular", bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  US_SHIFT: { label: "US Shift", bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  BOTH: { label: "Both", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
};
const SHIFT_OPTIONS = ["REGULAR", "US_SHIFT", "BOTH"] as const;

function SaveIndicator({ status }: { status: "idle" | "saved" | "error" }) {
  if (status === "saved") return <span className="inline-flex items-center gap-0.5 ml-2" style={{ fontSize: '10px', color: "#16a34a" }}><Check style={{ width: '10px', height: '10px' }} /> Saved</span>;
  if (status === "error") return <span className="inline-flex items-center gap-0.5 ml-2" style={{ fontSize: '10px', color: "#dc2626" }}><AlertCircle style={{ width: '10px', height: '10px' }} /> Failed</span>;
  return null;
}

function FieldLabel({ children, saveState }: { children: React.ReactNode; saveState?: "idle" | "saved" | "error" }) {
  return (
    <p className="flex items-center" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>
      {children}
      {saveState && <SaveIndicator status={saveState} />}
    </p>
  );
}

interface ProfileTabProps {
  candidate: Candidate;
  statuses: CandidateStatus[];
}

export function ProfileTab({ candidate, statuses }: ProfileTabProps) {
  const update = useUpdateCandidateFull();
  const [saves, setSaves] = useState<Record<string, "idle" | "saved" | "error">>({});

  const handleSave = useCallback(async (field: string, value: any) => {
    try {
      await update.mutateAsync({ id: candidate.id, data: { [field]: value } });
      setSaves((p) => ({ ...p, [field]: "saved" }));
      setTimeout(() => setSaves((p) => ({ ...p, [field]: "idle" })), 2000);
    } catch {
      setSaves((p) => ({ ...p, [field]: "error" }));
    }
  }, [candidate.id, update]);

  const statusObj = statuses.find((s) => s.label === candidate.status);
  const statusColor = statusObj?.color || "#6b7280";

  return (
    <div style={{ padding: '20px', overflow: 'auto' }}>
      {/* Info Grid */}
      <div className="grid grid-cols-2" style={{ gap: '20px 32px' }}>
        <div>
          <FieldLabel saveState={saves["name"]}>Name</FieldLabel>
          <InlineEdit value={candidate.name} onSave={(v) => handleSave("name", v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel saveState={saves["status"]}>Status</FieldLabel>
          <StatusPicker current={candidate.status} color={statusColor} statuses={statuses} onSave={(v) => handleSave("status", v)} />
        </div>

        <div>
          <FieldLabel saveState={saves["email"]}>Email</FieldLabel>
          <InlineEdit value={candidate.email} onSave={(v) => handleSave("email", v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel saveState={saves["communicationRating"]}>Communication</FieldLabel>
          <CommPicker value={candidate.communicationRating} onSave={(v) => handleSave("communicationRating", v)} />
        </div>

        <div>
          <FieldLabel saveState={saves["phone"]}>Phone</FieldLabel>
          <InlineEdit value={candidate.phone || "—"} onSave={(v) => handleSave("phone", v === "—" ? null : v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel saveState={saves["shiftAvailability"]}>Shift Availability</FieldLabel>
          <ShiftPicker value={candidate.shiftAvailability} onSave={(v) => handleSave("shiftAvailability", v)} />
        </div>

        <div>
          <FieldLabel saveState={saves["title"]}>Title</FieldLabel>
          <InlineEdit value={candidate.title || "—"} onSave={(v) => handleSave("title", v === "—" ? null : v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel saveState={saves["source"]}>Source</FieldLabel>
          <InlineEdit value={candidate.source || "—"} onSave={(v) => handleSave("source", v === "—" ? null : v)} className="text-[13px]" />
        </div>

        <div className="col-span-2">
          <FieldLabel saveState={saves["portfolioUrl"]}>Portfolio / LinkedIn</FieldLabel>
          <InlineEdit value={candidate.portfolioUrl || "—"} onSave={(v) => handleSave("portfolioUrl", v === "—" ? null : v)} className="text-[13px]" />
        </div>
      </div>

      {/* Tags */}
      <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '20px', paddingTop: '20px' }}>
        <FieldLabel>Tags</FieldLabel>
        <TagPills candidateId={candidate.id} tags={candidate.tags} maxVisible={10} />
      </div>

      {/* Transcript */}
      <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '20px', paddingTop: '20px' }}>
        <FieldLabel saveState={saves["transcription"]}>Communication Test Transcript</FieldLabel>
        <InlineEdit
          value={candidate.transcription || ""}
          onSave={(v) => handleSave("transcription", v)}
          as="textarea"
          className="text-[13px] w-full"
          inputClassName="min-h-[120px]"
        />
        {!candidate.transcription && (
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>Click to paste Fathom/Meet transcript here...</p>
        )}
      </div>
    </div>
  );
}

/* ── Pickers (consistent with list row badge style) ─────── */
function StatusPicker({ current, color, statuses, onSave }: { current: string; color: string; statuses: CandidateStatus[]; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full cursor-pointer transition-colors"
          style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color, backgroundColor: `${color}20`, border: `1px solid ${color}35` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}30`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}20`; }}>
          {current}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '220px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="px-2.5 pt-1.5 pb-1"><span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 500 }}>CHANGE STATUS</span></div>
        {statuses.map((s) => (
          <button key={s.id} onClick={() => { onSave(s.label); setOpen(false); }}
            className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
            <span className="shrink-0" style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
            <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{s.label}</span>
            {s.label === current && <Check style={{ width: '14px', height: '14px', color: '#7c3aed' }} />}
          </button>
        ))}
        <div style={{ borderTop: '1px solid #e9eaec', margin: '4px 0' }} />
        <button onClick={() => { navigate('/settings'); setOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ fontSize: '12px', color: '#7c3aed' }}>Manage Statuses</button>
      </PopoverContent>
    </Popover>
  );
}

function CommPicker({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const cc = getCommColor(value);
  const border = cc.bg === '#dcfce7' ? '#bbf7d0' : cc.bg === '#dbeafe' ? '#bfdbfe' : cc.bg === '#fef3c7' ? '#fde68a' : '#fecaca';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full cursor-pointer"
          style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: cc.bg, color: cc.text, border: `1px solid ${border}` }}>
          {commLabel(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '180px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        {COMM_OPTIONS.map((opt) => {
          const oc = getCommColor(opt);
          const ob = oc.bg === '#dcfce7' ? '#bbf7d0' : oc.bg === '#dbeafe' ? '#bfdbfe' : oc.bg === '#fef3c7' ? '#fde68a' : '#fecaca';
          return (
            <button key={opt} onClick={() => { onSave(opt); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
              <span className="inline-flex items-center rounded-full shrink-0" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, backgroundColor: oc.bg, color: oc.text, border: `1px solid ${ob}` }}>
                {commLabel(opt)}
              </span>
              {value === opt && <Check style={{ width: '14px', height: '14px', marginLeft: 'auto', color: '#7c3aed' }} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function ShiftPicker({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const s = SHIFT_LABELS[value] || SHIFT_LABELS.REGULAR;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full cursor-pointer"
          style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
          {s.label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '180px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        {SHIFT_OPTIONS.map((opt) => {
          const sl = SHIFT_LABELS[opt];
          return (
            <button key={opt} onClick={() => { onSave(opt); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
              <span className="inline-flex items-center rounded-full shrink-0" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, backgroundColor: sl.bg, color: sl.color, border: `1px solid ${sl.border}` }}>
                {sl.label}
              </span>
              {value === opt && <Check style={{ width: '14px', height: '14px', marginLeft: 'auto', color: '#7c3aed' }} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
