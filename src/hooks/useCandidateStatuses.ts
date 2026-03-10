import { useQuery } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";

export interface CandidateStatus {
  id: string;
  label: string;
  color: string;
  position: number;
}

export function useCandidateStatuses() {
  return useQuery<CandidateStatus[]>({
    queryKey: ["candidate-statuses"],
    queryFn: () => mockStore.getCandidateStatuses(),
    staleTime: Infinity,
  });
}
