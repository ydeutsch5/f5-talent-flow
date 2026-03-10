import { useState, useRef, useEffect } from "react";
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

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const config = ICON_MAP[entry.type] || ICON_MAP.comment;
  const Icon = config.icon;

  return (
    <div className="flex gap-2.5 py-2">
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Icon className="h-3 w-3" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{entry.content}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-xs text-muted-foreground mt-0.5 cursor-default">
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
}

export function ActivityFeed({ jobId, showCommentBox = true }: ActivityFeedProps) {
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
                <div className="h-6 w-6 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}
        {entries?.map((entry) => (
          <ActivityItem key={entry.id} entry={entry} />
        ))}
        {!isLoading && (!entries || entries.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-8">No activity yet</p>
        )}
        <div ref={bottomRef} />
      </div>

      {showCommentBox && (
        <div className="px-4 py-2 border-t border-border flex gap-2">
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
            className="flex-1 resize-none rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handlePost}
            disabled={!comment.trim() || postActivity.isPending}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity duration-fast disabled:opacity-50 shrink-0 self-end"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
