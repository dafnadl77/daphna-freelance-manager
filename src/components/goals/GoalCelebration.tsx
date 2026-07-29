import { PartyPopper } from "lucide-react";
import type { Goal } from "@/types";

export function GoalCelebration({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl bg-card p-8 text-center shadow-xl animate-confetti-pop">
        <div className="text-5xl">{goal.icon}</div>
        <div className="flex items-center gap-2 text-xl font-extrabold text-success">
          <PartyPopper className="h-6 w-6" />
          עשית את זה! הגעת ליעד
        </div>
        <p className="text-sm text-muted-foreground">
          היעד ״{goal.name}״ הושלם במלואו. מגיע לך לחגוג!
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          יאללה, קדימה ליעד הבא
        </button>
      </div>
    </div>
  );
}
