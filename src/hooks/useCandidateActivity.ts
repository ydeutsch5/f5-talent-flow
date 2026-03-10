import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

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
    queryFn: () => mockStore.getCandidateActivity(candidateId!) as CandidateActivityEntry[],
    enabled: !!candidateId,
    staleTime: Infinity,
  });
}

export function usePostCandidateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, content }: { candidateId: string; content: string }) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.postCandidateActivity(candidateId, content);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidate-activity", vars.candidateId] });
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
