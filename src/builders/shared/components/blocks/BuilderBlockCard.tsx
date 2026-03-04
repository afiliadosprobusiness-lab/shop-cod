import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BuilderBlockCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  selected?: boolean;
  interactive?: boolean;
}

export function BuilderBlockCard({
  children,
  selected = false,
  interactive = false,
  className,
  ...props
}: BuilderBlockCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border p-4 shadow-[0_24px_50px_rgba(2,6,23,0.18)] transition-all",
        "border-white/10 bg-slate-950/75 text-white",
        selected ? "ring-2 ring-sky-400/70" : "",
        interactive ? "hover:border-white/20" : "",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
