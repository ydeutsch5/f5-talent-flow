import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const HOURS_OPTIONS = [
  { value: "US_HOURS", label: "US Hours" },
  { value: "INDIA_SHIFT", label: "India Shift" },
  { value: "GENERAL_SHIFT", label: "General" },
] as const;

interface HoursChipProps {
  value: string;
  onSave: (value: string) => void;
}

const LABELS: Record<string, string> = {
  US_HOURS: "US Hours",
  INDIA_SHIFT: "India Shift",
  GENERAL_SHIFT: "General",
};

export function HoursChip({ value, onSave }: HoursChipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center rounded px-2 py-0.5 text-xs text-muted-foreground bg-muted hover:bg-muted/80 transition-colors duration-fast cursor-pointer border-0 outline-none"
        >
          {LABELS[value] || value}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-36 p-1"
        align="start"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
      >
        {HOURS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              if (opt.value !== value) onSave(opt.value);
              setOpen(false);
            }}
            className={`
              flex items-center w-full px-2.5 py-1.5 text-sm rounded-sm
              transition-colors duration-fast text-foreground
              ${opt.value === value ? "bg-muted font-medium" : "hover:bg-muted/60"}
            `}
          >
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
