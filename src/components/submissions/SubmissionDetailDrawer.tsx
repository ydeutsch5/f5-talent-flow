import { useState, useEffect } from "react";
import { X, Check, X as XIcon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import type { Submission } from "@/hooks/useSubmissions";
import { getCommColor, commLabel } from "@/components/jobs/detail/matchUtils";
import { format, formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Pending:  { bg: "#fef3c7", text: "#d97706" },
  Approved: { bg: "#dcfce7", text: "#15803d" },
  Rejected: { bg: "#fee2e2", text: "#dc2626" },
};

const HOURS_LABELS: Record<string, string> = { US_HOURS: "US Hours", INDIA_SHIFT: "India Shift", GENERAL_SHIFT: "General" };

interface SubmissionDetailDrawerProps {
  submission: Submission | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onOpenCandidate: (id: string) => void;
  onOpenJob: (id: string) => void;
}

export function SubmissionDetailDrawer({ submission: s, open, onClose, onUpdate, onOpenCandidate, onOpenJob }: SubmissionDetailDrawerProps) {
  const [visible, setVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else { setVisible(false); setRejectMode(false); setRejectReason(""); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !s) return null;

  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Pending;
  const cc = getCommColor(s.candidate.communicationRating || null);
  const initials = s.submittedBy.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className={`flex-1 bg-foreground/20 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`w-[560px] max-w-full bg-background border-l border-border flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Submission Detail</h2>
          <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors duration-fast">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Two cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Candidate card */}
            <div className="border border-border rounded-md p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate</p>
              <button onClick={() => onOpenCandidate(s.candidate.id)} className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-fast">
                {s.candidate.name}
              </button>
              <p className="text-xs text-muted-foreground">{s.candidate.title || "—"}</p>
              <p className="text-xs text-muted-foreground">{s.candidate.email}</p>
              {s.candidate.phone && <p className="text-xs text-muted-foreground">{s.candidate.phone}</p>}
              {s.candidate.communicationRating && (
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: cc.bg, color: cc.text }}>
                  {commLabel(s.candidate.communicationRating)}
                </span>
              )}
            </div>

            {/* Job card */}
            <div className="border border-border rounded-md p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job</p>
              <button onClick={() => onOpenJob(s.job.id)} className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-fast">
                {s.job.roleTitle}
              </button>
              <p className="text-xs text-muted-foreground">{s.job.clientName}</p>
              {s.job.weeklyBudget && <p className="text-xs text-muted-foreground">Budget: {s.job.weeklyBudget}</p>}
              {s.job.workingHours && (
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground bg-muted">
                  {HOURS_LABELS[s.job.workingHours] || s.job.workingHours}
                </span>
              )}
            </div>
          </div>

          {/* Status + meta */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
              {s.status}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-semibold text-primary-foreground">
                {initials}
              </div>
              <span className="text-xs text-muted-foreground">by {s.submittedBy.name}</span>
            </div>
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
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Notes</p>
            <InlineEdit
              value={s.notes || ""}
              onSave={(v) => onUpdate(s.id, { notes: v })}
              as="textarea"
              className="text-sm text-foreground w-full"
              inputClassName="min-h-[80px]"
            />
            {!s.notes && <p className="text-xs text-muted-foreground mt-1">Click to add notes</p>}
          </div>

          {/* Actions */}
          {s.status === "Pending" && (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</p>
              {!rejectMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(s.id, { status: "Approved" })}
                    className="flex-1 h-9 rounded-md text-sm font-medium transition-opacity duration-fast hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectMode(true)}
                    className="flex-1 h-9 rounded-md text-sm font-medium transition-opacity duration-fast hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                  >
                    <XIcon className="h-4 w-4" /> Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection…"
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setRejectMode(false); setRejectReason(""); }}
                      className="flex-1 h-8 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted transition-colors duration-fast"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { onUpdate(s.id, { status: "Rejected", notes: rejectReason || s.notes }); setRejectMode(false); }}
                      className="flex-1 h-8 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
