import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateJob, type JobStatus } from "@/hooks/useJobs";
import { toast } from "sonner";

const schema = z.object({
  roleTitle: z.string().min(1, "Role title is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientWebsite: z.string().optional(),
  industry: z.string().optional(),
  weeklyBudget: z.string().optional(),
  workingHours: z.enum(["US_HOURS", "INDIA_SHIFT", "GENERAL_SHIFT"]),
  status: z.string(),
  mustHaveRequirements: z.string().optional(),
  niceToHave: z.string().optional(),
  responsibilities: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface NewJobDrawerProps {
  open: boolean;
  onClose: () => void;
  statuses: JobStatus[];
  defaultStatus?: string;
}

export function NewJobDrawer({ open, onClose, statuses, defaultStatus }: NewJobDrawerProps) {
  const createJob = useCreateJob();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [open]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleTitle: "", clientName: "", clientWebsite: "", industry: "", weeklyBudget: "",
      workingHours: "US_HOURS", status: defaultStatus || statuses[0]?.label || "Draft",
      mustHaveRequirements: "", niceToHave: "", responsibilities: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createJob.mutateAsync(data);
      toast.success("Job created");
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message, { duration: 8000 });
    }
  };

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '32px', border: '1px solid #e2e3e6', borderRadius: '6px', fontSize: '13px', color: '#1a1a1a', padding: '0 10px', background: '#ffffff',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' };
  const errorStyle: React.CSSProperties = { fontSize: '11px', color: '#dc2626', marginTop: '3px' };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.15)', opacity: visible ? 1 : 0, transitionDuration: '260ms' }} onClick={onClose} />
      <div className="flex flex-col bg-white" style={{ width: '480px', maxWidth: '100%', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', transform: visible ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 260ms cubic-bezier(0.32,0.72,0,1)' }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ height: '56px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>New Job</h2>
          <button onClick={onClose} className="rounded-md flex items-center justify-center transition-colors hover:bg-[#f3f4f6]" style={{ width: '28px', height: '28px', color: '#6b7280' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1" style={{ padding: '16px 20px' }}>
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Role Title *</label>
                <input {...register("roleTitle")} style={inputStyle} placeholder="e.g. Senior React Developer"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.roleTitle && <p style={errorStyle}>{errors.roleTitle.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Client Name *</label>
                <input {...register("clientName")} style={inputStyle} placeholder="e.g. Acme Corp"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.clientName && <p style={errorStyle}>{errors.clientName.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Client Website</label>
                <input {...register("clientWebsite")} style={inputStyle} placeholder="https://..."
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <input {...register("industry")} style={inputStyle} placeholder="e.g. Fintech"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Weekly Budget</label>
                  <input {...register("weeklyBudget")} style={inputStyle} placeholder="e.g. $2,000"
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Working Hours</label>
                  <Controller control={control} name="workingHours" render={({ field }) => (
                    <select {...field} style={inputStyle}>
                      <option value="US_HOURS">US Hours</option>
                      <option value="INDIA_SHIFT">India Shift</option>
                      <option value="GENERAL_SHIFT">General Shift</option>
                    </select>
                  )} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <Controller control={control} name="status" render={({ field }) => (
                  <select {...field} style={inputStyle}>
                    {statuses.map((s) => <option key={s.id} value={s.label}>{s.label}</option>)}
                  </select>
                )} />
              </div>
              <div>
                <label style={labelStyle}>Must Have Requirements</label>
                <textarea {...register("mustHaveRequirements")} style={{ ...inputStyle, height: 'auto', padding: '8px 10px', minHeight: '80px', resize: 'vertical' as const }} rows={3} placeholder="Key requirements..."
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Nice To Have</label>
                <textarea {...register("niceToHave")} style={{ ...inputStyle, height: 'auto', padding: '8px 10px', minHeight: '60px', resize: 'vertical' as const }} rows={2} placeholder="Preferred qualifications..."
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e9eaec' }}>
            <button type="submit" disabled={createJob.isPending}
              style={{ width: '100%', height: '28px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: createJob.isPending ? 0.5 : 1, cursor: createJob.isPending ? 'not-allowed' : 'pointer' }}>
              {createJob.isPending ? "Creating…" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
