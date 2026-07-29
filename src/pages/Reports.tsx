import { useMemo, useState } from "react";
import { Award, Users } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AllocationPieChart } from "@/components/dashboard/AllocationPieChart";
import { YearlyChart } from "@/components/reports/YearlyChart";
import { ExportImportPanel } from "@/components/reports/ExportImportPanel";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import {
  averageMonthlyIncome,
  computeGoalAllocations,
  computeMonthlySummary,
  computeYearlySummary,
  getAvailableYears,
  shiftMonthKey,
  toMonthKey,
  topClientsByIncome,
  topProjectsByIncome,
} from "@/lib/finance";
import { Receipt, Landmark, ShieldCheck, PiggyBank, Target, Wallet, Clock3 } from "lucide-react";

export function Reports() {
  const { incomes, goals, settings } = useAppData();
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const years = useMemo(() => getAvailableYears(incomes), [incomes]);
  const [year, setYear] = useState(() => new Date().getFullYear());

  const monthlySummary = useMemo(() => computeMonthlySummary(incomes, settings, month), [incomes, settings, month]);
  const yearlySummary = useMemo(() => computeYearlySummary(incomes, settings, year), [incomes, settings, year]);
  const summary = tab === "monthly" ? monthlySummary : yearlySummary;

  const topClients = useMemo(() => topClientsByIncome(incomes).slice(0, 3), [incomes]);
  const topProjects = useMemo(() => topProjectsByIncome(incomes).slice(0, 3), [incomes]);

  const last6Months = useMemo(() => Array.from({ length: 6 }, (_, i) => shiftMonthKey(month, -(5 - i))), [month]);
  const avgMonthly = useMemo(() => averageMonthlyIncome(incomes, settings, last6Months), [incomes, settings, last6Months]);

  const goalAllocations = computeGoalAllocations(summary.goalsFund, goals);

  const totalObligations =
    summary.totalOrganizationFees + summary.totalIncomeTax + summary.totalBusinessReserve + summary.nationalInsurance;
  const obligationsRatio = summary.totalIncome > 0 ? (totalObligations / summary.totalIncome) * 100 : 0;
  const personalRatio = summary.totalIncome > 0 ? (summary.personalNet / summary.totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">דוחות</h1>
        <p className="text-sm text-muted-foreground">תמונת מצב לפי חודש או שנה</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "monthly" | "yearly")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="monthly">חודשי</TabsTrigger>
            <TabsTrigger value="yearly">שנתי</TabsTrigger>
          </TabsList>

          {tab === "monthly" ? (
            <MonthPicker value={month} onChange={setMonth} />
          ) : (
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="monthly" className="space-y-6">
          <ReportStats summary={monthlySummary} avgMonthly={avgMonthly} label={formatMonthLabel(month)} />
        </TabsContent>
        <TabsContent value="yearly" className="space-y-6">
          <ReportStats summary={yearlySummary} avgMonthly={avgMonthly} label={String(year)} />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AllocationPieChart summary={summary} />
        <YearlyChart incomes={incomes} settings={settings} year={tab === "monthly" ? Number(month.slice(0, 4)) : year} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              הלקוחות המובילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">אין עדיין נתונים</p>
            ) : (
              <ul className="space-y-2.5">
                {topClients.map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {i + 1}. {c.name}
                    </span>
                    <span className="font-bold text-primary">{formatCurrency(c.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              הפרויקטים הרווחיים ביותר
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">אין עדיין נתונים</p>
            ) : (
              <ul className="space-y-2.5">
                {topProjects.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {i + 1}. {p.name}
                    </span>
                    <span className="font-bold text-primary">{formatCurrency(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הפרשה ליעדים</CardTitle>
        </CardHeader>
        <CardContent>
          {goalAllocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין יעדים מוגדרים</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {goalAllocations.map((a) => (
                <li key={a.goalId} className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm">
                  <span className="font-medium">{a.goalName}</span>
                  <span className="font-bold text-primary">{formatCurrency(a.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>יחס בין התחייבויות לנטו אישי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
            <div className="bg-warning" style={{ width: `${obligationsRatio}%` }} />
            <div className="bg-success" style={{ width: `${personalRatio}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>התחייבויות: {obligationsRatio.toFixed(0)}%</span>
            <span>נטו אישי: {personalRatio.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      <ExportImportPanel />
    </div>
  );
}

function ReportStats({
  summary,
  avgMonthly,
  label,
}: {
  summary: ReturnType<typeof computeMonthlySummary>;
  avgMonthly: number;
  label: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label={`סך הכנסות — ${label}`} amount={summary.totalIncome} icon={Receipt} />
      <SummaryCard label="הכנסות שהתקבלו" amount={summary.receivedIncome} icon={Receipt} tone="success" />
      <SummaryCard label="הכנסות ממתינות" amount={summary.pendingIncome} icon={Clock3} tone="warning" />
      <SummaryCard label="ממוצע חודשי (6 חודשים)" amount={avgMonthly} icon={Receipt} tone="muted" />
      <SummaryCard label="תשלום למטה" amount={summary.totalOrganizationFees} icon={Landmark} tone="warning" />
      <SummaryCard label="מס הכנסה משוער" amount={summary.totalIncomeTax} icon={Landmark} tone="warning" />
      <SummaryCard label="רזרבה לעסק" amount={summary.totalBusinessReserve} icon={PiggyBank} tone="warning" />
      <SummaryCard label="ביטוח לאומי" amount={summary.nationalInsurance} icon={ShieldCheck} tone="warning" />
      <SummaryCard label="הפרשה ליעדים" amount={summary.goalsFund} icon={Target} />
      <SummaryCard label="נטו למחיה" amount={summary.personalNet} icon={Wallet} tone="success" emphasize />
    </div>
  );
}
