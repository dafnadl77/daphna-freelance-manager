import { LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS, type ScreenId } from "./nav-items";

interface SidebarProps {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-border/60 bg-card/60 p-5 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-extrabold leading-tight text-foreground">הכנסות שלי</p>
          <p className="text-xs text-muted-foreground">ניהול תקציב לעצמאית</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="truncate px-2 text-xs text-muted-foreground/70">מחוברת כ־{user?.email}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          התנתקות
        </button>
      </div>
    </aside>
  );
}
