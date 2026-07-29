import { useEffect, useState } from "react";
import { Info, LogOut, RotateCcw, Trash2 } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AppSettings } from "@/types";

export function Settings() {
  const { settings, updateSettings, resetSettings, clearSampleData, incomes } = useAppData();
  const { user, signOut } = useAuth();
  const [form, setForm] = useState<AppSettings>(settings);

  useEffect(() => setForm(settings), [settings]);

  const hasSampleData = incomes.some((i) => i.isSample);
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  function handleSave() {
    updateSettings(form);
  }

  function updateField<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">הגדרות</h1>
        <p className="text-sm text-muted-foreground">ערכי ברירת המחדל לחישובים באפליקציה</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>החשבון שלי</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">מחוברת כ־{user?.email}</p>
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            התנתקות
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>אחוזים ברירת מחדל</CardTitle>
          <CardDescription>הערכים האלו יוצעו אוטומטית בעת הוספת הכנסה חדשה, וניתן לשנות אותם לכל הכנסה בנפרד</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FieldRow label="מע״מ (%)" hint="שיעור המע״מ המחושב על כל הכנסה, לצורכי מעקב בלבד">
            <Input type="number" min={0} max={100} step="0.1" value={form.vatRate} onChange={(e) => updateField("vatRate", Number(e.target.value))} className="w-28" />
          </FieldRow>

          <FieldRow label="תשלום למטה / לגוף מפנה (%)">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.organizationFeeRate}
              onChange={(e) => updateField("organizationFeeRate", Number(e.target.value))}
              className="w-28"
            />
          </FieldRow>

          <FieldRow label="מס הכנסה (%)" hint="זהו אומדן לצורכי תכנון ואינו מחליף חישוב של רואה חשבון">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.incomeTaxRate}
              onChange={(e) => updateField("incomeTaxRate", Number(e.target.value))}
              className="w-28"
            />
          </FieldRow>

          <FieldRow label="רזרבה לעסק (%)">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.businessReserveRate}
              onChange={(e) => updateField("businessReserveRate", Number(e.target.value))}
              className="w-28"
            />
          </FieldRow>

          <FieldRow label="הפרשה ליעדים (%)" hint="אחוז מהנטו החודשי אחרי התחייבויות שיופרש לקרן היעדים">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.goalsRate}
              onChange={(e) => updateField("goalsRate", Number(e.target.value))}
              className="w-28"
            />
          </FieldRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ביטוח לאומי</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldRow label="סכום חודשי (₪)">
            <Input
              type="number"
              min={0}
              step="1"
              value={form.nationalInsuranceMonthly}
              onChange={(e) => updateField("nationalInsuranceMonthly", Number(e.target.value))}
              className="w-32"
            />
          </FieldRow>
          <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary" />
            ביטוח לאומי הוא סכום חודשי ויורד פעם אחת מסיכום החודש, לא מכל עסקה בנפרד
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תחזית ותצוגה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label="לכלול הכנסות ממתינות בתחזית החודשית">
            <Switch checked={form.includePendingInForecast} onCheckedChange={(v) => updateField("includePendingInForecast", v)} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">מטבע</p>
              <p>שקל ישראלי (₪)</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">פורמט מספרים</p>
              <p>he-IL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={!dirty}>
          שמירת הגדרות
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4" />
              איפוס להגדרות ברירת המחדל
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>איפוס הגדרות</AlertDialogTitle>
              <AlertDialogDescription>כל ההגדרות יחזרו לערכי ברירת המחדל של האפליקציה. הפעולה אינה משפיעה על ההכנסות והיעדים שלך.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => resetSettings()}>איפוס</AlertDialogAction>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {hasSampleData && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                מחיקת נתוני דוגמה
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>מחיקת נתוני דוגמה</AlertDialogTitle>
                <AlertDialogDescription>ההכנסה לדוגמה שנוצרה בהפעלה הראשונה תימחק. הפעולה אינה הפיכה.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => clearSampleData()}>מחיקה</AlertDialogAction>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label>{label}</Label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
