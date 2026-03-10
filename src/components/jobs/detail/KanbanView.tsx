import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { Match } from "@/hooks/useMatches";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getMatchColor, getCommColor, commLabel } from "./matchUtils";

interface KanbanViewProps {
  matches: Match[];
  statuses: CandidateStatus[];
  onChangeStatus: (matchId: string, newStatus: string) => void;
  onViewProfile: (candidateId: string) => void;
}

export function KanbanView({ matches, statuses, onChangeStatus, onViewProfile }: KanbanViewProps) {
  const sorted = [...statuses].sort((a, b) => a.position - b.position);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-1">
      {sorted.map((status) => {
        const cards = matches.filter((m) => m.status === status.label);
        return (
          <div key={status.id} className="flex-shrink-0 w-[220px]">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
              <span className="text-sm font-semibold text-foreground">{status.label}</span>
              <span className="text-xs text-muted-foreground">{cards.length}</span>
            </div>

            {/* Cards */}
            <div className="space-y-1.5">
              {cards.map((m) => (
                <KanbanCard
                  key={m.id}
                  match={m}
                  statuses={statuses}
                  onChangeStatus={onChangeStatus}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  match, statuses, onChangeStatus, onViewProfile,
}: {
  match: Match;
  statuses: CandidateStatus[];
  onChangeStatus: (matchId: string, newStatus: string) => void;
  onViewProfile: (candidateId: string) => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const mc = getMatchColor(match.matchPercentage);
  const cc = getCommColor(match.candidate.communicationRating);
  const statusObj = statuses.find((s) => s.label === match.status);
  const statusColor = statusObj?.color || "#6b7280";

  return (
    <div className="border border-border rounded-md p-2.5 bg-background hover:bg-row-hover transition-colors duration-fast cursor-pointer">
      <div className="flex items-start justify-between mb-1">
        <button
          onClick={() => onViewProfile(match.candidateId)}
          className="text-sm font-semibold text-foreground text-left hover:text-primary transition-colors duration-fast truncate"
        >
          {match.candidate.name}
        </button>
        <span
          className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-semibold shrink-0 ml-1"
          style={{ backgroundColor: mc.bg, color: mc.text }}
        >
          {match.matchPercentage ?? "—"}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground truncate mb-1.5">{match.candidate.title || "—"}</p>
      <div className="flex items-center gap-1.5">
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border-0 outline-none cursor-pointer"
              style={{ backgroundColor: `${statusColor}26`, color: statusColor }}
            >
              {match.status}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="start" sideOffset={4}>
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => { onChangeStatus(match.id, s.label); setStatusOpen(false); }}
                className={`flex items-center gap-2 w-full px-2 py-1 text-xs rounded-sm transition-colors duration-fast text-foreground ${s.label === match.status ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        {match.candidate.communicationRating && (
          <span
            className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: cc.bg, color: cc.text }}
          >
            {commLabel(match.candidate.communicationRating)}
          </span>
        )}
      </div>
    </div>
  );
}
