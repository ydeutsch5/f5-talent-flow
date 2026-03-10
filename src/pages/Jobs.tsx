import { useState, useCallback } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
import { useJobs, useJobStatuses, useUpdateJob, useDeleteJob, type Job } from "@/hooks/useJobs";
import { JobsListView } from "@/components/jobs/JobsListView";
import { NewJobDrawer } from "@/components/jobs/NewJobDrawer";
import { JobDetailDrawer } from "@/components/jobs/detail/JobDetailDrawerFull";
import { JobsSkeletonRows } from "@/components/jobs/JobsSkeletonRows";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";

export default function Jobs() {
  usePageTitle("Jobs");
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
      updateJob.mutate({ id, data }, {
        onSuccess: () => toast.success("Job updated"),
        onError: (e) => toast.error(e.message, { duration: 8000 }),
      });
    },
    [updateJob]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteJob.mutate(id, {
        onSuccess: () => toast.success("Job deleted"),
        onError: (e) => toast.error(e.message, { duration: 8000 }),
      });
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

  const inputStyle: React.CSSProperties = {
    height: '28px',
    width: '200px',
    paddingLeft: '28px',
    paddingRight: '8px',
    borderRadius: '6px',
    border: '1px solid #e2e3e6',
    fontSize: '13px',
    color: '#1a1a1a',
    background: '#ffffff',
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between shrink-0" style={{ height: '48px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Jobs</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2" style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs…"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <button
            onClick={() => handleOpenNewJob()}
            className="inline-flex items-center gap-1.5 transition-colors"
            style={{
              height: '28px',
              padding: '0 12px',
              borderRadius: '6px',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
          >
            <Plus style={{ width: '14px', height: '14px' }} /> New Job
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 shrink-0" style={{ height: '40px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
        <button
          onClick={() => setFilterStatus(null)}
          className="inline-flex items-center rounded-md transition-colors"
          style={{
            height: '28px',
            padding: '0 10px',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid #e2e3e6',
            backgroundColor: filterStatus === null ? '#f3f4f6' : 'transparent',
            color: filterStatus === null ? '#1a1a1a' : '#374151',
          }}
        >
          All
        </button>
        {statuses?.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilterStatus(filterStatus === s.label ? null : s.label)}
            className="inline-flex items-center gap-1.5 rounded-md transition-colors"
            style={{
              height: '28px',
              padding: '0 10px',
              fontSize: '13px',
              fontWeight: 500,
              border: filterStatus === s.label ? `1px solid ${s.color}` : '1px solid #e2e3e6',
              backgroundColor: filterStatus === s.label ? `${s.color}15` : 'transparent',
              color: filterStatus === s.label ? s.color : '#374151',
            }}
          >
            <span className="rounded-full shrink-0" style={{ width: '8px', height: '8px', backgroundColor: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <JobsSkeletonRows />}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: '48px 0' }}>
            <Briefcase style={{ width: '48px', height: '48px', color: '#d1d5db' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginTop: '16px' }}>No jobs yet</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', maxWidth: '320px' }}>Add your first job to start building your pipeline</p>
            <button
              onClick={() => handleOpenNewJob()}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: '28px',
                padding: '0 12px',
                borderRadius: '6px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 500,
                marginTop: '20px',
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} /> New Job
            </button>
          </div>
        )}
        {!isLoading && !isEmpty && statuses && jobs && (
          <JobsListView
            jobs={jobs} statuses={statuses} onUpdate={handleUpdate} onDelete={handleDelete}
            onOpenDetail={setDetailJob} onNewJob={handleOpenNewJob} searchQuery={searchQuery}
            filterStatus={filterStatus} selectedIds={selectedIds} onToggleSelect={handleToggleSelect}
          />
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 shrink-0" style={{ height: '40px', borderTop: '1px solid #e9eaec', padding: '0 20px', backgroundColor: '#f9fafb' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} style={{ fontSize: '13px', color: '#7c3aed', cursor: 'pointer' }}>Clear</button>
        </div>
      )}

      {statuses && <NewJobDrawer open={newDrawerOpen} onClose={() => setNewDrawerOpen(false)} statuses={statuses} defaultStatus={newDrawerDefaultStatus} />}
      <JobDetailDrawer job={detailJob} open={!!detailJob} onClose={() => setDetailJob(null)} statuses={statuses || []} onUpdate={handleUpdate} />
    </div>
  );
}
