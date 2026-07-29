export interface Goal {
  id: string;
  name: string;
  icon: string; // emoji
  percentage: number; // share of the goals fund, 0-100
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null; // ISO date string or null
  color: string; // hex color for charts/progress
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type GoalInput = Omit<Goal, "id" | "createdAt" | "updatedAt">;
