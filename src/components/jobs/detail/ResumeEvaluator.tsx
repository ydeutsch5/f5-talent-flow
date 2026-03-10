import { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Upload, Check } from "lucide-react";
import { useEvaluateResume, useCreateCandidate } from "@/hooks/useMatches";
import { getMatchColor } from "./matchUtils";
import { toast } from "sonner";

interface ResumeEvaluatorProps {
  jobId: string;
}

interface EvalResult {
  matchPercentage: number;
  matchBand: string;
  candidateName: string;
  candidateEmail: string;
  candidateTitle: string;
  skillsMatched: string[];
  skillsMissing: string[];
  summary: string;
}

export function ResumeEvaluator({ jobId }: ResumeEvaluatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const evaluate = useEvaluateResume();
  const createCandidate = useCreateCandidate();

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await evaluate.mutateAsync({ jobId, formData });
      setResult(res);
      setEditName(res.candidateName || "");
      setEditEmail(res.candidateEmail || "");
      setEditTitle(res.candidateTitle || "");
    } catch (err: any) {
      toast({ title: "Evaluation failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") handleFile(file);
  };

  const handleAddToPipeline = async () => {
    try {
      await createCandidate.mutateAsync({
        name: editName,
        email: editEmail,
        title: editTitle,
        jobId,
        matchPercentage: result!.matchPercentage,
        matchBand: result!.matchBand,
      });
      toast({ title: "Candidate added", description: `${editName} has been added to the pipeline.` });
      setResult(null);
      setExpanded(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const mc = result ? getMatchColor(result.matchPercentage) : null;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-row-hover transition-colors duration-fast"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Evaluate a Resume
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {evaluate.isPending ? (
            <div className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Evaluating resume…</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Match result */}
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-lg font-bold"
                  style={{ backgroundColor: mc!.bg, color: mc!.text }}
                >
                  {result.matchPercentage}%
                </span>
                <span className="text-sm text-muted-foreground">{result.matchBand}</span>
              </div>

              {/* Editable candidate info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">Email</label>
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Skills Matched</p>
                  <div className="flex flex-wrap gap-1">
                    {result.skillsMatched.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Skills Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {result.skillsMissing.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>

              <button
                onClick={handleAddToPipeline}
                disabled={createCandidate.isPending}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> {createCandidate.isPending ? "Adding…" : "Add to Pipeline"}
              </button>
            </div>
          ) : (
            /* Upload zone */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors duration-fast"
            >
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop resume PDF here or click to browse</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
