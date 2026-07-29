import { useMemo } from "react";
import { PartyPopper } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { computeGoalAllocations } from "@/lib/finance";
import type { Goal, MonthlySummary } from "@/types";

interface MotivationalMessageProps {
  summary: MonthlySummary;
  goals: Goal[];
}

export function MotivationalMessage({ summary, goals }: MotivationalMessageProps) {
  const message = useMemo(() => {
    if (summary.incomeCount === 0) {
      return "עדיין אין הכנסות בחודש הזה — בואי נוסיף את הראשונה!";
    }

    const allocations = computeGoalAllocations(summary.goalsFund, goals);
    const topAllocation = [...allocations].sort((a, b) => b.amount - a.amount)[0];

    const templates: string[] = [];
    if (topAllocation && topAllocation.amount > 0) {
      templates.push(`איזה כיף, החודש קידמת את ${topAllocation.goalName} בעוד ${formatCurrency(topAllocation.amount)}`);
    }
    if (summary.personalNet > 0) {
      templates.push(`החודש נשארו לך ${formatCurrency(summary.personalNet)} למחיה`);
    }
    templates.push("את בדרך הנכונה ליעד הבא שלך");

    const index = (summary.incomeCount + Math.floor(summary.personalNet)) % templates.length;
    return templates[index];
  }, [summary, goals]);

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
      <PartyPopper className="h-4 w-4 shrink-0 text-primary" />
      {message}
    </div>
  );
}
