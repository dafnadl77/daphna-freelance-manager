import * as React from "react";
import { dataService, validateBackupData } from "@/services/dataService";
import { toast } from "@/components/ui/use-toast";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type {
  AppSettings,
  BackupData,
  Expense,
  ExpenseInput,
  Goal,
  GoalInput,
  Income,
  IncomeInput,
  IncomeStatus,
} from "@/types";

interface AppDataContextValue {
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  settings: AppSettings;
  loading: boolean;
  addIncome: (input: IncomeInput) => Promise<void>;
  updateIncome: (id: string, patch: Partial<IncomeInput>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  duplicateIncome: (id: string) => Promise<void>;
  setIncomeStatus: (id: string, status: IncomeStatus) => Promise<void>;
  clearSampleData: () => Promise<void>;
  addExpense: (input: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, patch: Partial<ExpenseInput>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, patch: Partial<GoalInput>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  reorderGoals: (orderedIds: string[]) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportBackup: () => Promise<BackupData>;
  importBackup: (data: unknown) => Promise<{ ok: boolean; error?: string }>;
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [incomes, setIncomes] = React.useState<Income[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const [i, e, g, s] = await Promise.all([
      dataService.getIncomes(),
      dataService.getExpenses(),
      dataService.getGoals(),
      dataService.getSettings(),
    ]);
    setIncomes(i);
    setExpenses(e);
    setGoals(g);
    setSettings(s);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const addIncome = React.useCallback(async (input: IncomeInput) => {
    const income = await dataService.addIncome(input);
    setIncomes((prev) => [income, ...prev]);
    toast({ title: "ההכנסה נשמרה", description: "ההכנסה החדשה נוספה בהצלחה", variant: "success" });
  }, []);

  const updateIncome = React.useCallback(async (id: string, patch: Partial<IncomeInput>) => {
    const updated = await dataService.updateIncome(id, patch);
    if (updated) {
      setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast({ title: "ההכנסה עודכנה", variant: "success" });
    }
  }, []);

  const deleteIncome = React.useCallback(async (id: string) => {
    await dataService.deleteIncome(id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "ההכנסה נמחקה", variant: "destructive" });
  }, []);

  const duplicateIncome = React.useCallback(async (id: string) => {
    const clone = await dataService.duplicateIncome(id);
    if (clone) {
      setIncomes((prev) => [clone, ...prev]);
      toast({ title: "ההכנסה שוכפלה", description: "עותק חדש נוצר בסטטוס ממתין", variant: "success" });
    }
  }, []);

  const setIncomeStatus = React.useCallback(async (id: string, status: IncomeStatus) => {
    const updated = await dataService.updateIncome(id, { status });
    if (updated) {
      setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast({ title: "הסטטוס עודכן", variant: "success" });
    }
  }, []);

  const clearSampleData = React.useCallback(async () => {
    await dataService.clearSampleData();
    setIncomes((prev) => prev.filter((i) => !i.isSample));
    toast({ title: "נתוני הדוגמה נמחקו", variant: "success" });
  }, []);

  const addExpense = React.useCallback(async (input: ExpenseInput) => {
    const expense = await dataService.addExpense(input);
    setExpenses((prev) => [expense, ...prev]);
    toast({ title: "ההוצאה נשמרה", variant: "success" });
  }, []);

  const updateExpense = React.useCallback(async (id: string, patch: Partial<ExpenseInput>) => {
    const updated = await dataService.updateExpense(id, patch);
    if (updated) {
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast({ title: "ההוצאה עודכנה", variant: "success" });
    }
  }, []);

  const deleteExpense = React.useCallback(async (id: string) => {
    await dataService.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "ההוצאה נמחקה", variant: "destructive" });
  }, []);

  const addGoal = React.useCallback(async (input: GoalInput) => {
    const goal = await dataService.addGoal(input);
    setGoals((prev) => [...prev, goal]);
    toast({ title: "היעד נוסף", variant: "success" });
  }, []);

  const updateGoal = React.useCallback(async (id: string, patch: Partial<GoalInput>) => {
    const updated = await dataService.updateGoal(id, patch);
    if (updated) {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      toast({ title: "היעד עודכן", variant: "success" });
    }
  }, []);

  const deleteGoal = React.useCallback(async (id: string) => {
    await dataService.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast({ title: "היעד נמחק", variant: "destructive" });
  }, []);

  const reorderGoals = React.useCallback(async (orderedIds: string[]) => {
    const reordered = await dataService.reorderGoals(orderedIds);
    setGoals(reordered);
  }, []);

  const updateSettings = React.useCallback(async (patch: Partial<AppSettings>) => {
    const next = await dataService.updateSettings(patch);
    setSettings(next);
    toast({ title: "ההגדרות נשמרו", variant: "success" });
  }, []);

  const resetSettings = React.useCallback(async () => {
    const next = await dataService.resetSettings();
    setSettings(next);
    toast({ title: "ההגדרות אופסו לברירת המחדל", variant: "success" });
  }, []);

  const exportBackup = React.useCallback(async () => {
    return dataService.exportBackup();
  }, []);

  const importBackup = React.useCallback(async (data: unknown) => {
    if (!validateBackupData(data)) {
      toast({ title: "קובץ הגיבוי אינו תקין", description: "לא ניתן לזהות את מבנה הנתונים", variant: "destructive" });
      return { ok: false, error: "invalid" };
    }
    await dataService.importBackup(data);
    await refresh();
    toast({ title: "הייבוא הושלם", description: "כל הנתונים נטענו בהצלחה", variant: "success" });
    return { ok: true };
  }, [refresh]);

  const value = React.useMemo<AppDataContextValue>(() => {
    return {
      incomes,
      expenses,
      goals,
      settings,
      loading,
      addIncome,
      updateIncome,
      deleteIncome,
      duplicateIncome,
      setIncomeStatus,
      clearSampleData,
      addExpense,
      updateExpense,
      deleteExpense,
      addGoal,
      updateGoal,
      deleteGoal,
      reorderGoals,
      updateSettings,
      resetSettings,
      exportBackup,
      importBackup,
    };
  }, [
    incomes,
    expenses,
    goals,
    settings,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    duplicateIncome,
    setIncomeStatus,
    clearSampleData,
    addExpense,
    updateExpense,
    deleteExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    reorderGoals,
    updateSettings,
    resetSettings,
    exportBackup,
    importBackup,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = React.useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
