import { useState, useRef, useEffect, useCallback } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  as?: "input" | "textarea";
}

export function InlineEdit({
  value,
  onSave,
  className = "",
  inputClassName = "",
  as = "input",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  }, [draft, value, onSave]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && as === "input") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-muted/60 rounded px-1 -mx-1 transition-colors duration-fast ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title="Click to edit"
      >
        {value || "—"}
      </span>
    );
  }

  const sharedProps = {
    ref: ref as any,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: save,
    onKeyDown: handleKeyDown,
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    className: `bg-background border border-input rounded px-1.5 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring -mx-1 ${inputClassName}`,
  };

  if (as === "textarea") {
    return <textarea {...sharedProps} rows={2} />;
  }

  return <input type="text" {...sharedProps} />;
}
