import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BuilderLibraryItem, BuilderSectionPreset, BuilderSidebarTab } from "@/features/funnel-builder/types";

export function LeftSidebar({
  tab,
  query,
  items,
  presets,
  onTabChange,
  onQueryChange,
  onAddElement,
  onAddPreset,
  onDragElementStart,
  onDragElementEnd,
}: {
  tab: BuilderSidebarTab;
  query: string;
  items: BuilderLibraryItem[];
  presets: BuilderSectionPreset[];
  onTabChange: (value: BuilderSidebarTab) => void;
  onQueryChange: (value: string) => void;
  onAddElement: (type: BuilderLibraryItem["type"]) => void;
  onAddPreset: (presetId: string) => void;
  onDragElementStart: (type: BuilderLibraryItem["type"]) => void;
  onDragElementEnd: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">Build Your Page</p>
      <p className="mt-1 text-xs text-muted-foreground">Arrastra elementos al canvas o usa click para agregar rapido.</p>

      <div className="mt-3 inline-flex w-full rounded-lg border border-border bg-background p-1">
        <button
          type="button"
          className={cn("flex-1 rounded-md px-2 py-1 text-sm", tab === "elements" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
          onClick={() => onTabChange("elements")}
        >
          Elements
        </button>
        <button
          type="button"
          className={cn("flex-1 rounded-md px-2 py-1 text-sm", tab === "sections" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
          onClick={() => onTabChange("sections")}
        >
          Sections
        </button>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} className="pl-9" placeholder="Buscar bloque o seccion" />
      </div>

      {tab === "elements" ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <Button
              key={item.type}
              type="button"
              draggable
              variant="outline"
              className="h-auto w-full cursor-grab justify-start rounded-xl px-3 py-2 text-left active:cursor-grabbing"
              onClick={() => onAddElement(item.type)}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copyMove";
                event.dataTransfer.setData("text/plain", item.type);
                onDragElementStart(item.type);
              }}
              onDragEnd={onDragElementEnd}
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Button>
          ))}
          {!items.length ? (
            <p className="rounded-lg border border-border bg-card px-3 py-4 text-xs text-muted-foreground">
              No hay elementos para esta busqueda.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {presets.map((preset) => (
            <article key={preset.id} className="rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-semibold">{preset.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
              <Button type="button" variant="outline" size="sm" className="mt-3 h-8 rounded-lg text-xs" onClick={() => onAddPreset(preset.id)}>
                Agregar preset
              </Button>
            </article>
          ))}
          {!presets.length ? (
            <p className="rounded-lg border border-border bg-card px-3 py-4 text-xs text-muted-foreground">
              No hay secciones para esta busqueda.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
