/**
 * High-level data access API. Every screen talks to the app's data through
 * this module instead of touching Supabase directly. All data lives in a
 * shared Supabase database (see README "מעבר ל-Supabase"), so it's the same
 * across every device and browser — nothing is stored locally anymore.
 */
import { supabase } from "./supabaseClient";
import { BACKUP_VERSION } from "@/types/backup";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { AppSettings, BackupData, Expense, ExpenseInput, Goal, GoalInput, Income, IncomeInput } from "@/types";

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("לא מחוברת למערכת");
  return data.user.id;
}

// ----- Row <-> app type mapping -----

interface IncomeRow {
  id: string;
  date: string;
  client_name: string;
  project_name: string;
  amount_before_vat: number;
  has_organization_fee: boolean;
  organization_fee_rate: number;
  status: Income["status"];
  notes: string;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
}

function incomeFromRow(row: IncomeRow): Income {
  return {
    id: row.id,
    date: row.date,
    clientName: row.client_name,
    projectName: row.project_name,
    amountBeforeVat: Number(row.amount_before_vat),
    hasOrganizationFee: row.has_organization_fee,
    organizationFeeRate: Number(row.organization_fee_rate),
    status: row.status,
    notes: row.notes,
    isSample: row.is_sample,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function incomeToRow(input: Partial<IncomeInput>): Partial<IncomeRow> {
  const row: Partial<IncomeRow> = {};
  if (input.date !== undefined) row.date = input.date;
  if (input.clientName !== undefined) row.client_name = input.clientName;
  if (input.projectName !== undefined) row.project_name = input.projectName;
  if (input.amountBeforeVat !== undefined) row.amount_before_vat = input.amountBeforeVat;
  if (input.hasOrganizationFee !== undefined) row.has_organization_fee = input.hasOrganizationFee;
  if (input.organizationFeeRate !== undefined) row.organization_fee_rate = input.organizationFeeRate;
  if (input.status !== undefined) row.status = input.status;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.isSample !== undefined) row.is_sample = input.isSample;
  return row;
}

interface GoalRow {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  color: string;
  goal_order: number;
  last_allocated_month: string | null;
  created_at: string;
  updated_at: string;
}

function goalFromRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    percentage: Number(row.percentage),
    targetAmount: Number(row.target_amount),
    savedAmount: Number(row.saved_amount),
    targetDate: row.target_date,
    color: row.color,
    order: row.goal_order,
    lastAllocatedMonth: row.last_allocated_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function goalToRow(input: Partial<GoalInput>): Partial<GoalRow> {
  const row: Partial<GoalRow> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.icon !== undefined) row.icon = input.icon;
  if (input.percentage !== undefined) row.percentage = input.percentage;
  if (input.targetAmount !== undefined) row.target_amount = input.targetAmount;
  if (input.savedAmount !== undefined) row.saved_amount = input.savedAmount;
  if (input.targetDate !== undefined) row.target_date = input.targetDate;
  if (input.color !== undefined) row.color = input.color;
  if (input.order !== undefined) row.goal_order = input.order;
  if (input.lastAllocatedMonth !== undefined) row.last_allocated_month = input.lastAllocatedMonth;
  return row;
}

interface SettingsRow {
  vat_rate: number;
  organization_fee_rate: number;
  income_tax_rate: number;
  business_reserve_rate: number;
  goals_rate: number;
  home_rate: number;
  include_pending_in_forecast: boolean;
  currency: AppSettings["currency"];
  number_format_locale: AppSettings["numberFormatLocale"];
}

function settingsFromRow(row: SettingsRow): AppSettings {
  return {
    vatRate: Number(row.vat_rate),
    organizationFeeRate: Number(row.organization_fee_rate),
    incomeTaxRate: Number(row.income_tax_rate),
    businessReserveRate: Number(row.business_reserve_rate),
    goalsRate: Number(row.goals_rate),
    homeRate: Number(row.home_rate),
    includePendingInForecast: row.include_pending_in_forecast,
    currency: row.currency,
    numberFormatLocale: row.number_format_locale,
  };
}

function settingsToRow(settings: AppSettings): SettingsRow {
  return {
    vat_rate: settings.vatRate,
    organization_fee_rate: settings.organizationFeeRate,
    income_tax_rate: settings.incomeTaxRate,
    business_reserve_rate: settings.businessReserveRate,
    goals_rate: settings.goalsRate,
    home_rate: settings.homeRate,
    include_pending_in_forecast: settings.includePendingInForecast,
    currency: settings.currency,
    number_format_locale: settings.numberFormatLocale,
  };
}

interface ExpenseRow {
  id: string;
  date: string;
  name: string;
  amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

function expenseFromRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    amount: Number(row.amount),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function expenseToRow(input: Partial<ExpenseInput>): Partial<ExpenseRow> {
  const row: Partial<ExpenseRow> = {};
  if (input.date !== undefined) row.date = input.date;
  if (input.name !== undefined) row.name = input.name;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.notes !== undefined) row.notes = input.notes;
  return row;
}

function throwIfError<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export const dataService = {
  // ----- Incomes -----
  async getIncomes(): Promise<Income[]> {
    const result = await supabase.from("incomes").select("*").order("date", { ascending: false });
    return throwIfError(result as { data: IncomeRow[]; error: { message: string } | null }).map(incomeFromRow);
  },

  async addIncome(input: IncomeInput): Promise<Income> {
    const row = { id: generateId(), ...incomeToRow(input) };
    const result = await supabase.from("incomes").insert(row).select().single();
    return incomeFromRow(throwIfError(result as { data: IncomeRow; error: { message: string } | null }));
  },

  async updateIncome(id: string, patch: Partial<IncomeInput>): Promise<Income | null> {
    const result = await supabase
      .from("incomes")
      .update({ ...incomeToRow(patch), updated_at: nowIso() })
      .eq("id", id)
      .select()
      .maybeSingle();
    const row = throwIfError(result as { data: IncomeRow | null; error: { message: string } | null });
    return row ? incomeFromRow(row) : null;
  },

  async deleteIncome(id: string): Promise<void> {
    const result = await supabase.from("incomes").delete().eq("id", id);
    throwIfError(result as { data: null; error: { message: string } | null });
  },

  async duplicateIncome(id: string): Promise<Income | null> {
    const existing = await supabase.from("incomes").select("*").eq("id", id).maybeSingle();
    const row = throwIfError(existing as { data: IncomeRow | null; error: { message: string } | null });
    if (!row) return null;
    const clone = {
      ...row,
      id: generateId(),
      status: "pending" as const,
      is_sample: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    const inserted = await supabase.from("incomes").insert(clone).select().single();
    return incomeFromRow(throwIfError(inserted as { data: IncomeRow; error: { message: string } | null }));
  },

  async clearSampleData(): Promise<void> {
    const result = await supabase.from("incomes").delete().eq("is_sample", true);
    throwIfError(result as { data: null; error: { message: string } | null });
  },

  // ----- Goals -----
  async getGoals(): Promise<Goal[]> {
    const result = await supabase.from("goals").select("*").order("goal_order", { ascending: true });
    return throwIfError(result as { data: GoalRow[]; error: { message: string } | null }).map(goalFromRow);
  },

  async addGoal(input: GoalInput): Promise<Goal> {
    const row = { id: generateId(), ...goalToRow(input) };
    const result = await supabase.from("goals").insert(row).select().single();
    return goalFromRow(throwIfError(result as { data: GoalRow; error: { message: string } | null }));
  },

  async updateGoal(id: string, patch: Partial<GoalInput>): Promise<Goal | null> {
    const result = await supabase
      .from("goals")
      .update({ ...goalToRow(patch), updated_at: nowIso() })
      .eq("id", id)
      .select()
      .maybeSingle();
    const row = throwIfError(result as { data: GoalRow | null; error: { message: string } | null });
    return row ? goalFromRow(row) : null;
  },

  async deleteGoal(id: string): Promise<void> {
    const result = await supabase.from("goals").delete().eq("id", id);
    throwIfError(result as { data: null; error: { message: string } | null });
  },

  async reorderGoals(orderedIds: string[]): Promise<Goal[]> {
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("goals").update({ goal_order: index, updated_at: nowIso() }).eq("id", id)
      )
    );
    return dataService.getGoals();
  },

  // ----- Expenses -----
  async getExpenses(): Promise<Expense[]> {
    const result = await supabase.from("expenses").select("*").order("date", { ascending: false });
    return throwIfError(result as { data: ExpenseRow[]; error: { message: string } | null }).map(expenseFromRow);
  },

  async addExpense(input: ExpenseInput): Promise<Expense> {
    const row = { id: generateId(), ...expenseToRow(input) };
    const result = await supabase.from("expenses").insert(row).select().single();
    return expenseFromRow(throwIfError(result as { data: ExpenseRow; error: { message: string } | null }));
  },

  async updateExpense(id: string, patch: Partial<ExpenseInput>): Promise<Expense | null> {
    const result = await supabase
      .from("expenses")
      .update({ ...expenseToRow(patch), updated_at: nowIso() })
      .eq("id", id)
      .select()
      .maybeSingle();
    const row = throwIfError(result as { data: ExpenseRow | null; error: { message: string } | null });
    return row ? expenseFromRow(row) : null;
  },

  async deleteExpense(id: string): Promise<void> {
    const result = await supabase.from("expenses").delete().eq("id", id);
    throwIfError(result as { data: null; error: { message: string } | null });
  },

  // ----- Settings -----
  async getSettings(): Promise<AppSettings> {
    const userId = await getCurrentUserId();
    const result = await supabase.from("app_settings").select("*").eq("user_id", userId).single();
    return settingsFromRow(throwIfError(result as { data: SettingsRow; error: { message: string } | null }));
  },

  async updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const [current, userId] = await Promise.all([dataService.getSettings(), getCurrentUserId()]);
    const next = { ...current, ...patch };
    const result = await supabase
      .from("app_settings")
      .update({ ...settingsToRow(next), updated_at: nowIso() })
      .eq("user_id", userId)
      .select()
      .single();
    return settingsFromRow(throwIfError(result as { data: SettingsRow; error: { message: string } | null }));
  },

  async resetSettings(): Promise<AppSettings> {
    const userId = await getCurrentUserId();
    const result = await supabase
      .from("app_settings")
      .update({ ...settingsToRow(DEFAULT_SETTINGS), updated_at: nowIso() })
      .eq("user_id", userId)
      .select()
      .single();
    return settingsFromRow(throwIfError(result as { data: SettingsRow; error: { message: string } | null }));
  },

  // ----- Backup / export / import -----
  async exportBackup(): Promise<BackupData> {
    const [incomes, expenses, goals, settings] = await Promise.all([
      dataService.getIncomes(),
      dataService.getExpenses(),
      dataService.getGoals(),
      dataService.getSettings(),
    ]);
    return {
      version: BACKUP_VERSION,
      exportedAt: nowIso(),
      incomes,
      expenses,
      goals,
      settings,
    };
  },

  async importBackup(data: BackupData): Promise<void> {
    const userId = await getCurrentUserId();
    await supabase.from("incomes").delete().neq("id", "__none__");
    await supabase.from("expenses").delete().neq("id", "__none__");
    await supabase.from("goals").delete().neq("id", "__none__");

    if (data.incomes.length > 0) {
      const rows = data.incomes.map((income) => ({ id: income.id || generateId(), ...incomeToRow(income) }));
      const result = await supabase.from("incomes").insert(rows);
      throwIfError(result as { data: null; error: { message: string } | null });
    }
    if (data.expenses.length > 0) {
      const rows = data.expenses.map((expense) => ({ id: expense.id || generateId(), ...expenseToRow(expense) }));
      const result = await supabase.from("expenses").insert(rows);
      throwIfError(result as { data: null; error: { message: string } | null });
    }
    if (data.goals.length > 0) {
      const rows = data.goals.map((goal) => ({ id: goal.id || generateId(), ...goalToRow(goal) }));
      const result = await supabase.from("goals").insert(rows);
      throwIfError(result as { data: null; error: { message: string } | null });
    }
    const result = await supabase
      .from("app_settings")
      .update({ ...settingsToRow(data.settings), updated_at: nowIso() })
      .eq("user_id", userId);
    throwIfError(result as { data: null; error: { message: string } | null });
  },
};

export function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<BackupData>;
  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.incomes) &&
    Array.isArray(candidate.expenses) &&
    Array.isArray(candidate.goals) &&
    typeof candidate.settings === "object" &&
    candidate.settings !== null
  );
}
