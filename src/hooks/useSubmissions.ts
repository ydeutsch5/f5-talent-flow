import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

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
    queryFn: () => mockStore.getSubmissions() as Submission[],
    staleTime: Infinity,
  });
}

export function useUpdateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateSubmission(id, data);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      const status = vars.data.status;
      if (status === "Approved") toast.success("Submission approved");
      else if (status === "Rejected") toast.success("Submission rejected");
      else toast.success("Submission updated");
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
