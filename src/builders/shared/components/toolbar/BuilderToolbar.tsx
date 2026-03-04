import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BuilderToolbarProps {
  eyebrow: string;
  title: string;
  description: string;
  accentClassName?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function BuilderToolbar({
  eyebrow,
  title,
  description,
  accentClassName = "text-sky-200",
  actions,
  children,
  className,
}: BuilderToolbarProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-[0_30px_60px_rgba(2,6,23,0.28)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", accentClassName)}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
