import { formatCurrency } from "@/lib/format";
import { calculateIncomeBreakdown } from "@/lib/finance";
import type { AppSettings, Income } from "@/types";

interface IncomeCalcBreakdownProps {
  income: Pick<Income, "amountBeforeVat" | "hasOrganizationFee" | "organizationFeeRate">;
  settings: AppSettings;
}

export function IncomeCalcBreakdown({ income, settings }: IncomeCalcBreakdownProps) {
  const calc = calculateIncomeBreakdown(income, settings);

  const rows = [
    { label: "סכום לפני מע״מ", value: calc.amountBeforeVat },
    { label: `מע״מ (${settings.vatRate}%)`, value: calc.vatAmount },
    { label: "סכום כולל חשבונית", value: calc.invoiceTotal, strong: true },
    { label: "תשלום למטה", value: -calc.organizationFee, negative: calc.organizationFee > 0 },
    { label: "נטו לחלוקה", value: calc.netToDistribute, strong: true },
    { label: `מס הכנסה (${settings.incomeTaxRate}%)`, value: -calc.incomeTax, negative: calc.incomeTax > 0 },
    { label: `רזרבה לעסק (${settings.businessReserveRate}%)`, value: -calc.businessReserve, negative: calc.businessReserve > 0 },
    { label: `הפרשה ליעדים (${settings.goalsRate}%)`, value: -calc.goalsAllocation, negative: calc.goalsAllocation > 0 },
    { label: `הפרשה לבית (${settings.homeRate}%)`, value: calc.homeAllocation, strong: true },
  ];

  return (
    <div className="rounded-xl bg-muted/60 p-4 text-sm">
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between">
            <span className={row.strong ? "font-bold" : "text-muted-foreground"}>{row.label}</span>
            <span className={row.strong ? "font-bold" : row.negative ? "text-warning" : ""}>
              {row.value < 0 ? `-${formatCurrency(Math.abs(row.value))}` : formatCurrency(row.value)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        פירוט זה לפי הכנסה זו בלבד ואינו כולל ביטוח לאומי, המחושב פעם אחת בחודש בלוח הבקרה והדוחות.
      </p>
    </div>
  );
}
