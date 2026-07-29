import { useState, type DragEvent } from "react";
import { CheckCircle2, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { goalProgressPercentage, isGoalCompleted } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppDataContext";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  monthlyAllocation: number;
  isAllocatedThisMonth: boolean;
  onToggleAllocated: (goal: Goal, allocated: boolean) => void;
  onEdit: (goal: Goal) => void;
  dragHandlers: {
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDrop: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    isDragging: boolean;
  };
}

export function GoalCard({
  goal,
  monthlyAllocation,
  isAllocatedThisMonth,
  onToggleAllocated,
  onEdit,
  dragHandlers,
}: GoalCardProps) {
  const { deleteGoal } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const progress = goalProgressPercentage(goal);
  const completed = isGoalCompleted(goal);
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

  return (
    <Card
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
      onDragEnd={dragHandlers.onDragEnd}
      className={cn(
        "transition-all",
        dragHandlers.isDragging && "opacity-50",
        completed && "border-success/40 bg-success/5"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 cursor-grab touch-none text-muted-foreground/50 active:cursor-grabbing"
            aria-label="גרירה לשינוי סדר"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">{goal.name}</p>
              {completed && (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success animate-scale-in">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  הושלם!
                </span>
              )}
              <span className="text-xs font-medium text-muted-foreground">{goal.percentage}% מקרן היעדים</span>
            </div>

            <div className="mt-2.5">
              <Progress value={progress} indicatorColor={goal.color} className="h-2.5" />
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
                <span>
                  {formatCurrency(goal.savedAmount)} מתוך {formatCurrency(goal.targetAmount)} ({progress.toFixed(0)}%)
                </span>
                <span>{completed ? "היעד הושג במלואו" : `נותרו ${formatCurrency(remaining)}`}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>הפרשה חודשית: {formatCurrency(monthlyAllocation)}</span>
              {goal.targetDate && <span>יעד לתאריך: {formatDate(goal.targetDate)}</span>}
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold">{isAllocatedThisMonth ? "הופרש בפועל החודש" : "עדיין לא הופרש החודש"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isAllocatedThisMonth
                    ? `נוסף ${formatCurrency(monthlyAllocation)} ל"כבר נחסך"`
                    : `סמני כשתעבירי בפועל ${formatCurrency(monthlyAllocation)}`}
                </p>
              </div>
              <Switch
                checked={isAllocatedThisMonth}
                onCheckedChange={(checked) => onToggleAllocated(goal, checked)}
                disabled={monthlyAllocation <= 0}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)} aria-label="עריכת יעד">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              aria-label="מחיקת יעד"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת יעד</AlertDialogTitle>
            <AlertDialogDescription>האם למחוק את היעד ״{goal.name}״? פעולה זו אינה הפיכה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => deleteGoal(goal.id)}>מחיקה</AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
