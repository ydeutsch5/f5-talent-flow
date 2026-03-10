import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ActivityEntry {
  id: string;
  type: "status_change" | "comment" | "candidate_added" | "evaluation" | "submission";
  content: string;
  createdAt: string;
  user?: { name: string };
}

export function useJobActivity(jobId: string | undefined) {
  return useQuery<ActivityEntry[]>({
    queryKey: ["job-activity", jobId],
    queryFn: () => api.get(`/jobs/${jobId}/activity`),
    enabled: !!jobId,
  });
}

export function usePostActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, content }: { jobId: string; content: string }) =>
      api.post(`/jobs/${jobId}/activity`, { type: "comment", content }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["job-activity", vars.jobId] });
    },
  });
}
