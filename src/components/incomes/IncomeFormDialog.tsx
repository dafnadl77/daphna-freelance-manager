import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IncomeCalcBreakdown } from "./IncomeCalcBreakdown";
import { useAppData } from "@/context/AppDataContext";
import { formatCurrency, todayIso } from "@/lib/format";
import type { Income, IncomeInput, IncomeStatus } from "@/types";

interface IncomeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: Income | null;
}

const STATUS_LABELS: Record<IncomeStatus, string> = {
  received: "התקבל",
  pending: "ממתין",
  cancelled: "בוטל",
};

function buildInitialState(
  income: Income | null | undefined,
  defaults: { organizationFeeRate: number }
): IncomeInput {
  if (income) {
    const { id, createdAt, updatedAt, ...rest } = income;
    return rest;
  }
  return {
    date: todayIso(),
    clientName: "",
    projectName: "",
    amountBeforeVat: 0,
    hasOrganizationFee: true,
    organizationFeeRate: defaults.organizationFeeRate,
    status: "received",
    notes: "",
    isSample: false,
  };
}

/** The amount is entered including VAT; internally the app still stores and
 * calculates everything from the pre-VAT amount, so this converts both ways. */
function toAmountWithVat(amountBeforeVat: number, vatRate: number): number {
  return amountBeforeVat * (1 + vatRate / 100);
}

function toAmountBeforeVat(amountWithVat: number, vatRate: number): number {
  return amountWithVat / (1 + vatRate / 100);
}

export function IncomeFormDialog({ open, onOpenChange, income }: IncomeFormDialogProps) {
  const { settings, addIncome, updateIncome } = useAppData();
  const [form, setForm] = useState<IncomeInput>(() => buildInitialState(income, settings));
  const [amountWithVatInput, setAmountWithVatInput] = useState(() =>
    toAmountWithVat(form.amountBeforeVat, settings.vatRate)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const initial = buildInitialState(income, settings);
      setForm(initial);
      setAmountWithVatInput(toAmountWithVat(initial.amountBeforeVat, settings.vatRate));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, income]);

  function handleAmountWithVatChange(value: number) {
    const amountWithVat = Math.max(0, value);
    setAmountWithVatInput(amountWithVat);
    setForm((prev) => ({ ...prev, amountBeforeVat: toAmountBeforeVat(amountWithVat, settings.vatRate) }));
  }

  const isEdit = Boolean(income);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.clientName.trim()) {
      setError("יש להזין שם לקוח");
      return;
    }
    if (!form.projectName.trim()) {
      setError("יש להזין שם פרויקט");
      return;
    }
    if (!form.date) {
      setError("יש לבחור תאריך");
      return;
    }
    if (!Number.isFinite(form.amountBeforeVat) || form.amountBeforeVat <= 0) {
      setError("סכום ההכנסה חייב להיות מספר חיובי גדול מאפס");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && income) {
        await updateIncome(income.id, form);
      } else {
        await addIncome(form);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת הכנסה" : "הוספת הכנסה חדשה"}</DialogTitle>
          <DialogDescription>הזיני את הסכום כפי שנקוב בחשבונית, כולל מע״מ — האפליקציה תחשב את השאר</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">תאריך</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as IncomeStatus })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as IncomeStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientName">שם הלקוח</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="לדוגמה: סטודיו כרמל"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="projectName">שם הפרויקט</Label>
              <Input
                id="projectName"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                placeholder="לדוגמה: עיצוב אתר"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="amount">סכום כולל מע״מ ({settings.vatRate}%) (₪)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={Number.isFinite(amountWithVatInput) ? amountWithVatInput : ""}
                onChange={(e) => handleAmountWithVatChange(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                סכום לפני מע״מ: {Number.isFinite(form.amountBeforeVat) ? formatCurrency(form.amountBeforeVat, true) : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="hasFee">תשלום למטה / לגוף מפנה</Label>
                <p className="text-xs text-muted-foreground">אחוז שמועבר לגוף המפנה או לארגון</p>
              </div>
              <Switch id="hasFee" checked={form.hasOrganizationFee} onCheckedChange={(v) => setForm({ ...form, hasOrganizationFee: v })} />
            </div>
            {form.hasOrganizationFee && (
              <Input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.organizationFeeRate}
                onChange={(e) => setForm({ ...form, organizationFeeRate: Number(e.target.value) })}
                className="w-32"
              />
            )}
          </div>

          <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
            מס הכנסה, רזרבה לעסק, הפרשה ליעדים והפרשה לבית מחושבים לפי האחוזים הקבועים שהוגדרו ב״הגדרות״, ומתעדכנים אוטומטית שם עבור כל ההכנסות.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="notes">הערות</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>

          <IncomeCalcBreakdown income={form} settings={settings} />

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {isEdit ? "שמירת שינויים" : "הוספת הכנסה"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
