import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    queryFn: () => api.get(`/jobs/${jobId}/intelligence`),
    enabled: !!jobId,
  });
}

export function useGenerateIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post(`/jobs/${jobId}/intelligence/generate`),
    onSuccess: (_d, jobId) => {
      qc.invalidateQueries({ queryKey: ["job-intelligence", jobId] });
    },
  });
}
