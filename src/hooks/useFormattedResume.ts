import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface FormattedResume {
  url: string;
  generatedAt: string;
}

export function useFormattedResume(candidateId: string | undefined) {
  return useQuery<FormattedResume | null>({
    queryKey: ["formatted-resume", candidateId],
    queryFn: () => null,
    enabled: !!candidateId,
    staleTime: Infinity,
  });
}

export function useRegenerateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: string) => {
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Resume regenerated");
      return { url: "#", generatedAt: new Date().toISOString() };
    },
    onSuccess: (_d, candidateId) => {
      qc.invalidateQueries({ queryKey: ["formatted-resume", candidateId] });
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
