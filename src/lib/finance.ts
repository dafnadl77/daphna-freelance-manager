import type { AppSettings, Goal, Income, IncomeCalculation, MonthlySummary, GoalAllocation } from "@/types";

/** Returns "YYYY-MM" for a given date (Date object or "YYYY-MM-DD" string). */
export function toMonthKey(date: Date | string): string {
  if (typeof date === "string") return date.slice(0, 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Full per-income calculation breakdown, per the app's fixed formulas. */
export function calculateIncomeBreakdown(
  income: Pick<
    Income,
    | "amountBeforeVat"
    | "hasOrganizationFee"
    | "organizationFeeRate"
    | "calculateIncomeTax"
    | "incomeTaxRate"
    | "hasBusinessReserve"
    | "businessReserveRate"
  >,
  vatRate: number
): IncomeCalculation {
  const amountBeforeVat = Math.max(0, income.amountBeforeVat || 0);
  const vatAmount = amountBeforeVat * (vatRate / 100);
  const invoiceTotal = amountBeforeVat + vatAmount;

  const organizationFee = income.hasOrganizationFee
    ? amountBeforeVat * (income.organizationFeeRate / 100)
    : 0;

  const incomeTax = income.calculateIncomeTax
    ? amountBeforeVat * (income.incomeTaxRate / 100)
    : 0;

  const businessReserve = income.hasBusinessReserve
    ? amountBeforeVat * (income.businessReserveRate / 100)
    : 0;

  const remainingBeforeNationalInsurance =
    amountBeforeVat - organizationFee - incomeTax - businessReserve;

  return {
    amountBeforeVat,
    vatAmount,
    invoiceTotal,
    organizationFee,
    incomeTax,
    businessReserve,
    remainingBeforeNationalInsurance,
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

export function computeMonthlySummary(
  incomes: Income[],
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
    (sum, i) => sum + calculateIncomeBreakdown(i, settings.vatRate).vatAmount,
    0
  );
  const totalOrganizationFees = includedIncomes.reduce(
    (sum, i) => sum + calculateIncomeBreakdown(i, settings.vatRate).organizationFee,
    0
  );
  const totalIncomeTax = includedIncomes.reduce(
    (sum, i) => sum + calculateIncomeBreakdown(i, settings.vatRate).incomeTax,
    0
  );
  const totalBusinessReserve = includedIncomes.reduce(
    (sum, i) => sum + calculateIncomeBreakdown(i, settings.vatRate).businessReserve,
    0
  );

  const nationalInsurance = includedIncomes.length > 0 ? settings.nationalInsuranceMonthly : 0;

  const netAfterObligations = Math.max(
    0,
    totalIncome - totalOrganizationFees - totalIncomeTax - totalBusinessReserve - nationalInsurance
  );

  const goalsFund = netAfterObligations * (settings.goalsRate / 100);
  const personalNet = Math.max(0, netAfterObligations - goalsFund);

  return {
    month,
    totalIncome,
    receivedIncome,
    pendingIncome,
    vatCollected,
    totalOrganizationFees,
    totalIncomeTax,
    totalBusinessReserve,
    nationalInsurance,
    netAfterObligations,
    goalsFund,
    personalNet,
    incomeCount: includedIncomes.length,
  };
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

export function computeYearlySummary(incomes: Income[], settings: AppSettings, year: number): MonthlySummary {
  const monthlySummaries = Array.from({ length: 12 }, (_, i) =>
    computeMonthlySummary(incomes, settings, `${year}-${String(i + 1).padStart(2, "0")}`)
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
      nationalInsurance: acc.nationalInsurance + m.nationalInsurance,
      netAfterObligations: acc.netAfterObligations + m.netAfterObligations,
      goalsFund: acc.goalsFund + m.goalsFund,
      personalNet: acc.personalNet + m.personalNet,
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
      nationalInsurance: 0,
      netAfterObligations: 0,
      goalsFund: 0,
      personalNet: 0,
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

export function averageMonthlyIncome(incomes: Income[], settings: AppSettings, months: string[]): number {
  if (months.length === 0) return 0;
  const total = months.reduce((sum, m) => sum + computeMonthlySummary(incomes, settings, m).totalIncome, 0);
  return total / months.length;
}
