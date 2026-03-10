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
import { Button } from "@/components/ui/button";
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
    createTag.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setAdding(false);
          setNewName("");
          setNewColor("#8b5cf6");
          toast.success("Tag created");
        },
      }
    );
  };

  const candidateCount = (deleteTarget as any)?._count?.candidates ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded" />)}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Tags</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Manage tags that can be applied to candidates across the app.
      </p>

      <div className="space-y-0.5">
        {tags.map((tag: any) => (
          <TagRow
            key={tag.id}
            tag={tag}
            onUpdateColor={(color) => updateTag.mutate({ id: tag.id, color })}
            onUpdateName={(name) => updateTag.mutate({ id: tag.id, name })}
            onDelete={() => setDeleteTarget(tag)}
          />
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 mt-2 px-2 h-10">
          <ColorPalettePicker color={newColor} onChange={setNewColor} />
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Tag name"
            className="flex-1 bg-background border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Tag
        </Button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {candidateCount > 0
                ? `This tag is used by ${candidateCount} candidate(s). Remove the tag from all candidates first.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={candidateCount > 0}
              onClick={() => {
                if (!deleteTarget) return;
                deleteTag.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    setDeleteTarget(null);
                    toast({ title: "Tag deleted" });
                  },
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TagRow({
  tag,
  onUpdateColor,
  onUpdateName,
  onDelete,
}: {
  tag: Tag & { _count?: { candidates: number } };
  onUpdateColor: (c: string) => void;
  onUpdateName: (n: string) => void;
  onDelete: () => void;
}) {
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
    <div className="group flex items-center gap-3 h-10 px-2 rounded hover:bg-row-hover transition-colors">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />

      <ColorPalettePicker color={tag.color} onChange={onUpdateColor} />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setEditing(false); setDraft(tag.name); }
          }}
          className="flex-1 bg-background border border-input rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <span
          className="flex-1 text-sm text-foreground cursor-pointer hover:bg-muted/60 rounded px-1 -mx-1 transition-colors"
          onClick={() => setEditing(true)}
        >
          {tag.name}
        </span>
      )}

      {/* Preview pill */}
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium"
        style={{
          backgroundColor: `${tag.color}33`,
          color: tag.color,
        }}
      >
        {tag.name}
      </span>

      {count > 0 && (
        <span className="text-xs text-muted-foreground">{count} candidates</span>
      )}

      {count > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1 opacity-30 cursor-not-allowed" disabled>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Remove tag from all candidates first</TooltipContent>
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
