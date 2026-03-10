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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Pending:  { bg: "#fef3c7", text: "#d97706" },
  Approved: { bg: "#dcfce7", text: "#15803d" },
  Rejected: { bg: "#fee2e2", text: "#dc2626" },
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
  const truncatedNotes = s.notes ? (s.notes.length > 60 ? s.notes.slice(0, 60) + "…" : s.notes) : "—";

  const handleApprove = () => {
    onUpdate(s.id, { status: "Approved" });
    setStatusOpen(false);
  };

  const handleReject = () => {
    onUpdate(s.id, { status: "Rejected", notes: rejectReason || s.notes });
    setRejectMode(false);
    setRejectReason("");
    setStatusOpen(false);
  };

  return (
    <div
      className={`group grid items-center h-row border-b border-border px-3 cursor-pointer transition-colors duration-fast ${hovered ? "bg-row-hover" : ""}`}
      style={{ gridTemplateColumns: "1fr 1fr 100px 130px 90px 1fr 32px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenDetail(s)}
    >
      {/* Candidate */}
      <div className="flex flex-col justify-center min-w-0 pr-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenCandidate(s.candidate.id); }}
          className="text-sm font-semibold text-foreground truncate text-left hover:text-primary transition-colors duration-fast"
        >
          {s.candidate.name}
        </button>
        <span className="text-xs text-muted-foreground truncate">{s.candidate.title || "—"}</span>
      </div>

      {/* Job */}
      <div className="flex flex-col justify-center min-w-0 pr-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenJob(s.job.id); }}
          className="text-sm font-semibold text-foreground truncate text-left hover:text-primary transition-colors duration-fast"
        >
          {s.job.roleTitle}
        </button>
        <span className="text-xs text-muted-foreground truncate">{s.job.clientName}</span>
      </div>

      {/* Status */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {s.status === "Pending" ? (
          <Popover open={statusOpen} onOpenChange={(v) => { setStatusOpen(v); if (!v) { setRejectMode(false); setRejectReason(""); } }}>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer transition-opacity hover:opacity-80"
                style={{ backgroundColor: sc.bg, color: sc.text }}
              >
                {s.status}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="start" sideOffset={4}>
              {!rejectMode ? (
                <>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 w-full px-2.5 py-2 text-sm rounded-sm hover:bg-muted/60 transition-colors duration-fast"
                    style={{ color: "#15803d" }}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectMode(true)}
                    className="flex items-center gap-2 w-full px-2.5 py-2 text-sm rounded-sm hover:bg-muted/60 transition-colors duration-fast text-destructive"
                  >
                    <XIcon className="h-3.5 w-3.5" /> Reject…
                  </button>
                </>
              ) : (
                <div className="p-2 space-y-2">
                  <p className="text-xs font-medium text-foreground">Rejection reason (min 10 chars)</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (required)…"
                    rows={2}
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRejectMode(false)}
                      className="flex-1 h-7 rounded text-xs text-muted-foreground hover:bg-muted transition-colors duration-fast"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 h-7 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity duration-fast"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        ) : (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: sc.bg, color: sc.text }}
          >
            {s.status}
          </span>
        )}
      </div>

      {/* Submitted By */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground shrink-0">
          {initials}
        </div>
        <span className="text-xs text-foreground truncate">{s.submittedBy.name}</span>
      </div>

      {/* Date */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground cursor-default">
              {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
            </span>
          </TooltipTrigger>
          <TooltipContent>{format(new Date(s.createdAt), "MMM d, yyyy 'at' h:mm a")}</TooltipContent>
        </Tooltip>
      </div>

      {/* Notes */}
      <div className="flex items-center min-w-0" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate">
              <InlineEdit
                value={s.notes || ""}
                onSave={(v) => onUpdate(s.id, { notes: v })}
                className="text-xs text-muted-foreground truncate"
              />
            </div>
          </TooltipTrigger>
          {s.notes && s.notes.length > 60 && (
            <TooltipContent className="max-w-xs text-xs">{s.notes}</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-all duration-fast ${hovered ? "opacity-100" : "opacity-0"}`}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {s.status === "Pending" && (
              <>
                <DropdownMenuItem onClick={handleApprove} className="text-[#15803d]">
                  <Check className="mr-2 h-3.5 w-3.5" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusOpen(true); setRejectMode(true); }} className="text-destructive">
                  <XIcon className="mr-2 h-3.5 w-3.5" /> Reject with reason
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onOpenDetail(s)}>
              <Eye className="mr-2 h-3.5 w-3.5" /> View Details
            </DropdownMenuItem>
            {s.status !== "Pending" && (
              <DropdownMenuItem onClick={() => onOpenDetail(s)}>
                <MessageSquare className="mr-2 h-3.5 w-3.5" /> Add Note
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
