import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CandidateStatus {
  id: string;
  label: string;
  color: string;
  position: number;
}

export function useCandidateStatuses() {
  return useQuery<CandidateStatus[]>({
    queryKey: ["candidate-statuses"],
    queryFn: () => api.get("/candidate-statuses"),
  });
}
