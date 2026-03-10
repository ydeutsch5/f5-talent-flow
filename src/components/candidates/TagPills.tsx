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
    if (appliedIds.has(tagId)) removeTag.mutate({ candidateId, tagId });
    else addTag.mutate({ candidateId, tagId });
  };

  const handleCreate = async () => {
    const color = TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
    const newTag = await createTag.mutateAsync({ name: search.trim(), color });
    if (newTag?.id) addTag.mutate({ candidateId, tagId: newTag.id });
    setSearch("");
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleTags.map((tag) => (
        <span
          key={tag.id}
          className="group/tag inline-flex items-center rounded-full cursor-default"
          style={{
            padding: '2px 7px',
            fontSize: '11px',
            fontWeight: 500,
            backgroundColor: `${tag.color}22`,
            color: tag.color,
            border: `1px solid ${tag.color}40`,
            gap: '3px',
          }}
        >
          {tag.name}
          <button
            onClick={(e) => { e.stopPropagation(); removeTag.mutate({ candidateId, tagId: tag.id }); }}
            className="opacity-0 group-hover/tag:opacity-100 transition-opacity"
            style={{ marginLeft: '2px', color: tag.color }}
          >
            <X style={{ width: '10px', height: '10px' }} />
          </button>
        </span>
      ))}

      {extraCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center rounded-full transition-colors hover:bg-[#f3f4f6]"
              style={{ padding: '2px 6px', fontSize: '11px', color: '#9ca3af', backgroundColor: '#f3f4f6' }}
            >
              +{extraCount}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap gap-1">
              {tags.slice(maxVisible).map((tag) => (
                <span
                  key={tag.id}
                  className="group/tag inline-flex items-center rounded-full"
                  style={{ padding: '2px 7px', fontSize: '11px', fontWeight: 500, backgroundColor: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}40`, gap: '3px' }}
                >
                  {tag.name}
                  <button onClick={() => removeTag.mutate({ candidateId, tagId: tag.id })} className="opacity-0 group-hover/tag:opacity-100 transition-opacity" style={{ color: tag.color }}>
                    <X style={{ width: '10px', height: '10px' }} />
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
            className="inline-flex items-center gap-1 rounded-full transition-colors"
            style={{
              padding: '2px 7px',
              fontSize: '11px',
              color: '#9ca3af',
              border: '1px dashed #d1d5db',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#9ca3af'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >
            <Plus style={{ width: '10px', height: '10px' }} /> Tag
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '240px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {/* Search */}
          <div style={{ borderBottom: '1px solid #e9eaec' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tags..."
              style={{ width: '100%', height: '32px', padding: '0 10px', fontSize: '13px', border: 'none', outline: 'none', background: 'transparent', color: '#1a1a1a' }}
              autoFocus
            />
          </div>

          {/* Tag list */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.map((tag) => {
              const applied = appliedIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className="flex items-center gap-2 w-full px-2.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
                  style={{ height: '28px', margin: '1px 4px', width: 'calc(100% - 8px)' }}
                >
                  <span className="inline-flex items-center rounded-full shrink-0" style={{ padding: '1px 6px', fontSize: '10px', fontWeight: 500, backgroundColor: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}40` }}>
                    {tag.name}
                  </span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', color: '#1a1a1a' }}>{tag.name}</span>
                  {applied && <span style={{ color: '#7c3aed', fontSize: '12px' }}>✓</span>}
                </button>
              );
            })}

            {showCreate && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 w-full px-2.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
                style={{ height: '28px', margin: '1px 4px', width: 'calc(100% - 8px)' }}
              >
                <Plus style={{ width: '14px', height: '14px', color: '#7c3aed' }} />
                <span style={{ fontSize: '13px', color: '#7c3aed' }}>Create "{search.trim()}"</span>
              </button>
            )}

            {!showCreate && filtered.length === 0 && (
              <p className="text-center" style={{ fontSize: '11px', color: '#9ca3af', padding: '12px' }}>No tags found</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
