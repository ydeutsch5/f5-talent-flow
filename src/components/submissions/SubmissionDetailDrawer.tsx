import { useState, useEffect } from "react";
import { X, Check, X as XIcon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import type { Submission } from "@/hooks/useSubmissions";
import { getCommColor, commLabel } from "@/components/jobs/detail/matchUtils";
import { format, formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, { color: string }> = {
  Pending: { color: "#d97706" },
  Approved: { color: "#15803d" },
  Rejected: { color: "#dc2626" },
};

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
  const commBorder = cc.bg === '#dcfce7' ? '#bbf7d0' : cc.bg === '#dbeafe' ? '#bfdbfe' : cc.bg === '#fef3c7' ? '#fde68a' : '#fecaca';
  const initials = s.submittedBy.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.15)', opacity: visible ? 1 : 0, transitionDuration: '260ms' }} onClick={onClose} />
      <div className="flex flex-col bg-white" style={{ width: '480px', maxWidth: '100%', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', transform: visible ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 260ms cubic-bezier(0.32,0.72,0,1)' }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ height: '56px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>Submission Detail</h2>
          <button onClick={onClose} className="rounded-md flex items-center justify-center transition-colors hover:bg-[#f3f4f6]" style={{ width: '28px', height: '28px', color: '#6b7280' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
          {/* Cards */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '20px' }}>
            <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '6px' }}>Candidate</p>
              <button onClick={() => onOpenCandidate(s.candidate.id)} className="transition-colors" style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>
                {s.candidate.name}
              </button>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{s.candidate.title || "—"}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>{s.candidate.email}</p>
              {s.candidate.communicationRating && (
                <span className="inline-flex items-center rounded-full" style={{ marginTop: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: cc.bg, color: cc.text, border: `1px solid ${commBorder}` }}>
                  {commLabel(s.candidate.communicationRating)}
                </span>
              )}
            </div>
            <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '6px' }}>Job</p>
              <button onClick={() => onOpenJob(s.job.id)} className="transition-colors" style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>
                {s.job.roleTitle}
              </button>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{s.job.clientName}</p>
              {s.job.weeklyBudget && <p style={{ fontSize: '11px', color: '#9ca3af' }}>Budget: {s.job.weeklyBudget}</p>}
            </div>
          </div>

          {/* Status + meta */}
          <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: '20px' }}>
            <span className="inline-flex items-center rounded-full" style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: sc.color, backgroundColor: `${sc.color}20`, border: `1px solid ${sc.color}35` }}>
              {s.status}
            </span>
            <div className="flex items-center gap-2">
              <div className="rounded-full flex items-center justify-center" style={{ width: '20px', height: '20px', backgroundColor: '#7c3aed' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#ffffff' }}>{initials}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>by {s.submittedBy.name}</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default" style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
              </TooltipTrigger>
              <TooltipContent>{format(new Date(s.createdAt), "MMM d, yyyy 'at' h:mm a")}</TooltipContent>
            </Tooltip>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Notes</p>
            <InlineEdit value={s.notes || ""} onSave={(v) => onUpdate(s.id, { notes: v })} as="textarea" className="text-[13px] w-full" inputClassName="min-h-[80px]" />
            {!s.notes && <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Click to add notes</p>}
          </div>

          {/* Actions */}
          {s.status === "Pending" && (
            <div style={{ borderTop: '1px solid #e9eaec', paddingTop: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Actions</p>
              {!rejectMode ? (
                <div className="flex gap-2">
                  <button onClick={() => onUpdate(s.id, { status: "Approved" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-md transition-colors"
                    style={{ height: '28px', fontSize: '13px', fontWeight: 500, backgroundColor: '#dcfce7', color: '#15803d' }}>
                    <Check style={{ width: '14px', height: '14px' }} /> Approve
                  </button>
                  <button onClick={() => setRejectMode(true)} className="flex-1 flex items-center justify-center gap-1.5 rounded-md transition-colors"
                    style={{ height: '28px', fontSize: '13px', fontWeight: 500, backgroundColor: '#fee2e2', color: '#dc2626' }}>
                    <XIcon style={{ width: '14px', height: '14px' }} /> Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p style={{ fontSize: '11px', color: '#9ca3af' }}>Reason for rejection (min 10 characters)</p>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason…" rows={2}
                    style={{ width: '100%', borderRadius: '6px', border: '1px solid #e2e3e6', padding: '6px 10px', fontSize: '13px', color: '#1a1a1a', resize: 'vertical', minHeight: '60px' }} autoFocus
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setRejectMode(false); setRejectReason(""); }} className="flex-1 rounded-md transition-colors hover:bg-[#f3f4f6]" style={{ height: '28px', fontSize: '13px', color: '#9ca3af', border: '1px solid #e2e3e6' }}>Cancel</button>
                    <button onClick={() => { onUpdate(s.id, { status: "Rejected", notes: rejectReason || s.notes }); setRejectMode(false); }} disabled={rejectReason.trim().length < 10}
                      style={{ flex: 1, height: '28px', borderRadius: '6px', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: rejectReason.trim().length < 10 ? 0.5 : 1 }}>
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
