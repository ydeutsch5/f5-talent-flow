import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface FormattedResume {
  url: string;
  generatedAt: string;
}

export function useFormattedResume(candidateId: string | undefined) {
  return useQuery<FormattedResume | null>({
    queryKey: ["formatted-resume", candidateId],
    queryFn: () => api.get(`/candidates/${candidateId}/formatted-resume`),
    enabled: !!candidateId,
  });
}

export function useRegenerateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) =>
      api.post(`/candidates/${candidateId}/formatted-resume/regenerate`),
    onSuccess: (_d, candidateId) => {
      qc.invalidateQueries({ queryKey: ["formatted-resume", candidateId] });
    },
  });
}
