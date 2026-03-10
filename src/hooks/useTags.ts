import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => mockStore.getTags(),
    staleTime: Infinity,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.createTag(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tags"] }); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useAddCandidateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, tagId }: { candidateId: string; tagId: string }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.addCandidateTag(candidateId, tagId);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.candidateId] });
      toast.success("Tag added");
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useRemoveCandidateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, tagId }: { candidateId: string; tagId: string }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.removeCandidateTag(candidateId, tagId);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.candidateId] });
      toast.success("Tag removed");
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
