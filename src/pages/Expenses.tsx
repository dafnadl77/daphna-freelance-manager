import { useMemo, useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import { formatCurrency } from "@/lib/format";
import { getExpensesForMonth, toMonthKey } from "@/lib/finance";
import type { Expense } from "@/types";

export function Expenses() {
  const { expenses } = useAppData();
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthExpenses = useMemo(
    () => getExpensesForMonth(expenses, month).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, month]
  );
  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  function openAdd() {
    setEditingExpense(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">הוצאות</h1>
          <p className="text-sm text-muted-foreground">הוצאות חודשיות גלובליות, כמו ביטוח לאומי, שכירות או ביטוחים</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <p className="text-sm font-medium text-muted-foreground">סה״כ הוצאות החודש</p>
          <p className="text-xl font-extrabold text-warning">{formatCurrency(total)}</p>
        </CardContent>
      </Card>

      <Button onClick={openAdd}>
        <Plus className="h-4 w-4" />
        הוספת הוצאה חדשה
      </Button>

      {monthExpenses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">אין הוצאות מוגדרות לחודש זה</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            הוסיפי כאן הוצאות קבועות כמו ביטוח לאומי, שכירות או מנויים, כדי לראות כמה באמת נשאר לך בסוף החודש
          </p>
          <Button onClick={openAdd} className="mt-2">
            <Plus className="h-4 w-4" />
            הוספת הוצאה ראשונה
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {monthExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} onEdit={openEdit} />
          ))}
        </div>
      )}

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} expense={editingExpense} />
    </div>
  );
}
