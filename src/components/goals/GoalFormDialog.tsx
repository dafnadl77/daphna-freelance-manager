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
import { useAppData } from "@/context/AppDataContext";
import { isGoalCompleted } from "@/lib/finance";
import type { Goal, GoalInput } from "@/types";

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onCompleted?: (goal: Goal) => void;
}

const PALETTE = ["#7C3AED", "#EC4899", "#F97316", "#10B981", "#0EA5E9", "#F59E0B", "#EF4444", "#14B8A6"];

function buildInitialState(goal: Goal | null | undefined, order: number): GoalInput {
  if (goal) {
    const { id, createdAt, updatedAt, ...rest } = goal;
    return rest;
  }
  return {
    name: "",
    icon: "🎯",
    percentage: 0,
    targetAmount: 0,
    savedAmount: 0,
    targetDate: null,
    color: PALETTE[order % PALETTE.length],
    order,
  };
}

export function GoalFormDialog({ open, onOpenChange, goal, onCompleted }: GoalFormDialogProps) {
  const { goals, addGoal, updateGoal } = useAppData();
  const [form, setForm] = useState<GoalInput>(() => buildInitialState(goal, goals.length));
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(goal);

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(goal, goals.length));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("יש להזין שם ליעד");
      return;
    }
    if (form.percentage < 0 || form.percentage > 100) {
      setError("האחוז חייב להיות בין 0 ל-100");
      return;
    }
    if (form.targetAmount < 0 || form.savedAmount < 0) {
      setError("לא ניתן להזין סכומים שליליים");
      return;
    }

    const wasCompleted = goal ? isGoalCompleted(goal) : false;

    if (isEdit && goal) {
      await updateGoal(goal.id, form);
      const updated: Goal = { ...goal, ...form };
      if (!wasCompleted && isGoalCompleted(updated)) onCompleted?.(updated);
    } else {
      await addGoal(form);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת יעד" : "יעד חדש"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="icon">אייקון</Label>
              <Input id="icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4} className="text-center text-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">שם היעד</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="לדוגמה: חופשה ביוון" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="percentage">אחוז מקרן היעדים</Label>
              <Input
                id="percentage"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetDate">תאריך יעד (אופציונלי)</Label>
              <Input
                id="targetDate"
                type="date"
                value={form.targetDate ?? ""}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value || null })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetAmount">סכום מטרה (₪)</Label>
              <Input
                id="targetAmount"
                type="number"
                min={0}
                step="1"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: Math.max(0, Number(e.target.value)) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="savedAmount">כבר נחסך (₪)</Label>
              <Input
                id="savedAmount"
                type="number"
                min={0}
                step="1"
                value={form.savedAmount}
                onChange={(e) => setForm({ ...form, savedAmount: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>צבע</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className="h-8 w-8 rounded-full ring-offset-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: color, boxShadow: form.color === color ? `0 0 0 2px ${color}` : undefined }}
                  aria-label={`בחירת צבע ${color}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit">{isEdit ? "שמירת שינויים" : "הוספת יעד"}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
