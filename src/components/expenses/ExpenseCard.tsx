import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAppData } from "@/context/AppDataContext";
import type { Expense } from "@/types";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
}

export function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  const { deleteExpense } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">{expense.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(expense.date)}</p>
          {expense.notes && <p className="mt-1 text-xs text-muted-foreground">הערה: {expense.notes}</p>}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg font-extrabold text-warning">{formatCurrency(expense.amount)}</p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(expense)} aria-label="עריכת הוצאה">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
            aria-label="מחיקת הוצאה"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת הוצאה</AlertDialogTitle>
            <AlertDialogDescription>האם למחוק את ההוצאה ״{expense.name}״? פעולה זו אינה הפיכה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => deleteExpense(expense.id)}>מחיקה</AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
