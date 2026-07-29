import { useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Button } from "@/components/ui/button";
import { IncomeFilters, type IncomeFiltersState } from "@/components/incomes/IncomeFilters";
import { IncomeCard } from "@/components/incomes/IncomeCard";
import { IncomeFormDialog } from "@/components/incomes/IncomeFormDialog";
import { toMonthKey } from "@/lib/finance";
import type { Income } from "@/types";

const initialFilters: IncomeFiltersState = { search: "", month: "all", status: "all", client: "all" };

export function Incomes() {
  const { incomes } = useAppData();
  const [filters, setFilters] = useState<IncomeFiltersState>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const months = useMemo(
    () => Array.from(new Set(incomes.map((i) => toMonthKey(i.date)))).sort().reverse(),
    [incomes]
  );
  const clients = useMemo(
    () => Array.from(new Set(incomes.map((i) => i.clientName).filter(Boolean))).sort(),
    [incomes]
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return incomes.filter((income) => {
      if (filters.month !== "all" && toMonthKey(income.date) !== filters.month) return false;
      if (filters.status !== "all" && income.status !== filters.status) return false;
      if (filters.client !== "all" && income.clientName !== filters.client) return false;
      if (search) {
        const haystack = `${income.clientName} ${income.projectName} ${income.notes}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [incomes, filters]);

  const received = filtered.filter((i) => i.status === "received").sort((a, b) => b.date.localeCompare(a.date));
  const pending = filtered.filter((i) => i.status === "pending").sort((a, b) => b.date.localeCompare(a.date));
  const cancelled = filtered.filter((i) => i.status === "cancelled").sort((a, b) => b.date.localeCompare(a.date));

  function openEdit(income: Income) {
    setEditingIncome(income);
    setFormOpen(true);
  }

  function openAdd() {
    setEditingIncome(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">הכנסות</h1>
          <p className="text-sm text-muted-foreground">כל ההכנסות שלך במקום אחד</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          הוספת הכנסה חדשה
        </Button>
      </div>

      <IncomeFilters filters={filters} onChange={setFilters} months={months} clients={clients} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">לא נמצאו הכנסות</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {incomes.length === 0 ? "עדיין לא הוספת הכנסות. בואי נתחיל!" : "נסי לשנות את הסינון או החיפוש"}
          </p>
          <Button onClick={openAdd} className="mt-2">
            <Plus className="h-4 w-4" />
            הוספת הכנסה ראשונה
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {received.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground">התקבלו ({received.length})</h2>
              <div className="space-y-3">
                {received.map((income) => (
                  <IncomeCard key={income.id} income={income} onEdit={openEdit} />
                ))}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground">ממתינות ({pending.length})</h2>
              <div className="space-y-3">
                {pending.map((income) => (
                  <IncomeCard key={income.id} income={income} onEdit={openEdit} />
                ))}
              </div>
            </section>
          )}

          {cancelled.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground">בוטלו ({cancelled.length})</h2>
              <div className="space-y-3">
                {cancelled.map((income) => (
                  <IncomeCard key={income.id} income={income} onEdit={openEdit} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <IncomeFormDialog open={formOpen} onOpenChange={setFormOpen} income={editingIncome} />
    </div>
  );
}
