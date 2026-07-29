import { AlertTriangle } from "lucide-react";
import { sumGoalPercentages } from "@/lib/finance";
import type { Goal } from "@/types";

export function GoalsPercentageBanner({ goals }: { goals: Goal[] }) {
  const total = sumGoalPercentages(goals);
  const isValid = Math.abs(total - 100) < 0.01;

  if (isValid) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      חלוקת היעדים צריכה להסתכם ב־100% (כרגע {total.toFixed(1)}%)
    </div>
  );
}
