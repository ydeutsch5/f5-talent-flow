import { Download, RefreshCw, FileText } from "lucide-react";
import { useFormattedResume, useRegenerateResume } from "@/hooks/useFormattedResume";

interface ResumeTabProps {
  candidateId: string;
}

export function ResumeTab({ candidateId }: ResumeTabProps) {
  const { data: resume, isLoading } = useFormattedResume(candidateId);
  const regenerate = useRegenerateResume();

  if (isLoading) {
    return (
      <div className="flex-1 animate-pulse p-4">
        <div className="h-8 bg-muted rounded w-full mb-4" />
        <div className="h-[500px] bg-muted rounded w-full" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">No formatted resume generated yet</p>
        <p className="text-xs text-muted-foreground">
          Evaluate a resume from a Job page to generate a formatted version.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border shrink-0">
        <a
          href={resume.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors duration-fast"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
        <button
          onClick={() => regenerate.mutate(candidateId)}
          disabled={regenerate.isPending}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-fast"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${regenerate.isPending ? "animate-spin" : ""}`} />
          {regenerate.isPending ? "Regenerating…" : "Regenerate"}
        </button>
      </div>

      {/* PDF embed */}
      <div className="flex-1">
        <iframe
          src={resume.url}
          className="w-full h-full border-0"
          title="Formatted Resume"
        />
      </div>
    </div>
  );
}
