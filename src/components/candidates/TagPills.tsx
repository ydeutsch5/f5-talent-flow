import { useState, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTags, useAddCandidateTag, useRemoveCandidateTag, useCreateTag } from "@/hooks/useTags";
import type { CandidateTag } from "@/hooks/useCandidates";

const TAG_PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

interface TagPillsProps {
  candidateId: string;
  tags: CandidateTag[];
  maxVisible?: number;
}

export function TagPills({ candidateId, tags, maxVisible = 3 }: TagPillsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: allTags } = useTags();
  const addTag = useAddCandidateTag();
  const removeTag = useRemoveCandidateTag();
  const createTag = useCreateTag();

  const visibleTags = tags.slice(0, maxVisible);
  const extraCount = Math.max(0, tags.length - maxVisible);
  const appliedIds = new Set(tags.map((t) => t.id));

  const filtered = useMemo(() => {
    if (!allTags) return [];
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, search]);

  const showCreate = search.trim() && filtered.length === 0;

  const handleToggleTag = (tagId: string) => {
    if (appliedIds.has(tagId)) {
      removeTag.mutate({ candidateId, tagId });
    } else {
      addTag.mutate({ candidateId, tagId });
    }
  };

  const handleCreate = async () => {
    const color = TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
    const newTag = await createTag.mutateAsync({ name: search.trim(), color });
    if (newTag?.id) {
      addTag.mutate({ candidateId, tagId: newTag.id });
    }
    setSearch("");
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleTags.map((tag) => (
        <span
          key={tag.id}
          className="group/tag inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium cursor-default"
          style={{
            backgroundColor: `${tag.color}33`,
            color: tag.color,
          }}
        >
          {tag.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeTag.mutate({ candidateId, tagId: tag.id });
            }}
            className="opacity-0 group-hover/tag:opacity-100 transition-opacity duration-fast ml-0.5 hover:opacity-80"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {extraCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs text-muted-foreground bg-muted hover:bg-muted/80 transition-colors duration-fast"
            >
              +{extraCount} more
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap gap-1">
              {tags.slice(maxVisible).map((tag) => (
                <span
                  key={tag.id}
                  className="group/tag inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}33`, color: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => removeTag.mutate({ candidateId, tagId: tag.id })}
                    className="opacity-0 group-hover/tag:opacity-100 transition-opacity duration-fast ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Add tag button */}
      <Popover open={pickerOpen} onOpenChange={(v) => { setPickerOpen(v); if (!v) setSearch(""); }}>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs text-muted-foreground border border-dashed border-border hover:border-muted-foreground hover:text-foreground transition-colors duration-fast"
          >
            <Plus className="h-3 w-3" /> Tag
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" align="start" sideOffset={4} onClick={(e) => e.stopPropagation()}>
          {/* Search */}
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

          {/* Tag list */}
          <div className="max-h-48 overflow-y-auto px-1 pb-1">
            {filtered.map((tag) => {
              const applied = appliedIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${applied ? "bg-muted" : "hover:bg-muted/60"}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1 text-left truncate">{tag.name}</span>
                  {applied && <span className="text-xs text-primary">✓</span>}
                </button>
              );
            })}

            {showCreate && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm text-primary hover:bg-muted/60 transition-colors duration-fast"
              >
                <Plus className="h-3.5 w-3.5" />
                Create "{search.trim()}"
              </button>
            )}

            {!showCreate && filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">No tags found</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
