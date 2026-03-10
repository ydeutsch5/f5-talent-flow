import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CandidateTag {
  id: string;
  name: string;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  source: string | null;
  shiftAvailability: "REGULAR" | "US_SHIFT" | "BOTH";
  communicationRating: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  status: string;
  tags: CandidateTag[];
  transcription?: string | null;
  portfolioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { matches: number };
}

export function useCandidates() {
  return useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: () => api.get("/candidates"),
  });
}

export function useCandidate(id: string | undefined) {
  return useQuery<Candidate>({
    queryKey: ["candidate", id],
    queryFn: () => api.get(`/candidates/${id}`),
    enabled: !!id,
  });
}

export function useUpdateCandidateFull() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.put(`/candidates/${id}`, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.id] });
    },
  });
}

export function useCreateCandidateFull() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.post("/candidates", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/candidates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

export function useBulkUpdateCandidates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Record<string, any> }) =>
      Promise.all(ids.map((id) => api.put(`/candidates/${id}`, data))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

export function useBulkDeleteCandidates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => api.del(`/candidates/${id}`))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}
