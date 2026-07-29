# הכנסות שלי — ניהול תקציב לעצמאית

אפליקציית ווב לניהול הכנסות של עצמאית, וחלוקת הכסף בין התחייבויות (מע״מ, תשלום לגוף מפנה, מס הכנסה, רזרבה לעסק, ביטוח לאומי), יעדים עתידיים ומשכורת אישית.

## התקנה והרצה

דרישות: Node.js גרסה 18 ומעלה, ו-npm.

```bash
npm install
npm run dev
```

האפליקציה תיפתח בכתובת `http://localhost:5173`.

פקודות נוספות:

```bash
npm run build     # בדיקת טיפוסים + build לפרודקשן לתיקיית dist
npm run preview   # הרצת ה-build לבדיקה מקומית
npm run test      # הרצת בדיקות היחידה (vitest) על לוגיקת החישוב
```

## מבנה הפרויקט

```
src/
  types/            הגדרות TypeScript: Income, Goal, AppSettings, MonthlySummary, BackupData
  lib/
    finance.ts       כל נוסחאות החישוב הפיננסי (טהורות, ללא תלות ב-UI)
    finance.test.ts  בדיקות יחידה ללוגיקת החישוב
    format.ts        עיצוב מטבע/תאריך/אחוזים לפי locale he-IL
    exportUtils.ts    ייצוא CSV/JSON/גיבוי וקריאת קובצי ייבוא
    utils.ts          פונקציית cn (מיזוג classNames)
  services/
    supabaseClient.ts   לקוח Supabase (נבנה ממשתני הסביבה VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
    dataService.ts      API ברמה גבוהה ל-CRUD על הכנסות/יעדים/הגדרות + גיבוי, מול Supabase
  context/
    AppDataContext.tsx  ה-state הגלובלי של האפליקציה (React Context), עוטף את dataService
  components/
    ui/          רכיבי shadcn/ui (Button, Card, Dialog, Select, Toast וכו')
    layout/      תפריט ניווט (Sidebar למחשב, MobileNav לנייד)
    dashboard/   רכיבי לוח הבקרה (כרטיסי סיכום, גרפים, יעדים)
    incomes/     טופס הכנסה, כרטיס הכנסה, סינון
    goals/       כרטיס יעד, טופס יעד, אנימציית חגיגה
    reports/     גרפים והשוואות, ייצוא/ייבוא
    settings/    (מוטמע בעמוד Settings)
    shared/      MonthPicker משותף
  pages/         חמשת המסכים הראשיים (Dashboard, Incomes, Goals, Reports, Settings)
```

### עקרון מפתח: הפרדת לוגיקה מתצוגה

כל נוסחת חישוב נמצאת ב-`src/lib/finance.ts` כפונקציה טהורה (ללא state, ללא side effects), ומכוסה בבדיקות יחידה. רכיבי ה-UI רק קוראים לפונקציות האלו ומציגים את התוצאה — כך שאפשר לבדוק ולתחזק את הלוגיקה הפיננסית בנפרד לגמרי מהעיצוב.

## הסבר על החישובים

לכל הכנסה (`calculateIncomeBreakdown` ב-`finance.ts`):

```
vatAmount            = amountBeforeVat × vatRate
invoiceTotal          = amountBeforeVat + vatAmount
organizationFee        = amountBeforeVat × organizationFeeRate   (אם סומן "יש תשלום למטה")
incomeTax               = amountBeforeVat × incomeTaxRate         (אם סומן "לחשב מס")
businessReserve          = amountBeforeVat × businessReserveRate   (אם סומן "להפריש רזרבה")
remainingBeforeNationalInsurance = amountBeforeVat − organizationFee − incomeTax − businessReserve
```

לחישוב החודשי (`computeMonthlySummary`):

```
monthlyIncome            = סכום ההכנסות הכלולות בחודש (סטטוס "התקבל", ובהתאם להגדרה גם "ממתין")
monthlyNationalInsurance = סכום קבוע אחד, רק אם קיימת לפחות הכנסה אחת שנכללת באותו חודש
netAfterObligations       = MAX(0, monthlyIncome − סה״כ תשלומים למטה − סה״כ מס הכנסה − סה״כ רזרבה − ביטוח לאומי)
goalsFund                  = netAfterObligations × goalsRate
personalNet                 = MAX(0, netAfterObligations − goalsFund)
```

הכנסות בסטטוס **בוטל** אינן נכללות בחישוב בשום מקרה. הכנסות בסטטוס **ממתין** נכללות רק אם הוגדר כך ב"הגדרות" (ברירת המחדל: כן).

המע״מ **אינו** מופחת מהחישוב של הנטו — הוא מוצג בנפרד כסכום למעקב בלבד, כי הסכום שמוזן הוא תמיד לפני מע״מ.

## שמירת נתונים (Supabase)

כל הנתונים (הכנסות, יעדים, הגדרות) נשמרים במסד נתונים משותף ב-Supabase — **אותם נתונים מכל מכשיר ודפדפן**, לא רק בדפדפן הנוכחי. שלוש טבלאות: `incomes`, `goals`, `app_settings` (שורה יחידה עם `id=1`).

1. **`supabaseClient.ts`** — יוצר לקוח Supabase יחיד מתוך משתני הסביבה `VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY`.
2. **`dataService.ts`** — ה-API שכל שאר האפליקציה משתמשת בו. חושף פונקציות async (`getIncomes`, `addIncome`, `updateGoal`, `exportBackup` וכו') שמדברות עם הטבלאות ישירות.

אף רכיב תצוגה לא ניגש ל-Supabase ישירות — הכל עובר דרך `dataService`.

⚠️ **הערת אבטחה**: כרגע אין מסך התחברות/הרשמה, כך שכל מי שיש לו את קישור האתר יכול לצפות ולערוך את הנתונים (כמו שהיה קודם עם localStorage, רק עכשיו משותף בין מכשירים). אם בעתיד רוצים להגביל גישה — יש להוסיף Supabase Auth (ראו סעיף הבא).

### הגדרת סביבה מקומית

צרו קובץ `.env` (לא נכנס ל-git) לפי `.env.example`:

```
VITE_SUPABASE_URL=https://uhbdpcdkkzuazruhefrw.supabase.co
VITE_SUPABASE_ANON_KEY=<המפתח הציבורי מ-Supabase>
```

באתר הפרוס ב-Vercel, אותם משתנים מוגדרים תחת Project Settings → Environment Variables.

## מעבר עתידי ל-Lovable ולהרשמה/התחברות

1. **Lovable**: ייבוא הפרויקט הקיים (React + TypeScript + Tailwind + shadcn/ui + Supabase הם הסטאק המובנה של Lovable), ללא צורך בשינוי מבנה.
2. **הרשמה והתחברות**: הוסיפו Supabase Auth, ועטפו את `AppDataProvider` בבדיקת session; הוסיפו עמודת `user_id` לכל טבלה, הפעילו Row Level Security לפי המשתמש המחובר, וסננו את כל השאילתות ב-`dataService.ts` לפיו.
3. **סיכום שבועי אוטומטי / התראות ליעד מתקרב / דוח במייל**: אלו הופכים לזמינים בקלות עם Supabase Edge Function שרצה בקרון ומשתמשת מחדש בפונקציות מ-`finance.ts` (שהן טהורות ועובדות גם בסביבת Node/Deno).

מבנה הגיבוי (`BackupData`) כולל שדה `version`, כדי לאפשר מיגרציות עתידיות של פורמט הנתונים בלי לשבור גיבויים קיימים של משתמשות.

## נתוני דוגמה

בהפעלה הראשונה נוצרת הכנסה לדוגמה אחת וארבעה יעדי ברירת מחדל (מדריד, קעקוע, לוס אנג׳לס, מדפסת תלת־ממד). ניתן למחוק את ההכנסה לדוגמה מעמוד ההגדרות, בכפתור "מחיקת נתוני דוגמה".
