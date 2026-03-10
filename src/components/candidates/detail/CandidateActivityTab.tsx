import { useState } from "react";
import { ArrowLeftRight, MessageSquare, Tag, Star, Send as SendIcon } from "lucide-react";
import { useCandidateActivity, usePostCandidateActivity, type CandidateActivityEntry } from "@/hooks/useCandidateActivity";
import { formatDistanceToNow, format } from "date-fns";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const ICON_MAP: Record<string, { icon: typeof ArrowLeftRight; color: string }> = {
  status_change: { icon: ArrowLeftRight, color: "#1d4ed8" },
  comment: { icon: MessageSquare, color: "#6b7280" },
  tag_added: { icon: Tag, color: "#0d9488" },
  resume_evaluated: { icon: Star, color: "#7c3aed" },
  submission: { icon: SendIcon, color: "#c2410c" },
};

interface CandidateActivityTabProps {
  candidateId: string;
}

export function CandidateActivityTab({ candidateId }: CandidateActivityTabProps) {
  const { data: entries, isLoading } = useCandidateActivity(candidateId);
  const post = usePostCandidateActivity();
  const [comment, setComment] = useState("");

  const handlePost = () => {
    const text = comment.trim();
    if (!text) return;
    post.mutate({ candidateId, content: text });
    setComment("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 20px' }}>
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} />
                <div className="flex-1 space-y-1.5">
                  <div style={{ height: '10px', width: '75%', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                  <div style={{ height: '8px', width: '48px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {entries?.map((entry) => {
          const config = ICON_MAP[entry.type] || ICON_MAP.comment;
          const Icon = config.icon;
          return (
            <div key={entry.id} className="flex gap-2.5" style={{ padding: '10px 0' }}>
              <div className="shrink-0 flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: `${config.color}12` }}>
                <Icon style={{ width: '13px', height: '13px', color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>{entry.content}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="cursor-default" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>{format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm:ss a")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
        {!isLoading && (!entries || entries.length === 0) && (
          <div className="flex flex-col items-center justify-center" style={{ padding: '40px 0' }}>
            <MessageSquare style={{ width: '28px', height: '28px', color: '#d1d5db' }} />
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>No activity yet</p>
          </div>
        )}
      </div>

      <div className="flex gap-2" style={{ padding: '12px 20px', borderTop: '1px solid #e9eaec' }}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
          placeholder="Add a comment…"
          rows={1}
          style={{ flex: 1, resize: 'none', borderRadius: '6px', border: '1px solid #e2e3e6', padding: '6px 10px', fontSize: '13px', color: '#1a1a1a' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <button
          onClick={handlePost}
          disabled={!comment.trim() || post.isPending}
          className="shrink-0 self-end transition-colors"
          style={{ height: '32px', padding: '0 14px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: !comment.trim() ? 0.5 : 1 }}
          onMouseEnter={(e) => { if (comment.trim()) e.currentTarget.style.backgroundColor = '#6d28d9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
        >
          Post
        </button>
      </div>
    </div>
  );
}
