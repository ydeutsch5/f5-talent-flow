import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCreateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { label: string; color: string }) =>
      api.post("/candidate-statuses", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate-statuses"] }),
  });
}

export function useUpdateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; label?: string; color?: string }) =>
      api.put(`/candidate-statuses/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate-statuses"] }),
  });
}

export function useDeleteCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/candidate-statuses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate-statuses"] }),
  });
}

export function useReorderCandidateStatuses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.put("/candidate-statuses/reorder", { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate-statuses"] }),
  });
}
