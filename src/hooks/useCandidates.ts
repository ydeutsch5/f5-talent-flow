import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface CandidateTag {
  id: string;
  name: string;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  source: string | null;
  shiftAvailability: "REGULAR" | "US_SHIFT" | "BOTH";
  communicationRating: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  status: string;
  tags: CandidateTag[];
  transcription?: string | null;
  portfolioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { matches: number };
}

export function useCandidates() {
  return useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: () => mockStore.getCandidates() as Candidate[],
    staleTime: Infinity,
  });
}

export function useCandidate(id: string | undefined) {
  return useQuery<Candidate>({
    queryKey: ["candidate", id],
    queryFn: () => mockStore.getCandidate(id!) as Candidate,
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useUpdateCandidateFull() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateCandidate(id, data);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.id] });
      toast.success("Candidate updated");
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useCreateCandidateFull() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.createCandidate(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); toast.success("Candidate added"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.deleteCandidate(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); toast.success("Candidate deleted"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useBulkUpdateCandidates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Record<string, any> }) => {
      await new Promise(r => setTimeout(r, 350));
      ids.forEach(id => mockStore.updateCandidate(id, data));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); toast.success("Candidates updated"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useBulkDeleteCandidates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await new Promise(r => setTimeout(r, 350));
      ids.forEach(id => mockStore.deleteCandidate(id));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["candidates"] }); toast.success("Candidates deleted"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
