import { useState, useMemo, useCallback } from "react";
import { Search, Send } from "lucide-react";
import { useSubmissions, useUpdateSubmission, type Submission } from "@/hooks/useSubmissions";
import { SubmissionRow } from "@/components/submissions/SubmissionRow";
import { SubmissionDetailDrawer } from "@/components/submissions/SubmissionDetailDrawer";
import { toast } from "@/hooks/use-toast";

const STATUS_FILTERS = [
  { label: "All", value: null },
  { label: "Pending", value: "Pending", bg: "#fef3c7", text: "#d97706" },
  { label: "Approved", value: "Approved", bg: "#dcfce7", text: "#15803d" },
  { label: "Rejected", value: "Rejected", bg: "#fee2e2", text: "#dc2626" },
] as const;

export default function Submissions() {
  const { data: submissions, isLoading } = useSubmissions();
  const update = useUpdateSubmission();

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailSub, setDetailSub] = useState<Submission | null>(null);

  const handleUpdate = useCallback((id: string, data: Record<string, any>) => {
    update.mutate({ id, data }, {
      onSuccess: () => {
        if (data.status) toast({ title: `Submission ${data.status.toLowerCase()}` });
      },
    });
  }, [update]);

  const sorted = useMemo(() => {
    if (!submissions) return [];
    let result = [...submissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.candidate.name.toLowerCase().includes(q) ||
        s.job.roleTitle.toLowerCase().includes(q) ||
        s.job.clientName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [submissions, filterStatus, searchQuery]);

  const counts = useMemo(() => {
    if (!submissions) return { Pending: 0, Approved: 0, Rejected: 0 };
    return {
      Pending: submissions.filter((s) => s.status === "Pending").length,
      Approved: submissions.filter((s) => s.status === "Approved").length,
      Rejected: submissions.filter((s) => s.status === "Rejected").length,
    };
  }, [submissions]);

  const isEmpty = !isLoading && sorted.length === 0;

  // Placeholder for drawer navigation — in real app these open the respective detail drawers
  const handleOpenCandidate = (id: string) => console.log("Open candidate", id);
  const handleOpenJob = (id: string) => console.log("Open job", id);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <h1 className="text-lg font-bold text-foreground">Submissions</h1>
        <div className="flex items-center gap-2">
          {(["Pending", "Approved", "Rejected"] as const).map((st) => {
            const sc = STATUS_FILTERS.find((f) => f.value === st)!;
            return (
              <span
                key={st}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: sc.bg, color: sc.text }}
              >
                {counts[st]} {st}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-6 h-10 border-b border-border shrink-0">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilterStatus(f.value)}
            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium transition-colors duration-fast border shrink-0 ${
              filterStatus === f.value
                ? f.value ? "" : "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
            style={
              filterStatus === f.value && f.value
                ? { backgroundColor: f.bg, color: f.text, borderColor: f.text }
                : {}
            }
          >
            {f.value && (
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: f.text || undefined }} />
            )}
            {f.label}
          </button>
        ))}

        <div className="ml-auto relative shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="h-7 w-48 pl-7 pr-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-fast"
          />
        </div>
      </div>

      {/* Column headers */}
      {!isEmpty && !isLoading && (
        <div
          className="grid items-center h-8 px-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider"
          style={{ gridTemplateColumns: "1fr 1fr 100px 130px 90px 1fr 32px" }}
        >
          <div>Candidate</div>
          <div>Job</div>
          <div>Status</div>
          <div>Submitted By</div>
          <div>Date</div>
          <div>Notes</div>
          <div />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid items-center h-row px-3 border-b border-border"
                style={{ gridTemplateColumns: "1fr 1fr 100px 130px 90px 1fr 32px" }}
              >
                <div className="space-y-1 pr-4"><div className="h-3.5 bg-muted rounded w-28" /><div className="h-2.5 bg-muted rounded w-20" /></div>
                <div className="space-y-1 pr-4"><div className="h-3.5 bg-muted rounded w-32" /><div className="h-2.5 bg-muted rounded w-16" /></div>
                <div><div className="h-5 bg-muted rounded-full w-16" /></div>
                <div className="flex items-center gap-2"><div className="h-6 w-6 bg-muted rounded-full" /><div className="h-3 bg-muted rounded w-16" /></div>
                <div><div className="h-3 bg-muted rounded w-12" /></div>
                <div><div className="h-3 bg-muted rounded w-24" /></div>
                <div />
              </div>
            ))}
          </div>
        )}

        {isEmpty && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Send className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-medium text-foreground mb-1">No submissions yet</p>
            <p className="text-sm text-muted-foreground">Submit candidates to client jobs to see them here</p>
          </div>
        )}

        {!isLoading && sorted.map((s) => (
          <SubmissionRow
            key={s.id}
            submission={s}
            onUpdate={handleUpdate}
            onOpenDetail={setDetailSub}
            onOpenCandidate={handleOpenCandidate}
            onOpenJob={handleOpenJob}
          />
        ))}
      </div>

      {/* Detail drawer */}
      <SubmissionDetailDrawer
        submission={detailSub}
        open={!!detailSub}
        onClose={() => setDetailSub(null)}
        onUpdate={handleUpdate}
        onOpenCandidate={handleOpenCandidate}
        onOpenJob={handleOpenJob}
      />
    </div>
  );
}
