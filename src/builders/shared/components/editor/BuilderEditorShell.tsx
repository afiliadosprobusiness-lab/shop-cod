import type { ReactNode } from "react";

interface BuilderEditorShellProps {
  toolbar?: ReactNode;
  children: ReactNode;
}

export function BuilderEditorShell({ toolbar, children }: BuilderEditorShellProps) {
  return (
    <section className="space-y-5">
      {toolbar}
      {children}
    </section>
  );
}
