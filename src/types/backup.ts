import type { Income } from "./income";
import type { Expense } from "./expense";
import type { Goal } from "./goal";
import type { AppSettings } from "./settings";

export const BACKUP_VERSION = 2;

export interface BackupData {
  version: number;
  exportedAt: string;
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  settings: AppSettings;
}
