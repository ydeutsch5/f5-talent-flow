import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => api.get("/tags"),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color: string }) => api.post("/tags", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useAddCandidateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, tagId }: { candidateId: string; tagId: string }) =>
      api.post(`/candidates/${candidateId}/tags`, { tagId }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.candidateId] });
    },
  });
}

export function useRemoveCandidateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, tagId }: { candidateId: string; tagId: string }) =>
      api.del(`/candidates/${candidateId}/tags/${tagId}`),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.candidateId] });
    },
  });
}
