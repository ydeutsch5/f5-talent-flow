import { useState, useCallback } from "react";
import { Check, AlertCircle } from "lucide-react";
import { InlineEdit } from "../InlineEdit";
import { StatusBadge } from "../StatusBadge";
import { HoursChip } from "../HoursChip";
import { useUpdateJob, type Job, type JobStatus } from "@/hooks/useJobs";
import { format, formatDistanceToNow } from "date-fns";

interface DetailsTabProps {
  job: Job & { mustHaveRequirements?: string; niceToHave?: string; responsibilities?: string };
  statuses: JobStatus[];
}

function SaveIndicator({ status }: { status: "idle" | "saved" | "error" }) {
  if (status === "saved") {
    return <span className="inline-flex items-center gap-0.5 ml-2" style={{ fontSize: '10px', color: "#16a34a" }}><Check style={{ width: '10px', height: '10px' }} /> Saved</span>;
  }
  if (status === "error") {
    return <span className="inline-flex items-center gap-0.5 ml-2" style={{ fontSize: '10px', color: "#dc2626" }}><AlertCircle style={{ width: '10px', height: '10px' }} /> Failed</span>;
  }
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

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ paddingTop: '8px', paddingBottom: '4px', borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>{label}</span>
    </div>
  );
}

export function DetailsTab({ job, statuses }: DetailsTabProps) {
  const updateJob = useUpdateJob();
  const [saveStates, setSaveStates] = useState<Record<string, "idle" | "saved" | "error">>({});

  const handleSave = useCallback(
    async (field: string, value: any) => {
      try {
        await updateJob.mutateAsync({ id: job.id, data: { [field]: value } });
        setSaveStates((p) => ({ ...p, [field]: "saved" }));
        setTimeout(() => setSaveStates((p) => ({ ...p, [field]: "idle" })), 2000);
      } catch {
        setSaveStates((p) => ({ ...p, [field]: "error" }));
      }
    },
    [job.id, updateJob]
  );

  return (
    <div style={{ padding: '20px', overflow: 'auto' }}>
      {/* Job Info Grid */}
      <div className="grid grid-cols-2" style={{ gap: '20px 32px' }}>
        <div>
          <FieldLabel saveState={saveStates["roleTitle"]}>Role Title</FieldLabel>
          <InlineEdit value={job.roleTitle} onSave={(v) => handleSave("roleTitle", v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel saveState={saveStates["workingHours"]}>Working Hours</FieldLabel>
          <HoursChip value={job.workingHours} onSave={(v) => handleSave("workingHours", v)} />
        </div>

        <div>
          <FieldLabel saveState={saveStates["clientName"]}>Client</FieldLabel>
          <InlineEdit value={job.clientName} onSave={(v) => handleSave("clientName", v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel saveState={saveStates["status"]}>Status</FieldLabel>
          <StatusBadge currentStatus={job.status} statuses={statuses} onChangeStatus={(s) => handleSave("status", s)} />
        </div>

        <div>
          <FieldLabel saveState={saveStates["clientWebsite"]}>Website</FieldLabel>
          <InlineEdit
            value={job.clientWebsite || "—"}
            onSave={(v) => handleSave("clientWebsite", v === "—" ? null : v)}
            className="text-[13px]"
          />
        </div>
        <div>
          <FieldLabel saveState={saveStates["weeklyBudget"]}>Budget</FieldLabel>
          <InlineEdit value={job.weeklyBudget || "—"} onSave={(v) => handleSave("weeklyBudget", v === "—" ? null : v)} className="text-[13px]" />
        </div>

        <div>
          <FieldLabel saveState={saveStates["industry"]}>Industry</FieldLabel>
          <InlineEdit value={job.industry || "—"} onSave={(v) => handleSave("industry", v === "—" ? null : v)} className="text-[13px]" />
        </div>
        <div>
          <FieldLabel>Created</FieldLabel>
          <span style={{ fontSize: '13px', color: '#374151' }}>{format(new Date(job.createdAt), "MMM d, yyyy")}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>({formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })})</span>
        </div>
      </div>

      {/* Requirements */}
      <SectionDivider label="Requirements" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
        <div>
          <FieldLabel saveState={saveStates["mustHaveRequirements"]}>Must Have</FieldLabel>
          <InlineEdit
            value={job.mustHaveRequirements || "—"}
            onSave={(v) => handleSave("mustHaveRequirements", v === "—" ? "" : v)}
            as="textarea"
            className="text-[13px] w-full"
            inputClassName="min-h-[60px]"
          />
        </div>
        <div>
          <FieldLabel saveState={saveStates["niceToHave"]}>Nice To Have</FieldLabel>
          <InlineEdit
            value={job.niceToHave || "—"}
            onSave={(v) => handleSave("niceToHave", v === "—" ? "" : v)}
            as="textarea"
            className="text-[13px] w-full"
            inputClassName="min-h-[60px]"
          />
        </div>
        <div>
          <FieldLabel saveState={saveStates["responsibilities"]}>Responsibilities</FieldLabel>
          <InlineEdit
            value={job.responsibilities || "—"}
            onSave={(v) => handleSave("responsibilities", v === "—" ? "" : v)}
            as="textarea"
            className="text-[13px] w-full"
            inputClassName="min-h-[60px]"
          />
        </div>
      </div>
    </div>
  );
}
