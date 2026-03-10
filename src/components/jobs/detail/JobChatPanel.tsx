import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { useJobChat, useSendChatMessage } from "@/hooks/useJobChat";
import { formatDistanceToNow } from "date-fns";

interface JobChatPanelProps {
  jobId: string;
}

export function JobChatPanel({ jobId }: JobChatPanelProps) {
  const { data: messages, isLoading } = useJobChat(jobId);
  const sendMessage = useSendChatMessage();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    sendMessage.mutate({ jobId, message: msg });
    setInput("");
  };

  return (
    <div className="flex flex-col" style={{ maxHeight: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '10px 20px', borderBottom: '1px solid #e9eaec' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Ask about this job</span>
        <button className="flex items-center gap-1 transition-colors" style={{ fontSize: '11px', color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#374151'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}>
          <Trash2 style={{ width: '12px', height: '12px' }} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3" style={{ padding: '16px 20px' }}>
        {isLoading && (
          <div className="space-y-2 animate-pulse">
            <div style={{ height: '32px', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '75%' }} />
            <div style={{ height: '32px', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '66%', marginLeft: 'auto' }} />
          </div>
        )}
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%]"
              style={{
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                lineHeight: 1.5,
                ...(msg.role === "user"
                  ? { backgroundColor: '#7c3aed', color: '#ffffff' }
                  : { backgroundColor: '#f3f4f6', color: '#374151' }),
              }}
            >
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2" style={{ padding: '10px 20px', borderTop: '1px solid #e9eaec' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask a question…"
          rows={1}
          style={{ flex: 1, resize: 'none', borderRadius: '6px', border: '1px solid #e2e3e6', padding: '6px 10px', fontSize: '13px', color: '#1a1a1a', maxHeight: '72px' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          className="flex items-center justify-center shrink-0 transition-colors"
          style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', opacity: !input.trim() ? 0.5 : 1 }}
          onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.backgroundColor = '#6d28d9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
        >
          <Send style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
    </div>
  );
}
