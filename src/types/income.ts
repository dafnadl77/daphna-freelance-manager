export type IncomeStatus = "received" | "pending" | "cancelled";

export interface Income {
  id: string;
  date: string; // ISO date string, e.g. "2026-07-15"
  clientName: string;
  projectName: string;
  amountBeforeVat: number;
  hasOrganizationFee: boolean;
  organizationFeeRate: number; // percentage, e.g. 12 for 12%
  status: IncomeStatus;
  notes: string;
  isSample?: boolean;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type IncomeInput = Omit<Income, "id" | "createdAt" | "updatedAt">;

/** Illustrative per-income breakdown: how this income's own net (after its
 * optional organization fee) would split under the current settings rates.
 * National Insurance is excluded here since it's a flat monthly amount,
 * not a per-income concept. */
export interface IncomeCalculation {
  amountBeforeVat: number;
  vatAmount: number;
  invoiceTotal: number;
  organizationFee: number;
  netToDistribute: number;
  incomeTax: number;
  businessReserve: number;
  goalsAllocation: number;
  homeAllocation: number;
}
