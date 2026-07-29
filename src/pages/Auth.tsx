import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

type Mode = "signIn" | "signUp";

export function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError("יש להזין כתובת אימייל");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === "signIn" ? await signIn(email, password) : await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else if (mode === "signUp") {
        setInfo("נרשמת בהצלחה! אם נדרש אימות אימייל, בדקי את תיבת הדואר שלך.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("כדי לאפס סיסמה, הזיני קודם את כתובת האימייל שלך למעלה");
      return;
    }
    const result = await resetPassword(email);
    if (result.error) setError(result.error);
    else setInfo("נשלח אליך מייל לאיפוס סיסמה");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle>הכנסות שלי</CardTitle>
          <CardDescription>{mode === "signIn" ? "התחברות לחשבון שלך" : "יצירת חשבון חדש"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="את@דוגמה.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "הסתרת סיסמה" : "הצגת סיסמה"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {info && <p className="text-sm font-medium text-success">{info}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {mode === "signIn" ? "התחברות" : "הרשמה"}
            </Button>

            {mode === "signIn" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-center text-xs text-muted-foreground hover:underline"
              >
                שכחת סיסמה?
              </button>
            )}
          </form>

          <div className="mt-5 border-t border-border/70 pt-4 text-center text-sm">
            {mode === "signIn" ? (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => {
                  setMode("signUp");
                  setError(null);
                  setInfo(null);
                }}
              >
                אין לך חשבון? הרשמי כאן
              </button>
            ) : (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => {
                  setMode("signIn");
                  setError(null);
                  setInfo(null);
                }}
              >
                כבר יש לך חשבון? התחברי
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
