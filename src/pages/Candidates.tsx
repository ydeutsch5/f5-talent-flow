import { useState, useCallback } from "react";
import { Plus, Search, Users } from "lucide-react";
import { useCandidates, useUpdateCandidateFull, useDeleteCandidate, useBulkUpdateCandidates, useBulkDeleteCandidates, type Candidate } from "@/hooks/useCandidates";
import { useCandidateStatuses } from "@/hooks/useCandidateStatuses";
import { CandidatesListView } from "@/components/candidates/CandidatesListView";
import { AddCandidateDrawer } from "@/components/candidates/AddCandidateDrawer";
import { CandidateDetailDrawer } from "@/components/candidates/detail/CandidateDetailDrawer";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { getCommColor, commLabel, COMM_OPTIONS } from "@/components/jobs/detail/matchUtils";
import { TagBulkPicker } from "@/components/candidates/TagBulkPicker";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";

export default function Candidates() {
  usePageTitle("Candidates");
  const { data: candidates, isLoading: cLoading } = useCandidates();
  const { data: statuses, isLoading: sLoading } = useCandidateStatuses();
  const updateCandidate = useUpdateCandidateFull();
  const deleteCandidate = useDeleteCandidate();
  const bulkUpdate = useBulkUpdateCandidates();
  const bulkDelete = useBulkDeleteCandidates();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterComm, setFilterComm] = useState<string | null>(null);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  const handleUpdate = useCallback((id: string, data: Record<string, any>) => {
    updateCandidate.mutate({ id, data }, {
      onSuccess: () => toast.success(data.status ? "Status updated" : "Candidate updated"),
      onError: (e) => toast.error(e.message, { duration: 8000 }),
    });
  }, [updateCandidate]);

  const handleDelete = useCallback((id: string) => {
    deleteCandidate.mutate(id, {
      onSuccess: () => toast.success("Candidate deleted"),
      onError: (e) => toast.error(e.message, { duration: 8000 }),
    });
  }, [deleteCandidate]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filtered = candidates?.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterComm && c.communicationRating !== filterComm) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !(c.title || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const isLoading = cLoading || sLoading;
  const isEmpty = !isLoading && (!filtered || filtered.length === 0);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between shrink-0" style={{ height: '48px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Candidates</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2" style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              style={{ height: '28px', width: '180px', paddingLeft: '28px', paddingRight: '8px', borderRadius: '6px', border: '1px solid #e2e3e6', fontSize: '13px', color: '#1a1a1a' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <button
            onClick={() => setAddDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 transition-colors"
            style={{ height: '28px', padding: '0 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
          >
            <Plus style={{ width: '14px', height: '14px' }} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 shrink-0 overflow-x-auto" style={{ height: '40px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
        <button
          onClick={() => setFilterStatus(null)}
          className="inline-flex items-center rounded-md transition-colors shrink-0"
          style={{ height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500, border: '1px solid #e2e3e6', backgroundColor: filterStatus === null ? '#f3f4f6' : 'transparent', color: filterStatus === null ? '#1a1a1a' : '#374151' }}
        >
          All
        </button>
        {statuses?.map((s) => (
          <button key={s.id} onClick={() => setFilterStatus(filterStatus === s.label ? null : s.label)}
            className="inline-flex items-center gap-1.5 rounded-md transition-colors shrink-0"
            style={{ height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500, border: filterStatus === s.label ? `1px solid ${s.color}` : '1px solid #e2e3e6', backgroundColor: filterStatus === s.label ? `${s.color}15` : 'transparent', color: filterStatus === s.label ? s.color : '#374151' }}>
            <span className="rounded-full shrink-0" style={{ width: '8px', height: '8px', backgroundColor: s.color }} />{s.label}
          </button>
        ))}
        <div className="shrink-0" style={{ width: '1px', height: '16px', backgroundColor: '#e9eaec', margin: '0 4px' }} />
        {COMM_OPTIONS.map((opt) => {
          const cc = getCommColor(opt);
          return (
            <button key={opt} onClick={() => setFilterComm(filterComm === opt ? null : opt)}
              className="inline-flex items-center rounded-md transition-colors shrink-0"
              style={{ height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500, border: filterComm === opt ? `1px solid ${cc.text}` : '1px solid #e2e3e6', backgroundColor: filterComm === opt ? cc.bg : 'transparent', color: filterComm === opt ? cc.text : '#374151' }}>
              {commLabel(opt)}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse">
            <div className="flex items-center" style={{ height: '32px', padding: '0 8px' }}>
              <div className="h-3 rounded" style={{ width: '180px', backgroundColor: '#f3f4f6' }} />
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid items-center" style={{ gridTemplateColumns: "28px 1fr 110px 90px 80px minmax(120px,1fr) 60px 80px 32px", height: '34px', borderBottom: '1px solid #f3f4f6', padding: '0 8px' }}>
                <div /><div className="space-y-1 pr-4 pl-3"><div className="h-3 rounded" style={{ width: '60%', backgroundColor: '#f3f4f6' }} /><div className="h-2 rounded" style={{ width: '40%', backgroundColor: '#f3f4f6' }} /></div><div><div className="h-5 rounded-full" style={{ width: '56px', backgroundColor: '#f3f4f6' }} /></div><div><div className="h-4 rounded-full" style={{ width: '48px', backgroundColor: '#f3f4f6' }} /></div><div><div className="h-4 rounded-full" style={{ width: '40px', backgroundColor: '#f3f4f6' }} /></div><div /><div /><div /><div />
              </div>
            ))}
          </div>
        )}
        {isEmpty && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: '48px 0' }}>
            <Users style={{ width: '48px', height: '48px', color: '#d1d5db' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginTop: '16px' }}>No candidates yet</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', maxWidth: '320px' }}>Add your first candidate to start building your pipeline</p>
            <button onClick={() => setAddDrawerOpen(true)} className="inline-flex items-center gap-1.5 transition-colors" style={{ height: '28px', padding: '0 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, marginTop: '20px' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Add Candidate
            </button>
          </div>
        )}
        {!isLoading && !isEmpty && statuses && filtered && (
          <CandidatesListView candidates={filtered} statuses={statuses} onUpdate={handleUpdate} onDelete={handleDelete} onOpenDetail={setDetailCandidate} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 shrink-0" style={{ height: '40px', borderTop: '1px solid #e9eaec', padding: '0 20px', backgroundColor: '#f9fafb' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>{selectedIds.size} selected</span>
          <Popover open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
            <PopoverTrigger asChild>
              <button style={{ height: '28px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e2e3e6', fontSize: '13px', color: '#374151', fontWeight: 500 }}>Change Status</button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="start">
              {statuses?.map((s) => (
                <button key={s.id} onClick={() => { bulkUpdate.mutate({ ids: [...selectedIds], data: { status: s.label } }, { onSuccess: () => toast.success(`${selectedIds.size} candidates updated`) }); setBulkStatusOpen(false); setSelectedIds(new Set()); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ fontSize: '13px', color: '#1a1a1a' }}>
                  <span className="shrink-0" style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />{s.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <TagBulkPicker candidateIds={[...selectedIds]} onDone={() => setSelectedIds(new Set())} />
          <button onClick={() => setBulkDeleteOpen(true)} style={{ height: '28px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dc2626', fontSize: '13px', color: '#dc2626', fontWeight: 500 }}>Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto" style={{ fontSize: '13px', color: '#7c3aed', cursor: 'pointer' }}>Clear</button>
        </div>
      )}

      <AddCandidateDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} />
      <CandidateDetailDrawer candidate={detailCandidate} open={!!detailCandidate} onClose={() => setDetailCandidate(null)} statuses={statuses || []} onUpdate={handleUpdate} />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} candidates?</AlertDialogTitle>
            <AlertDialogDescription>Their evaluation history will be removed. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { const count = selectedIds.size; bulkDelete.mutate([...selectedIds], { onSuccess: () => toast.success(`${count} candidates deleted`) }); setSelectedIds(new Set()); setBulkDeleteOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
