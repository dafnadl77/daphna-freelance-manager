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
  /** "YYYY-MM" of the last month whose computed allocation was actually
   * transferred into savedAmount. Resets (mismatches) at the start of a new month. */
  lastAllocatedMonth?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GoalInput = Omit<Goal, "id" | "createdAt" | "updatedAt">;
