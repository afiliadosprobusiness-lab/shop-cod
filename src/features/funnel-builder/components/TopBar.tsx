import { Monitor, Redo2, Save, Smartphone, Tablet, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BuilderBreakpoint } from "@/features/funnel-builder/types";

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveStatus({ state, at }: { state: SaveState; at: string | null }) {
  if (state === "saving") return <p className="text-xs text-muted-foreground">Guardando cambios...</p>;
  if (state === "error") return <p className="text-xs text-destructive">Error de guardado automatico</p>;
  if (state === "saved" && at) {
    return (
      <p className="text-xs text-muted-foreground">
        Guardado automatico {new Date(at).toLocaleTimeString("es-PE")}
      </p>
    );
  }
  return <p className="text-xs text-muted-foreground">Sin cambios pendientes</p>;
}

export function BuilderTopBar({
  title,
  saveState,
  lastSavedAt,
  breakpoint,
  onBreakpointChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveNow,
  previewHref,
  onBack,
  onContinue,
}: {
  title: string;
  saveState: SaveState;
  lastSavedAt: string | null;
  breakpoint: BuilderBreakpoint;
  onBreakpointChange: (value: BuilderBreakpoint) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveNow: () => void;
  previewHref: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <SaveStatus state={saveState} at={lastSavedAt} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-lg" disabled={!canUndo} onClick={onUndo}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-lg" disabled={!canRedo} onClick={onRedo}>
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="inline-flex rounded-lg border border-border bg-background p-1">
          <button
            type="button"
            className={cn("rounded-md px-2 py-1", breakpoint === "desktop" ? "bg-primary/15 text-primary" : "")}
            onClick={() => onBreakpointChange("desktop")}
            aria-label="Vista desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn("rounded-md px-2 py-1", breakpoint === "tablet" ? "bg-primary/15 text-primary" : "")}
            onClick={() => onBreakpointChange("tablet")}
            aria-label="Vista tablet"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn("rounded-md px-2 py-1", breakpoint === "mobile" ? "bg-primary/15 text-primary" : "")}
            onClick={() => onBreakpointChange("mobile")}
            aria-label="Vista mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <Button type="button" variant="outline" size="sm" className="rounded-lg" asChild>
          <Link to={previewHref} target="_blank" rel="noreferrer">
            Preview
          </Link>
        </Button>
        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onSaveNow}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onBack}>
          Volver
        </Button>
        <Button type="button" size="sm" className="rounded-lg" onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
