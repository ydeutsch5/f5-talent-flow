import { useState } from "react";
import { MoreHorizontal, Check, X as XIcon, Eye, MessageSquare } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import type { Submission } from "@/hooks/useSubmissions";
import { formatDistanceToNow, format } from "date-fns";

const STATUS_COLORS: Record<string, { color: string }> = {
  Pending: { color: "#d97706" },
  Approved: { color: "#15803d" },
  Rejected: { color: "#dc2626" },
};

interface SubmissionRowProps {
  submission: Submission;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onOpenDetail: (s: Submission) => void;
  onOpenCandidate: (id: string) => void;
  onOpenJob: (id: string) => void;
}

export function SubmissionRow({ submission: s, onUpdate, onOpenDetail, onOpenCandidate, onOpenJob }: SubmissionRowProps) {
  const [hovered, setHovered] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Pending;

  const initials = s.submittedBy.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleApprove = () => { onUpdate(s.id, { status: "Approved" }); setStatusOpen(false); };
  const handleReject = () => { onUpdate(s.id, { status: "Rejected", notes: rejectReason || s.notes }); setRejectMode(false); setRejectReason(""); setStatusOpen(false); };

  return (
    <div
      className="group grid items-center cursor-pointer transition-colors"
      style={{
        gridTemplateColumns: "1fr 1fr 100px 130px 90px 1fr 32px",
        height: '34px', borderBottom: '1px solid #f3f4f6', padding: '0 8px',
        backgroundColor: hovered ? '#f7f8f9' : '#ffffff',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenDetail(s)}
    >
      {/* Candidate */}
      <div className="flex flex-col justify-center min-w-0 pr-2">
        <button onClick={(e) => { e.stopPropagation(); onOpenCandidate(s.candidate.id); }} className="text-left truncate transition-colors" style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>
          {s.candidate.name}
        </button>
        <span className="truncate" style={{ fontSize: '11px', color: '#9ca3af' }}>{s.candidate.title || "—"}</span>
      </div>

      {/* Job */}
      <div className="flex flex-col justify-center min-w-0 pr-2">
        <button onClick={(e) => { e.stopPropagation(); onOpenJob(s.job.id); }} className="text-left truncate transition-colors" style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>
          {s.job.roleTitle}
        </button>
        <span className="truncate" style={{ fontSize: '11px', color: '#9ca3af' }}>{s.job.clientName}</span>
      </div>

      {/* Status */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {s.status === "Pending" ? (
          <Popover open={statusOpen} onOpenChange={(v) => { setStatusOpen(v); if (!v) { setRejectMode(false); setRejectReason(""); } }}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center rounded-full cursor-pointer transition-colors" style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: sc.color, backgroundColor: `${sc.color}20`, border: `1px solid ${sc.color}35` }}>
                {s.status}
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-1.5" align="start" sideOffset={4} style={{ width: '240px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
              {!rejectMode ? (
                <>
                  <button onClick={handleApprove} className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px', color: '#15803d', fontSize: '13px' }}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => setRejectMode(true)} className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px', color: '#dc2626', fontSize: '13px' }}>
                    <XIcon className="h-3.5 w-3.5" /> Reject…
                  </button>
                </>
              ) : (
                <div className="p-2 space-y-2">
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Rejection reason (min 10 chars)</p>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection…" rows={2}
                    style={{ width: '100%', borderRadius: '6px', border: '1px solid #e2e3e6', padding: '6px 10px', fontSize: '13px', color: '#1a1a1a', resize: 'none' }} autoFocus
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRejectMode(false)} className="flex-1 rounded-md transition-colors hover:bg-[#f3f4f6]" style={{ height: '28px', fontSize: '13px', color: '#9ca3af' }}>Cancel</button>
                    <button onClick={handleReject} disabled={rejectReason.trim().length < 10} style={{ flex: 1, height: '28px', borderRadius: '6px', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: rejectReason.trim().length < 10 ? 0.5 : 1 }}>Confirm</button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        ) : (
          <span className="inline-flex items-center rounded-full" style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: sc.color, backgroundColor: `${sc.color}20`, border: `1px solid ${sc.color}35` }}>
            {s.status}
          </span>
        )}
      </div>

      {/* Submitted By */}
      <div className="flex items-center gap-2">
        <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: '24px', height: '24px', backgroundColor: '#7c3aed' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#ffffff' }}>{initials}</span>
        </div>
        <span className="truncate" style={{ fontSize: '11px', color: '#374151' }}>{s.submittedBy.name}</span>
      </div>

      {/* Date */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default" style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
          </TooltipTrigger>
          <TooltipContent>{format(new Date(s.createdAt), "MMM d, yyyy 'at' h:mm a")}</TooltipContent>
        </Tooltip>
      </div>

      {/* Notes */}
      <div className="flex items-center min-w-0" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate">
              <InlineEdit value={s.notes || ""} onSave={(v) => onUpdate(s.id, { notes: v })} className="text-[11px] truncate" />
            </div>
          </TooltipTrigger>
          {s.notes && s.notes.length > 60 && <TooltipContent className="max-w-xs text-xs">{s.notes}</TooltipContent>}
        </Tooltip>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-7 w-7 rounded-md flex items-center justify-center transition-all hover:bg-[#f3f4f6]" style={{ color: '#6b7280', opacity: hovered ? 1 : 0 }}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {s.status === "Pending" && (
              <>
                <DropdownMenuItem onClick={handleApprove} style={{ color: '#15803d' }}><Check className="mr-2 h-3.5 w-3.5" /> Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusOpen(true); setRejectMode(true); }} className="text-destructive"><XIcon className="mr-2 h-3.5 w-3.5" /> Reject</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onOpenDetail(s)}><Eye className="mr-2 h-3.5 w-3.5" /> View Details</DropdownMenuItem>
            {s.status !== "Pending" && <DropdownMenuItem onClick={() => onOpenDetail(s)}><MessageSquare className="mr-2 h-3.5 w-3.5" /> Add Note</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
