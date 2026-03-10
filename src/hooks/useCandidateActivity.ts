import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CandidateActivityEntry {
  id: string;
  type: "status_change" | "comment" | "tag_added" | "resume_evaluated" | "submission";
  content: string;
  createdAt: string;
  user?: { name: string };
}

export function useCandidateActivity(candidateId: string | undefined) {
  return useQuery<CandidateActivityEntry[]>({
    queryKey: ["candidate-activity", candidateId],
    queryFn: () => api.get(`/candidates/${candidateId}/activity`),
    enabled: !!candidateId,
  });
}

export function usePostCandidateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, content }: { candidateId: string; content: string }) =>
      api.post(`/candidates/${candidateId}/activity`, { type: "comment", content }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidate-activity", vars.candidateId] });
    },
  });
}
