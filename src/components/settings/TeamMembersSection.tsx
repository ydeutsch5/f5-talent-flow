import { useState } from "react";
import { useUsers, useUpdateUser, useInviteUser, useDeactivateUser, type AppUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { UserPlus, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  manager: "bg-[#22c55e] text-[hsl(0,0%,100%)]",
  recruiter: "bg-[#3b82f6] text-[hsl(0,0%,100%)]",
};

const ROLES = ["admin", "manager", "recruiter"] as const;

export function TeamMembersSection() {
  const { data: users = [], isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const inviteUser = useInviteUser();
  const deactivateUser = useDeactivateUser();
  const currentUser = useAuthStore((s) => s.user);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "recruiter", password: "" });

  const handleInvite = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    inviteUser.mutate(
      { name: form.name.trim(), email: form.email.trim(), role: form.role, password: form.password },
      {
        onSuccess: () => {
          setInviteOpen(false);
          setForm({ name: "", email: "", role: "recruiter", password: "" });
          toast({ title: `Invitation sent to ${form.email}` });
        },
      }
    );
  };

  if (isLoading) {
    return <div className="space-y-2 animate-pulse">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground">Manage your team's access and roles.</p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Invite Member
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            const initials = user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${ROLE_COLORS[user.role] || "bg-muted text-muted-foreground"}`}
                    >
                      {initials}
                    </div>
                    <span className="font-medium text-sm text-foreground">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <RoleDropdown
                    role={user.role}
                    disabled={isSelf}
                    onChange={(role) => updateUser.mutate({ id: user.id, role })}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastLoginAt
                    ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                    : "Never"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSelf}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                    onClick={() => setDeactivateTarget(user)}
                  >
                    Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Invite drawer */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInviteOpen(false)} />
          <div className="relative w-[480px] bg-background border-l border-border h-full flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-6 h-14 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Invite Member</h3>
              <button onClick={() => setInviteOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <Field label="Temporary Password *" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
            </div>
            <div className="px-6 py-4 border-t border-border">
              <Button className="w-full" onClick={handleInvite} disabled={!form.name || !form.email || !form.password}>
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirm */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This user will no longer be able to access the system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deactivateTarget) return;
                deactivateUser.mutate(deactivateTarget.id, {
                  onSuccess: () => {
                    setDeactivateTarget(null);
                    toast({ title: `${deactivateTarget.name} has been deactivated` });
                  },
                });
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleDropdown({ role, disabled, onChange }: { role: string; disabled: boolean; onChange: (r: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${ROLE_COLORS[role] || "bg-muted text-muted-foreground"}`}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1" align="start">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => { onChange(r); setOpen(false); }}
            className={`w-full text-left text-sm px-3 py-1.5 rounded hover:bg-muted transition-colors ${r === role ? "font-medium text-primary" : "text-foreground"}`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
