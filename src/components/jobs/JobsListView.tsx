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
  jobs,
  statuses,
  onUpdate,
  onDelete,
  onOpenDetail,
  onNewJob,
  searchQuery,
  filterStatus,
  selectedIds,
  onToggleSelect,
}: JobsListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let result = jobs;
    if (filterStatus) {
      result = result.filter((j) => j.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.roleTitle.toLowerCase().includes(q) ||
          j.clientName.toLowerCase().includes(q)
      );
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

  const toggleCollapse = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex-1">
      {/* Column headers */}
      <div
        className="grid items-center h-8 px-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider"
        style={{
          gridTemplateColumns: "28px 1fr 120px 100px 100px 80px 90px 36px",
        }}
      >
        <div />
        <div>Name</div>
        <div>Status</div>
        <div>Budget</div>
        <div>Hours</div>
        <div className="text-center">Candidates</div>
        <div>Updated</div>
        <div />
      </div>

      {/* Grouped sections */}
      {grouped.map(({ status, jobs: groupJobs }) => {
        const isCollapsed = collapsed[status.label] ?? false;
        return (
          <div key={status.id}>
            {/* Group header */}
            <div
              className="group flex items-center h-row px-3 border-b border-border cursor-pointer select-none hover:bg-row-hover transition-colors duration-fast"
              onClick={() => toggleCollapse(status.label)}
              style={{ borderLeftWidth: 3, borderLeftColor: status.color }}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
              )}
              <span
                className="text-sm font-semibold mr-2"
                style={{ color: status.color }}
              >
                {status.label}
              </span>
              <span className="inline-flex items-center justify-center h-4.5 min-w-[18px] rounded-full bg-muted text-xs text-muted-foreground px-1.5">
                {groupJobs.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewJob(status.label);
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-fast flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add Job
              </button>
            </div>

            {/* Rows */}
            {!isCollapsed &&
              groupJobs.map((job) => (
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
