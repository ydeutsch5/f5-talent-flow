import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { JobStatus } from "@/hooks/useJobs";

interface StatusBadgeProps {
  currentStatus: string;
  statuses: JobStatus[];
  onChangeStatus: (newStatus: string) => void;
}

export function StatusBadge({ currentStatus, statuses, onChangeStatus }: StatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const status = statuses.find((s) => s.label === currentStatus);
  const color = status?.color || "#6b7280";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity duration-fast hover:opacity-80 cursor-pointer border-0 outline-none"
          style={{
            backgroundColor: `${color}26`,
            color: color,
          }}
        >
          {currentStatus}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-44 p-1"
        align="start"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
      >
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onChangeStatus(s.label);
              setOpen(false);
            }}
            className={`
              flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-sm
              transition-colors duration-fast
              ${s.label === currentStatus ? "bg-muted font-medium" : "hover:bg-muted/60"}
              text-foreground
            `}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
