import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateCandidateFull } from "@/hooks/useCandidates";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  title: z.string().trim().max(100).optional().or(z.literal("")),
  source: z.string().trim().max(100).optional().or(z.literal("")),
  shiftAvailability: z.enum(["REGULAR", "US_SHIFT", "BOTH"]),
  communicationRating: z.enum(["EXCELLENT", "GOOD", "AVERAGE", "POOR"]),
});

type FormValues = z.infer<typeof schema>;

interface AddCandidateDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AddCandidateDrawer({ open, onClose }: AddCandidateDrawerProps) {
  const create = useCreateCandidateFull();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [open]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", title: "", source: "", shiftAvailability: "REGULAR", communicationRating: "GOOD" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await create.mutateAsync(data);
      toast.success("Candidate added");
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
        <div className="flex items-center justify-between shrink-0" style={{ height: '56px', borderBottom: '1px solid #e9eaec', padding: '0 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>Add Candidate</h2>
          <button onClick={onClose} className="rounded-md flex items-center justify-center transition-colors hover:bg-[#f3f4f6]" style={{ width: '28px', height: '28px', color: '#6b7280' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1" style={{ padding: '16px 20px' }}>
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Name *</label>
                <input {...register("name")} style={inputStyle} placeholder="Full name"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input {...register("email")} type="email" style={inputStyle} placeholder="email@example.com"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input {...register("phone")} style={inputStyle} placeholder="+1 (555) 123-4567"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Title</label>
                <input {...register("title")} style={inputStyle} placeholder="e.g. Senior React Developer"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Source</label>
                <input {...register("source")} style={inputStyle} placeholder="e.g. LinkedIn, Referral"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Shift Availability</label>
                  <Controller control={control} name="shiftAvailability" render={({ field }) => (
                    <select {...field} style={inputStyle}><option value="REGULAR">Regular</option><option value="US_SHIFT">US Shift</option><option value="BOTH">Both</option></select>
                  )} />
                </div>
                <div>
                  <label style={labelStyle}>Communication</label>
                  <Controller control={control} name="communicationRating" render={({ field }) => (
                    <select {...field} style={inputStyle}><option value="EXCELLENT">Excellent</option><option value="GOOD">Good</option><option value="AVERAGE">Average</option><option value="POOR">Poor</option></select>
                  )} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e9eaec' }}>
            <button type="submit" disabled={create.isPending}
              style={{ width: '100%', height: '28px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 500, opacity: create.isPending ? 0.5 : 1 }}>
              {create.isPending ? "Adding…" : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
