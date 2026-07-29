import { formatCurrency } from "@/lib/format";
import { calculateIncomeBreakdown } from "@/lib/finance";
import type { Income } from "@/types";

interface IncomeCalcBreakdownProps {
  income: Pick<
    Income,
    | "amountBeforeVat"
    | "hasOrganizationFee"
    | "organizationFeeRate"
    | "calculateIncomeTax"
    | "incomeTaxRate"
    | "hasBusinessReserve"
    | "businessReserveRate"
  >;
  vatRate: number;
}

export function IncomeCalcBreakdown({ income, vatRate }: IncomeCalcBreakdownProps) {
  const calc = calculateIncomeBreakdown(income, vatRate);

  const rows = [
    { label: "סכום לפני מע״מ", value: calc.amountBeforeVat },
    { label: `מע״מ (${vatRate}%)`, value: calc.vatAmount },
    { label: "סכום כולל חשבונית", value: calc.invoiceTotal, strong: true },
    { label: "תשלום למטה", value: -calc.organizationFee, negative: calc.organizationFee > 0 },
    { label: "מס הכנסה", value: -calc.incomeTax, negative: calc.incomeTax > 0 },
    { label: "רזרבה לעסק", value: -calc.businessReserve, negative: calc.businessReserve > 0 },
    { label: "נותר לפני ביטוח לאומי", value: calc.remainingBeforeNationalInsurance, strong: true },
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
    </div>
  );
}
