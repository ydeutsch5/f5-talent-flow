import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleTitle: "",
      clientName: "",
      clientWebsite: "",
      industry: "",
      weeklyBudget: "",
      workingHours: "US_HOURS",
      status: defaultStatus || statuses[0]?.label || "Draft",
      mustHaveRequirements: "",
      niceToHave: "",
      responsibilities: "",
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

  const inputCls =
    "w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-fast";
  const labelCls = "block text-sm font-medium text-foreground mb-1";
  const errorCls = "text-xs text-destructive mt-0.5";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-semibold">New Job</SheetTitle>
          <SheetDescription className="sr-only">Create a new job posting</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-y-auto"
        >
          <div className="flex-1 px-6 py-4 space-y-4">
            <div>
              <label className={labelCls}>Role Title *</label>
              <input {...register("roleTitle")} className={inputCls} placeholder="e.g. Senior React Developer" />
              {errors.roleTitle && <p className={errorCls}>{errors.roleTitle.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Client Name *</label>
              <input {...register("clientName")} className={inputCls} placeholder="e.g. Acme Corp" />
              {errors.clientName && <p className={errorCls}>{errors.clientName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Client Website</label>
              <input {...register("clientWebsite")} className={inputCls} placeholder="https://..." />
            </div>

            <div>
              <label className={labelCls}>Industry</label>
              <input {...register("industry")} className={inputCls} placeholder="e.g. Fintech" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Weekly Budget</label>
                <input {...register("weeklyBudget")} className={inputCls} placeholder="e.g. $2,000" />
              </div>
              <div>
                <label className={labelCls}>Working Hours</label>
                <Controller
                  control={control}
                  name="workingHours"
                  render={({ field }) => (
                    <select {...field} className={inputCls}>
                      <option value="US_HOURS">US Hours</option>
                      <option value="INDIA_SHIFT">India Shift</option>
                      <option value="GENERAL_SHIFT">General Shift</option>
                    </select>
                  )}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select {...field} className={inputCls}>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.label}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div>
              <label className={labelCls}>Must Have Requirements</label>
              <textarea {...register("mustHaveRequirements")} className={`${inputCls} h-auto py-2`} rows={3} placeholder="Key requirements..." />
            </div>

            <div>
              <label className={labelCls}>Nice To Have</label>
              <textarea {...register("niceToHave")} className={`${inputCls} h-auto py-2`} rows={2} placeholder="Preferred qualifications..." />
            </div>

            <div>
              <label className={labelCls}>Responsibilities</label>
              <textarea {...register("responsibilities")} className={`${inputCls} h-auto py-2`} rows={3} placeholder="Role responsibilities..." />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border">
            <button
              type="submit"
              disabled={createJob.isPending}
              className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast disabled:opacity-50"
            >
              {createJob.isPending ? "Creating…" : "Create Job"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
