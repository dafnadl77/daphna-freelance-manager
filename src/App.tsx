import { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppDataProvider, useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import { Auth } from "@/pages/Auth";
import type { ScreenId } from "@/components/layout/nav-items";
import { Dashboard } from "@/pages/Dashboard";
import { Incomes } from "@/pages/Incomes";
import { Expenses } from "@/pages/Expenses";
import { Goals } from "@/pages/Goals";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">טוען נתונים...</p>
    </div>
  );
}

function AppShell() {
  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const { loading } = useAppData();

  if (loading) return <LoadingScreen />;

  return (
    <Layout active={screen} onNavigate={setScreen}>
      {screen === "dashboard" && <Dashboard onNavigate={setScreen} />}
      {screen === "incomes" && <Incomes />}
      {screen === "expenses" && <Expenses />}
      {screen === "goals" && <Goals />}
      {screen === "reports" && <Reports />}
      {screen === "settings" && <Settings />}
    </Layout>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Auth />;

  return (
    <AppDataProvider key={session.user.id}>
      <AppShell />
    </AppDataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
