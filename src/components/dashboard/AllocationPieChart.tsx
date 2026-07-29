import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { MonthlySummary } from "@/types";

interface AllocationPieChartProps {
  summary: MonthlySummary;
}

export function AllocationPieChart({ summary }: AllocationPieChartProps) {
  const data = [
    { name: "תשלום למטה", value: summary.totalOrganizationFees, color: "#FB923C" },
    { name: "מס הכנסה", value: summary.totalIncomeTax, color: "#F97316" },
    { name: "רזרבה לעסק", value: summary.totalBusinessReserve, color: "#F59E0B" },
    { name: "הוצאות", value: summary.totalExpenses, color: "#EF4444" },
    { name: "הפרשה ליעדים", value: summary.goalsFund, color: "#7C3AED" },
    { name: "נשאר למחיה", value: summary.personalNetAfterExpenses, color: "#10B981" },
  ].filter((d) => d.value > 0.01);

  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>חלוקת ההכנסה</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{ direction: "rtl", borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">אין עדיין נתונים להצגה בחודש זה</p>
        )}
        {hasData && (
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {data.map((d) => (
              <li key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate text-muted-foreground">{d.name}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
