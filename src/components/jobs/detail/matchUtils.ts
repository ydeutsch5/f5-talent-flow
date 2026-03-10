import type { Match } from "@/hooks/useMatches";
import type { CandidateStatus } from "@/hooks/useCandidateStatuses";

export function getMatchColor(pct: number | null) {
  if (pct == null) return { bg: "#f3f4f6", text: "#6b7280", label: "—" };
  if (pct >= 75) return { bg: "#dcfce7", text: "#15803d", label: "Strong" };
  if (pct >= 50) return { bg: "#dbeafe", text: "#1d4ed8", label: "Good" };
  if (pct >= 25) return { bg: "#fef3c7", text: "#d97706", label: "Possible" };
  return { bg: "#fee2e2", text: "#dc2626", label: "Weak" };
}

export function getCommColor(rating: string | null) {
  switch (rating) {
    case "EXCELLENT": return { bg: "#dcfce7", text: "#15803d" };
    case "GOOD":      return { bg: "#dbeafe", text: "#1d4ed8" };
    case "AVERAGE":   return { bg: "#fef3c7", text: "#d97706" };
    case "POOR":      return { bg: "#fee2e2", text: "#dc2626" };
    default:          return { bg: "#f3f4f6", text: "#6b7280" };
  }
}

export const COMM_OPTIONS = ["EXCELLENT", "GOOD", "AVERAGE", "POOR"] as const;

export function commLabel(r: string | null) {
  if (!r) return "—";
  return r.charAt(0) + r.slice(1).toLowerCase();
}
