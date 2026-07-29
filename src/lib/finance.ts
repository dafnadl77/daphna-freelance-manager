import type { AppSettings, Expense, Goal, Income, IncomeCalculation, MonthlySummary, GoalAllocation } from "@/types";

/** Returns "YYYY-MM" for a given date (Date object or "YYYY-MM-DD" string). */
export function toMonthKey(date: Date | string): string {
  if (typeof date === "string") return date.slice(0, 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Illustrative per-income breakdown: this income's own net (after its
 * optional organization fee) split by the current settings rates. */
export function calculateIncomeBreakdown(
  income: Pick<Income, "amountBeforeVat" | "hasOrganizationFee" | "organizationFeeRate">,
  settings: AppSettings
): IncomeCalculation {
  const amountBeforeVat = Math.max(0, income.amountBeforeVat || 0);
  const vatAmount = amountBeforeVat * (settings.vatRate / 100);
  const invoiceTotal = amountBeforeVat + vatAmount;

  const organizationFee = income.hasOrganizationFee
    ? amountBeforeVat * (income.organizationFeeRate / 100)
    : 0;

  const netToDistribute = amountBeforeVat - organizationFee;

  const incomeTax = netToDistribute * (settings.incomeTaxRate / 100);
  const businessReserve = netToDistribute * (settings.businessReserveRate / 100);
  const goalsAllocation = netToDistribute * (settings.goalsRate / 100);
  const homeAllocation = netToDistribute * (settings.homeRate / 100);

  return {
    amountBeforeVat,
    vatAmount,
    invoiceTotal,
    organizationFee,
    netToDistribute,
    incomeTax,
    businessReserve,
    goalsAllocation,
    homeAllocation,
  };
}

/** Cancelled incomes are always excluded. Pending incomes are excluded from
 * financial totals unless the user opted to include them in the forecast. */
export function isIncomeIncluded(income: Income, settings: AppSettings): boolean {
  if (income.status === "cancelled") return false;
  if (income.status === "pending") return settings.includePendingInForecast;
  return true;
}

export function getIncomesForMonth(incomes: Income[], month: string): Income[] {
  return incomes.filter((income) => toMonthKey(income.date) === month);
}

export function getExpensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((expense) => toMonthKey(expense.date) === month);
}

export function computeMonthlySummary(
  incomes: Income[],
  expenses: Expense[],
  settings: AppSettings,
  month: string
): MonthlySummary {
  const monthIncomes = getIncomesForMonth(incomes, month).filter(
    (i) => i.status !== "cancelled"
  );

  const receivedIncome = monthIncomes
    .filter((i) => i.status === "received")
    .reduce((sum, i) => sum + i.amountBeforeVat, 0);

  const pendingIncome = monthIncomes
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amountBeforeVat, 0);

  const includedIncomes = monthIncomes.filter((i) => isIncomeIncluded(i, settings));

  const totalIncome = includedIncomes.reduce((sum, i) => sum + i.amountBeforeVat, 0);
  const vatCollected = includedIncomes.reduce(
    (sum, i) => sum + calculateIncomeBreakdown(i, settings).vatAmount,
    0
  );
  const totalOrganizationFees = includedIncomes.reduce(
    (sum, i) => sum + calculateIncomeBreakdown(i, settings).organizationFee,
    0
  );

  const netToDistribute = Math.max(0, totalIncome - totalOrganizationFees);

  const totalIncomeTax = netToDistribute * (settings.incomeTaxRate / 100);
  const totalBusinessReserve = netToDistribute * (settings.businessReserveRate / 100);
  const goalsFund = netToDistribute * (settings.goalsRate / 100);
  const personalNet = netToDistribute * (settings.homeRate / 100);

  const netAfterObligations = Math.max(0, netToDistribute - totalIncomeTax - totalBusinessReserve);

  const totalExpenses = getExpensesForMonth(expenses, month).reduce((sum, e) => sum + e.amount, 0);
  const personalNetAfterExpenses = Math.max(0, personalNet - totalExpenses);

  return {
    month,
    totalIncome,
    receivedIncome,
    pendingIncome,
    vatCollected,
    totalOrganizationFees,
    totalIncomeTax,
    totalBusinessReserve,
    netAfterObligations,
    goalsFund,
    personalNet,
    totalExpenses,
    personalNetAfterExpenses,
    incomeCount: includedIncomes.length,
  };
}

/** The four obligation percentages (tax, business reserve, goals, home) are
 * meant to always split the same monthly pool (netToDistribute) exactly. */
export function sumObligationPercentages(settings: AppSettings): number {
  return settings.incomeTaxRate + settings.businessReserveRate + settings.goalsRate + settings.homeRate;
}

export function isObligationDistributionValid(settings: AppSettings): boolean {
  return Math.abs(sumObligationPercentages(settings) - 100) < 0.01;
}

export function sumGoalPercentages(goals: Goal[]): number {
  return goals.reduce((sum, g) => sum + (g.percentage || 0), 0);
}

export function isGoalDistributionValid(goals: Goal[]): boolean {
  return Math.abs(sumGoalPercentages(goals) - 100) < 0.01;
}

export function computeGoalAllocations(goalsFund: number, goals: Goal[]): GoalAllocation[] {
  return goals.map((goal) => ({
    goalId: goal.id,
    goalName: goal.name,
    amount: goalsFund * (goal.percentage / 100),
  }));
}

export function goalProgressPercentage(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
}

export function isGoalCompleted(goal: Goal): boolean {
  return goal.targetAmount > 0 && goal.savedAmount >= goal.targetAmount;
}

/** Shifts a "YYYY-MM" key by a number of months (positive or negative). */
export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1 + delta, 1);
  return toMonthKey(date);
}

export function getAvailableYears(incomes: Income[]): number[] {
  const years = new Set(incomes.map((i) => Number(i.date.slice(0, 4))));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export function computeYearlySummary(
  incomes: Income[],
  expenses: Expense[],
  settings: AppSettings,
  year: number
): MonthlySummary {
  const monthlySummaries = Array.from({ length: 12 }, (_, i) =>
    computeMonthlySummary(incomes, expenses, settings, `${year}-${String(i + 1).padStart(2, "0")}`)
  );

  return monthlySummaries.reduce<MonthlySummary>(
    (acc, m) => ({
      month: `${year}`,
      totalIncome: acc.totalIncome + m.totalIncome,
      receivedIncome: acc.receivedIncome + m.receivedIncome,
      pendingIncome: acc.pendingIncome + m.pendingIncome,
      vatCollected: acc.vatCollected + m.vatCollected,
      totalOrganizationFees: acc.totalOrganizationFees + m.totalOrganizationFees,
      totalIncomeTax: acc.totalIncomeTax + m.totalIncomeTax,
      totalBusinessReserve: acc.totalBusinessReserve + m.totalBusinessReserve,
      netAfterObligations: acc.netAfterObligations + m.netAfterObligations,
      goalsFund: acc.goalsFund + m.goalsFund,
      personalNet: acc.personalNet + m.personalNet,
      totalExpenses: acc.totalExpenses + m.totalExpenses,
      personalNetAfterExpenses: acc.personalNetAfterExpenses + m.personalNetAfterExpenses,
      incomeCount: acc.incomeCount + m.incomeCount,
    }),
    {
      month: `${year}`,
      totalIncome: 0,
      receivedIncome: 0,
      pendingIncome: 0,
      vatCollected: 0,
      totalOrganizationFees: 0,
      totalIncomeTax: 0,
      totalBusinessReserve: 0,
      netAfterObligations: 0,
      goalsFund: 0,
      personalNet: 0,
      totalExpenses: 0,
      personalNetAfterExpenses: 0,
      incomeCount: 0,
    }
  );
}

export interface RankedEntry {
  name: string;
  amount: number;
}

export function topClientsByIncome(incomes: Income[]): RankedEntry[] {
  const totals = new Map<string, number>();
  incomes
    .filter((i) => i.status !== "cancelled")
    .forEach((i) => totals.set(i.clientName, (totals.get(i.clientName) ?? 0) + i.amountBeforeVat));
  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function topProjectsByIncome(incomes: Income[]): RankedEntry[] {
  const totals = new Map<string, number>();
  incomes
    .filter((i) => i.status !== "cancelled")
    .forEach((i) => totals.set(i.projectName, (totals.get(i.projectName) ?? 0) + i.amountBeforeVat));
  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function averageMonthlyIncome(
  incomes: Income[],
  expenses: Expense[],
  settings: AppSettings,
  months: string[]
): number {
  if (months.length === 0) return 0;
  const total = months.reduce(
    (sum, m) => sum + computeMonthlySummary(incomes, expenses, settings, m).totalIncome,
    0
  );
  return total / months.length;
}
