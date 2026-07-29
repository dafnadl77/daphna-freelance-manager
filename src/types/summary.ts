export interface MonthlySummary {
  month: string; // "YYYY-MM"
  totalIncome: number; // included incomes, before VAT
  receivedIncome: number;
  pendingIncome: number;
  vatCollected: number;
  totalOrganizationFees: number;
  totalIncomeTax: number;
  totalBusinessReserve: number;
  netAfterObligations: number;
  goalsFund: number;
  personalNet: number; // home/personal allocation before subtracting expenses
  totalExpenses: number; // sum of this month's expense entries (e.g. National Insurance, rent...)
  personalNetAfterExpenses: number; // the real bottom-line take-home
  incomeCount: number;
}

export interface GoalAllocation {
  goalId: string;
  goalName: string;
  amount: number;
}
