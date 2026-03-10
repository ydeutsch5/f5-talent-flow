import { useState, useCallback } from "react";
import { Check, X, AlertCircle } from "lucide-react";
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
    return (
      <span className="inline-flex items-center gap-0.5 text-xs ml-2" style={{ color: "#15803d" }}>
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-destructive ml-2">
        <AlertCircle className="h-3 w-3" /> Failed to save
      </span>
    );
  }
  return null;
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

  const fieldLabel = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center";

  return (
    <div className="p-4 overflow-y-auto space-y-6">
      {/* Two columns */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* Left */}
        <div>
          <p className={fieldLabel}>Role Title <SaveIndicator status={saveStates["roleTitle"] || "idle"} /></p>
          <InlineEdit value={job.roleTitle} onSave={(v) => handleSave("roleTitle", v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={fieldLabel}>Working Hours <SaveIndicator status={saveStates["workingHours"] || "idle"} /></p>
          <HoursChip value={job.workingHours} onSave={(v) => handleSave("workingHours", v)} />
        </div>

        <div>
          <p className={fieldLabel}>Client Name <SaveIndicator status={saveStates["clientName"] || "idle"} /></p>
          <InlineEdit value={job.clientName} onSave={(v) => handleSave("clientName", v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={fieldLabel}>Status <SaveIndicator status={saveStates["status"] || "idle"} /></p>
          <StatusBadge currentStatus={job.status} statuses={statuses} onChangeStatus={(s) => handleSave("status", s)} />
        </div>

        <div>
          <p className={fieldLabel}>Client Website <SaveIndicator status={saveStates["clientWebsite"] || "idle"} /></p>
          {job.clientWebsite ? (
            <InlineEdit
              value={job.clientWebsite}
              onSave={(v) => handleSave("clientWebsite", v)}
              className="text-sm text-primary hover:underline"
            />
          ) : (
            <InlineEdit value="—" onSave={(v) => handleSave("clientWebsite", v)} className="text-sm text-muted-foreground" />
          )}
        </div>
        <div>
          <p className={fieldLabel}>Created</p>
          <p className="text-sm text-foreground">{format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
        </div>

        <div>
          <p className={fieldLabel}>Industry <SaveIndicator status={saveStates["industry"] || "idle"} /></p>
          <InlineEdit value={job.industry || "—"} onSave={(v) => handleSave("industry", v === "—" ? null : v)} className="text-sm text-foreground" />
        </div>
        <div>
          <p className={fieldLabel}>Last Updated</p>
          <p className="text-sm text-foreground">{formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}</p>
        </div>

        <div>
          <p className={fieldLabel}>Weekly Budget <SaveIndicator status={saveStates["weeklyBudget"] || "idle"} /></p>
          <InlineEdit value={job.weeklyBudget || "—"} onSave={(v) => handleSave("weeklyBudget", v === "—" ? null : v)} className="text-sm text-foreground" />
        </div>
      </div>

      {/* Full-width text areas */}
      <div>
        <p className={fieldLabel}>Must Have Requirements <SaveIndicator status={saveStates["mustHaveRequirements"] || "idle"} /></p>
        <InlineEdit
          value={job.mustHaveRequirements || "—"}
          onSave={(v) => handleSave("mustHaveRequirements", v === "—" ? "" : v)}
          as="textarea"
          className="text-sm text-foreground w-full"
        />
      </div>

      <div>
        <p className={fieldLabel}>Nice To Have Requirements <SaveIndicator status={saveStates["niceToHave"] || "idle"} /></p>
        <InlineEdit
          value={job.niceToHave || "—"}
          onSave={(v) => handleSave("niceToHave", v === "—" ? "" : v)}
          as="textarea"
          className="text-sm text-foreground w-full"
        />
      </div>

      <div>
        <p className={fieldLabel}>Responsibilities <SaveIndicator status={saveStates["responsibilities"] || "idle"} /></p>
        <InlineEdit
          value={job.responsibilities || "—"}
          onSave={(v) => handleSave("responsibilities", v === "—" ? "" : v)}
          as="textarea"
          className="text-sm text-foreground w-full"
        />
      </div>
    </div>
  );
}
