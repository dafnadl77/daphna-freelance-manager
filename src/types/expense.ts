export interface Expense {
  id: string;
  date: string; // ISO date string, e.g. "2026-07-15" — which month this expense belongs to
  name: string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;
