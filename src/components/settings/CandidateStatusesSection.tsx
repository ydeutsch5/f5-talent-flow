import { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { useCandidateStatuses, type CandidateStatus } from "@/hooks/useCandidateStatuses";
import {
  useCreateCandidateStatus,
  useUpdateCandidateStatus,
  useDeleteCandidateStatus,
  useReorderCandidateStatuses,
} from "@/hooks/useUpdateCandidateStatus";
import { ColorPalettePicker } from "./ColorPalettePicker";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [localOrder, setLocalOrder] = useState<CandidateStatus[]>([]);

  useEffect(() => {
    setLocalOrder(statuses);
  }, [statuses]);

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
  const handleDragEnd = () => {
    setDragIdx(null);
    const ids = localOrder.map((s) => s.id);
    reorder.mutate(ids);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    createStatus.mutate(
      { label: newLabel.trim(), color: newColor },
      {
        onSuccess: () => {
          setAdding(false);
          setNewLabel("");
          setNewColor("#374151");
          toast({ title: "Status created" });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteStatus.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast({ title: "Status deleted" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Candidate Statuses</h2>
      <p className="text-sm text-muted-foreground mb-4">
        These statuses appear as clickable dropdowns on every candidate across the app. Changes take effect immediately.
      </p>

      <div className="space-y-0.5">
        {localOrder.map((status, idx) => (
          <StatusRow
            key={status.id}
            status={status}
            idx={idx}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={dragIdx === idx}
            onUpdateColor={(color) => updateStatus.mutate({ id: status.id, color })}
            onUpdateLabel={(label) => updateStatus.mutate({ id: status.id, label })}
            onDelete={() => setDeleteTarget(status)}
          />
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 mt-2 px-2 h-10">
          <ColorPalettePicker color={newColor} onChange={setNewColor} />
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Status name"
            className="flex-1 bg-background border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newLabel.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Status
        </Button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete status "{deleteTarget?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Candidates with this status will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---- Individual status row ---- */

function StatusRow({
  status,
  idx,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  onUpdateColor,
  onUpdateLabel,
  onDelete,
}: {
  status: CandidateStatus & { isDefault?: boolean };
  idx: number;
  onDragStart: (idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onUpdateColor: (c: string) => void;
  onUpdateLabel: (l: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(status.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(status.label);
  }, [status.label]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== status.label) onUpdateLabel(trimmed);
    else setDraft(status.label);
  }, [draft, status.label, onUpdateLabel]);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(idx)}
      onDragOver={(e) => onDragOver(e, idx)}
      onDragEnd={onDragEnd}
      className={`group flex items-center gap-3 h-10 px-2 rounded transition-colors ${isDragging ? "opacity-50 bg-muted" : "hover:bg-row-hover"}`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />

      <ColorPalettePicker color={status.color} onChange={onUpdateColor} />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setEditing(false); setDraft(status.label); }
          }}
          className="flex-1 bg-background border border-input rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <span
          className="flex-1 text-sm text-foreground cursor-pointer hover:bg-muted/60 rounded px-1 -mx-1 transition-colors"
          onClick={() => setEditing(true)}
        >
          {status.label}
        </span>
      )}

      {(status as any).isDefault && (
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Default</span>
      )}

      {(status as any).isDefault ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1 opacity-30 cursor-not-allowed" disabled>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Cannot delete the default status</TooltipContent>
        </Tooltip>
      ) : (
        <button
          onClick={onDelete}
          className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
