import { BarChart3 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Reports() {
  usePageTitle("Reports");
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-0px)]">
      <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}
