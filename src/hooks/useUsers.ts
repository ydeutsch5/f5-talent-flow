import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    queryFn: () => api.get("/users"),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: string }) =>
      api.put(`/users/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; role: string; password: string }) =>
      api.post("/users/invite", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
