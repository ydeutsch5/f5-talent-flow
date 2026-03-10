import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Submission {
  id: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  candidate: { id: string; name: string; title: string | null; email: string; phone?: string | null; communicationRating?: string | null };
  job: { id: string; roleTitle: string; clientName: string; weeklyBudget?: string | null; workingHours?: string | null };
  submittedBy: { id: string; name: string; email: string };
}

export function useSubmissions() {
  return useQuery<Submission[]>({
    queryKey: ["submissions"],
    queryFn: () => api.get("/submissions"),
  });
}

export function useUpdateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.put(`/submissions/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions"] }),
  });
}
