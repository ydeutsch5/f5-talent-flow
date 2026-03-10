import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { JobStatus } from "@/hooks/useJobs";

interface StatusBadgeProps {
  currentStatus: string;
  statuses: JobStatus[];
  onChangeStatus: (newStatus: string) => void;
}

export function StatusBadge({ currentStatus, statuses, onChangeStatus }: StatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const status = statuses.find((s) => s.label === currentStatus);
  const color = status?.color || "#6b7280";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center rounded-full cursor-pointer transition-colors"
          style={{
            padding: '2px 8px',
            height: '20px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1,
            color: color,
            backgroundColor: `${color}20`,
            border: `1px solid ${color}35`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}30`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}20`; }}
        >
          {currentStatus}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1.5"
        align="start"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '220px',
          borderRadius: '8px',
          border: '1px solid #e2e3e6',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div className="px-2.5 pt-1.5 pb-1">
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 500 }}>
            CHANGE STATUS
          </span>
        </div>
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onChangeStatus(s.label);
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
            style={{ height: '30px' }}
          >
            <span
              className="shrink-0"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: s.color,
              }}
            />
            <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>
              {s.label}
            </span>
            {s.label === currentStatus && (
              <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />
            )}
          </button>
        ))}
        <div style={{ borderTop: '1px solid #e9eaec', margin: '4px 0' }} />
        <button
          onClick={() => { navigate('/settings'); setOpen(false); }}
          className="w-full text-left px-2.5 py-1.5 rounded-[5px] transition-colors hover:bg-[#f3f4f6] cursor-pointer"
          style={{ fontSize: '12px', color: '#7c3aed' }}
        >
          Manage Statuses
        </button>
      </PopoverContent>
    </Popover>
  );
}
