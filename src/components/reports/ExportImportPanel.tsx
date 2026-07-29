import { useRef, useState } from "react";
import { Download, FileJson, FileSpreadsheet, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAppData } from "@/context/AppDataContext";
import { exportBackupFile, exportIncomesCsv, exportIncomesJson, readJsonFile } from "@/lib/exportUtils";
import { toast } from "@/components/ui/use-toast";

export function ExportImportPanel() {
  const { incomes, exportBackup, importBackup } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<unknown | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleExportBackup() {
    const backup = await exportBackup();
    exportBackupFile(backup);
    toast({ title: "הגיבוי יוצא בהצלחה", variant: "success" });
  }

  function handleExportCsv() {
    exportIncomesCsv(incomes);
    toast({ title: "קובץ ה-CSV יוצא בהצלחה", variant: "success" });
  }

  function handleExportJson() {
    exportIncomesJson(incomes);
    toast({ title: "קובץ ה-JSON יוצא בהצלחה", variant: "success" });
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      setImportError(null);
      setPendingImport(data);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "שגיאה בקריאת הקובץ");
      toast({ title: "לא ניתן לקרוא את הקובץ", description: "ודאי שמדובר בקובץ גיבוי JSON תקין", variant: "destructive" });
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    const result = await importBackup(pendingImport);
    if (!result.ok) {
      setImportError("מבנה הקובץ אינו תואם לגיבוי של האפליקציה");
    }
    setPendingImport(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ייצוא וייבוא נתונים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={handleExportCsv}>
            <FileSpreadsheet className="h-4 w-4" />
            ייצוא CSV
          </Button>
          <Button variant="outline" onClick={handleExportJson}>
            <FileJson className="h-4 w-4" />
            ייצוא JSON
          </Button>
          <Button variant="outline" onClick={handleExportBackup}>
            <Download className="h-4 w-4" />
            גיבוי מלא
          </Button>
        </div>

        <div className="border-t border-border/70 pt-4">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            ייבוא קובץ גיבוי JSON
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
          {importError && <p className="mt-2 text-sm font-medium text-destructive">{importError}</p>}
        </div>
      </CardContent>

      <AlertDialog open={Boolean(pendingImport)} onOpenChange={(open) => !open && setPendingImport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ייבוא קובץ גיבוי</AlertDialogTitle>
            <AlertDialogDescription>
              הפעולה תחליף את כל ההכנסות, היעדים וההגדרות הקיימים בנתונים מהקובץ שנבחר. לא ניתן לבטל פעולה זו. להמשיך?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={confirmImport}>כן, לייבא ולהחליף נתונים</AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
