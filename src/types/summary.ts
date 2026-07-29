export interface MonthlySummary {
  month: string; // "YYYY-MM"
  totalIncome: number; // included incomes, before VAT
  receivedIncome: number;
  pendingIncome: number;
  vatCollected: number;
  totalOrganizationFees: number;
  totalIncomeTax: number;
  totalBusinessReserve: number;
  nationalInsurance: number;
  netAfterObligations: number;
  goalsFund: number;
  personalNet: number;
  incomeCount: number;
}

export interface GoalAllocation {
  goalId: string;
  goalName: string;
  amount: number;
}
