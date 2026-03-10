import { useState } from "react";
import { MoreHorizontal, User, Edit, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InlineEdit } from "@/components/jobs/InlineEdit";
import { TagPills } from "./TagPills";
import type { Candidate } from "@/hooks/useCandidates";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getCommColor, commLabel, COMM_OPTIONS } from "@/components/jobs/detail/matchUtils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const SHIFT_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  REGULAR: { label: "Regular", bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  US_SHIFT: { label: "US Shift", bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  BOTH: { label: "Both", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
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
  const navigate = useNavigate();

  const statusObj = statuses.find((s) => s.label === candidate.status);
  const statusColor = statusObj?.color || "#6b7280";
  const cc = getCommColor(candidate.communicationRating);
  const shift = SHIFT_LABELS[candidate.shiftAvailability] || SHIFT_LABELS.REGULAR;

  return (
    <div
      className="group grid items-center cursor-pointer transition-colors"
      style={{
        gridTemplateColumns: "28px 1fr 110px 90px 80px minmax(120px,1fr) 60px 80px 32px",
        height: '34px',
        borderBottom: '1px solid #f3f4f6',
        padding: '0 8px',
        backgroundColor: hovered ? '#f7f8f9' : selected ? '#7c3aed08' : '#ffffff',
      }}
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
          className="cursor-pointer transition-opacity"
          style={{
            width: '16px', height: '16px', borderRadius: '3px',
            border: '1.5px solid #d1d5db', opacity: hovered || selected ? 1 : 0, accentColor: '#7c3aed',
          }}
        />
      </div>

      {/* Name + Title */}
      <div className="flex flex-col justify-center min-w-0 pr-2" style={{ paddingLeft: '12px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(candidate); }}
          className="text-left truncate transition-colors"
          style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
        >
          {candidate.name}
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <InlineEdit
            value={candidate.title || "—"}
            onSave={(v) => onUpdate(candidate.id, { title: v === "—" ? null : v })}
            className="text-[11px]"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded-full cursor-pointer transition-colors"
              style={{
                padding: '2px 8px', height: '20px', fontSize: '11px', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: statusColor, backgroundColor: `${statusColor}20`, border: `1px solid ${statusColor}35`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${statusColor}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${statusColor}20`; }}
            >
              {candidate.status}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-1.5"
            align="start"
            sideOffset={4}
            style={{ width: '220px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div className="px-2.5 pt-1.5 pb-1">
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 500 }}>CHANGE STATUS</span>
            </div>
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => { onUpdate(candidate.id, { status: s.label }); setStatusOpen(false); }}
                className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
                style={{ height: '30px' }}
              >
                <span className="shrink-0" style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
                <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{s.label}</span>
                {s.label === candidate.status && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />}
              </button>
            ))}
            <div style={{ borderTop: '1px solid #e9eaec', margin: '4px 0' }} />
            <button onClick={() => { navigate('/settings'); setStatusOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ fontSize: '12px', color: '#7c3aed' }}>
              Manage Statuses
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Communication */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover open={commOpen} onOpenChange={setCommOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded-full cursor-pointer"
              style={{
                padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                backgroundColor: cc.bg, color: cc.text,
                border: `1px solid ${cc.bg === '#dcfce7' ? '#bbf7d0' : cc.bg === '#dbeafe' ? '#bfdbfe' : cc.bg === '#fef3c7' ? '#fde68a' : '#fecaca'}`,
              }}
            >
              {commLabel(candidate.communicationRating)}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-1.5"
            align="start"
            sideOffset={4}
            style={{ width: '180px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {COMM_OPTIONS.map((opt) => {
              const oc = getCommColor(opt);
              return (
                <button
                  key={opt}
                  onClick={() => { onUpdate(candidate.id, { communicationRating: opt }); setCommOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
                  style={{ height: '30px' }}
                >
                  <span className="inline-flex items-center rounded-full shrink-0" style={{ padding: '1px 6px', fontSize: '10px', fontWeight: 600, backgroundColor: oc.bg, color: oc.text }}>
                    {commLabel(opt)}
                  </span>
                  {candidate.communicationRating === opt && <Check className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#7c3aed' }} />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      {/* Shift */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover open={shiftOpen} onOpenChange={setShiftOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded-full cursor-pointer"
              style={{
                padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                backgroundColor: shift.bg, color: shift.color, border: `1px solid ${shift.border}`,
              }}
            >
              {shift.label}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-1.5"
            align="start"
            sideOffset={4}
            style={{ width: '180px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {SHIFT_OPTIONS.map((opt) => {
              const sl = SHIFT_LABELS[opt];
              return (
                <button
                  key={opt}
                  onClick={() => { onUpdate(candidate.id, { shiftAvailability: opt }); setShiftOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
                  style={{ height: '30px' }}
                >
                  <span className="inline-flex items-center rounded-full shrink-0" style={{ padding: '1px 6px', fontSize: '10px', fontWeight: 600, backgroundColor: sl.bg, color: sl.color, border: `1px solid ${sl.border}` }}>
                    {sl.label}
                  </span>
                  {candidate.shiftAvailability === opt && <Check className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#7c3aed' }} />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      {/* Tags */}
      <div className="flex items-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <TagPills candidateId={candidate.id} tags={candidate.tags} maxVisible={3} />
      </div>

      {/* Jobs count */}
      <div className="flex items-center justify-center">
        <span style={{ fontSize: '13px', color: '#374151' }}>{candidate._count.matches}</span>
      </div>

      {/* Updated */}
      <div className="flex items-center">
        <span className="truncate" style={{ fontSize: '11px', color: '#9ca3af' }}>
          {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-7 w-7 rounded-md flex items-center justify-center transition-all hover:bg-[#f3f4f6]"
              style={{ color: '#6b7280', opacity: hovered ? 1 : 0 }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onOpenDetail(candidate)}><User className="mr-2 h-3.5 w-3.5" /> View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenDetail(candidate)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(candidate.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
