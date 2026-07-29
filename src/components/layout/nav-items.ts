import { LayoutDashboard, Wallet, Target, BarChart3, Settings } from "lucide-react";

export type ScreenId = "dashboard" | "incomes" | "goals" | "reports" | "settings";

export const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "לוח בקרה", icon: LayoutDashboard },
  { id: "incomes", label: "הכנסות", icon: Wallet },
  { id: "goals", label: "היעדים שלי", icon: Target },
  { id: "reports", label: "דוחות", icon: BarChart3 },
  { id: "settings", label: "הגדרות", icon: Settings },
];
