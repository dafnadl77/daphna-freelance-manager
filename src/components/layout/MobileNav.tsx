import { cn } from "@/lib/utils";
import { NAV_ITEMS, type ScreenId } from "./nav-items";

interface MobileNavProps {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-6 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                "flex flex-col items-center gap-1 px-0.5 py-2.5 text-[9px] font-semibold leading-tight transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/15")} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
