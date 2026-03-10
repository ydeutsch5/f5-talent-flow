import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useMatches, useUpdateMatch } from "@/hooks/useMatches";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getMatchColor } from "@/components/jobs/detail/matchUtils";
import { formatDistanceToNow } from "date-fns";
import type { Job } from "@/hooks/useJobs";

interface JobsTabProps {
  candidateId: string;
  onOpenJob?: (jobId: string) => void;
}

export function JobsTab({ candidateId, onOpenJob }: JobsTabProps) {
  const { data: matches, isLoading } = useMatches(undefined);
  const { data: statuses } = useCandidateStatuses();
  const updateMatch = useUpdateMatch();

  // Filter matches for this candidate — we fetch all then filter
  // In a real app you'd use GET /api/v1/matches?candidateId={id}
  const candidateMatches = matches?.filter((m) => m.candidateId === candidateId) || [];

  if (isLoading) {
    return (
      <div className="p-4 space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-row border-b border-border flex items-center gap-4 px-3">
            <div className="h-3 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded-full w-16" />
            <div className="h-3 bg-muted rounded w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (candidateMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-foreground mb-0.5">No job matches</p>
        <p className="text-xs text-muted-foreground">This candidate hasn't been evaluated for any jobs yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        className="grid items-center h-8 px-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider"
        style={{ gridTemplateColumns: "1fr 70px 70px 110px 80px" }}
      >
        <div>Job</div>
        <div>Match</div>
        <div>Band</div>
        <div>Status</div>
        <div>Date</div>
      </div>

      {candidateMatches.map((m) => {
        const mc = getMatchColor(m.matchPercentage);
        return (
          <MatchRow
            key={m.id}
            match={m}
            statuses={statuses || []}
            matchColor={mc}
            onUpdateStatus={(newStatus) => updateMatch.mutate({ id: m.id, data: { status: newStatus } })}
            onClickJob={() => onOpenJob?.(m.jobId)}
          />
        );
      })}
    </div>
  );
}

function MatchRow({
  match, statuses, matchColor, onUpdateStatus, onClickJob,
}: {
  match: any;
  statuses: CandidateStatus[];
  matchColor: { bg: string; text: string; label: string };
  onUpdateStatus: (s: string) => void;
  onClickJob: () => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const statusObj = statuses.find((s) => s.label === match.status);
  const statusColor = statusObj?.color || "#6b7280";

  return (
    <div
      className="grid items-center h-row px-3 border-b border-border hover:bg-row-hover transition-colors duration-fast"
      style={{ gridTemplateColumns: "1fr 70px 70px 110px 80px" }}
    >
      <button onClick={onClickJob} className="text-sm font-semibold text-foreground text-left truncate hover:text-primary transition-colors duration-fast">
        {match.candidate?.name || "Job"} {/* In real usage this would show job title */}
      </button>
      <div>
        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: matchColor.bg, color: matchColor.text }}>
          {match.matchPercentage != null ? `${match.matchPercentage}%` : "—"}
        </span>
      </div>
      <div><span className="text-xs text-muted-foreground">{matchColor.label}</span></div>
      <div>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer" style={{ backgroundColor: `${statusColor}26`, color: statusColor }}>
              {match.status}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            {statuses.map((s) => (
              <button key={s.id} onClick={() => { onUpdateStatus(s.label); setStatusOpen(false); }}
                className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${s.label === match.status ? "bg-muted font-medium" : "hover:bg-muted/60"}`}>
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <div><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}</span></div>
    </div>
  );
}
