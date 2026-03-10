import { useState, useMemo, useCallback } from "react";
import { Search, Send } from "lucide-react";
import { useSubmissions, useUpdateSubmission, type Submission } from "@/hooks/useSubmissions";
import { SubmissionRow } from "@/components/submissions/SubmissionRow";
import { SubmissionDetailDrawer } from "@/components/submissions/SubmissionDetailDrawer";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";

const STATUS_FILTERS = [
  { label: "All", value: null as string | null },
  { label: "Pending", value: "Pending" as string | null, color: "#d97706" },
  { label: "Approved", value: "Approved" as string | null, color: "#15803d" },
  { label: "Rejected", value: "Rejected" as string | null, color: "#dc2626" },
];

export default function Submissions() {
  usePageTitle("Submissions");
  const { data: submissions, isLoading } = useSubmissions();
  const update = useUpdateSubmission();

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailSub, setDetailSub] = useState<Submission | null>(null);

  const handleUpdate = useCallback((id: string, data: Record<string, any>) => {
    update.mutate({ id, data }, {
      onSuccess: () => {
        if (data.status === "Approved") toast.success("Submission approved");
        else if (data.status === "Rejected") toast.error("Submission rejected");
        else toast.success("Submission updated");
      },
      onError: (e) => toast.error(e.message, { duration: 8000 }),
    });
  }, [update]);

  const sorted = useMemo(() => {
    if (!submissions) return [];
    let result = [...submissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.candidate.name.toLowerCase().includes(q) || s.job.roleTitle.toLowerCase().includes(q) || s.job.clientName.toLowerCase().includes(q));
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

  const colHeaderStyle: React.CSSProperties = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500,
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between shrink-0" style={{ height: '48px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Submissions</h1>
        <div className="flex items-center gap-3">
          {(["Pending", "Approved", "Rejected"] as const).map((st) => {
            const sf = STATUS_FILTERS.find((f) => f.value === st)!;
            return (
              <span key={st} className="inline-flex items-center rounded-full" style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: `${sf.color}20`, color: sf.color, border: `1px solid ${sf.color}35` }}>
                {counts[st]} {st}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 shrink-0" style={{ height: '40px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
        {STATUS_FILTERS.map((f) => (
          <button key={f.label} onClick={() => setFilterStatus(f.value)}
            className="inline-flex items-center gap-1.5 rounded-md transition-colors shrink-0"
            style={{
              height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500,
              border: filterStatus === f.value ? (f.color ? `1px solid ${f.color}` : '1px solid #374151') : '1px solid #e2e3e6',
              backgroundColor: filterStatus === f.value ? (f.color ? `${f.color}15` : '#f3f4f6') : 'transparent',
              color: filterStatus === f.value ? (f.color || '#1a1a1a') : '#374151',
            }}>
            {f.color && <span className="rounded-full shrink-0" style={{ width: '8px', height: '8px', backgroundColor: f.color }} />}
            {f.label}
          </button>
        ))}
        <div className="ml-auto relative shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2" style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search…"
            style={{ height: '28px', width: '200px', paddingLeft: '28px', paddingRight: '8px', borderRadius: '6px', border: '1px solid #e2e3e6', fontSize: '13px', color: '#1a1a1a' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Column headers */}
      {!isEmpty && !isLoading && (
        <div className="grid items-center" style={{ gridTemplateColumns: "1fr 1fr 100px 130px 90px 1fr 32px", height: '32px', padding: '0 8px', borderBottom: '1px solid #e9eaec', backgroundColor: '#ffffff' }}>
          <div style={colHeaderStyle}>Candidate</div><div style={colHeaderStyle}>Job</div><div style={colHeaderStyle}>Status</div><div style={colHeaderStyle}>Submitted By</div><div style={colHeaderStyle}>Date</div><div style={colHeaderStyle}>Notes</div><div />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid items-center" style={{ gridTemplateColumns: "1fr 1fr 100px 130px 90px 1fr 32px", height: '34px', padding: '0 8px', borderBottom: '1px solid #f3f4f6' }}>
                <div className="space-y-1 pr-4"><div className="h-3 rounded" style={{ width: '120px', backgroundColor: '#f3f4f6' }} /><div className="h-2 rounded" style={{ width: '80px', backgroundColor: '#f3f4f6' }} /></div>
                <div className="space-y-1 pr-4"><div className="h-3 rounded" style={{ width: '140px', backgroundColor: '#f3f4f6' }} /><div className="h-2 rounded" style={{ width: '60px', backgroundColor: '#f3f4f6' }} /></div>
                <div><div className="h-5 rounded-full" style={{ width: '56px', backgroundColor: '#f3f4f6' }} /></div>
                <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full" style={{ backgroundColor: '#f3f4f6' }} /><div className="h-3 rounded" style={{ width: '60px', backgroundColor: '#f3f4f6' }} /></div>
                <div><div className="h-3 rounded" style={{ width: '48px', backgroundColor: '#f3f4f6' }} /></div>
                <div><div className="h-3 rounded" style={{ width: '100px', backgroundColor: '#f3f4f6' }} /></div>
                <div />
              </div>
            ))}
          </div>
        )}
        {isEmpty && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: '48px 0' }}>
            <Send style={{ width: '48px', height: '48px', color: '#d1d5db' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginTop: '16px' }}>No submissions yet</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', maxWidth: '320px' }}>Submit candidates to client jobs to see them here</p>
          </div>
        )}
        {!isLoading && sorted.map((s) => (
          <SubmissionRow key={s.id} submission={s} onUpdate={handleUpdate} onOpenDetail={setDetailSub} onOpenCandidate={(id) => console.log("Open candidate", id)} onOpenJob={(id) => console.log("Open job", id)} />
        ))}
      </div>

      <SubmissionDetailDrawer submission={detailSub} open={!!detailSub} onClose={() => setDetailSub(null)} onUpdate={handleUpdate} onOpenCandidate={(id) => console.log("Open candidate", id)} onOpenJob={(id) => console.log("Open job", id)} />
    </div>
  );
}
