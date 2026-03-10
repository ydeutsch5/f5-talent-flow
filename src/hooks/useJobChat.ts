import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function useJobChat(jobId: string | undefined) {
  return useQuery<ChatMessage[]>({
    queryKey: ["job-chat", jobId],
    queryFn: () => mockStore.getJobChat(jobId!),
    enabled: !!jobId,
    staleTime: Infinity,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, message }: { jobId: string; message: string }) => {
      await new Promise(r => setTimeout(r, 800));
      return mockStore.postJobChat(jobId, message);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["job-chat", vars.jobId] });
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
