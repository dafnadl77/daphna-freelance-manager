import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import type { ScreenId } from "./nav-items";

interface LayoutProps {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  children: ReactNode;
}

export function Layout({ active, onNavigate, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileNav active={active} onNavigate={onNavigate} />
    </div>
  );
}
