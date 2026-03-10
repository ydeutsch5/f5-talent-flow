import { useQuery } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";

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
    queryFn: () => mockStore.getRecentActivity() as RecentActivityEntry[],
    staleTime: Infinity,
  });
}
