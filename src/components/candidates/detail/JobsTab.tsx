import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useMatches, useUpdateMatch } from "@/hooks/useMatches";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import { useJobs } from "@/hooks/useJobs";
import { getMatchColor } from "@/components/jobs/detail/matchUtils";
import { formatDistanceToNow } from "date-fns";
import { Check } from "lucide-react";

interface JobsTabProps {
  candidateId: string;
  onOpenJob?: (jobId: string) => void;
}

export function JobsTab({ candidateId, onOpenJob }: JobsTabProps) {
  const { data: matches, isLoading } = useMatches(undefined);
  const { data: statuses } = useCandidateStatuses();
  const { data: jobs } = useJobs();
  const updateMatch = useUpdateMatch();

  const candidateMatches = matches?.filter((m) => m.candidateId === candidateId) || [];

  if (isLoading) {
    return (
      <div className="p-4 space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: '34px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px' }}>
            <div style={{ width: '160px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
            <div style={{ width: '48px', height: '20px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
            <div style={{ width: '40px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (candidateMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>No job matches</p>
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>This candidate hasn't been evaluated for any jobs yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: "1fr 120px 70px 70px 110px 80px", height: '32px', padding: '0 12px', borderBottom: '1px solid #e9eaec' }}
      >
        {["Job", "Client", "Match", "Band", "Status", "Date"].map(h => (
          <div key={h} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500 }}>{h}</div>
        ))}
      </div>

      {candidateMatches.map((m) => {
        const mc = getMatchColor(m.matchPercentage);
        const job = jobs?.find(j => j.id === m.jobId);
        return (
          <MatchRow
            key={m.id}
            match={m}
            jobTitle={job?.roleTitle || "Unknown Job"}
            clientName={job?.clientName || ""}
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
  match, jobTitle, clientName, statuses, matchColor, onUpdateStatus, onClickJob,
}: {
  match: any;
  jobTitle: string;
  clientName: string;
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
      className="grid items-center transition-colors"
      style={{ gridTemplateColumns: "1fr 120px 70px 70px 110px 80px", height: '34px', padding: '0 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f8f9'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <button onClick={onClickJob} className="text-left truncate transition-colors" style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}>
        {jobTitle}
      </button>
      <span className="truncate" style={{ fontSize: '11px', color: '#9ca3af' }}>{clientName}</span>
      <div>
        <span className="inline-flex items-center rounded-full" style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: matchColor.bg, color: matchColor.text }}>
          {match.matchPercentage != null ? `${match.matchPercentage}%` : "—"}
        </span>
      </div>
      <div><span style={{ fontSize: '11px', color: '#9ca3af' }}>{matchColor.label}</span></div>
      <div>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center rounded-full cursor-pointer transition-colors"
              style={{ padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: statusColor, backgroundColor: `${statusColor}20`, border: `1px solid ${statusColor}35` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${statusColor}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${statusColor}20`; }}>
              {match.status}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-1.5" align="start" style={{ width: '220px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="px-2.5 pt-1.5 pb-1">
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 500 }}>CHANGE STATUS</span>
            </div>
            {statuses.map((s) => (
              <button key={s.id} onClick={() => { onUpdateStatus(s.label); setStatusOpen(false); }}
                className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
                <span className="shrink-0" style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
                <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{s.label}</span>
                {s.label === match.status && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <div><span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}</span></div>
    </div>
  );
}
