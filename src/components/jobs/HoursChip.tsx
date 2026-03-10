import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const HOURS_OPTIONS = [
  { value: "US_HOURS", label: "US Shift", bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  { value: "INDIA_SHIFT", label: "Regular", bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  { value: "GENERAL_SHIFT", label: "Both", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
] as const;

const LABELS: Record<string, typeof HOURS_OPTIONS[number]> = {};
HOURS_OPTIONS.forEach((o) => { LABELS[o.value] = o; });

interface HoursChipProps {
  value: string;
  onSave: (value: string) => void;
}

export function HoursChip({ value, onSave }: HoursChipProps) {
  const [open, setOpen] = useState(false);
  const opt = LABELS[value] || HOURS_OPTIONS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center rounded-full cursor-pointer transition-colors"
          style={{
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: opt.bg,
            color: opt.color,
            border: `1px solid ${opt.border}`,
          }}
        >
          {opt.label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[180px] p-1.5"
        align="start"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: '8px',
          border: '1px solid #e2e3e6',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {HOURS_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => {
              if (o.value !== value) onSave(o.value);
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]"
            style={{ height: '30px', fontSize: '13px', color: '#1a1a1a' }}
          >
            <span
              className="inline-flex items-center rounded-full shrink-0"
              style={{
                padding: '1px 6px',
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: o.bg,
                color: o.color,
                border: `1px solid ${o.border}`,
              }}
            >
              {o.label}
            </span>
            {o.value === value && (
              <span style={{ color: '#7c3aed', fontSize: '12px', marginLeft: 'auto' }}>✓</span>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
