import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IncomeStatus } from "@/types";

export interface IncomeFiltersState {
  search: string;
  month: string; // "all" or "YYYY-MM"
  status: IncomeStatus | "all";
  client: string; // "all" or client name
}

interface IncomeFiltersProps {
  filters: IncomeFiltersState;
  onChange: (filters: IncomeFiltersState) => void;
  months: string[];
  clients: string[];
}

const STATUS_OPTIONS: { value: IncomeStatus | "all"; label: string }[] = [
  { value: "all", label: "כל הסטטוסים" },
  { value: "received", label: "התקבל" },
  { value: "pending", label: "ממתין" },
  { value: "cancelled", label: "בוטל" },
];

export function IncomeFilters({ filters, onChange, months, clients }: IncomeFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative">
        <Search className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי לקוח, פרויקט או הערה"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pe-10"
        />
      </div>

      <Select value={filters.month} onValueChange={(v) => onChange({ ...filters, month: v })}>
        <SelectTrigger>
          <SelectValue placeholder="סינון לפי חודש" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל החודשים</SelectItem>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => onChange({ ...filters, status: v as IncomeStatus | "all" })}>
        <SelectTrigger>
          <SelectValue placeholder="סינון לפי סטטוס" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.client} onValueChange={(v) => onChange({ ...filters, client: v })}>
        <SelectTrigger>
          <SelectValue placeholder="סינון לפי לקוח" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הלקוחות</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
