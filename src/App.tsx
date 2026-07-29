import { useState } from "react";
import { AppDataProvider, useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import type { ScreenId } from "@/components/layout/nav-items";
import { Dashboard } from "@/pages/Dashboard";
import { Incomes } from "@/pages/Incomes";
import { Goals } from "@/pages/Goals";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";

function AppShell() {
  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const { loading } = useAppData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <Layout active={screen} onNavigate={setScreen}>
      {screen === "dashboard" && <Dashboard onNavigate={setScreen} />}
      {screen === "incomes" && <Incomes />}
      {screen === "goals" && <Goals />}
      {screen === "reports" && <Reports />}
      {screen === "settings" && <Settings />}
    </Layout>
  );
}

function App() {
  return (
    <AppDataProvider>
      <AppShell />
      <Toaster />
    </AppDataProvider>
  );
}

export default App;
