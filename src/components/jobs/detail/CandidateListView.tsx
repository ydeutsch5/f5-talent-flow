import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CandidateRow } from "./CandidateRow";
import type { Match } from "@/hooks/useMatches";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";

interface CandidateListViewProps {
  matches: Match[];
  statuses: CandidateStatus[];
  onChangeStatus: (matchId: string, newStatus: string) => void;
  onChangeComm: (candidateId: string, rating: string) => void;
  onViewProfile: (candidateId: string) => void;
  onRemove: (matchId: string) => void;
}

export function CandidateListView({
  matches, statuses, onChangeStatus, onChangeComm, onViewProfile, onRemove,
}: CandidateListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const sorted = [...statuses].sort((a, b) => a.position - b.position);
    return sorted.map((s) => ({
      status: s,
      matches: matches.filter((m) => m.status === s.label),
    }));
  }, [matches, statuses]);

  return (
    <div>
      {/* Column headers */}
      <div
        className="grid items-center h-7 px-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider"
        style={{ gridTemplateColumns: "1fr 110px 70px 70px 90px 80px 32px" }}
      >
        <div>Candidate</div>
        <div>Status</div>
        <div>Match</div>
        <div>Band</div>
        <div>Comm</div>
        <div>Shift</div>
        <div />
      </div>

      {grouped.map(({ status, matches: gm }) => {
        const isCol = collapsed[status.label] ?? false;
        return (
          <div key={status.id}>
            <div
              className="group flex items-center h-row px-3 border-b border-border cursor-pointer select-none hover:bg-row-hover transition-colors duration-fast"
              onClick={() => setCollapsed((p) => ({ ...p, [status.label]: !p[status.label] }))}
              style={{ borderLeftWidth: 3, borderLeftColor: status.color }}
            >
              {isCol
                ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />}
              <span className="text-sm font-semibold mr-2" style={{ color: status.color }}>
                {status.label}
              </span>
              <span className="inline-flex items-center justify-center h-4 min-w-[18px] rounded-full bg-muted text-xs text-muted-foreground px-1.5">
                {gm.length}
              </span>
            </div>
            {!isCol && gm.map((m) => (
              <CandidateRow
                key={m.id}
                match={m}
                statuses={statuses}
                onChangeStatus={onChangeStatus}
                onChangeComm={onChangeComm}
                onViewProfile={onViewProfile}
                onRemove={onRemove}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
