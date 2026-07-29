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
    storageService.ts  שכבת גישה יחידה ל-localStorage (get/set/remove)
    dataService.ts      API ברמה גבוהה ל-CRUD על הכנסות/יעדים/הגדרות + גיבוי
    seedData.ts          נתוני הדוגמה שנוצרים בהפעלה הראשונה
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

## שמירת נתונים (localStorage)

כל הנתונים (הכנסות, יעדים, הגדרות) נשמרים בדפדפן באמצעות `localStorage`, דרך שתי שכבות:

1. **`storageService.ts`** — השכבה היחידה שנוגעת ב-`window.localStorage` ישירות. אחראית רק על get/set/remove גנרי, עם namespace קבוע ו-JSON serialization בטוח.
2. **`dataService.ts`** — ה-API שכל שאר האפליקציה משתמשת בו. חושף פונקציות async (`getIncomes`, `addIncome`, `updateGoal`, `exportBackup` וכו') כדי שממשק הקריאה יישאר זהה גם כשההטמעה תוחלף בעתיד.

אף רכיב תצוגה לא ניגש ל-`localStorage` ישירות — הכל עובר דרך `dataService`.

## מעבר עתידי ל-Lovable ול-Supabase

הפרויקט נבנה כך שהמעבר יהיה ממוקד וללא שינוי בממשקי הקריאה:

1. **Lovable**: ייבוא הפרויקט הקיים (React + TypeScript + Tailwind + shadcn/ui הם הסטאק המובנה של Lovable), ללא צורך בשינוי מבנה.
2. **Supabase**:
   - צרו טבלאות `incomes`, `goals`, `settings` (ראו את ה-interfaces ב-`src/types` כבסיס למבנה העמודות).
   - כתבו מימוש חדש ל-`dataService.ts` שמדבר עם Supabase (`supabase.from('incomes').select()` וכו') במקום עם `storageService`. מכיוון שכל הפונקציות כבר `async` והממשק (הפרמטרים וערכי ההחזרה) לא משתנה, **אין צורך לגעת באף קומפוננטת React**.
   - אפשר למחוק את `storageService.ts` או להשאיר אותו כ-fallback למצב אופליין.
3. **הרשמה והתחברות**: הוסיפו Supabase Auth, ועטפו את `AppDataProvider` בבדיקת session; הוסיפו עמודת `user_id` לכל טבלה וסננו לפי המשתמש המחובר.
4. **נתונים נפרדים לכל משתמשת**: מובטח באמצעות Row Level Security ב-Supabase על בסיס `user_id`.
5. **סנכרון בין מכשירים**: מגיע "בחינם" ברגע שהנתונים עוברים לשרת במקום ל-localStorage.
6. **סיכום שבועי אוטומטי / התראות ליעד מתקרב / דוח במייל**: אלו הופכים לזמינים בקלות ברגע שיש backend — למשל Supabase Edge Function שרצה בקרון ומשתמשת מחדש בפונקציות מ-`finance.ts` (שהן טהורות ועובדות גם בסביבת Node/Deno).

מבנה הגיבוי (`BackupData`) כולל שדה `version`, כדי לאפשר מיגרציות עתידיות של פורמט הנתונים בלי לשבור גיבויים קיימים של משתמשות.

## נתוני דוגמה

בהפעלה הראשונה נוצרת הכנסה לדוגמה אחת וארבעה יעדי ברירת מחדל (מדריד, קעקוע, לוס אנג׳לס, מדפסת תלת־ממד). ניתן למחוק את ההכנסה לדוגמה מעמוד ההגדרות, בכפתור "מחיקת נתוני דוגמה".
