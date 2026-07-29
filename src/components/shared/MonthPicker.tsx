import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/format";
import { shiftMonthKey, toMonthKey } from "@/lib/finance";

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const isCurrentMonth = value === toMonthKey(new Date());

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card p-1.5 shadow-sm">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(shiftMonthKey(value, 1))} aria-label="חודש הבא">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="flex min-w-[130px] items-center justify-center gap-2 px-1 text-sm font-bold">
        <Calendar className="h-4 w-4 text-primary" />
        {formatMonthLabel(value)}
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(shiftMonthKey(value, -1))} aria-label="חודש קודם">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {!isCurrentMonth && (
        <Button variant="link" size="sm" className="h-8 px-2 text-xs" onClick={() => onChange(toMonthKey(new Date()))}>
          חזרה להיום
        </Button>
      )}
    </div>
  );
}
