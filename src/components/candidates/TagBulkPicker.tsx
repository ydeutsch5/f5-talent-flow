import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTags, useAddCandidateTag, useCreateTag } from "@/hooks/useTags";

const TAG_PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

interface TagBulkPickerProps {
  candidateIds: string[];
  onDone: () => void;
}

export function TagBulkPicker({ candidateIds, onDone }: TagBulkPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: allTags } = useTags();
  const addTag = useAddCandidateTag();
  const createTag = useCreateTag();

  const filtered = useMemo(() => {
    if (!allTags) return [];
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, search]);

  const showCreate = search.trim() && filtered.length === 0;

  const handleAdd = async (tagId: string) => {
    await Promise.all(candidateIds.map((cid) => addTag.mutateAsync({ candidateId: cid, tagId })));
    setOpen(false);
    setSearch("");
    onDone();
  };

  const handleCreate = async () => {
    const color = TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
    const newTag = await createTag.mutateAsync({ name: search.trim(), color });
    if (newTag?.id) await handleAdd(newTag.id);
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
      <PopoverTrigger asChild>
        <button className="h-7 px-2.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors duration-fast">
          Add Tag
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <div className="px-2 pt-2 pb-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or create…"
            className="w-full h-7 px-2 rounded border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
        </div>
        <div className="max-h-48 overflow-y-auto px-1 pb-1">
          {filtered.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleAdd(tag.id)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted/60 transition-colors duration-fast text-foreground"
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
          {showCreate && (
            <button onClick={handleCreate} className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm text-primary hover:bg-muted/60 transition-colors duration-fast">
              <Plus className="h-3.5 w-3.5" /> Create "{search.trim()}"
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
