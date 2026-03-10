import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

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
    queryFn: () => mockStore.getJobActivity(jobId!) as ActivityEntry[],
    enabled: !!jobId,
    staleTime: Infinity,
  });
}

export function usePostActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, content }: { jobId: string; content: string }) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.postJobActivity(jobId, content);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["job-activity", vars.jobId] });
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
