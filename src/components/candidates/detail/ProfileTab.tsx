import { useState, useCallback } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import { TagPills } from "../TagPills";
import type { Candidate } from "@/hooks/useCandidates";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getCommColor, commLabel, COMM_OPTIONS } from "@/components/jobs/detail/matchUtils";
import { useUpdateCandidateFull } from "@/hooks/useCandidates";

const SHIFT_LABELS: Record<string, string> = { REGULAR: "Regular", US_SHIFT: "US Shift", BOTH: "Both" };
const SHIFT_OPTIONS = ["REGULAR", "US_SHIFT", "BOTH"] as const;

function SaveIndicator({ status }: { status: "idle" | "saved" | "error" }) {
  if (status === "saved") return <span className="inline-flex items-center gap-0.5 text-xs ml-2" style={{ color: "#15803d" }}><Check className="h-3 w-3" /> Saved</span>;
  if (status === "error") return <span className="inline-flex items-center gap-0.5 text-xs text-destructive ml-2"><AlertCircle className="h-3 w-3" /> Failed</span>;
  return null;
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

  const label = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center";
  const statusObj = statuses.find((s) => s.label === candidate.status);
  const statusColor = statusObj?.color || "#6b7280";
  const cc = getCommColor(candidate.communicationRating);

  return (
    <div className="p-4 overflow-y-auto space-y-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <p className={label}>Name <SaveIndicator status={saves["name"] || "idle"} /></p>
          <InlineEdit value={candidate.name} onSave={(v) => handleSave("name", v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={label}>Shift Availability <SaveIndicator status={saves["shiftAvailability"] || "idle"} /></p>
          <ShiftPicker value={candidate.shiftAvailability} onSave={(v) => handleSave("shiftAvailability", v)} />
        </div>

        <div>
          <p className={label}>Email <SaveIndicator status={saves["email"] || "idle"} /></p>
          <InlineEdit value={candidate.email} onSave={(v) => handleSave("email", v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={label}>Communication <SaveIndicator status={saves["communicationRating"] || "idle"} /></p>
          <CommPicker value={candidate.communicationRating} onSave={(v) => handleSave("communicationRating", v)} />
        </div>

        <div>
          <p className={label}>Phone <SaveIndicator status={saves["phone"] || "idle"} /></p>
          <InlineEdit value={candidate.phone || "—"} onSave={(v) => handleSave("phone", v === "—" ? null : v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={label}>Status <SaveIndicator status={saves["status"] || "idle"} /></p>
          <StatusPicker current={candidate.status} statuses={statuses} onSave={(v) => handleSave("status", v)} />
        </div>

        <div>
          <p className={label}>Title <SaveIndicator status={saves["title"] || "idle"} /></p>
          <InlineEdit value={candidate.title || "—"} onSave={(v) => handleSave("title", v === "—" ? null : v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={label}>Source <SaveIndicator status={saves["source"] || "idle"} /></p>
          <InlineEdit value={candidate.source || "—"} onSave={(v) => handleSave("source", v === "—" ? null : v)} className="text-sm text-foreground" />
        </div>

        <div className="col-span-2">
          <p className={label}>Portfolio / LinkedIn <SaveIndicator status={saves["portfolioUrl"] || "idle"} /></p>
          <InlineEdit value={candidate.portfolioUrl || "—"} onSave={(v) => handleSave("portfolioUrl", v === "—" ? null : v)} className="text-sm text-primary hover:underline" />
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className={label}>Tags</p>
        <TagPills candidateId={candidate.id} tags={candidate.tags} maxVisible={10} />
      </div>

      {/* Transcript */}
      <div>
        <p className={label}>Communication Test Transcript <SaveIndicator status={saves["transcription"] || "idle"} /></p>
        <InlineEdit
          value={candidate.transcription || ""}
          onSave={(v) => handleSave("transcription", v)}
          as="textarea"
          className="text-sm text-foreground w-full min-h-[200px]"
          inputClassName="min-h-[200px]"
        />
        {!candidate.transcription && (
          <p className="text-xs text-muted-foreground mt-1">Click to paste Fathom/Meet transcript here...</p>
        )}
      </div>
    </div>
  );
}

function StatusPicker({ current, statuses, onSave }: { current: string; statuses: CandidateStatus[]; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const obj = statuses.find((s) => s.label === current);
  const color = obj?.color || "#6b7280";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer" style={{ backgroundColor: `${color}26`, color }}>
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

function CommPicker({ value, onSave }: { value: string; onSave: (v: string) => void }) {
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

function ShiftPicker({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground bg-muted border-0 outline-none cursor-pointer hover:bg-muted/80 transition-colors duration-fast">
          {SHIFT_LABELS[value] || value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1" align="start">
        {SHIFT_OPTIONS.map((opt) => (
          <button key={opt} onClick={() => { onSave(opt); setOpen(false); }}
            className={`flex items-center w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${value === opt ? "bg-muted font-medium" : "hover:bg-muted/60"}`}>
            {SHIFT_LABELS[opt]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
