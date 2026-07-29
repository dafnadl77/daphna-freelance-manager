import { useState } from "react";
import { ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IncomeCalcBreakdown } from "./IncomeCalcBreakdown";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppDataContext";
import type { Income, IncomeStatus } from "@/types";

const STATUS_META: Record<IncomeStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  received: { label: "התקבל", variant: "success" },
  pending: { label: "ממתין", variant: "warning" },
  cancelled: { label: "בוטל", variant: "destructive" },
};

interface IncomeCardProps {
  income: Income;
  onEdit: (income: Income) => void;
}

export function IncomeCard({ income, onEdit }: IncomeCardProps) {
  const { settings, deleteIncome, duplicateIncome, setIncomeStatus } = useAppData();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statusMeta = STATUS_META[income.status];

  return (
    <Card className={cn(income.status === "cancelled" && "opacity-60")}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-foreground">{income.clientName}</p>
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
              {income.isSample && <Badge variant="outline">נתוני דוגמה</Badge>}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{income.projectName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(income.date)}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {income.hasOrganizationFee ? (
                <Badge variant="warning">תשלום למטה {income.organizationFeeRate}%</Badge>
              ) : (
                <Badge variant="outline">ללא תשלום למטה</Badge>
              )}
            </div>
          </div>
          <div className="text-left">
            <p className="text-lg font-extrabold">
              {formatCurrency(income.amountBeforeVat * (1 + settings.vatRate / 100))}
            </p>
            <p className="text-xs text-muted-foreground">כולל מע״מ · {formatCurrency(income.amountBeforeVat)} לפני מע״מ</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={income.status} onValueChange={(v) => setIncomeStatus(income.id, v as IncomeStatus)}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_META) as IncomeStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={() => onEdit(income)}>
            <Pencil className="h-4 w-4" />
            עריכה
          </Button>
          <Button variant="ghost" size="sm" onClick={() => duplicateIncome(income.id)}>
            <Copy className="h-4 w-4" />
            שכפול
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            מחיקה
          </Button>

          <Button variant="ghost" size="sm" className="me-auto" onClick={() => setExpanded((v) => !v)}>
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            פירוט חישוב
          </Button>
        </div>

        {income.notes && <p className="mt-2 text-xs text-muted-foreground">הערה: {income.notes}</p>}

        {expanded && (
          <div className="mt-3">
            <IncomeCalcBreakdown income={income} settings={settings} />
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת הכנסה</AlertDialogTitle>
            <AlertDialogDescription>
              האם למחוק את ההכנסה מ{income.clientName}? פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => deleteIncome(income.id)}>מחיקה</AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
