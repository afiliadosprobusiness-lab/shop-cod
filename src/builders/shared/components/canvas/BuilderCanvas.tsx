import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BuilderCanvasProps {
  eyebrow: string;
  title: string;
  description: string;
  accentClassName?: string;
  headerBadge?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function BuilderCanvas({
  eyebrow,
  title,
  description,
  accentClassName = "text-sky-200",
  headerBadge,
  headerActions,
  children,
  className,
  bodyClassName,
}: BuilderCanvasProps) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_30px_60px_rgba(2,6,23,0.28)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", accentClassName)}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {headerActions}
          {headerBadge}
        </div>
      </div>

      <div className={cn("pt-5", bodyClassName)}>{children}</div>
    </section>
  );
}
