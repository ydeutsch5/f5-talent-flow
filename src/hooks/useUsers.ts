import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "recruiter" | "manager";
  createdAt: string;
  lastLoginAt: string | null;
}

export function useUsers() {
  return useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: () => mockStore.getUsers() as AppUser[],
    staleTime: Infinity,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; role?: string }) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.updateUser(id, body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User updated"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; role: string; password: string }) => {
      await new Promise(r => setTimeout(r, 350));
      return mockStore.inviteUser(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User invited"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 350));
      mockStore.deactivateUser(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User deactivated"); },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  });
}
