import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { computeMonthlySummary } from "@/lib/finance";
import type { AppSettings, Expense, Income } from "@/types";

const MONTH_LABELS = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יונ׳", "יול׳", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];

export function YearlyChart({
  incomes,
  expenses,
  settings,
  year,
}: {
  incomes: Income[];
  expenses: Expense[];
  settings: AppSettings;
  year: number;
}) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`;
    const summary = computeMonthlySummary(incomes, expenses, settings, month);
    return {
      label: MONTH_LABELS[i],
      הכנסות: Math.round(summary.totalIncome),
      "נשאר למחיה": Math.round(summary.personalNetAfterExpenses),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>הכנסות לפי חודשים — {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ direction: "rtl", borderRadius: 12, border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="הכנסות" fill="#7C3AED" radius={[8, 8, 0, 0]} maxBarSize={26} />
              <Bar dataKey="נשאר למחיה" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
