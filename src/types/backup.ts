import type { Income } from "./income";
import type { Goal } from "./goal";
import type { AppSettings } from "./settings";

export const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  incomes: Income[];
  goals: Goal[];
  settings: AppSettings;
}
