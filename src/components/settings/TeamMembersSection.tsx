import { useState, useEffect } from "react";
import { useUsers, useUpdateUser, useInviteUser, useDeactivateUser, type AppUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { UserPlus, X, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#7c3aed", text: "#ffffff" },
  manager: { bg: "#16a34a", text: "#ffffff" },
  recruiter: { bg: "#3b82f6", text: "#ffffff" },
};
const ROLES = ["admin", "manager", "recruiter"] as const;

export function TeamMembersSection() {
  const { data: users = [], isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const inviteUser = useInviteUser();
  const deactivateUser = useDeactivateUser();
  const currentUser = useAuthStore((s) => s.user);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "recruiter", password: "" });

  useEffect(() => {
    if (inviteOpen) requestAnimationFrame(() => setInviteVisible(true));
    else setInviteVisible(false);
  }, [inviteOpen]);

  const handleInvite = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    inviteUser.mutate({ name: form.name.trim(), email: form.email.trim(), role: form.role, password: form.password }, {
      onSuccess: () => { setInviteOpen(false); setForm({ name: "", email: "", role: "recruiter", password: "" }); toast.success(`Invitation sent`); },
    });
  };

  if (isLoading) {
    return <div className="space-y-2 animate-pulse">{[1, 2, 3].map((i) => <div key={i} style={{ height: '48px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />)}</div>;
  }

  const colHeaderStyle: React.CSSProperties = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 500, paddingBottom: '8px' };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Team Members</h2>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>Manage your team's access and roles.</p>
        </div>
        <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-1.5 transition-colors"
          style={{ height: '28px', padding: '0 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
        >
          <UserPlus style={{ width: '14px', height: '14px' }} /> Invite Member
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid #e9eaec' }}>
            <th className="text-left" style={colHeaderStyle}>Member</th>
            <th className="text-left" style={colHeaderStyle}>Email</th>
            <th className="text-left" style={colHeaderStyle}>Role</th>
            <th className="text-left" style={colHeaderStyle}>Last Login</th>
            <th style={{ ...colHeaderStyle, width: '80px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
            const rc = ROLE_COLORS[user.role] || { bg: '#f3f4f6', text: '#374151' };
            return (
              <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 0' }}>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: '28px', height: '28px', backgroundColor: rc.bg }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: rc.text }}>{initials}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '8px 0', fontSize: '13px', color: '#9ca3af' }}>{user.email}</td>
                <td style={{ padding: '8px 0' }}>
                  <RoleDropdown role={user.role} disabled={isSelf} onChange={(role) => updateUser.mutate({ id: user.id, role })} />
                </td>
                <td style={{ padding: '8px 0', fontSize: '11px', color: '#9ca3af' }}>{user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : "Never"}</td>
                <td style={{ padding: '8px 0' }}>
                  <button disabled={isSelf} onClick={() => setDeactivateTarget(user)}
                    style={{ fontSize: '13px', color: isSelf ? '#d1d5db' : '#dc2626', cursor: isSelf ? 'not-allowed' : 'pointer' }}
                    onMouseEnter={(e) => { if (!isSelf) e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Invite drawer */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="flex-1 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.15)', opacity: inviteVisible ? 1 : 0 }} onClick={() => setInviteOpen(false)} />
          <div className="flex flex-col bg-white" style={{ width: '480px', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', transform: inviteVisible ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 260ms cubic-bezier(0.32,0.72,0,1)' }}>
            <div className="flex items-center justify-between shrink-0" style={{ height: '56px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>Invite Member</h3>
              <button onClick={() => setInviteOpen(false)} className="rounded-md flex items-center justify-center transition-colors hover:bg-[#f3f4f6]" style={{ width: '28px', height: '28px', color: '#6b7280' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>
              <div className="space-y-4">
                <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ width: '100%', height: '32px', border: '1px solid #e2e3e6', borderRadius: '6px', fontSize: '13px', color: '#1a1a1a', padding: '0 10px' }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <Field label="Temporary Password *" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e9eaec' }}>
              <button onClick={handleInvite} disabled={!form.name || !form.email || !form.password}
                style={{ width: '100%', height: '28px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: (!form.name || !form.email || !form.password) ? 0.5 : 1 }}>
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This user will no longer be able to access the system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (!deactivateTarget) return; deactivateUser.mutate(deactivateTarget.id, { onSuccess: () => { setDeactivateTarget(null); toast.success(`${deactivateTarget.name} deactivated`); } }); }}>
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
  const rc = ROLE_COLORS[role] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button disabled={disabled} className="inline-flex items-center rounded-full cursor-pointer transition-colors"
          style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: rc.bg, color: rc.text, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1.5" align="start" style={{ width: '160px', borderRadius: '8px', border: '1px solid #e2e3e6', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        {ROLES.map((r) => (
          <button key={r} onClick={() => { onChange(r); setOpen(false); }}
            className="flex items-center gap-2 w-full px-2 rounded-[5px] transition-colors hover:bg-[#f3f4f6]" style={{ height: '30px' }}>
            <span style={{ fontSize: '13px', color: '#1a1a1a', flex: 1, textAlign: 'left' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
            {r === role && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', height: '32px', border: '1px solid #e2e3e6', borderRadius: '6px', fontSize: '13px', color: '#1a1a1a', padding: '0 10px' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
