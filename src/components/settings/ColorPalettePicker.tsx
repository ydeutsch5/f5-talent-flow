import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";

const PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#dc2626", "#d97706", "#15803d", "#0891b2",
  "#1d4ed8", "#7c3aed", "#be185d", "#374151",
];

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPalettePicker({ color, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-4 h-4 rounded-full shrink-0 ring-1 ring-border cursor-pointer hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-4 gap-1.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${c === color ? "ring-2 ring-ring ring-offset-2" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
