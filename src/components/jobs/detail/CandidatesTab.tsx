import { useState } from "react";
import { List, LayoutGrid, Users } from "lucide-react";
import { useMatches, useUpdateMatch, useUpdateCandidate } from "@/hooks/useMatches";
import { useCandidateStatuses } from "@/hooks/useCandidateStatuses";
import { CandidateListView } from "./CandidateListView";
import { KanbanView } from "./KanbanView";
import { ResumeEvaluator } from "./ResumeEvaluator";

interface CandidatesTabProps {
  jobId: string;
}

export function CandidatesTab({ jobId }: CandidatesTabProps) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const { data: matches, isLoading: matchesLoading } = useMatches(jobId);
  const { data: statuses, isLoading: statusesLoading } = useCandidateStatuses();
  const updateMatch = useUpdateMatch();
  const updateCandidate = useUpdateCandidate();

  const isLoading = matchesLoading || statusesLoading;
  const isEmpty = !isLoading && (!matches || matches.length === 0);

  const handleChangeStatus = (matchId: string, newStatus: string) => {
    updateMatch.mutate({ id: matchId, data: { status: newStatus } });
  };

  const handleChangeComm = (candidateId: string, rating: string) => {
    updateCandidate.mutate({ id: candidateId, data: { communicationRating: rating } });
  };

  const handleRemove = (matchId: string) => {
    // Could be a DELETE endpoint - using update to set inactive for now
    updateMatch.mutate({ id: matchId, data: { status: "Removed" } });
  };

  const handleViewProfile = (candidateId: string) => {
    // TODO: Open candidate detail drawer
    console.log("View profile", candidateId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Candidates</span>
          {matches && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-muted text-xs text-muted-foreground px-1.5">
              {matches.length}
            </span>
          )}
        </div>
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`h-7 px-2.5 flex items-center gap-1 text-xs font-medium transition-colors duration-fast ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`h-7 px-2.5 flex items-center gap-1 text-xs font-medium transition-colors duration-fast ${view === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse px-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-row border-b border-border flex items-center gap-4 px-3">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded-full w-16" />
                <div className="h-3 bg-muted rounded w-10" />
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground mb-0.5">No candidates matched</p>
            <p className="text-xs text-muted-foreground">Evaluate resumes below to add candidates</p>
          </div>
        )}

        {!isLoading && !isEmpty && statuses && matches && (
          view === "list" ? (
            <CandidateListView
              matches={matches}
              statuses={statuses}
              onChangeStatus={handleChangeStatus}
              onChangeComm={handleChangeComm}
              onViewProfile={handleViewProfile}
              onRemove={handleRemove}
            />
          ) : (
            <KanbanView
              matches={matches}
              statuses={statuses}
              onChangeStatus={handleChangeStatus}
              onViewProfile={handleViewProfile}
            />
          )
        )}
      </div>

      {/* Resume evaluator */}
      <ResumeEvaluator jobId={jobId} />
    </div>
  );
}
