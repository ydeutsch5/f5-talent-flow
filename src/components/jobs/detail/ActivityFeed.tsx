import { useState, useRef } from "react";
import { ArrowLeftRight, MessageSquare, UserPlus, Star, Send as SendIcon } from "lucide-react";
import { useJobActivity, usePostActivity, type ActivityEntry } from "@/hooks/useJobActivity";
import { formatDistanceToNow, format } from "date-fns";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const ICON_MAP: Record<string, { icon: typeof ArrowLeftRight; color: string }> = {
  status_change: { icon: ArrowLeftRight, color: "#1d4ed8" },
  comment: { icon: MessageSquare, color: "#6b7280" },
  candidate_added: { icon: UserPlus, color: "#15803d" },
  evaluation: { icon: Star, color: "#7c3aed" },
  submission: { icon: SendIcon, color: "#c2410c" },
};

function CondensedItem({ entry }: { entry: ActivityEntry }) {
  const config = ICON_MAP[entry.type] || ICON_MAP.comment;
  const Icon = config.icon;
  const truncated = entry.content.length > 45 ? entry.content.slice(0, 45) + "…" : entry.content;

  return (
    <div className="flex items-center gap-2" style={{ padding: '4px 0' }}>
      <Icon style={{ width: '12px', height: '12px', color: config.color, flexShrink: 0 }} />
      <span className="flex-1 truncate" style={{ fontSize: '12px', color: '#374151' }}>{truncated}</span>
      <span className="shrink-0" style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
    </div>
  );
}

function ExpandedItem({ entry }: { entry: ActivityEntry }) {
  const config = ICON_MAP[entry.type] || ICON_MAP.comment;
  const Icon = config.icon;

  return (
    <div className="flex gap-2.5" style={{ padding: '8px 0' }}>
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{entry.content}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="cursor-default" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm:ss a")}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  jobId: string;
  showCommentBox?: boolean;
  condensed?: boolean;
  expanded?: boolean;
}

export function ActivityFeed({ jobId, showCommentBox = true, condensed = false, expanded = false }: ActivityFeedProps) {
  const { data: entries, isLoading } = useJobActivity(jobId);
  const postActivity = usePostActivity();
  const [comment, setComment] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const handlePost = () => {
    const text = comment.trim();
    if (!text) return;
    postActivity.mutate({ jobId, content: text });
    setComment("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div style={{ width: condensed ? '12px' : '24px', height: condensed ? '12px' : '24px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} />
                <div className="flex-1 space-y-1">
                  <div style={{ height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px', width: '75%' }} />
                  <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '3px', width: '40px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {entries?.map((entry) => (
          condensed
            ? <CondensedItem key={entry.id} entry={entry} />
            : <ExpandedItem key={entry.id} entry={entry} />
        ))}
        {!isLoading && (!entries || entries.length === 0) && (
          <p style={{ fontSize: condensed ? '11px' : '13px', color: '#9ca3af', textAlign: 'center', padding: condensed ? '16px 0' : '32px 0' }}>No activity yet</p>
        )}
        <div ref={bottomRef} />
      </div>

      {showCommentBox && !condensed && (
        <div className="px-4 py-2 border-t" style={{ borderColor: '#e9eaec' }}>
          <div className="flex gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
              placeholder="Add a comment…"
              rows={1}
              style={{ flex: 1, resize: 'none', borderRadius: '6px', border: '1px solid #e2e3e6', padding: '6px 10px', fontSize: '13px', color: '#1a1a1a' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              onClick={handlePost}
              disabled={!comment.trim() || postActivity.isPending}
              style={{ height: '32px', padding: '0 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: !comment.trim() ? 0.5 : 1 }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
