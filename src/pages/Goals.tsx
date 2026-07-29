import { useMemo, useRef, useState, type DragEvent } from "react";
import { Plus, Target } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { GoalsPercentageBanner } from "@/components/goals/GoalsPercentageBanner";
import { GoalCelebration } from "@/components/goals/GoalCelebration";
import { computeGoalAllocations, computeMonthlySummary, toMonthKey } from "@/lib/finance";
import type { Goal } from "@/types";

export function Goals() {
  const { goals, incomes, settings, reorderGoals } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [celebrating, setCelebrating] = useState<Goal | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sortedGoals = useMemo(() => [...goals].sort((a, b) => a.order - b.order), [goals]);

  const currentMonthSummary = useMemo(
    () => computeMonthlySummary(incomes, settings, toMonthKey(new Date())),
    [incomes, settings]
  );
  const allocations = computeGoalAllocations(currentMonthSummary.goalsFund, sortedGoals);

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  function openAdd() {
    setEditingGoal(null);
    setFormOpen(true);
  }

  function handleDragStart(index: number) {
    return (e: DragEvent<HTMLDivElement>) => {
      dragIndex.current = index;
      setDraggingId(sortedGoals[index].id);
      e.dataTransfer.effectAllowed = "move";
    };
  }

  function handleDragOver(index: number) {
    return (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (dragIndex.current === null || dragIndex.current === index) return;
      const next = [...sortedGoals];
      const [moved] = next.splice(dragIndex.current, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      reorderGoals(next.map((g) => g.id));
    };
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setDraggingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">היעדים שלי</h1>
          <p className="text-sm text-muted-foreground">גררי כדי לשנות סדר עדיפויות</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          הוספת יעד
        </Button>
      </div>

      <GoalsPercentageBanner goals={goals} />

      {sortedGoals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Target className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">עדיין אין יעדים</p>
          <p className="max-w-xs text-sm text-muted-foreground">הוסיפי יעד ראשון כדי להתחיל לחסוך</p>
          <Button onClick={openAdd} className="mt-2">
            <Plus className="h-4 w-4" />
            הוספת יעד
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGoals.map((goal, index) => (
            <div key={goal.id} onDragOver={handleDragOver(index)} onDrop={handleDrop}>
              <GoalCard
                goal={goal}
                monthlyAllocation={allocations.find((a) => a.goalId === goal.id)?.amount ?? 0}
                onEdit={openEdit}
                dragHandlers={{
                  onDragStart: handleDragStart(index),
                  onDragOver: handleDragOver(index),
                  onDrop: handleDrop,
                  onDragEnd: handleDragEnd,
                  isDragging: draggingId === goal.id,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <GoalFormDialog open={formOpen} onOpenChange={setFormOpen} goal={editingGoal} onCompleted={setCelebrating} />
      {celebrating && <GoalCelebration goal={celebrating} onClose={() => setCelebrating(null)} />}
    </div>
  );
}
