import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { JobRow } from "./JobRow";
import type { Job, JobStatus } from "@/hooks/useJobs";

interface JobsListViewProps {
  jobs: Job[];
  statuses: JobStatus[];
  onUpdate: (id: string, data: Partial<Job>) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (job: Job) => void;
  onNewJob: (defaultStatus?: string) => void;
  searchQuery: string;
  filterStatus: string | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function JobsListView({
  jobs, statuses, onUpdate, onDelete, onOpenDetail, onNewJob,
  searchQuery, filterStatus, selectedIds, onToggleSelect,
}: JobsListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let result = jobs;
    if (filterStatus) result = result.filter((j) => j.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((j) => j.roleTitle.toLowerCase().includes(q) || j.clientName.toLowerCase().includes(q));
    }
    return result;
  }, [jobs, filterStatus, searchQuery]);

  const grouped = useMemo(() => {
    const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
    return sortedStatuses.map((status) => ({
      status,
      jobs: filtered.filter((j) => j.status === status.label),
    }));
  }, [filtered, statuses]);

  return (
    <div className="flex-1">
      {/* Column header */}
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "28px 1fr 120px 100px 100px 80px 90px 36px",
          height: '32px',
          borderBottom: '1px solid #e9eaec',
          padding: '0 8px',
          backgroundColor: '#ffffff',
        }}
      >
        <div />
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500 }}>Name</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500 }}>Status</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500 }}>Budget</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500 }}>Hours</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>Cands</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500 }}>Updated</div>
        <div />
      </div>

      {/* Grouped sections */}
      {grouped.map(({ status, jobs: groupJobs }) => {
        const isCollapsed = collapsed[status.label] ?? false;
        return (
          <div key={status.id}>
            {/* Group header */}
            <div
              className="group flex items-center cursor-pointer select-none transition-colors hover:bg-[#f7f8f9]"
              onClick={() => setCollapsed((p) => ({ ...p, [status.label]: !p[status.label] }))}
              style={{ height: '32px', padding: '0 8px', background: 'transparent' }}
            >
              {isCollapsed ? (
                <ChevronRight className="shrink-0 mr-1.5" style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
              ) : (
                <ChevronDown className="shrink-0 mr-1.5" style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
              )}
              <span
                className="shrink-0 rounded-full mr-2"
                style={{ width: '8px', height: '8px', backgroundColor: status.color }}
              />
              <span style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
                color: status.color,
                marginRight: '6px',
              }}>
                {status.label}
              </span>
              <span
                className="rounded-full"
                style={{
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: `${status.color}1F`,
                  color: status.color,
                }}
              >
                {groupJobs.length}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onNewJob(status.label); }}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                style={{ fontSize: '11px', color: '#9ca3af' }}
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            {!isCollapsed && groupJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                statuses={statuses}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onOpenDetail={onOpenDetail}
                selected={selectedIds.has(job.id)}
                onSelect={onToggleSelect}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
