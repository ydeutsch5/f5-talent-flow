import { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import { useCreateCandidateStatus, useUpdateCandidateStatus, useDeleteCandidateStatus, useReorderCandidateStatuses } from "@/hooks/useUpdateCandidateStatus";
import { ColorPalettePicker } from "./ColorPalettePicker";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";

export function CandidateStatusesSection() {
  const { data: statuses = [], isLoading } = useCandidateStatuses();
  const createStatus = useCreateCandidateStatus();
  const updateStatus = useUpdateCandidateStatus();
  const deleteStatus = useDeleteCandidateStatus();
  const reorder = useReorderCandidateStatuses();

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#374151");
  const [deleteTarget, setDeleteTarget] = useState<CandidateStatus | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [localOrder, setLocalOrder] = useState<CandidateStatus[]>([]);

  useEffect(() => { setLocalOrder(statuses); }, [statuses]);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const updated = [...localOrder];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    setLocalOrder(updated);
    setDragIdx(idx);
  };
  const handleDragEnd = () => { setDragIdx(null); reorder.mutate(localOrder.map((s) => s.id)); };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    createStatus.mutate({ label: newLabel.trim(), color: newColor }, {
      onSuccess: () => { setAdding(false); setNewLabel(""); setNewColor("#374151"); toast.success("Status created"); },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} style={{ height: '34px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />)}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>Candidate Statuses</h2>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>Manage statuses that appear as clickable dropdowns on every candidate.</p>

      <div className="space-y-px">
        {localOrder.map((status, idx) => (
          <StatusRow key={status.id} status={status} idx={idx} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} isDragging={dragIdx === idx}
            onUpdateColor={(color) => updateStatus.mutate({ id: status.id, color })} onUpdateLabel={(label) => updateStatus.mutate({ id: status.id, label })} onDelete={() => setDeleteTarget(status)} />
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-3 mt-2 px-2" style={{ height: '40px' }}>
          <GripVertical style={{ width: '14px', height: '14px', color: '#e9eaec', flexShrink: 0 }} />
          <ColorPalettePicker color={newColor} onChange={setNewColor} />
          <input autoFocus value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Status name" style={{ flex: 1, height: '32px', border: '1px solid #e2e3e6', borderRadius: '6px', padding: '0 10px', fontSize: '14px', color: '#1a1a1a' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button onClick={handleAdd} disabled={!newLabel.trim()} style={{ height: '28px', padding: '0 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: !newLabel.trim() ? 0.5 : 1 }}>Add</button>
          <button onClick={() => setAdding(false)} style={{ height: '28px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e2e3e6', fontSize: '13px', color: '#374151' }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 mt-3 w-full transition-colors hover:bg-[#f3f4f6] rounded-md"
          style={{ height: '40px', padding: '0 12px', fontSize: '13px', color: '#7c3aed', border: '1px dashed #d1d5db', borderRadius: '6px', justifyContent: 'center' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add a status
        </button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete status "{deleteTarget?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>Candidates with this status will need to be reassigned.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (!deleteTarget) return; deleteStatus.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); toast.success("Status deleted"); } }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusRow({ status, idx, onDragStart, onDragOver, onDragEnd, isDragging, onUpdateColor, onUpdateLabel, onDelete }: {
  status: CandidateStatus & { isDefault?: boolean }; idx: number; onDragStart: (i: number) => void; onDragOver: (e: React.DragEvent, i: number) => void; onDragEnd: () => void; isDragging: boolean;
  onUpdateColor: (c: string) => void; onUpdateLabel: (l: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(status.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(status.label); }, [status.label]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== status.label) onUpdateLabel(trimmed);
    else setDraft(status.label);
  }, [draft, status.label, onUpdateLabel]);

  return (
    <div draggable onDragStart={() => onDragStart(idx)} onDragOver={(e) => onDragOver(e, idx)} onDragEnd={onDragEnd}
      className="group flex items-center gap-3 px-2 rounded-[5px] transition-colors"
      style={{ height: '34px', opacity: isDragging ? 0.5 : 1, backgroundColor: isDragging ? '#f3f4f6' : 'transparent' }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = '#f7f8f9'; }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <GripVertical style={{ width: '14px', height: '14px', color: '#d1d5db', cursor: 'grab', flexShrink: 0 }} />
      <ColorPalettePicker color={status.color} onChange={onUpdateColor} />
      {editing ? (
        <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setEditing(false); setDraft(status.label); } }}
          style={{ flex: 1, height: '28px', border: '1px solid #e2e3e6', borderRadius: '6px', padding: '0 8px', fontSize: '13px', color: '#1a1a1a' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
        />
      ) : (
        <span className="flex-1 cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-[#f3f4f6]" style={{ fontSize: '13px', color: '#1a1a1a' }} onClick={() => setEditing(true)}>
          {status.label}
        </span>
      )}
      {(status as any).isDefault ? (
        <Tooltip><TooltipTrigger asChild><button className="p-1 cursor-not-allowed" style={{ opacity: 0.3 }} disabled><Trash2 style={{ width: '14px', height: '14px', color: '#9ca3af' }} /></button></TooltipTrigger><TooltipContent>Cannot delete default</TooltipContent></Tooltip>
      ) : (
        <button onClick={onDelete} className="p-1 opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}>
          <Trash2 style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}
