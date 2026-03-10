import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface RecentActivityEntry {
  id: string;
  type: "evaluation" | "status_change" | "submission_approved" | "submission_rejected" | "comment" | "candidate_added";
  description: string;
  createdAt: string;
  linkType?: "job" | "candidate" | "submission";
  linkId?: string;
}

export function useRecentActivity() {
  return useQuery<RecentActivityEntry[]>({
    queryKey: ["recent-activity"],
    queryFn: () => api.get("/activity/recent"),
  });
}
