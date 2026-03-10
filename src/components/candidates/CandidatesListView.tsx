import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
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

  return (
    <div>
      {/* Column headers */}
      <div
        className="grid items-center h-8 px-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider"
        style={{ gridTemplateColumns: "28px 1fr 110px 90px 80px minmax(120px,1fr) 60px 80px 32px" }}
      >
        <div />
        <div>Name</div>
        <div>Status</div>
        <div>Comm</div>
        <div>Shift</div>
        <div>Tags</div>
        <div className="text-center">Jobs</div>
        <div>Updated</div>
        <div />
      </div>

      {grouped.map(({ status, candidates: gc }) => {
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
