import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  const {
    register, handleSubmit, control, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", email: "", phone: "", title: "", source: "",
      shiftAvailability: "REGULAR", communicationRating: "GOOD",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await create.mutateAsync(data);
      toast({ title: "Candidate added", description: `${data.name} has been created.` });
      reset();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const inputCls = "w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-fast";
  const labelCls = "block text-sm font-medium text-foreground mb-1";
  const errorCls = "text-xs text-destructive mt-0.5";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-semibold">Add Candidate</SheetTitle>
          <SheetDescription className="sr-only">Create a new candidate</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-4 space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input {...register("name")} className={inputCls} placeholder="Full name" />
              {errors.name && <p className={errorCls}>{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input {...register("email")} type="email" className={inputCls} placeholder="email@example.com" />
              {errors.email && <p className={errorCls}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input {...register("phone")} className={inputCls} placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input {...register("title")} className={inputCls} placeholder="e.g. Senior React Developer" />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <input {...register("source")} className={inputCls} placeholder="e.g. LinkedIn, Referral" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Shift Availability</label>
                <Controller
                  control={control}
                  name="shiftAvailability"
                  render={({ field }) => (
                    <select {...field} className={inputCls}>
                      <option value="REGULAR">Regular</option>
                      <option value="US_SHIFT">US Shift</option>
                      <option value="BOTH">Both</option>
                    </select>
                  )}
                />
              </div>
              <div>
                <label className={labelCls}>Communication</label>
                <Controller
                  control={control}
                  name="communicationRating"
                  render={({ field }) => (
                    <select {...field} className={inputCls}>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="AVERAGE">Average</option>
                      <option value="POOR">Poor</option>
                    </select>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border">
            <button
              type="submit"
              disabled={create.isPending}
              className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-fast disabled:opacity-50"
            >
              {create.isPending ? "Adding…" : "Add Candidate"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
