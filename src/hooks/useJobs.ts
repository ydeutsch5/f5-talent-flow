import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    queryFn: () => api.get("/jobs"),
  });
}

export function useJobStatuses() {
  return useQuery<JobStatus[]>({
    queryKey: ["job-statuses"],
    queryFn: () => api.get("/job-statuses"),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      api.put(`/jobs/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.post("/jobs", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/jobs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}
