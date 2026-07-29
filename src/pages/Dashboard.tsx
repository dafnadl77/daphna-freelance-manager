import { useMemo, useState } from "react";
import { Plus, Receipt, TrendingDown, Landmark, PiggyBank, ReceiptText, Target, Wallet } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { Greeting } from "@/components/dashboard/Greeting";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AllocationPieChart } from "@/components/dashboard/AllocationPieChart";
import { MonthlyIncomeChart } from "@/components/dashboard/MonthlyIncomeChart";
import { GoalsOverview } from "@/components/dashboard/GoalsOverview";
import { MotivationalMessage } from "@/components/dashboard/MotivationalMessage";
import { Button } from "@/components/ui/button";
import { IncomeFormDialog } from "@/components/incomes/IncomeFormDialog";
import { computeMonthlySummary, toMonthKey } from "@/lib/finance";
import type { ScreenId } from "@/components/layout/nav-items";

interface DashboardProps {
  onNavigate: (screen: ScreenId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { incomes, expenses, goals, settings } = useAppData();
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const [formOpen, setFormOpen] = useState(false);

  const summary = useMemo(
    () => computeMonthlySummary(incomes, expenses, settings, month),
    [incomes, expenses, settings, month]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Greeting />
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <MotivationalMessage summary={summary} goals={goals} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="הכנסות לפני מע״מ" amount={summary.totalIncome} icon={Receipt} />
        <SummaryCard label="מע״מ שנגבה (למעקב)" amount={summary.vatCollected} icon={TrendingDown} tone="muted" />
        <SummaryCard label="תשלום למטה" amount={summary.totalOrganizationFees} icon={Landmark} tone="warning" />
        <SummaryCard label="מס הכנסה משוער" amount={summary.totalIncomeTax} icon={Landmark} tone="warning" />
        <SummaryCard label="רזרבה לעסק" amount={summary.totalBusinessReserve} icon={PiggyBank} tone="warning" />
        <SummaryCard label="הפרשה ליעדים" amount={summary.goalsFund} icon={Target} />
        <SummaryCard label="הפרשה לבית" amount={summary.personalNet} icon={Wallet} tone="muted" />
        <SummaryCard label="הוצאות" amount={summary.totalExpenses} icon={ReceiptText} tone="warning" />
      </div>

      <SummaryCard
        label="נשאר למחיה בפועל"
        amount={summary.personalNetAfterExpenses}
        icon={Wallet}
        tone="success"
        emphasize
        helper="הפרשה לבית פחות ההוצאות החודשיות"
      />

      <Button size="lg" className="w-full sm:w-auto" onClick={() => setFormOpen(true)}>
        <Plus className="h-5 w-5" />
        הוספת הכנסה חדשה
      </Button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AllocationPieChart summary={summary} />
        <MonthlyIncomeChart incomes={incomes} expenses={expenses} settings={settings} centerMonth={month} />
      </div>

      <GoalsOverview goals={goals} goalsFund={summary.goalsFund} />

      <div className="flex justify-center">
        <Button variant="link" onClick={() => onNavigate("incomes")}>
          לצפייה בכל ההכנסות
        </Button>
      </div>

      <IncomeFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
