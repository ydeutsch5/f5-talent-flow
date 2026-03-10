import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs, useJobStatuses, type Job, type JobStatus } from "@/hooks/useJobs";
import { useCandidates, type Candidate } from "@/hooks/useCandidates";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useRecentActivity, type RecentActivityEntry } from "@/hooks/useRecentActivity";
import { useUpdateCandidateFull } from "@/hooks/useCandidates";
import { usePageTitle } from "@/hooks/usePageTitle";
import { mockStore } from "@/lib/mockData";
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

/* ── Section Header ────────────────────────────────────────── */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: '10px' }}>
      {children}
    </h2>
  );
}

/* ── KPI Card ──────────────────────────────────────────────── */
function KpiCard({ label, value, sub, trend, onClick, loading, icon: Icon }: {
  label: string; value: number | string; sub: React.ReactNode; trend?: { dir: "up" | "down"; n: number } | null; onClick?: () => void; loading?: boolean; icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex items-start gap-3 text-left transition-colors disabled:cursor-default"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e9eaec',
        borderRadius: '8px',
        padding: '14px 16px',
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
    >
      <div className="flex items-center justify-center shrink-0" style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#7c3aed12' }}>
        <Icon style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
      </div>
      <div className="flex-1 min-w-0">
        <span style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>{label}</span>
        {loading ? (
          <div className="animate-pulse mt-1"><div style={{ width: '48px', height: '24px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} /></div>
        ) : (
          <div className="flex items-end gap-2 mt-0.5">
            <span style={{ fontSize: '24px', lineHeight: 1.1, fontWeight: 700, color: '#1a1a1a' }}>{value}</span>
            {trend && (
              <span className="flex items-center" style={{ fontSize: '11px', fontWeight: 600, color: trend.dir === "up" ? "#16a34a" : "#dc2626", marginBottom: '2px' }}>
                {trend.dir === "up" ? <ArrowUp style={{ width: '12px', height: '12px' }} /> : <ArrowDown style={{ width: '12px', height: '12px' }} />}{trend.n}
              </span>
            )}
          </div>
        )}
        {loading ? (
          <div className="animate-pulse mt-1"><div style={{ width: '80px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} /></div>
        ) : (
          <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'block' }}>{sub}</span>
        )}
      </div>
    </button>
  );
}

/* ── Pipeline Bar ──────────────────────────────────────────── */
function PipelineBar({ segments }: { segments: { label: string; color: string; count: number }[] }) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) return <div style={{ width: '140px', height: '6px', borderRadius: '100px', backgroundColor: '#f3f4f6' }} />;
  return (
    <div className="flex overflow-hidden" style={{ width: '140px', height: '6px', borderRadius: '100px' }}>
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

/* ── Activity icon map ─────────────────────────────────────── */
const ACTIVITY_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  evaluation: { icon: Star, color: "#7c3aed" },
  status_change: { icon: ArrowRightLeft, color: "#3b82f6" },
  submission_approved: { icon: CheckIcon, color: "#16a34a" },
  submission_rejected: { icon: XIcon, color: "#dc2626" },
  comment: { icon: MessageCircle, color: "#6b7280" },
  candidate_added: { icon: UserPlus, color: "#14b8a6" },
};

/* ── Status Chip ───────────────────────────────────────────── */
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

/* ── Dashboard ─────────────────────────────────────────────── */
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
    <div style={{ padding: '24px', maxWidth: '1400px' }}>
      {/* Page title */}
      <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>Dashboard</h1>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '24px' }}>
        <KpiCard icon={Briefcase} label="Open Jobs" value={activeJobs.length} sub={<span>{onHoldJobs.length} on hold</span>} onClick={() => navigate("/jobs?filter=active")} loading={loading} />
        <KpiCard icon={Users} label="Total Candidates" value={candidates.length} sub={<span style={{ color: '#16a34a' }}>+{newCandidatesThisWeek.length} this week</span>} onClick={() => navigate("/candidates")} loading={loading} />
        <KpiCard icon={FileText} label="Pending Submissions" value={pendingSubs.length} sub={<span style={{ color: '#16a34a' }}>{approvedThisMonth.length} approved this month</span>} onClick={() => navigate("/submissions?filter=pending")} loading={loading} />
        <KpiCard icon={Sparkles} label="AI Evaluations" value={evaluationsThisWeek} sub="Resumes scored this week" loading={loading} />
      </div>

      {/* Pipeline + Activity */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '3fr 2fr', marginBottom: '24px' }}>
        {/* Pipeline */}
        <div>
          <SectionHeader>Active Pipeline</SectionHeader>
          <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            {jLoad ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ height: '42px', padding: '0 16px', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: '160px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ width: '140px', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
                  <div className="ml-auto" style={{ width: '20px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              ))
            ) : activeJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: '32px 16px' }}>
                <Briefcase style={{ width: '28px', height: '28px', color: '#d1d5db' }} />
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>No active jobs — create one to get started</p>
              </div>
            ) : (
              activeJobs.map((job, idx) => {
                const jobMatches = allMatches.filter(m => m.jobId === job.id);
                const statusCounts = new Map<string, number>();
                jobMatches.forEach(m => statusCounts.set(m.status, (statusCounts.get(m.status) || 0) + 1));
                const segs = candidateStatuses
                  .map(cs => ({ label: cs.label, color: cs.color, count: statusCounts.get(cs.label) || 0 }))
                  .filter(s => s.count > 0);
                if (segs.length === 0 && job._count.matches > 0) segs.push({ label: "Unassigned", color: "#d1d5db", count: job._count.matches });
                return (
                  <button key={job.id} onClick={() => navigate(`/jobs`)}
                    className="flex items-center w-full gap-4 text-left transition-colors hover:bg-[#f7f8f9]"
                    style={{ height: '42px', padding: '0 16px', borderBottom: idx < activeJobs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <span className="truncate min-w-0 flex-1" style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>
                      {job.roleTitle} <span style={{ color: '#9ca3af', fontWeight: 400 }}>· {job.clientName}</span>
                    </span>
                    <PipelineBar segments={segs} />
                    <span style={{ fontSize: '12px', color: '#6b7280', width: '24px', textAlign: 'right', fontWeight: 500 }}>{job._count.matches}</span>
                    <ArrowRight style={{ width: '12px', height: '12px', color: '#d1d5db', flexShrink: 0 }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <SectionHeader>Recent Activity</SectionHeader>
          <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            {aLoad ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse" style={{ height: '34px', padding: '0 14px', borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} />
                  <div style={{ width: '180px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div className="ml-auto" style={{ width: '40px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              ))
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: '32px 14px' }}>
                <MessageCircle style={{ width: '28px', height: '28px', color: '#d1d5db' }} />
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>No recent activity</p>
              </div>
            ) : (
              activity.slice(0, 10).map((entry, idx) => {
                const meta = ACTIVITY_ICON[entry.type] || ACTIVITY_ICON.comment;
                const Icon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-center gap-2.5" style={{ height: '34px', padding: '0 14px', borderBottom: idx < Math.min(activity.length, 10) - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div className="shrink-0 flex items-center justify-center" style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: `${meta.color}12` }}>
                      <Icon style={{ width: '11px', height: '11px', color: meta.color }} />
                    </div>
                    <span className="truncate flex-1" style={{ fontSize: '13px', color: '#374151' }}>{entry.description}</span>
                    <span className="shrink-0" style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: chart + recent candidates */}
      <div className="grid grid-cols-2 gap-5">
        {/* Jobs by Status */}
        <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff', padding: '20px' }}>
          <SectionHeader>Jobs by Status</SectionHeader>
          {jLoad ? (
            <div className="flex items-center justify-center animate-pulse" style={{ height: '180px' }}><div style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} /></div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: '40px 0' }}>
              <Briefcase style={{ width: '28px', height: '28px', color: '#d1d5db' }} />
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>No jobs yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <div className="relative shrink-0" style={{ width: '160px', height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={jobsByStatus} dataKey="count" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">{jobsByStatus.map((s) => <Cell key={s.label} fill={s.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.1 }}>{jobs.length}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Total</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {jobsByStatus.map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <span className="rounded-full shrink-0" style={{ width: '8px', height: '8px', backgroundColor: s.color }} />
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: 400 }}>{s.label}</span>
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Candidates */}
        <div style={{ border: '1px solid #e9eaec', borderRadius: '8px', backgroundColor: '#ffffff', padding: '20px' }}>
          <SectionHeader>Recently Added Candidates</SectionHeader>
          {cLoad ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3" style={{ height: '34px' }}>
                  <div style={{ width: '100px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ width: '40px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ width: '56px', height: '20px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
                  <div className="ml-auto" style={{ width: '56px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              ))}
            </div>
          ) : recentCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: '40px 0' }}>
              <Users style={{ width: '28px', height: '28px', color: '#d1d5db' }} />
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>No candidates yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {["Name", "Jobs", "Status", "Added"].map((h, i) => (
                    <th key={h} className={i === 3 ? "text-right" : "text-left"} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500, paddingBottom: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c, idx) => {
                  const statusObj = candidateStatuses.find((s) => s.label === c.status);
                  const statusColor = statusObj?.color || "#6b7280";
                  return (
                    <tr key={c.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 0' }}>
                        <button onClick={() => setDrawerCandidate(c)} className="transition-colors" style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>{c.name}</button>
                      </td>
                      <td style={{ padding: '8px 0', fontSize: '13px', color: '#9ca3af' }}>{c._count.matches > 0 ? `${c._count.matches}` : "—"}</td>
                      <td style={{ padding: '8px 0' }}>
                        <StatusChip current={c.status} color={statusColor} statuses={candidateStatuses} onSave={(status) => {
                          updateCandidate.mutate({ id: c.id, data: { status } }, {
                            onSuccess: () => toast.success("Status updated"),
                            onError: (e) => toast.error(e.message, { duration: 8000 }),
                          });
                        }} />
                      </td>
                      <td className="text-right" style={{ padding: '8px 0', fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</td>
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
