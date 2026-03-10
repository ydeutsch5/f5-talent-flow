import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function useJobChat(jobId: string | undefined) {
  return useQuery<ChatMessage[]>({
    queryKey: ["job-chat", jobId],
    queryFn: () => api.get(`/jobs/${jobId}/chat`),
    enabled: !!jobId,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, message }: { jobId: string; message: string }) =>
      api.post(`/jobs/${jobId}/chat`, { message }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["job-chat", vars.jobId] });
    },
  });
}
