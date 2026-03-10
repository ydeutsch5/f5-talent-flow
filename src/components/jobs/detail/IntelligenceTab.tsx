import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import { useJobIntelligence, useGenerateIntelligence } from "@/hooks/useJobIntelligence";
import { JobChatPanel } from "./JobChatPanel";

interface IntelligenceTabProps {
  jobId: string;
}

function CopyableChip({ label, color }: { label: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(label);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-full transition-colors"
      style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 500, backgroundColor: `${color}15`, color, border: `1px solid ${color}25` }}
      title="Click to copy"
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}25`; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}15`; }}
    >
      {label}
      {copied && <Check style={{ width: '10px', height: '10px' }} />}
    </button>
  );
}

function ChipSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <CopyableChip key={item} label={item} color={color} />
        ))}
      </div>
    </div>
  );
}

export function IntelligenceTab({ jobId }: IntelligenceTabProps) {
  const { data: intel, isLoading } = useJobIntelligence(jobId);
  const generate = useGenerateIntelligence();

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }} className="space-y-5 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div style={{ height: '10px', width: '80px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
            <div className="flex gap-2">
              <div style={{ height: '24px', width: '60px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
              <div style={{ height: '24px', width: '80px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
              <div style={{ height: '24px', width: '56px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!intel) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ padding: '64px 24px' }}>
        <Sparkles style={{ width: '32px', height: '32px', color: '#d1d5db' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginTop: '16px' }}>Generate Job Intelligence</p>
        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', maxWidth: '320px' }}>
          AI analyzes this job and extracts key hiring signals, required skills, and recruiter context.
        </p>
        <button
          onClick={() => generate.mutate(jobId)}
          disabled={generate.isPending}
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{ marginTop: '20px', height: '32px', padding: '0 14px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: generate.isPending ? 0.6 : 1 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
        >
          <Sparkles style={{ width: '14px', height: '14px' }} />
          {generate.isPending ? "Generating…" : "Generate Intelligence"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Regenerate */}
      <div className="flex justify-end" style={{ padding: '12px 20px 0' }}>
        <button
          onClick={() => generate.mutate(jobId)}
          disabled={generate.isPending}
          className="inline-flex items-center gap-1 transition-colors"
          style={{ fontSize: '12px', color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#374151'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
        >
          <RefreshCw className={generate.isPending ? "animate-spin" : ""} style={{ width: '12px', height: '12px' }} />
          Regenerate
        </button>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2" style={{ gap: '0 32px', padding: '12px 20px 20px' }}>
        {/* Left */}
        <div>
          <ChipSection title="Must Have Skills" items={intel.mustHaveSkills} color="#15803d" />
          <ChipSection title="Nice To Have Skills" items={intel.niceToHaveSkills} color="#1d4ed8" />
          <ChipSection title="Technologies" items={intel.technologies} color="#6b7280" />
          <ChipSection title="Search Keywords" items={intel.searchKeywords} color="#7c3aed" />
        </div>

        {/* Right */}
        <div>
          {intel.seniorityLevel && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>Seniority Level</p>
              <span className="inline-flex items-center rounded-md" style={{ padding: '4px 10px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f3f4f6', color: '#1a1a1a' }}>
                {intel.seniorityLevel}
              </span>
            </div>
          )}

          {intel.recruiterSummary && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>Recruiter Summary</p>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{intel.recruiterSummary}</p>
            </div>
          )}

          {intel.domainContext && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>Domain Context</p>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{intel.domainContext}</p>
            </div>
          )}

          {intel.hiringSignals?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>Hiring Signals</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {intel.hiringSignals.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: '13px', color: '#374151' }}>
                    <span className="shrink-0 rounded-full" style={{ width: '5px', height: '5px', backgroundColor: '#16a34a', marginTop: '6px' }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {intel.risks?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '8px' }}>Risks</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {intel.risks.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: '13px', color: '#374151' }}>
                    <span className="shrink-0 rounded-full" style={{ width: '5px', height: '5px', backgroundColor: '#dc2626', marginTop: '6px' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat */}
      <div style={{ borderTop: '1px solid #e9eaec', flexShrink: 0 }}>
        <JobChatPanel jobId={jobId} />
      </div>
    </div>
  );
}
