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
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-fast hover:opacity-80"
      style={{ backgroundColor: `${color}20`, color }}
      title="Click to copy"
    >
      {label}
      {copied && <Check className="h-3 w-3" />}
    </button>
  );
}

function ChipSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items?.length) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
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
      <div className="p-4 space-y-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-muted rounded w-24" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded-full w-16" />
              <div className="h-6 bg-muted rounded-full w-20" />
              <div className="h-6 bg-muted rounded-full w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!intel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <Sparkles className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-medium text-foreground mb-1">Generate Job Intelligence</p>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          AI analyzes this job and extracts key hiring signals, required skills, and recruiter context.
        </p>
        <button
          onClick={() => generate.mutate(jobId)}
          disabled={generate.isPending}
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {generate.isPending ? "Generating…" : "Generate Intelligence"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Regenerate */}
      <div className="flex justify-end px-4 pt-3">
        <button
          onClick={() => generate.mutate(jobId)}
          disabled={generate.isPending}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-fast"
        >
          <RefreshCw className={`h-3 w-3 ${generate.isPending ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6 px-4 pb-4">
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
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Seniority Level</p>
              <span className="inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold bg-muted text-foreground">
                {intel.seniorityLevel}
              </span>
            </div>
          )}

          {intel.recruiterSummary && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recruiter Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{intel.recruiterSummary}</p>
            </div>
          )}

          {intel.domainContext && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Domain Context</p>
              <p className="text-sm text-foreground leading-relaxed">{intel.domainContext}</p>
            </div>
          )}

          {intel.hiringSignals?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Hiring Signals</p>
              <ul className="space-y-1">
                {intel.hiringSignals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#15803d" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {intel.risks?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Risks</p>
              <ul className="space-y-1">
                {intel.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#dc2626" }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat */}
      <div className="border-t border-border flex-shrink-0">
        <JobChatPanel jobId={jobId} />
      </div>
    </div>
  );
}
