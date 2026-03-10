import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export function useCreateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { label: string; color: string }) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.createCandidateStatus(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidate-statuses"] }); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useUpdateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; label?: string; color?: string }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateCandidateStatus(id, body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidate-statuses"] }); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useDeleteCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.deleteCandidateStatus(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidate-statuses"] }); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useReorderCandidateStatuses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.reorderCandidateStatuses(ids);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidate-statuses"] }); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
