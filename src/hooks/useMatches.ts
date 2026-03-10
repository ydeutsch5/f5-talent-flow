import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Match {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  matchPercentage: number | null;
  matchBand: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    communicationRating: string | null;
    shiftAvailability: string | null;
  };
}

export function useMatches(jobId: string | undefined) {
  return useQuery<Match[]>({
    queryKey: ["matches", jobId],
    queryFn: () => api.get(`/matches?jobId=${jobId}`),
    enabled: !!jobId,
    select: (data) => data.filter((m) => m.matchPercentage != null),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.put(`/matches/${id}`, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.put(`/candidates/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useEvaluateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, formData }: { jobId: string; formData: FormData }) =>
      api.postForm(`/jobs/${jobId}/evaluate-resume`, formData),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["matches", vars.jobId] });
    },
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.post("/candidates", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
