import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "ok" | "warn" | "danger";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-surface text-muted border-border",
    ok: "bg-ok-bg text-ok border-ok/20",
    warn: "bg-warn-bg text-warn border-warn/20",
    danger: "bg-danger-bg text-danger border-danger/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
