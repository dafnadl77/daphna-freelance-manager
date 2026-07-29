import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { computeGoalAllocations, goalProgressPercentage } from "@/lib/finance";
import type { Goal } from "@/types";
import { Target } from "lucide-react";

interface GoalsOverviewProps {
  goals: Goal[];
  goalsFund: number;
}

export function GoalsOverview({ goals, goalsFund }: GoalsOverviewProps) {
  const allocations = computeGoalAllocations(goalsFund, goals);
  const sortedGoals = [...goals].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle>היעדים שלי</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {sortedGoals.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <Target className="h-8 w-8 text-muted-foreground/50" />
            עדיין לא הוגדרו יעדים
          </div>
        )}
        {sortedGoals.map((goal) => {
          const allocation = allocations.find((a) => a.goalId === goal.id)?.amount ?? 0;
          const progress = goalProgressPercentage(goal);
          return (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-lg leading-none">{goal.icon}</span>
                  {goal.name}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                </span>
              </div>
              <Progress value={progress} indicatorColor={goal.color} className="h-2" />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.toFixed(0)}% הושלם</span>
                <span>+{formatCurrency(allocation)} החודש</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
