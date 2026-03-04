import type { ReactNode } from "react";

interface MainContentProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function MainContent({
  eyebrow,
  title,
  description,
  actions,
  children,
}: MainContentProps) {
  return (
    <main className="flex-1 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <section className="rounded-[2rem] border border-border/80 bg-card/80 p-6 shadow-2xl shadow-black/10 backdrop-blur xl:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 space-y-3">
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  {eyebrow}
                </p>
              ) : null}
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
