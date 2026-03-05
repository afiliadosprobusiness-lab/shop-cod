import type { ReactNode } from "react";

export function EditorShell({
  topbar,
  leftSidebar,
  canvas,
  properties,
}: {
  topbar: ReactNode;
  leftSidebar: ReactNode;
  canvas: ReactNode;
  properties: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-3 lg:p-4">
      <div className="mb-3">{topbar}</div>
      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="rounded-xl border border-border bg-secondary/15 p-3">{leftSidebar}</aside>
        <section className="rounded-xl border border-border bg-background p-3">{canvas}</section>
        <aside className="rounded-xl border border-border bg-secondary/15 p-3">{properties}</aside>
      </div>
    </section>
  );
}
