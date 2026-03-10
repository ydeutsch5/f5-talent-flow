import { useState } from "react";
import { MoreHorizontal, User } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Match } from "@/hooks/useMatches";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";
import { getMatchColor, getCommColor, commLabel, COMM_OPTIONS } from "./matchUtils";

interface CandidateRowProps {
  match: Match;
  statuses: CandidateStatus[];
  onChangeStatus: (matchId: string, newStatus: string) => void;
  onChangeComm: (candidateId: string, rating: string) => void;
  onViewProfile: (candidateId: string) => void;
  onRemove: (matchId: string) => void;
}

export function CandidateRow({
  match, statuses, onChangeStatus, onChangeComm, onViewProfile, onRemove,
}: CandidateRowProps) {
  const [hovered, setHovered] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const mc = getMatchColor(match.matchPercentage);
  const cc = getCommColor(match.candidate.communicationRating);
  const statusObj = statuses.find((s) => s.label === match.status);
  const statusColor = statusObj?.color || "#6b7280";

  return (
    <div
      className={`group grid items-center h-row border-b border-border px-3 transition-colors duration-fast ${hovered ? "bg-row-hover" : ""}`}
      style={{ gridTemplateColumns: "1fr 110px 70px 70px 90px 80px 32px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name */}
      <div className="flex flex-col justify-center min-w-0 pr-2">
        <button
          onClick={() => onViewProfile(match.candidateId)}
          className="text-sm font-semibold text-foreground truncate text-left hover:text-primary transition-colors duration-fast"
        >
          {match.candidate.name}
        </button>
        <span className="text-xs text-muted-foreground truncate">{match.candidate.title || "—"}</span>
      </div>

      {/* Status badge */}
      <div className="flex items-center">
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 border-0 outline-none cursor-pointer"
              style={{ backgroundColor: `${statusColor}26`, color: statusColor }}
            >
              {match.status}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => { onChangeStatus(match.id, s.label); setStatusOpen(false); }}
                className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${s.label === match.status ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Match % */}
      <div className="flex items-center">
        <span
          className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: mc.bg, color: mc.text }}
        >
          {match.matchPercentage != null ? `${match.matchPercentage}%` : "—"}
        </span>
      </div>

      {/* Band */}
      <div className="flex items-center">
        <span className="text-xs text-muted-foreground">{mc.label}</span>
      </div>

      {/* Communication */}
      <div className="flex items-center">
        <Popover open={commOpen} onOpenChange={setCommOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium cursor-pointer border-0 outline-none"
              style={{ backgroundColor: cc.bg, color: cc.text }}
            >
              {commLabel(match.candidate.communicationRating)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start" sideOffset={4}>
            {COMM_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChangeComm(match.candidate.id, opt); setCommOpen(false); }}
                className={`flex items-center w-full px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-fast text-foreground ${match.candidate.communicationRating === opt ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                {commLabel(opt)}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Shift */}
      <div className="flex items-center">
        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground bg-muted">
          {match.candidate.shiftAvailability || "—"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-all duration-fast ${hovered ? "opacity-100" : "opacity-0"}`}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewProfile(match.candidateId)}>
              <User className="mr-2 h-3.5 w-3.5" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRemove(match.id)} className="text-destructive focus:text-destructive">
              Remove from Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
