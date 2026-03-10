import { useState } from "react";
import { MoreHorizontal, User, Edit, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import { TagPills } from "./TagPills";
import type { Candidate } from "@/hooks/useCandidates";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getCommColor, commLabel, COMM_OPTIONS } from "@/components/jobs/detail/matchUtils";
import { formatDistanceToNow } from "date-fns";

const SHIFT_LABELS: Record<string, string> = {
  REGULAR: "Regular",
  US_SHIFT: "US Shift",
  BOTH: "Both",
};
const SHIFT_OPTIONS = ["REGULAR", "US_SHIFT", "BOTH"] as const;

interface CandidateRowProps {
  candidate: Candidate;
  statuses: CandidateStatus[];
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (candidate: Candidate) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function CandidateRow({
  candidate, statuses, onUpdate, onDelete, onOpenDetail, selected, onSelect,
}: CandidateRowProps) {
  const [hovered, setHovered] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);

  const statusObj = statuses.find((s) => s.label === candidate.status);
  const statusColor = statusObj?.color || "#6b7280";
  const cc = getCommColor(candidate.communicationRating);

  return (
    <div
      className={`group grid items-center h-row border-b border-border px-3 cursor-pointer transition-colors duration-fast ${hovered ? "bg-row-hover" : ""} ${selected ? "bg-primary/5" : ""}`}
      style={{ gridTemplateColumns: "28px 1fr 110px 90px 80px minmax(120px,1fr) 60px 80px 32px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenDetail(candidate)}
    >
      {/* Checkbox */}
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => { e.stopPropagation(); onSelect(candidate.id); }}
          onClick={(e) => e.stopPropagation()}
          className={`h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer transition-opacity duration-fast ${hovered || selected ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Name + Title */}
      <div className="flex flex-col justify-center min-w-0 pr-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(candidate); }}
          className="text-sm font-semibold text-foreground truncate text-left hover:text-primary transition-colors duration-fast"
        >
          {candidate.name}
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <InlineEdit
            value={candidate.title || "—"}
            onSave={(v) => onUpdate(candidate.id, { title: v === "—" ? null : v })}
            className="text-xs text-muted-foreground truncate"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: `${statusColor}26`, color: statusColor }}
            >
              {candidate.status}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => { onUpdate(candidate.id, { status: s.label }); setStatusOpen(false); }}
                className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${s.label === candidate.status ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Communication */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover open={commOpen} onOpenChange={setCommOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer"
              style={{ backgroundColor: cc.bg, color: cc.text }}
            >
              {commLabel(candidate.communicationRating)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start" sideOffset={4}>
            {COMM_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { onUpdate(candidate.id, { communicationRating: opt }); setCommOpen(false); }}
                className={`flex items-center w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${candidate.communicationRating === opt ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                {commLabel(opt)}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Shift */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover open={shiftOpen} onOpenChange={setShiftOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground bg-muted border-0 outline-none cursor-pointer hover:bg-muted/80 transition-colors duration-fast">
              {SHIFT_LABELS[candidate.shiftAvailability] || candidate.shiftAvailability}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start" sideOffset={4}>
            {SHIFT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { onUpdate(candidate.id, { shiftAvailability: opt }); setShiftOpen(false); }}
                className={`flex items-center w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${candidate.shiftAvailability === opt ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                {SHIFT_LABELS[opt]}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Tags */}
      <div className="flex items-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <TagPills candidateId={candidate.id} tags={candidate.tags} maxVisible={3} />
      </div>

      {/* Jobs count */}
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded bg-muted text-xs text-muted-foreground px-1.5">
          {candidate._count.matches}
        </span>
      </div>

      {/* Updated */}
      <div className="flex items-center">
        <span className="text-xs text-muted-foreground truncate">
          {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-all duration-fast ${hovered ? "opacity-100" : "opacity-0"}`}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onOpenDetail(candidate)}>
              <User className="mr-2 h-3.5 w-3.5" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenDetail(candidate)}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(candidate.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
