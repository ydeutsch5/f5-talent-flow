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
  const [saving, setSaving] = useState<"saving" | "saved" | null>(null);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (saving === "saved") {
      const t = setTimeout(() => setSaving(null), 1500);
      return () => clearTimeout(t);
    }
  }, [saving]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      setSaving("saving");
      onSave(trimmed);
      // Simulate brief save state
      setTimeout(() => setSaving("saved"), 200);
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
      <span className="relative inline-flex items-center">
        <span
          className={`cursor-text rounded px-0.5 -mx-0.5 transition-colors hover:bg-[#f7f8f9] ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          style={{ borderBottom: '1px dotted transparent' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = '#d1d5db'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; }}
          title="Click to edit"
        >
          {value || "—"}
        </span>
        {saving && (
          <span className="ml-1.5" style={{ fontSize: '10px', color: saving === 'saved' ? '#16a34a' : '#9ca3af' }}>
            {saving === 'saving' ? 'Saving...' : 'Saved ✓'}
          </span>
        )}
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
    className: `bg-white rounded px-1.5 py-0.5 text-[13px] -mx-0.5 ${inputClassName}`,
    style: {
      color: '#1a1a1a',
      border: 'none',
      boxShadow: '0 0 0 2px #7c3aed40',
      outline: 'none',
    },
  };

  if (as === "textarea") {
    return <textarea {...sharedProps} rows={2} />;
  }

  return <input type="text" {...sharedProps} />;
}
