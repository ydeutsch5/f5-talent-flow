import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InlineEdit } from "./InlineEdit";
import { StatusBadge } from "./StatusBadge";
import { HoursChip } from "./HoursChip";
import type { Job, JobStatus } from "@/hooks/useJobs";
import { formatDistanceToNow, format } from "date-fns";

interface JobDetailDrawerProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  statuses: JobStatus[];
  onUpdate: (id: string, data: Partial<Job>) => void;
}

export function JobDetailDrawer({ job, open, onClose, statuses, onUpdate }: JobDetailDrawerProps) {
  if (!job) return null;

  const labelCls = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1";
  const valueCls = "text-sm text-foreground";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusBadge
              currentStatus={job.status}
              statuses={statuses}
              onChangeStatus={(s) => onUpdate(job.id, { status: s })}
            />
          </div>
          <SheetTitle className="text-lg font-semibold mt-2">
            <InlineEdit
              value={job.roleTitle}
              onSave={(v) => onUpdate(job.id, { roleTitle: v })}
              className="text-lg font-semibold"
            />
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {job.clientName}
            {job.clientWebsite && (
              <>
                {" · "}
                <a
                  href={job.clientWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Website
                </a>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Weekly Budget</p>
              <InlineEdit
                value={job.weeklyBudget || "—"}
                onSave={(v) => onUpdate(job.id, { weeklyBudget: v === "—" ? null : v } as any)}
                className={valueCls}
              />
            </div>
            <div>
              <p className={labelCls}>Working Hours</p>
              <HoursChip
                value={job.workingHours}
                onSave={(v) => onUpdate(job.id, { workingHours: v } as any)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Industry</p>
              <p className={valueCls}>{job.industry || "—"}</p>
            </div>
            <div>
              <p className={labelCls}>Candidates</p>
              <p className={valueCls}>{job._count.matches}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Created</p>
              <p className={valueCls}>{format(new Date(job.createdAt), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className={labelCls}>Updated</p>
              <p className={valueCls}>{formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
