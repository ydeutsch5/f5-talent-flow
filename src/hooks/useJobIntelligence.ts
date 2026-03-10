import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface JobIntelligence {
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  technologies: string[];
  seniorityLevel: string;
  searchKeywords: string[];
  recruiterSummary: string;
  domainContext: string;
  hiringSignals: string[];
  risks: string[];
}

export function useJobIntelligence(jobId: string | undefined) {
  return useQuery<JobIntelligence | null>({
    queryKey: ["job-intelligence", jobId],
    queryFn: () => mockStore.getJobIntelligence(jobId!),
    enabled: !!jobId,
    staleTime: Infinity,
  });
}

export function useGenerateIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      await new Promise(r => setTimeout(r, 1500));
      toast.success("Intelligence generated");
    },
    onSuccess: (_d, jobId) => {
      qc.invalidateQueries({ queryKey: ["job-intelligence", jobId] });
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
