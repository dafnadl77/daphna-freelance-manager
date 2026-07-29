import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

interface SummaryCardProps {
  label: string;
  amount: number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "muted";
  helper?: string;
  emphasize?: boolean;
}

const toneStyles: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  muted: "bg-muted text-muted-foreground",
};

export function SummaryCard({ label, amount, icon: Icon, tone = "default", helper, emphasize }: SummaryCardProps) {
  return (
    <Card
      className={cn(
        "transition-transform hover:-translate-y-0.5",
        emphasize && "border-success/40 bg-success/5 sm:col-span-2"
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1.5 truncate text-2xl font-extrabold",
              emphasize ? "text-success sm:text-3xl" : "text-foreground"
            )}
          >
            {formatCurrency(amount)}
          </p>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", toneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
