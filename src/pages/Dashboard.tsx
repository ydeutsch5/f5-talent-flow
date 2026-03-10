import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs, useJobStatuses, type Job, type JobStatus } from "@/hooks/useJobs";
import { useCandidates, type Candidate } from "@/hooks/useCandidates";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useRecentActivity, type RecentActivityEntry } from "@/hooks/useRecentActivity";
import { useUpdateCandidateFull } from "@/hooks/useCandidates";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CandidateDetailDrawer } from "@/components/candidates/detail/CandidateDetailDrawer";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, isAfter, subDays, startOfMonth, startOfWeek } from "date-fns";
import {
  Star, ArrowRightLeft, Check, X as XIcon, MessageCircle, UserPlus,
  Briefcase, Users, FileText, Sparkles, ArrowUp, ArrowDown, ArrowRight,
} from "lucide-react";

// ── helpers ──
const now = new Date();
const weekAgo = subDays(now, 7);
const monthStart = startOfMonth(now);
const weekStart = startOfWeek(now, { weekStartsOn: 1 });

function isThisWeek(d: string) {
  return isAfter(new Date(d), weekStart);
}

// ── KPI Card ──
function KpiCard({
  label, value, sub, trend, onClick, loading,
}: {
  label: string; value: number | string; sub: React.ReactNode; trend?: { dir: "up" | "down"; n: number } | null; onClick?: () => void; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-start bg-background border border-border rounded-lg p-4 text-left transition-colors hover:bg-muted/40 disabled:cursor-default disabled:hover:bg-background"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      {loading ? (
        <Skeleton className="h-8 w-16 mt-1" />
      ) : (
        <div className="flex items-end gap-2 mt-1">
          <span className="text-[32px] leading-none font-bold text-foreground">{value}</span>
          {trend && (
            <span className={`flex items-center text-xs font-medium ${trend.dir === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {trend.dir === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {trend.n}
            </span>
          )}
        </div>
      )}
      {loading ? <Skeleton className="h-3.5 w-24 mt-1.5" /> : <span className="text-sm text-muted-foreground mt-1">{sub}</span>}
    </button>
  );
}

// ── Mini Pipeline Bar ──
function PipelineBar({ segments }: { segments: { label: string; color: string; count: number }[] }) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) return <div className="w-[120px] h-2.5 rounded-full bg-muted" />;
  return (
    <div className="flex w-[120px] h-2.5 rounded-full overflow-hidden">
      {segments.filter((s) => s.count > 0).map((s) => (
        <Tooltip key={s.label}>
          <TooltipTrigger asChild>
            <div style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }} className="h-full first:rounded-l-full last:rounded-r-full" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">{s.label}: {s.count}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

// ── Activity icon ──
const ACTIVITY_ICON: Record<string, { icon: React.ElementType; cls: string }> = {
  evaluation: { icon: Star, cls: "text-primary" },
  status_change: { icon: ArrowRightLeft, cls: "text-blue-500" },
  submission_approved: { icon: Check, cls: "text-emerald-500" },
  submission_rejected: { icon: XIcon, cls: "text-red-500" },
  comment: { icon: MessageCircle, cls: "text-muted-foreground" },
  candidate_added: { icon: UserPlus, cls: "text-teal-500" },
};

// ── Status dropdown (reuse pattern from candidate detail) ──
function StatusChip({ current, color, statuses, onSave }: { current: string; color: string; statuses: CandidateStatus[]; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium cursor-pointer transition-opacity hover:opacity-80" style={{ backgroundColor: `${color}26`, color }}>
          {current}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        {statuses.map((s) => (
          <button key={s.id} onClick={() => { onSave(s.label); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors text-foreground ${s.label === current ? "bg-muted font-medium" : "hover:bg-muted/60"}`}>
            <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: s.color }} />
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ── Main ──
export default function Dashboard() {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading: jLoad } = useJobs();
  const { data: jobStatuses = [] } = useJobStatuses();
  const { data: candidates = [], isLoading: cLoad } = useCandidates();
  const { data: candidateStatuses = [] } = useCandidateStatuses();
  const { data: submissions = [], isLoading: sLoad } = useSubmissions();
  const { data: activity = [], isLoading: aLoad } = useRecentActivity();
  const updateCandidate = useUpdateCandidateFull();

  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);

  // ── KPI computations ──
  const activeJobs = useMemo(() => jobs.filter((j) => j.status === "Active"), [jobs]);
  const onHoldJobs = useMemo(() => jobs.filter((j) => j.status === "On Hold"), [jobs]);
  const newCandidatesThisWeek = useMemo(() => candidates.filter((c) => isThisWeek(c.createdAt)), [candidates]);
  const pendingSubs = useMemo(() => submissions.filter((s) => s.status === "Pending"), [submissions]);
  const approvedThisMonth = useMemo(() => submissions.filter((s) => s.status === "Approved" && isAfter(new Date(s.createdAt), monthStart)), [submissions]);
  const evaluationsThisWeek = useMemo(() => candidates.reduce((n, c) => n + (isThisWeek(c.updatedAt) ? c._count.matches : 0), 0), [candidates]);

  // ── Pipeline segments per active job ──
  // We don't have per-job candidate status breakdown from the API,
  // so we show total matches count with a single segment.
  // When match data includes statuses, this can be expanded.

  // ── Jobs by Status donut ──
  const jobsByStatus = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((j) => map.set(j.status, (map.get(j.status) || 0) + 1));
    return Array.from(map.entries()).map(([label, count]) => {
      const st = jobStatuses.find((s) => s.label === label);
      return { label, count, color: st?.color || "#6b7280" };
    });
  }, [jobs, jobStatuses]);

  // ── Recent 5 candidates ──
  const recentCandidates = useMemo(
    () => [...candidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [candidates],
  );

  const loading = jLoad || cLoad || sLoad;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* SECTION 1 — KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Open Jobs"
          value={activeJobs.length}
          sub={<span>{onHoldJobs.length} on hold</span>}
          onClick={() => navigate("/jobs?filter=active")}
          loading={loading}
        />
        <KpiCard
          label="Total Candidates"
          value={candidates.length}
          sub={<span className="text-emerald-600">+{newCandidatesThisWeek.length} added this week</span>}
          onClick={() => navigate("/candidates")}
          loading={loading}
        />
        <KpiCard
          label="Pending Submissions"
          value={pendingSubs.length}
          sub={<span className="text-emerald-600">{approvedThisMonth.length} approved this month</span>}
          onClick={() => navigate("/submissions?filter=pending")}
          loading={loading}
        />
        <KpiCard
          label="AI Evaluations (This Week)"
          value={evaluationsThisWeek}
          sub="Resumes scored"
          loading={loading}
        />
      </div>

      {/* SECTION 2 — Pipeline + Activity */}
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        {/* Left — Active Pipeline */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Active Pipeline</h2>
          <div className="border border-border rounded-lg divide-y divide-border bg-background">
            {jLoad ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center h-11 px-4 gap-4">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-2.5 w-[120px] rounded-full" />
                  <Skeleton className="h-3.5 w-6 ml-auto" />
                </div>
              ))
            ) : activeJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-6">No active jobs — create one to get started</p>
            ) : (
              activeJobs.map((job) => {
                // Build segments from candidateStatuses with dummy proportional data
                // Since we only have _count.matches total, show a single bar
                const segs = candidateStatuses.map((cs) => ({
                  label: cs.label,
                  color: cs.color,
                  count: 0, // would need per-job breakdown
                }));
                // Fallback: show total as first segment color
                if (segs.length > 0 && job._count.matches > 0) {
                  segs[0] = { ...segs[0], count: job._count.matches };
                }
                return (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/jobs`)}
                    className="flex items-center w-full h-11 px-4 gap-4 text-left hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-sm text-foreground truncate min-w-0 flex-1">
                      {job.roleTitle} <span className="text-muted-foreground">· {job.clientName}</span>
                    </span>
                    <PipelineBar segments={segs} />
                    <span className="text-xs text-muted-foreground w-6 text-right">{job._count.matches}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right — Recent Activity */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Recent Activity</h2>
          <div className="border border-border rounded-lg bg-background divide-y divide-border">
            {aLoad ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center h-8 px-4 gap-3">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-10 ml-auto" />
                </div>
              ))
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-6">No recent activity</p>
            ) : (
              activity.slice(0, 12).map((entry) => {
                const meta = ACTIVITY_ICON[entry.type] || ACTIVITY_ICON.comment;
                const Icon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-center h-8 px-4 gap-3">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.cls}`} />
                    <span className="text-sm text-foreground truncate flex-1">{entry.description}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 — Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left — Jobs by Status Donut */}
        <div className="border border-border rounded-lg bg-background p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Jobs by Status</h2>
          {jLoad ? (
            <div className="flex items-center justify-center h-48">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No jobs yet</p>
          ) : (
            <div className="flex items-center gap-8">
              <div className="relative h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobsByStatus}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {jobsByStatus.map((s) => (
                        <Cell key={s.label} fill={s.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground">{jobs.length}</span>
                  <span className="text-xs text-muted-foreground">Total Jobs</span>
                </div>
              </div>
              <div className="space-y-2">
                {jobsByStatus.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-foreground">{s.label}</span>
                    <span className="text-muted-foreground ml-1">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Recently Added Candidates */}
        <div className="border border-border rounded-lg bg-background p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Recently Added Candidates</h2>
          {cLoad ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center h-9 gap-3">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-10" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3.5 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : recentCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No candidates yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left font-medium pb-2">Name</th>
                  <th className="text-left font-medium pb-2">Best Match</th>
                  <th className="text-left font-medium pb-2">Status</th>
                  <th className="text-right font-medium pb-2">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentCandidates.map((c) => {
                  const statusObj = candidateStatuses.find((s) => s.label === c.status);
                  const statusColor = statusObj?.color || "#6b7280";
                  return (
                    <tr key={c.id} className="group">
                      <td className="py-2">
                        <button
                          onClick={() => setDrawerCandidate(c)}
                          className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {c._count.matches > 0 ? `${c._count.matches} jobs` : "—"}
                      </td>
                      <td className="py-2">
                        <StatusChip
                          current={c.status}
                          color={statusColor}
                          statuses={candidateStatuses}
                          onSave={(status) => updateCandidate.mutate({ id: c.id, data: { status } })}
                        />
                      </td>
                      <td className="py-2 text-right text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        candidate={drawerCandidate}
        open={!!drawerCandidate}
        onClose={() => setDrawerCandidate(null)}
        statuses={candidateStatuses}
        onUpdate={(id, data) => updateCandidate.mutate({ id, data })}
      />
    </div>
  );
}
