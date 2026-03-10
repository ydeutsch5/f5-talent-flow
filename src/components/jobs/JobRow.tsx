import { useState } from "react";
import { MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { InlineEdit } from "./InlineEdit";
import { StatusBadge } from "./StatusBadge";
import { HoursChip } from "./HoursChip";
import type { Job, JobStatus } from "@/hooks/useJobs";
import { formatDistanceToNow } from "date-fns";

interface JobRowProps {
  job: Job;
  statuses: JobStatus[];
  onUpdate: (id: string, data: Partial<Job>) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (job: Job) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function JobRow({
  job,
  statuses,
  onUpdate,
  onDelete,
  onOpenDetail,
  selected,
  onSelect,
}: JobRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const relativeTime = formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true });

  return (
    <>
      <div
        className={`
          group grid items-center h-row border-b border-border px-3 cursor-pointer
          transition-colors duration-fast
          ${hovered ? "bg-row-hover" : ""}
          ${selected ? "bg-primary/5" : ""}
        `}
        style={{
          gridTemplateColumns: "28px 1fr 120px 100px 100px 80px 90px 36px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onOpenDetail(job)}
      >
        {/* Checkbox */}
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(job.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer transition-opacity duration-fast ${
              hovered || selected ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Name + Client */}
        <div className="flex flex-col justify-center min-w-0 pr-2">
          <InlineEdit
            value={job.roleTitle}
            onSave={(v) => onUpdate(job.id, { roleTitle: v })}
            className="text-sm font-semibold text-foreground truncate"
          />
          <span className="text-xs text-muted-foreground truncate">{job.clientName}</span>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <StatusBadge
            currentStatus={job.status}
            statuses={statuses}
            onChangeStatus={(s) => onUpdate(job.id, { status: s })}
          />
        </div>

        {/* Budget */}
        <div className="flex items-center">
          <InlineEdit
            value={job.weeklyBudget || "—"}
            onSave={(v) => onUpdate(job.id, { weeklyBudget: v === "—" ? null : v } as any)}
            className="text-sm text-muted-foreground"
          />
        </div>

        {/* Hours */}
        <div className="flex items-center">
          <HoursChip
            value={job.workingHours}
            onSave={(v) => onUpdate(job.id, { workingHours: v } as any)}
          />
        </div>

        {/* Candidates count */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded bg-muted text-xs text-muted-foreground px-1.5">
            {job._count.matches}
          </span>
        </div>

        {/* Updated */}
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground truncate">{relativeTime}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-all duration-fast ${
                  hovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(job);
                }}
              >
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{job.roleTitle}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all candidate evaluations for this job. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(job.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
