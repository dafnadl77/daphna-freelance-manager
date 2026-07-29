import { describe, expect, it } from "vitest";
import {
  calculateIncomeBreakdown,
  computeGoalAllocations,
  computeMonthlySummary,
  isGoalDistributionValid,
  isObligationDistributionValid,
  sumObligationPercentages,
  toMonthKey,
} from "./finance";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { Goal, Income } from "@/types";

const baseIncome: Income = {
  id: "1",
  date: "2026-07-15",
  clientName: "לקוח לדוגמה",
  projectName: "אתר תדמית ושאלון",
  amountBeforeVat: 16000,
  hasOrganizationFee: true,
  organizationFeeRate: 12,
  status: "received",
  notes: "",
  createdAt: "2026-07-15T00:00:00.000Z",
  updatedAt: "2026-07-15T00:00:00.000Z",
};

describe("calculateIncomeBreakdown", () => {
  it("splits this income's net (after org fee) across tax/reserve/goals/home per the default settings", () => {
    const result = calculateIncomeBreakdown(baseIncome, DEFAULT_SETTINGS);
    expect(result.vatAmount).toBeCloseTo(2880);
    expect(result.invoiceTotal).toBeCloseTo(18880);
    expect(result.organizationFee).toBeCloseTo(1920);
    expect(result.netToDistribute).toBeCloseTo(14080);
    expect(result.incomeTax).toBeCloseTo(2112);
    expect(result.businessReserve).toBe(0);
    expect(result.goalsAllocation).toBeCloseTo(2816);
    expect(result.homeAllocation).toBeCloseTo(9152);
  });

  it("the four splits always add up to netToDistribute", () => {
    const result = calculateIncomeBreakdown(baseIncome, DEFAULT_SETTINGS);
    const total = result.incomeTax + result.businessReserve + result.goalsAllocation + result.homeAllocation;
    expect(total).toBeCloseTo(result.netToDistribute);
  });

  it("skips organization fee when disabled", () => {
    const result = calculateIncomeBreakdown({ ...baseIncome, hasOrganizationFee: false }, DEFAULT_SETTINGS);
    expect(result.organizationFee).toBe(0);
    expect(result.netToDistribute).toBe(result.amountBeforeVat);
  });

  it("never produces a negative amount for negative input", () => {
    const result = calculateIncomeBreakdown({ ...baseIncome, amountBeforeVat: -500 }, DEFAULT_SETTINGS);
    expect(result.amountBeforeVat).toBe(0);
  });
});

describe("computeMonthlySummary", () => {
  it("splits the monthly net-to-distribute across tax/reserve/goals/home per the default settings", () => {
    const summary = computeMonthlySummary([baseIncome], DEFAULT_SETTINGS, "2026-07");
    expect(summary.totalOrganizationFees).toBeCloseTo(1920);
    expect(summary.nationalInsurance).toBe(3313);
    expect(summary.totalIncomeTax).toBeCloseTo(1615.05);
    expect(summary.totalBusinessReserve).toBe(0);
    expect(summary.goalsFund).toBeCloseTo(2153.4);
    expect(summary.personalNet).toBeCloseTo(6998.55);
    expect(summary.netAfterObligations).toBeCloseTo(9151.95);
  });

  it("keeps the four monthly splits summing to netToDistribute (income - orgFee - NI)", () => {
    const summary = computeMonthlySummary([baseIncome], DEFAULT_SETTINGS, "2026-07");
    const netToDistribute = summary.totalIncome - summary.totalOrganizationFees - summary.nationalInsurance;
    const total = summary.totalIncomeTax + summary.totalBusinessReserve + summary.goalsFund + summary.personalNet;
    expect(total).toBeCloseTo(netToDistribute);
  });

  it("excludes cancelled incomes entirely", () => {
    const cancelled: Income = { ...baseIncome, id: "2", status: "cancelled" };
    const summary = computeMonthlySummary([baseIncome, cancelled], DEFAULT_SETTINGS, "2026-07");
    expect(summary.incomeCount).toBe(1);
  });

  it("excludes pending incomes from totals when forecast setting is off", () => {
    const pending: Income = { ...baseIncome, id: "3", status: "pending" };
    const summary = computeMonthlySummary(
      [pending],
      { ...DEFAULT_SETTINGS, includePendingInForecast: false },
      "2026-07"
    );
    expect(summary.totalIncome).toBe(0);
    expect(summary.nationalInsurance).toBe(0);
    expect(summary.pendingIncome).toBe(16000);
  });

  it("charges national insurance only once regardless of income count", () => {
    const second: Income = { ...baseIncome, id: "4", amountBeforeVat: 5000 };
    const summary = computeMonthlySummary([baseIncome, second], DEFAULT_SETTINGS, "2026-07");
    expect(summary.nationalInsurance).toBe(3313);
  });

  it("never goes negative when obligations exceed income", () => {
    const small: Income = { ...baseIncome, id: "5", amountBeforeVat: 100 };
    const summary = computeMonthlySummary([small], DEFAULT_SETTINGS, "2026-07");
    expect(summary.netAfterObligations).toBe(0);
    expect(summary.personalNet).toBe(0);
  });
});

describe("obligation percentage validation", () => {
  it("flags the default settings as valid (sums to 100)", () => {
    expect(sumObligationPercentages(DEFAULT_SETTINGS)).toBeCloseTo(100);
    expect(isObligationDistributionValid(DEFAULT_SETTINGS)).toBe(true);
  });

  it("flags an invalid distribution when the four rates don't sum to 100", () => {
    const invalid = { ...DEFAULT_SETTINGS, businessReserveRate: 20 };
    expect(isObligationDistributionValid(invalid)).toBe(false);
  });
});

describe("goal allocations", () => {
  const goals: Goal[] = [
    { id: "g1", name: "מדריד", icon: "✈️", percentage: 40, targetAmount: 4000, savedAmount: 0, targetDate: null, color: "#7C3AED", order: 0, createdAt: "", updatedAt: "" },
    { id: "g2", name: "קעקוע", icon: "🎨", percentage: 20, targetAmount: 2000, savedAmount: 0, targetDate: null, color: "#EC4899", order: 1, createdAt: "", updatedAt: "" },
    { id: "g3", name: "לוס אנג׳לס", icon: "🌴", percentage: 25, targetAmount: 8000, savedAmount: 0, targetDate: null, color: "#F97316", order: 2, createdAt: "", updatedAt: "" },
    { id: "g4", name: "מדפסת תלת־ממד", icon: "🖨️", percentage: 15, targetAmount: 3000, savedAmount: 0, targetDate: null, color: "#10B981", order: 3, createdAt: "", updatedAt: "" },
  ];

  it("splits a goals fund across goals by percentage", () => {
    const allocations = computeGoalAllocations(2153.4, goals);
    expect(allocations.find((a) => a.goalId === "g1")!.amount).toBeCloseTo(861.36);
    expect(allocations.find((a) => a.goalId === "g2")!.amount).toBeCloseTo(430.68);
    expect(allocations.find((a) => a.goalId === "g3")!.amount).toBeCloseTo(538.35);
    expect(allocations.find((a) => a.goalId === "g4")!.amount).toBeCloseTo(323.01);
  });

  it("flags an invalid distribution when percentages don't sum to 100", () => {
    expect(isGoalDistributionValid(goals)).toBe(true);
    const invalid = [...goals.slice(0, 3)];
    expect(isGoalDistributionValid(invalid)).toBe(false);
  });
});

describe("toMonthKey", () => {
  it("formats a date as YYYY-MM", () => {
    expect(toMonthKey("2026-01-05")).toBe("2026-01");
    expect(toMonthKey("2026-12-31")).toBe("2026-12");
  });
});
