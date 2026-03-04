import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BuilderSidebarProps {
  eyebrow: string;
  description: string;
  icon?: ReactNode;
  accentClassName?: string;
  children: ReactNode;
  className?: string;
}

export function BuilderSidebar({
  eyebrow,
  description,
  icon,
  accentClassName = "text-sky-200",
  children,
  className,
}: BuilderSidebarProps) {
  return (
    <aside
      className={cn(
        "w-full shrink-0 rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_30px_60px_rgba(2,6,23,0.28)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        {icon ? (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-white/5 text-white">
            {icon}
          </div>
        ) : null}
        <div>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", accentClassName)}>
            {eyebrow}
          </p>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </aside>
  );
}
