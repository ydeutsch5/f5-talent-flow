import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; color?: string }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateTag(id, body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tags"] }); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.deleteTag(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tags"] }); toast.success("Tag deleted"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
