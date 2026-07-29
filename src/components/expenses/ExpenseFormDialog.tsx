import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/context/AppDataContext";
import { todayIso } from "@/lib/format";
import type { Expense, ExpenseInput } from "@/types";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

function buildInitialState(expense: Expense | null | undefined): ExpenseInput {
  if (expense) {
    const { id, createdAt, updatedAt, ...rest } = expense;
    return rest;
  }
  return {
    date: todayIso(),
    name: "",
    amount: 0,
    notes: "",
  };
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const { addExpense, updateExpense } = useAppData();
  const [form, setForm] = useState<ExpenseInput>(() => buildInitialState(expense));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(expense));
      setError(null);
    }
  }, [open, expense]);

  const isEdit = Boolean(expense);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("יש להזין שם הוצאה");
      return;
    }
    if (!form.date) {
      setError("יש לבחור תאריך");
      return;
    }
    if (!Number.isFinite(form.amount) || form.amount <= 0) {
      setError("סכום ההוצאה חייב להיות מספר חיובי גדול מאפס");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && expense) {
        await updateExpense(expense.id, form);
      } else {
        await addExpense(form);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת הוצאה" : "הוספת הוצאה חדשה"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">תאריך</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">סכום (₪)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={Number.isFinite(form.amount) ? form.amount : ""}
                onChange={(e) => setForm({ ...form, amount: Math.max(0, Number(e.target.value)) })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">שם ההוצאה</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="לדוגמה: ביטוח לאומי"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {isEdit ? "שמירת שינויים" : "הוספת הוצאה"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
