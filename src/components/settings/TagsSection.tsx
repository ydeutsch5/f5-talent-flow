import { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { useTags, useCreateTag, type Tag } from "@/hooks/useTags";
import { useUpdateTag, useDeleteTag } from "@/hooks/useUpdateTag";
import { ColorPalettePicker } from "./ColorPalettePicker";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";

export function TagsSection() {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6");
  const [deleteTarget, setDeleteTarget] = useState<(Tag & { _count?: { candidates: number } }) | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    createTag.mutate({ name: newName.trim(), color: newColor }, {
      onSuccess: () => { setAdding(false); setNewName(""); setNewColor("#8b5cf6"); toast.success("Tag created"); },
    });
  };

  const candidateCount = (deleteTarget as any)?._count?.candidates ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} style={{ height: '34px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />)}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>Tags</h2>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>Manage tags that can be applied to candidates.</p>

      <div className="space-y-px">
        {tags.map((tag: any) => (
          <TagRow key={tag.id} tag={tag} onUpdateColor={(color) => updateTag.mutate({ id: tag.id, color })} onUpdateName={(name) => updateTag.mutate({ id: tag.id, name })} onDelete={() => setDeleteTarget(tag)} />
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-3 mt-2 px-2" style={{ height: '40px' }}>
          <GripVertical style={{ width: '14px', height: '14px', color: '#e9eaec', flexShrink: 0 }} />
          <ColorPalettePicker color={newColor} onChange={setNewColor} size={16} />
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Tag name" style={{ flex: 1, height: '32px', border: '1px solid #e2e3e6', borderRadius: '6px', padding: '0 10px', fontSize: '14px', color: '#1a1a1a' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button onClick={handleAdd} disabled={!newName.trim()} style={{ height: '28px', padding: '0 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: !newName.trim() ? 0.5 : 1 }}>Add</button>
          <button onClick={() => setAdding(false)} style={{ height: '28px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e2e3e6', fontSize: '13px', color: '#374151' }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 mt-3 w-full transition-colors hover:bg-[#f3f4f6] rounded-md"
          style={{ height: '40px', padding: '0 12px', fontSize: '13px', color: '#7c3aed', border: '1px dashed #d1d5db', borderRadius: '6px', justifyContent: 'center' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add a tag
        </button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>{candidateCount > 0 ? `This tag is used by ${candidateCount} candidate(s).` : "This action cannot be undone."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={candidateCount > 0} onClick={() => { if (!deleteTarget) return; deleteTag.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); toast.success("Tag deleted"); } }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TagRow({ tag, onUpdateColor, onUpdateName, onDelete }: { tag: Tag & { _count?: { candidates: number } }; onUpdateColor: (c: string) => void; onUpdateName: (n: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tag.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const count = (tag as any)._count?.candidates ?? 0;

  useEffect(() => { setDraft(tag.name); }, [tag.name]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== tag.name) onUpdateName(trimmed);
    else setDraft(tag.name);
  }, [draft, tag.name, onUpdateName]);

  return (
    <div className="group flex items-center gap-3 px-2 rounded-[5px] transition-colors"
      style={{ height: '34px' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7f8f9'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <GripVertical style={{ width: '14px', height: '14px', color: '#d1d5db', cursor: 'grab', flexShrink: 0 }} />
      <ColorPalettePicker color={tag.color} onChange={onUpdateColor} size={16} />
      {editing ? (
        <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setEditing(false); setDraft(tag.name); } }}
          style={{ flex: 1, height: '32px', border: '1px solid #e2e3e6', borderRadius: '6px', padding: '0 10px', fontSize: '14px', color: '#1a1a1a' }}
        />
      ) : (
        <span className="flex-1 cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-[#f3f4f6]" style={{ fontSize: '13px', color: '#1a1a1a' }} onClick={() => setEditing(true)}>
          {tag.name}
        </span>
      )}
      {/* Preview pill */}
      <span className="rounded-full" style={{ padding: '2px 7px', fontSize: '11px', fontWeight: 500, backgroundColor: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}40` }}>
        {tag.name}
      </span>
      {count > 0 && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{count} candidates</span>}
      {count > 0 ? (
        <Tooltip><TooltipTrigger asChild><button className="p-1 cursor-not-allowed" style={{ opacity: 0.3 }} disabled><Trash2 style={{ width: '14px', height: '14px', color: '#9ca3af' }} /></button></TooltipTrigger><TooltipContent>Remove from all candidates first</TooltipContent></Tooltip>
      ) : (
        <button onClick={onDelete} className="p-1 opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}>
          <Trash2 style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}
