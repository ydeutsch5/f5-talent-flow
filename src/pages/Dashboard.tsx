import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs, useJobStatuses, type Job, type JobStatus } from "@/hooks/useJobs";
import { useCandidates, type Candidate } from "@/hooks/useCandidates";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useRecentActivity, type RecentActivityEntry } from "@/hooks/useRecentActivity";
import { useUpdateCandidateFull } from "@/hooks/useCandidates";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CandidateDetailDrawer } from "@/components/candidates/detail/CandidateDetailDrawer";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, isAfter, subDays, startOfMonth, startOfWeek } from "date-fns";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  Star, ArrowRightLeft, Check as CheckIcon, X as XIcon, MessageCircle, UserPlus,
  Briefcase, Users, FileText, Sparkles, ArrowUp, ArrowDown, ArrowRight,
} from "lucide-react";

const now = new Date();
const weekAgo = subDays(now, 7);
const monthStart = startOfMonth(now);
const weekStart = startOfWeek(now, { weekStartsOn: 1 });
function isThisWeek(d: string) { return isAfter(new Date(d), weekStart); }

// KPI Card
function KpiCard({ label, value, sub, trend, onClick, loading }: {
  label: string; value: number | string; sub: React.ReactNode; trend?: { dir: "up" | "down"; n: number } | null; onClick?: () => void; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-start text-left transition-colors disabled:cursor-default"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e9eaec',
        borderRadius: '8px',
        padding: '16px',
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
    >
      <span style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>{label}</span>
      {loading ? (
        <div className="animate-pulse mt-1"><div style={{ width: '64px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} /></div>
      ) : (
        <div className="flex items-end gap-2 mt-1">
          <span style={{ fontSize: '24px', lineHeight: 1.2, fontWeight: 700, color: '#1a1a1a' }}>{value}</span>
          {trend && (
            <span className="flex items-center" style={{ fontSize: '11px', fontWeight: 600, color: trend.dir === "up" ? "#16a34a" : "#dc2626" }}>
              {trend.dir === "up" ? <ArrowUp style={{ width: '12px', height: '12px' }} /> : <ArrowDown style={{ width: '12px', height: '12px' }} />}{trend.n}
            </span>
          )}
        </div>
      )}
      {loading ? (
        <div className="animate-pulse mt-1"><div style={{ width: '96px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} /></div>
      ) : (
        <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{sub}</span>
      )}
    </button>
  );
}

// Pipeline Bar
function PipelineBar({ segments }: { segments: { label: string; color: string; count: number }[] }) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) return <div style={{ width: '120px', height: '8px', borderRadius: '100px', backgroundColor: '#f3f4f6' }} />;
  return (
    <div className="flex overflow-hidden" style={{ width: '120px', height: '8px', borderRadius: '100px' }}>
      {segments.filter((s) => s.count > 0).map((s) => (
        <Tooltip key={s.label}>
          <TooltipTrigger asChild>
            <div style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color, height: '100%' }} />
          </TooltipTrigger>
          <TooltipContent side="top" style={{ fontSize: '11px' }}>{s.label}: {s.count}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

// Activity icon map
const ACTIVITY_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  evaluation: { icon: Star, color: "#7c3aed" },
  status_change: { icon: ArrowRightLeft, color: "#3b82f6" },
  submission_approved: { icon: CheckIcon, color: "#16a34a" },
  submission_rejected: { icon: XIcon, color: "#dc2626" },
  comment: { icon: MessageCircle, color: "#9ca3af" },
  candidate_added: { icon: UserPlus, color: "#14b8a6" },
};

// Status Chip for dashboard
function StatusChip({ current, color, statuses, onSave }: { current: string; color: string; statuses: CandidateStatus[]; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full cursor-pointer transition-colors"
          style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color, backgroundColor: `${color}20`, border: `1px solid ${color}35` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}30`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}20`; }}
        >
          {current}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '220px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="px-2.5 pt-1.5 pb-1">
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 500 }}>CHANGE STATUS</span>
        </div>
        {statuses.map((s) => (
          <button key={s.id} onClick={() => { onSave(s.label); setOpen(false); }}
            className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
            <span className="shrink-0" style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
            <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{s.label}</span>
            {s.label === current && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default function Dashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const { data: jobs = [], isLoading: jLoad } = useJobs();
  const { data: jobStatuses = [] } = useJobStatuses();
  const { data: candidates = [], isLoading: cLoad } = useCandidates();
  const { data: candidateStatuses = [] } = useCandidateStatuses();
  const { data: submissions = [], isLoading: sLoad } = useSubmissions();
  const { data: activity = [], isLoading: aLoad } = useRecentActivity();
  const updateCandidate = useUpdateCandidateFull();
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);

  const allMatches = useMemo(() => mockStore.getMatches(), [jobs]);
  const activeJobs = useMemo(() => jobs.filter((j) => j.status === "Active"), [jobs]);
  const onHoldJobs = useMemo(() => jobs.filter((j) => j.status === "On Hold"), [jobs]);
  const newCandidatesThisWeek = useMemo(() => candidates.filter((c) => isThisWeek(c.createdAt)), [candidates]);
  const pendingSubs = useMemo(() => submissions.filter((s) => s.status === "Pending"), [submissions]);
  const approvedThisMonth = useMemo(() => submissions.filter((s) => s.status === "Approved" && isAfter(new Date(s.createdAt), monthStart)), [submissions]);
  const evaluationsThisWeek = useMemo(() => candidates.reduce((n, c) => n + (isThisWeek(c.updatedAt) ? c._count.matches : 0), 0), [candidates]);

  const jobsByStatus = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((j) => map.set(j.status, (map.get(j.status) || 0) + 1));
    return Array.from(map.entries()).map(([label, count]) => {
      const st = jobStatuses.find((s) => s.label === label);
      return { label, count, color: st?.color || "#6b7280" };
    });
  }, [jobs, jobStatuses]);

  const recentCandidates = useMemo(
    () => [...candidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [candidates],
  );

  const loading = jLoad || cLoad || sLoad;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Dashboard</h1>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '20px' }}>
        <KpiCard label="Open Jobs" value={activeJobs.length} sub={<span>{onHoldJobs.length} on hold</span>} onClick={() => navigate("/jobs?filter=active")} loading={loading} />
        <KpiCard label="Total Candidates" value={candidates.length} sub={<span style={{ color: '#16a34a' }}>+{newCandidatesThisWeek.length} this week</span>} onClick={() => navigate("/candidates")} loading={loading} />
        <KpiCard label="Pending Submissions" value={pendingSubs.length} sub={<span style={{ color: '#16a34a' }}>{approvedThisMonth.length} approved this month</span>} onClick={() => navigate("/submissions?filter=pending")} loading={loading} />
        <KpiCard label="AI Evaluations" value={evaluationsThisWeek} sub="Resumes scored this week" loading={loading} />
      </div>

      {/* Pipeline + Activity */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Active Pipeline</h2>
          <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff' }}>
            {jLoad ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ height: '44px', padding: '0 16px', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: '160px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ width: '120px', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
                  <div className="ml-auto" style={{ width: '24px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              ))
            ) : activeJobs.length === 0 ? (
              <p style={{ padding: '24px 16px', fontSize: '13px', color: '#9ca3af' }}>No active jobs — create one to get started</p>
            ) : (
              activeJobs.map((job, idx) => {
                // Build segments from actual match data per status
                const jobMatches = allMatches.filter(m => m.jobId === job.id);
                const statusCounts = new Map<string, number>();
                jobMatches.forEach(m => statusCounts.set(m.status, (statusCounts.get(m.status) || 0) + 1));
                const segs = candidateStatuses
                  .map(cs => ({ label: cs.label, color: cs.color, count: statusCounts.get(cs.label) || 0 }))
                  .filter(s => s.count > 0);
                // If no match data but has count, show a single gray segment
                if (segs.length === 0 && job._count.matches > 0) segs.push({ label: "Unassigned", color: "#d1d5db", count: job._count.matches });
                return (
                  <button key={job.id} onClick={() => navigate(`/jobs`)}
                    className="flex items-center w-full gap-4 text-left transition-colors hover:bg-[#f7f8f9]"
                    style={{ height: '44px', padding: '0 16px', borderBottom: idx < activeJobs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <span className="truncate min-w-0 flex-1" style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>
                      {job.roleTitle} <span style={{ color: '#9ca3af', fontWeight: 400 }}>· {job.clientName}</span>
                    </span>
                    <PipelineBar segments={segs} />
                    <span style={{ fontSize: '13px', color: '#9ca3af', width: '24px', textAlign: 'right' }}>{job._count.matches}</span>
                    <ArrowRight style={{ width: '14px', height: '14px', color: '#9ca3af', flexShrink: 0 }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Recent Activity</h2>
          <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff' }}>
            {aLoad ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse" style={{ height: '32px', padding: '0 12px', borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} />
                  <div style={{ width: '180px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div className="ml-auto" style={{ width: '40px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              ))
            ) : activity.length === 0 ? (
              <p style={{ padding: '24px 12px', fontSize: '13px', color: '#9ca3af' }}>No recent activity</p>
            ) : (
              activity.slice(0, 12).map((entry, idx) => {
                const meta = ACTIVITY_ICON[entry.type] || ACTIVITY_ICON.comment;
                const Icon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-center gap-3" style={{ height: '32px', padding: '0 12px', borderBottom: idx < Math.min(activity.length, 12) - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <Icon style={{ width: '14px', height: '14px', color: meta.color, flexShrink: 0 }} />
                    <span className="truncate flex-1" style={{ fontSize: '13px', color: '#1a1a1a' }}>{entry.description}</span>
                    <span className="shrink-0" style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff', padding: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>Jobs by Status</h2>
          {jLoad ? (
            <div className="flex items-center justify-center animate-pulse" style={{ height: '192px' }}><div style={{ width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} /></div>
          ) : jobs.length === 0 ? (
            <p className="text-center" style={{ padding: '48px 0', fontSize: '13px', color: '#9ca3af' }}>No jobs yet</p>
          ) : (
            <div className="flex items-center gap-8">
              <div className="relative shrink-0" style={{ width: '192px', height: '192px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={jobsByStatus} dataKey="count" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">{jobsByStatus.map((s) => <Cell key={s.label} fill={s.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>{jobs.length}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Total Jobs</span>
                </div>
              </div>
              <div className="space-y-2">
                {jobsByStatus.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="rounded-full shrink-0" style={{ width: '10px', height: '10px', backgroundColor: s.color }} />
                    <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{s.label}</span>
                    <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff', padding: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>Recently Added Candidates</h2>
          {cLoad ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3" style={{ height: '34px' }}>
                  <div style={{ width: '128px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ width: '40px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ width: '56px', height: '20px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
                  <div className="ml-auto" style={{ width: '64px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              ))}
            </div>
          ) : recentCandidates.length === 0 ? (
            <p className="text-center" style={{ padding: '48px 0', fontSize: '13px', color: '#9ca3af' }}>No candidates yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {["Name", "Match", "Status", "Added"].map((h, i) => (
                    <th key={h} className={i === 3 ? "text-right" : "text-left"} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500, paddingBottom: '8px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c, idx) => {
                  const statusObj = candidateStatuses.find((s) => s.label === c.status);
                  const statusColor = statusObj?.color || "#6b7280";
                  return (
                    <tr key={c.id} style={{ borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '6px 0' }}>
                        <button onClick={() => setDrawerCandidate(c)} className="transition-colors" style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>{c.name}</button>
                      </td>
                      <td style={{ padding: '6px 0', fontSize: '13px', color: '#9ca3af' }}>{c._count.matches > 0 ? `${c._count.matches} jobs` : "—"}</td>
                      <td style={{ padding: '6px 0' }}>
                        <StatusChip current={c.status} color={statusColor} statuses={candidateStatuses} onSave={(status) => {
                          updateCandidate.mutate({ id: c.id, data: { status } }, {
                            onSuccess: () => toast.success("Status updated"),
                            onError: (e) => toast.error(e.message, { duration: 8000 }),
                          });
                        }} />
                      </td>
                      <td className="text-right" style={{ padding: '6px 0', fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CandidateDetailDrawer
        candidate={drawerCandidate}
        open={!!drawerCandidate}
        onClose={() => setDrawerCandidate(null)}
        statuses={candidateStatuses}
        onUpdate={(id, data) => updateCandidate.mutate({ id, data }, {
          onSuccess: () => toast.success("Candidate updated"),
          onError: (e) => toast.error(e.message, { duration: 8000 }),
        })}
      />
    </div>
  );
}
