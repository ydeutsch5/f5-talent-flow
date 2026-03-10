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
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <h1 className="text-lg font-bold text-foreground">Candidates</h1>
        <button onClick={() => setAddDrawerOpen(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast">
          <Plus className="h-3.5 w-3.5" /> Add Candidate
        </button>
      </div>

      <div className="flex items-center gap-2 px-6 h-10 border-b border-border shrink-0 overflow-x-auto">
        <button onClick={() => setFilterStatus(null)} className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium transition-colors duration-fast border shrink-0 ${filterStatus === null ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:bg-muted"}`}>All</button>
        {statuses?.map((s) => (
          <button key={s.id} onClick={() => setFilterStatus(filterStatus === s.label ? null : s.label)}
            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium transition-colors duration-fast border shrink-0 ${filterStatus === s.label ? "border-current" : "bg-transparent border-border hover:bg-muted"}`}
            style={{ color: filterStatus === s.label ? s.color : undefined, borderColor: filterStatus === s.label ? s.color : undefined }}>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />{s.label}
          </button>
        ))}
        <div className="h-4 w-px bg-border shrink-0 mx-1" />
        <button onClick={() => setFilterComm(null)} className={`inline-flex items-center h-6 px-2 rounded-full text-xs font-medium transition-colors duration-fast border shrink-0 ${filterComm === null ? "bg-muted text-foreground border-muted" : "bg-transparent text-muted-foreground border-border hover:bg-muted"}`}>All Comm</button>
        {COMM_OPTIONS.map((opt) => {
          const cc = getCommColor(opt);
          return (
            <button key={opt} onClick={() => setFilterComm(filterComm === opt ? null : opt)}
              className={`inline-flex items-center h-6 px-2 rounded-full text-xs font-medium transition-colors duration-fast border shrink-0 ${filterComm === opt ? "" : "bg-transparent border-border hover:bg-muted"}`}
              style={filterComm === opt ? { backgroundColor: cc.bg, color: cc.text, borderColor: cc.text } : {}}>
              {commLabel(opt)}
            </button>
          );
        })}
        <div className="ml-auto relative shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search…"
            className="h-7 w-44 pl-7 pr-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-fast" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-row border-b border-border flex items-center gap-4 px-6">
                <div className="h-3 bg-muted rounded w-32" /><div className="h-4 bg-muted rounded-full w-16" /><div className="h-3 bg-muted rounded w-14" /><div className="h-3 bg-muted rounded w-10" />
              </div>
            ))}
          </div>
        )}
        {isEmpty && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-medium text-foreground mb-1">No candidates yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add your first candidate to start building your pipeline</p>
            <button onClick={() => setAddDrawerOpen(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast">
              <Plus className="h-3.5 w-3.5" /> Add Candidate
            </button>
          </div>
        )}
        {!isLoading && !isEmpty && statuses && filtered && (
          <CandidatesListView candidates={filtered} statuses={statuses} onUpdate={handleUpdate} onDelete={handleDelete} onOpenDetail={setDetailCandidate} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-6 h-11 border-t border-border bg-muted/50 shrink-0">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <Popover open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
            <PopoverTrigger asChild>
              <button className="h-7 px-2.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors duration-fast">Change Status</button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="start">
              {statuses?.map((s) => (
                <button key={s.id} onClick={() => {
                  bulkUpdate.mutate({ ids: [...selectedIds], data: { status: s.label } }, {
                    onSuccess: () => toast.success(`${selectedIds.size} candidates updated`),
                  });
                  setBulkStatusOpen(false);
                  setSelectedIds(new Set());
                }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm hover:bg-muted/60 transition-colors duration-fast text-foreground">
                  <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: s.color }} />{s.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <TagBulkPicker candidateIds={[...selectedIds]} onDone={() => setSelectedIds(new Set())} />
          <button onClick={() => setBulkDeleteOpen(true)} className="h-7 px-2.5 rounded-md border border-destructive text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors duration-fast">Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-primary hover:underline ml-auto">Clear</button>
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
            <AlertDialogAction onClick={() => {
              const count = selectedIds.size;
              bulkDelete.mutate([...selectedIds], {
                onSuccess: () => toast.success(`${count} candidates deleted`),
              });
              setSelectedIds(new Set());
              setBulkDeleteOpen(false);
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
