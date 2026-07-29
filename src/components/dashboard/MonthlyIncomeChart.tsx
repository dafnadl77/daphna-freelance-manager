import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { computeMonthlySummary, shiftMonthKey } from "@/lib/finance";
import type { AppSettings, Expense, Income } from "@/types";

interface MonthlyIncomeChartProps {
  incomes: Income[];
  expenses: Expense[];
  settings: AppSettings;
  centerMonth: string;
}

export function MonthlyIncomeChart({ incomes, expenses, settings, centerMonth }: MonthlyIncomeChartProps) {
  const months = Array.from({ length: 6 }, (_, i) => shiftMonthKey(centerMonth, -(5 - i)));
  const data = months.map((month) => {
    const summary = computeMonthlySummary(incomes, expenses, settings, month);
    return {
      month,
      label: formatMonthLabel(month).replace(" ", "\n"),
      הכנסות: Math.round(summary.totalIncome),
      "נשאר למחיה": Math.round(summary.personalNetAfterExpenses),
    };
  });

  const hasData = data.some((d) => d["הכנסות"] > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>הכנסות לפי חודשים</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ direction: "rtl", borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="הכנסות" fill="#7C3AED" radius={[8, 8, 0, 0]} maxBarSize={28} />
                <Bar dataKey="נשאר למחיה" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">עוד לא נצברו מספיק נתונים להצגת מגמה</p>
        )}
      </CardContent>
    </Card>
  );
}
