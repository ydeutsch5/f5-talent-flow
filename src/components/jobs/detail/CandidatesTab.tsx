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
    updateMatch.mutate({ id: matchId, data: { status: "Removed" } });
  };

  const handleViewProfile = (candidateId: string) => {
    console.log("View profile", candidateId);
  };

  const viewBtnStyle = (active: boolean): React.CSSProperties => ({
    height: '28px',
    padding: '0 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: active ? '#1a1a1a' : '#9ca3af',
    backgroundColor: active ? '#f3f4f6' : 'transparent',
    transition: 'all 150ms ease',
  });

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between shrink-0" style={{ height: '40px', padding: '0 20px', borderBottom: '1px solid #e9eaec' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Candidates</span>
          {matches && (
            <span className="inline-flex items-center justify-center rounded-full" style={{ height: '20px', minWidth: '20px', padding: '0 6px', fontSize: '11px', fontWeight: 600, backgroundColor: '#f3f4f6', color: '#6b7280' }}>
              {matches.length}
            </span>
          )}
        </div>
        <div className="flex items-center overflow-hidden" style={{ border: '1px solid #e2e3e6', borderRadius: '6px' }}>
          <button onClick={() => setView("list")} style={viewBtnStyle(view === "list")}
            onMouseEnter={(e) => { if (view !== "list") e.currentTarget.style.backgroundColor = '#f9fafb'; }}
            onMouseLeave={(e) => { if (view !== "list") e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <List style={{ width: '14px', height: '14px' }} /> List
          </button>
          <button onClick={() => setView("kanban")} style={viewBtnStyle(view === "kanban")}
            onMouseEnter={(e) => { if (view !== "kanban") e.currentTarget.style.backgroundColor = '#f9fafb'; }}
            onMouseLeave={(e) => { if (view !== "kanban") e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <LayoutGrid style={{ width: '14px', height: '14px' }} /> Kanban
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse" style={{ padding: '0 12px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4" style={{ height: '34px', borderBottom: '1px solid #f3f4f6', padding: '0 12px' }}>
                <div style={{ width: '120px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
                <div style={{ width: '48px', height: '20px', backgroundColor: '#f3f4f6', borderRadius: '100px' }} />
                <div style={{ width: '40px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 20px' }}>
            <Users style={{ width: '32px', height: '32px', color: '#d1d5db' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginTop: '12px' }}>No candidates matched</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Evaluate resumes below to add candidates</p>
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
