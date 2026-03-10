import { useState, useCallback } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
import { useJobs, useJobStatuses, useUpdateJob, useDeleteJob, type Job } from "@/hooks/useJobs";
import { JobsListView } from "@/components/jobs/JobsListView";
import { NewJobDrawer } from "@/components/jobs/NewJobDrawer";
import { JobDetailDrawer } from "@/components/jobs/detail/JobDetailDrawerFull";
import { JobsSkeletonRows } from "@/components/jobs/JobsSkeletonRows";

export default function Jobs() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: statuses, isLoading: statusesLoading } = useJobStatuses();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [newDrawerOpen, setNewDrawerOpen] = useState(false);
  const [newDrawerDefaultStatus, setNewDrawerDefaultStatus] = useState<string | undefined>();
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleUpdate = useCallback(
    (id: string, data: Partial<Job>) => {
      updateJob.mutate({ id, data });
    },
    [updateJob]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteJob.mutate(id);
    },
    [deleteJob]
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleOpenNewJob = useCallback((defaultStatus?: string) => {
    setNewDrawerDefaultStatus(defaultStatus);
    setNewDrawerOpen(true);
  }, []);

  const isLoading = jobsLoading || statusesLoading;
  const isEmpty = !isLoading && (!jobs || jobs.length === 0);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <h1 className="text-lg font-bold text-foreground">Jobs</h1>
        <button
          onClick={() => handleOpenNewJob()}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast"
        >
          <Plus className="h-3.5 w-3.5" /> New Job
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-6 h-10 border-b border-border shrink-0">
        {/* Status filter pills */}
        <button
          onClick={() => setFilterStatus(null)}
          className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium transition-colors duration-fast border ${
            filterStatus === null
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          All
        </button>
        {statuses?.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilterStatus(filterStatus === s.label ? null : s.label)}
            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium transition-colors duration-fast border ${
              filterStatus === s.label
                ? "border-current"
                : "bg-transparent border-border hover:bg-muted"
            }`}
            style={{
              color: filterStatus === s.label ? s.color : undefined,
              borderColor: filterStatus === s.label ? s.color : undefined,
            }}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs…"
            className="h-7 w-48 pl-7 pr-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-fast"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && <JobsSkeletonRows />}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-medium text-foreground mb-1">No jobs yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first job to start building your pipeline
            </p>
            <button
              onClick={() => handleOpenNewJob()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast"
            >
              <Plus className="h-3.5 w-3.5" /> New Job
            </button>
          </div>
        )}

        {!isLoading && !isEmpty && statuses && jobs && (
          <JobsListView
            jobs={jobs}
            statuses={statuses}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onOpenDetail={setDetailJob}
            onNewJob={handleOpenNewJob}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-6 h-10 border-t border-border bg-muted/50 shrink-0">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Drawers */}
      {statuses && (
        <NewJobDrawer
          open={newDrawerOpen}
          onClose={() => setNewDrawerOpen(false)}
          statuses={statuses}
          defaultStatus={newDrawerDefaultStatus}
        />
      )}

      <JobDetailDrawer
        job={detailJob}
        open={!!detailJob}
        onClose={() => setDetailJob(null)}
        statuses={statuses || []}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
