import type { BackupData, Income } from "@/types";

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const CSV_HEADERS = [
  "תאריך",
  "לקוח",
  "פרויקט",
  "סכום לפני מעמ",
  "סטטוס",
  "תשלום למטה",
  "מס הכנסה משוער",
  "רזרבה לעסק",
  "הערות",
];

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function incomesToCsv(incomes: Income[]): string {
  const rows = incomes.map((i) => [
    i.date,
    i.clientName,
    i.projectName,
    i.amountBeforeVat,
    i.status,
    i.hasOrganizationFee ? `${i.organizationFeeRate}%` : "לא",
    i.calculateIncomeTax ? `${i.incomeTaxRate}%` : "לא",
    i.hasBusinessReserve ? `${i.businessReserveRate}%` : "לא",
    i.notes,
  ]);
  const lines = [CSV_HEADERS, ...rows].map((row) => row.map(escapeCsvField).join(","));
  return "﻿" + lines.join("\r\n");
}

export function exportIncomesCsv(incomes: Income[]): void {
  downloadBlob(incomesToCsv(incomes), `הכנסות-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
}

export function exportIncomesJson(incomes: Income[]): void {
  downloadBlob(JSON.stringify(incomes, null, 2), `הכנסות-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
}

export function exportBackupFile(backup: BackupData): void {
  downloadBlob(
    JSON.stringify(backup, null, 2),
    `גיבוי-מלא-${new Date().toISOString().slice(0, 10)}.json`,
    "application/json"
  );
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error("הקובץ אינו JSON תקין"));
      }
    };
    reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
    reader.readAsText(file);
  });
}
