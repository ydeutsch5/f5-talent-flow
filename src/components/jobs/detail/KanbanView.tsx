import { useState } from "react";
import { Check } from "lucide-react";
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
          <div key={status.id} style={{ flexShrink: 0, width: '260px', minHeight: '100%' }}>
            {/* Column header */}
            <div className="flex items-center gap-2 mb-2 px-1" style={{ height: '36px', borderBottom: '1px solid #e9eaec' }}>
              <span className="rounded-full shrink-0" style={{ width: '10px', height: '10px', backgroundColor: status.color }} />
              <span style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 700, color: status.color }}>{status.label}</span>
              <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>{cards.length}</span>
            </div>

            {/* Cards */}
            <div className="space-y-1.5">
              {cards.map((m) => (
                <KanbanCard key={m.id} match={m} statuses={statuses} onChangeStatus={onChangeStatus} onViewProfile={onViewProfile} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ match, statuses, onChangeStatus, onViewProfile }: {
  match: Match; statuses: CandidateStatus[]; onChangeStatus: (matchId: string, newStatus: string) => void; onViewProfile: (candidateId: string) => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const mc = getMatchColor(match.matchPercentage);
  const cc = getCommColor(match.candidate.communicationRating);
  const statusObj = statuses.find((s) => s.label === match.status);
  const statusColor = statusObj?.color || "#6b7280";
  const commBorder = cc.bg === '#dcfce7' ? '#bbf7d0' : cc.bg === '#dbeafe' ? '#bfdbfe' : cc.bg === '#fef3c7' ? '#fde68a' : '#fecaca';

  return (
    <div
      className="cursor-pointer transition-all"
      style={{
        border: '1px solid #e9eaec',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '6px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div className="flex items-start justify-between mb-1">
        <button onClick={() => onViewProfile(match.candidateId)} className="text-left truncate transition-colors" style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
        >
          {match.candidate.name}
        </button>
        <span className="inline-flex items-center rounded-full shrink-0 ml-1" style={{ padding: '1px 6px', fontSize: '10px', fontWeight: 600, backgroundColor: mc.bg, color: mc.text }}>
          {match.matchPercentage ?? "—"}%
        </span>
      </div>
      <p className="truncate" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', marginBottom: '6px' }}>{match.candidate.title || "—"}</p>
      <div className="flex items-center gap-1.5">
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center rounded-full cursor-pointer transition-colors" onClick={(e) => e.stopPropagation()}
              style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: statusColor, backgroundColor: `${statusColor}20`, border: `1px solid ${statusColor}35` }}>
              {match.status}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-1.5" align="start" sideOffset={4} style={{ width: '200px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
            {statuses.map((s) => (
              <button key={s.id} onClick={() => { onChangeStatus(match.id, s.label); setStatusOpen(false); }}
                className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '28px' }}>
                <span className="shrink-0" style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: s.color }} />
                <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{s.label}</span>
                {s.label === match.status && <Check className="h-3 w-3 shrink-0" style={{ color: '#7c3aed' }} />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        {match.candidate.communicationRating && (
          <span className="inline-flex items-center rounded-full" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, backgroundColor: cc.bg, color: cc.text, border: `1px solid ${commBorder}` }}>
            {commLabel(match.candidate.communicationRating)}
          </span>
        )}
      </div>
    </div>
  );
}
