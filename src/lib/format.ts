const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("he-IL", {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("he-IL", {
  month: "long",
  year: "numeric",
});

export function formatCurrency(amount: number, precise = false): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return precise ? currencyFormatterPrecise.format(value) : currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(Number.isFinite(value) ? value : 0)}%`;
}

export function formatDate(date: string): string {
  if (!date) return "";
  return dateFormatter.format(new Date(date));
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return monthFormatter.format(new Date(year, (month || 1) - 1, 1));
}

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
