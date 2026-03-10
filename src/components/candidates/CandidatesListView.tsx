import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CandidateRow } from "./CandidateRow";
import type { Candidate } from "@/hooks/useCandidates";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";

interface CandidatesListViewProps {
  candidates: Candidate[];
  statuses: CandidateStatus[];
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (c: Candidate) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function CandidatesListView({
  candidates, statuses, onUpdate, onDelete, onOpenDetail, selectedIds, onToggleSelect,
}: CandidatesListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const sorted = [...statuses].sort((a, b) => a.position - b.position);
    return sorted.map((s) => ({
      status: s,
      candidates: candidates.filter((c) => c.status === s.label),
    }));
  }, [candidates, statuses]);

  const colHeaderStyle: React.CSSProperties = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500,
  };

  return (
    <div>
      {/* Column headers */}
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "28px 1fr 110px 90px 80px minmax(120px,1fr) 60px 80px 32px",
          height: '32px', borderBottom: '1px solid #e9eaec', padding: '0 8px', backgroundColor: '#ffffff',
        }}
      >
        <div />
        <div style={colHeaderStyle}>Name</div>
        <div style={colHeaderStyle}>Status</div>
        <div style={colHeaderStyle}>Comm</div>
        <div style={colHeaderStyle}>Shift</div>
        <div style={colHeaderStyle}>Tags</div>
        <div style={{ ...colHeaderStyle, textAlign: 'center' }}>Jobs</div>
        <div style={colHeaderStyle}>Updated</div>
        <div />
      </div>

      {grouped.map(({ status, candidates: gc }) => {
        const isCol = collapsed[status.label] ?? false;
        return (
          <div key={status.id}>
            <div
              className="group flex items-center cursor-pointer select-none transition-colors hover:bg-[#f7f8f9]"
              onClick={() => setCollapsed((p) => ({ ...p, [status.label]: !p[status.label] }))}
              style={{ height: '32px', padding: '0 8px' }}
            >
              {isCol
                ? <ChevronRight className="shrink-0 mr-1.5" style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
                : <ChevronDown className="shrink-0 mr-1.5" style={{ width: '10px', height: '10px', color: '#9ca3af' }} />}
              <span className="shrink-0 rounded-full mr-2" style={{ width: '8px', height: '8px', backgroundColor: status.color }} />
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: status.color, marginRight: '6px' }}>
                {status.label}
              </span>
              <span className="rounded-full" style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 600, backgroundColor: `${status.color}1F`, color: status.color }}>
                {gc.length}
              </span>
            </div>
            {!isCol && gc.map((c) => (
              <CandidateRow
                key={c.id}
                candidate={c}
                statuses={statuses}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onOpenDetail={onOpenDetail}
                selected={selectedIds.has(c.id)}
                onSelect={onToggleSelect}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
