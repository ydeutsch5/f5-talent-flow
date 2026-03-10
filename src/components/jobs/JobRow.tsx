import { useState } from "react";
import { MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
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

export function JobRow({ job, statuses, onUpdate, onDelete, onOpenDetail, selected, onSelect }: JobRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        className="group grid items-center cursor-pointer transition-colors"
        style={{
          gridTemplateColumns: "28px 1fr 120px 100px 100px 80px 90px 36px",
          height: '34px',
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: hovered ? '#f7f8f9' : selected ? '#7c3aed08' : '#ffffff',
          padding: '0 8px',
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
            onChange={(e) => { e.stopPropagation(); onSelect(job.id); }}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer transition-opacity"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              border: '1.5px solid #d1d5db',
              opacity: hovered || selected ? 1 : 0,
              accentColor: '#7c3aed',
            }}
          />
        </div>

        {/* Name + Client */}
        <div className="flex flex-col justify-center min-w-0 pr-2" style={{ paddingLeft: '12px' }}>
          <div onClick={(e) => e.stopPropagation()}>
            <InlineEdit
              value={job.roleTitle}
              onSave={(v) => onUpdate(job.id, { roleTitle: v })}
              className="text-[13px] font-medium truncate"
              inputClassName="w-full"
            />
          </div>
          <span className="text-[11px] truncate" style={{ color: '#9ca3af' }}>{job.clientName}</span>
        </div>

        {/* Status */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <StatusBadge
            currentStatus={job.status}
            statuses={statuses}
            onChangeStatus={(s) => onUpdate(job.id, { status: s })}
          />
        </div>

        {/* Budget */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <InlineEdit
            value={job.weeklyBudget || "—"}
            onSave={(v) => onUpdate(job.id, { weeklyBudget: v === "—" ? null : v } as any)}
            className="text-[13px]"
          />
        </div>

        {/* Hours */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <HoursChip value={job.workingHours} onSave={(v) => onUpdate(job.id, { workingHours: v } as any)} />
        </div>

        {/* Candidates */}
        <div className="flex items-center justify-center">
          <span className="text-[13px]" style={{ color: '#374151' }}>{job._count.matches}</span>
        </div>

        {/* Updated */}
        <div className="flex items-center">
          <span className="text-[11px] truncate" style={{ color: '#9ca3af' }}>
            {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-7 w-7 rounded-md flex items-center justify-center transition-all hover:bg-[#f3f4f6]"
                style={{ color: '#6b7280', opacity: hovered ? 1 : 0 }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onOpenDetail(job)}>
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
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
            <AlertDialogDescription>This will remove all candidate evaluations for this job. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(job.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
