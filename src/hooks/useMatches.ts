import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface Match {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  matchPercentage: number | null;
  matchBand: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    communicationRating: string | null;
    shiftAvailability: string | null;
  };
}

export function useMatches(jobId: string | undefined) {
  return useQuery<Match[]>({
    queryKey: ["matches", jobId],
    queryFn: () => mockStore.getMatches(jobId) as Match[],
    enabled: !!jobId,
    select: (data) => data.filter((m) => m.matchPercentage != null),
    staleTime: Infinity,
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateMatch(id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateCandidate(id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Candidate updated"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useEvaluateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, formData }: { jobId: string; formData: FormData }) => {
      await new Promise(r => setTimeout(r, 1000));
      return {
        matchPercentage: Math.floor(Math.random() * 40) + 60,
        matchBand: "Good",
        candidateName: "New Candidate",
        candidateEmail: "candidate@example.com",
        candidateTitle: "Developer",
        skillsMatched: ["React", "TypeScript", "Git"],
        skillsMissing: ["GraphQL", "AWS"],
        summary: "Good technical fit with solid frontend experience. Communication skills need further evaluation.",
      };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["matches", vars.jobId] });
      toast.success("Resume evaluated");
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.createCandidate(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Candidate added"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
