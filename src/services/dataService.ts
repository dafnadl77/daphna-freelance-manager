/**
 * High-level data access API. Every screen talks to the app's data through
 * this module instead of touching storageService/localStorage directly.
 * Methods are async on purpose: today they resolve synchronously against
 * localStorage, but the same call sites will keep working unchanged once
 * this file is rewritten against Supabase (see README "מעבר ל-Lovable ול-Supabase").
 */
import { getItem, setItem } from "./storageService";
import { getDefaultGoals, getSeedIncome } from "./seedData";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { BACKUP_VERSION } from "@/types/backup";
import type { AppSettings, BackupData, Goal, GoalInput, Income, IncomeInput } from "@/types";

const KEYS = {
  incomes: "incomes",
  goals: "goals",
  settings: "settings",
  seeded: "seeded",
} as const;

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function ensureSeeded(): void {
  const seeded = getItem<boolean>(KEYS.seeded, false);
  if (seeded) return;
  setItem<Goal[]>(KEYS.goals, getDefaultGoals());
  setItem<Income[]>(KEYS.incomes, [getSeedIncome()]);
  setItem<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
  setItem<boolean>(KEYS.seeded, true);
}

ensureSeeded();

function readIncomes(): Income[] {
  return getItem<Income[]>(KEYS.incomes, []);
}
function writeIncomes(incomes: Income[]): void {
  setItem(KEYS.incomes, incomes);
}
function readGoals(): Goal[] {
  return getItem<Goal[]>(KEYS.goals, []).sort((a, b) => a.order - b.order);
}
function writeGoals(goals: Goal[]): void {
  setItem(KEYS.goals, goals);
}

export const dataService = {
  // ----- Incomes -----
  async getIncomes(): Promise<Income[]> {
    return readIncomes();
  },

  async addIncome(input: IncomeInput): Promise<Income> {
    const income: Income = {
      ...input,
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    writeIncomes([income, ...readIncomes()]);
    return income;
  },

  async updateIncome(id: string, patch: Partial<IncomeInput>): Promise<Income | null> {
    const incomes = readIncomes();
    let updated: Income | null = null;
    const next = incomes.map((income) => {
      if (income.id !== id) return income;
      updated = { ...income, ...patch, updatedAt: nowIso() };
      return updated;
    });
    writeIncomes(next);
    return updated;
  },

  async deleteIncome(id: string): Promise<void> {
    writeIncomes(readIncomes().filter((income) => income.id !== id));
  },

  async duplicateIncome(id: string): Promise<Income | null> {
    const incomes = readIncomes();
    const source = incomes.find((income) => income.id === id);
    if (!source) return null;
    const clone: Income = {
      ...source,
      id: generateId(),
      status: "pending",
      isSample: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    writeIncomes([clone, ...incomes]);
    return clone;
  },

  async clearSampleData(): Promise<void> {
    writeIncomes(readIncomes().filter((income) => !income.isSample));
  },

  // ----- Goals -----
  async getGoals(): Promise<Goal[]> {
    return readGoals();
  },

  async addGoal(input: GoalInput): Promise<Goal> {
    const goals = readGoals();
    const goal: Goal = {
      ...input,
      id: generateId(),
      order: goals.length,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    writeGoals([...goals, goal]);
    return goal;
  },

  async updateGoal(id: string, patch: Partial<GoalInput>): Promise<Goal | null> {
    const goals = readGoals();
    let updated: Goal | null = null;
    const next = goals.map((goal) => {
      if (goal.id !== id) return goal;
      updated = { ...goal, ...patch, updatedAt: nowIso() };
      return updated;
    });
    writeGoals(next);
    return updated;
  },

  async deleteGoal(id: string): Promise<void> {
    writeGoals(readGoals().filter((goal) => goal.id !== id));
  },

  async reorderGoals(orderedIds: string[]): Promise<Goal[]> {
    const goals = readGoals();
    const byId = new Map(goals.map((g) => [g.id, g]));
    const reordered = orderedIds
      .map((id, index) => {
        const goal = byId.get(id);
        return goal ? { ...goal, order: index, updatedAt: nowIso() } : null;
      })
      .filter((g): g is Goal => g !== null);
    writeGoals(reordered);
    return reordered;
  },

  // ----- Settings -----
  async getSettings(): Promise<AppSettings> {
    return getItem<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
  },

  async updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await dataService.getSettings();
    const next = { ...current, ...patch };
    setItem(KEYS.settings, next);
    return next;
  },

  async resetSettings(): Promise<AppSettings> {
    setItem(KEYS.settings, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  // ----- Backup / export / import -----
  async exportBackup(): Promise<BackupData> {
    const [incomes, goals, settings] = await Promise.all([
      dataService.getIncomes(),
      dataService.getGoals(),
      dataService.getSettings(),
    ]);
    return {
      version: BACKUP_VERSION,
      exportedAt: nowIso(),
      incomes,
      goals,
      settings,
    };
  },

  async importBackup(data: BackupData): Promise<void> {
    writeIncomes(data.incomes);
    writeGoals(data.goals);
    setItem(KEYS.settings, data.settings);
    setItem(KEYS.seeded, true);
  },
};

export function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<BackupData>;
  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.incomes) &&
    Array.isArray(candidate.goals) &&
    typeof candidate.settings === "object" &&
    candidate.settings !== null
  );
}
