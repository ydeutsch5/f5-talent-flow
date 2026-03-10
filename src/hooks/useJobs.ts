import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface JobStatus {
  id: string;
  label: string;
  color: string;
  position: number;
}

export interface Job {
  id: string;
  roleTitle: string;
  clientName: string;
  clientWebsite: string | null;
  status: string;
  weeklyBudget: string | null;
  workingHours: "US_HOURS" | "INDIA_SHIFT" | "GENERAL_SHIFT";
  industry: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { matches: number };
}

export function useJobs() {
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: () => mockStore.getJobs() as Job[],
    staleTime: Infinity,
  });
}

export function useJobStatuses() {
  return useQuery<JobStatus[]>({
    queryKey: ["job-statuses"],
    queryFn: () => mockStore.getJobStatuses(),
    staleTime: Infinity,
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateJob(id, data);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Job updated"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.createJob(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Job created"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.deleteJob(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Job deleted"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
