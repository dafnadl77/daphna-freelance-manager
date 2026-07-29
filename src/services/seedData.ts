import type { Goal, Income } from "@/types";

const nowIso = new Date().toISOString();

export function getDefaultGoals(): Goal[] {
  return [
    {
      id: "goal-madrid",
      name: "מדריד",
      icon: "✈️",
      percentage: 40,
      targetAmount: 6000,
      savedAmount: 0,
      targetDate: null,
      color: "#7C3AED",
      order: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "goal-tattoo",
      name: "קעקוע",
      icon: "🎨",
      percentage: 20,
      targetAmount: 2000,
      savedAmount: 0,
      targetDate: null,
      color: "#EC4899",
      order: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "goal-la",
      name: "לוס אנג׳לס",
      icon: "🌴",
      percentage: 25,
      targetAmount: 9000,
      savedAmount: 0,
      targetDate: null,
      color: "#F97316",
      order: 2,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "goal-printer",
      name: "מדפסת תלת־ממד",
      icon: "🖨️",
      percentage: 15,
      targetAmount: 3500,
      savedAmount: 0,
      targetDate: null,
      color: "#10B981",
      order: 3,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

export function getSeedIncome(): Income {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-15`;
  return {
    id: "income-sample-1",
    date,
    clientName: "לקוח לדוגמה",
    projectName: "אתר תדמית ושאלון",
    amountBeforeVat: 16000,
    hasOrganizationFee: true,
    organizationFeeRate: 12,
    calculateIncomeTax: true,
    incomeTaxRate: 15,
    hasBusinessReserve: false,
    businessReserveRate: 0,
    status: "received",
    notes: "",
    isSample: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}
