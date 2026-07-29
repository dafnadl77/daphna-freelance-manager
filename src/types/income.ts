export type IncomeStatus = "received" | "pending" | "cancelled";

export interface Income {
  id: string;
  date: string; // ISO date string, e.g. "2026-07-15"
  clientName: string;
  projectName: string;
  amountBeforeVat: number;
  hasOrganizationFee: boolean;
  organizationFeeRate: number; // percentage, e.g. 12 for 12%
  calculateIncomeTax: boolean;
  incomeTaxRate: number; // percentage
  hasBusinessReserve: boolean;
  businessReserveRate: number; // percentage
  status: IncomeStatus;
  notes: string;
  isSample?: boolean;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type IncomeInput = Omit<Income, "id" | "createdAt" | "updatedAt">;

export interface IncomeCalculation {
  amountBeforeVat: number;
  vatAmount: number;
  invoiceTotal: number;
  organizationFee: number;
  incomeTax: number;
  businessReserve: number;
  remainingBeforeNationalInsurance: number;
}
