import { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, Code2, Layers3, Plus, Search, Settings2, SquareDashedMousePointer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { pageBuilderElementCatalog } from "../block-engine/catalog";
import {
  type PageBuilderBlock,
  type PageBuilderBlockType,
} from "../block-engine/schema";
import { flattenPageBuilderBlocks } from "../block-engine/tree";

export type PageBuilderLeftTab = "elements" | "layers" | "settings";

interface PageBuilderSidebarProps {
  blocks: PageBuilderBlock[];
  selectedBlock: PageBuilderBlock | null;
  selectedId: string | null;
  pageJson: string;
  activeTab: PageBuilderLeftTab;
  onTabChange: (tab: PageBuilderLeftTab) => void;
  onSelect: (id: string) => void;
  onAddBlock: (type: PageBuilderBlockType) => void;
  onUpdateContent: (field: string, value: string) => void;
}

function PaletteRow({
  type,
  label,
  onAddBlock,
}: {
  type: PageBuilderBlockType;
  label: string;
  onAddBlock: (type: PageBuilderBlockType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: {
      kind: "palette",
      blockType: type,
    },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      style={style}
      onDoubleClick={() => onAddBlock(type)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50",
        isDragging ? "opacity-60" : "",
      )}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-600">
        <SquareDashedMousePointer className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
      {label}
    </div>
  );
}

export function PageBuilderSidebar({
  blocks,
  selectedBlock,
  selectedId,
  pageJson,
  activeTab,
  onTabChange,
  onSelect,
  onAddBlock,
  onUpdateContent,
}: PageBuilderSidebarProps) {
  const layers = flattenPageBuilderBlocks(blocks);
  const groupedCatalog = useMemo(
    () =>
      pageBuilderElementCatalog.reduce<Record<string, typeof pageBuilderElementCatalog>>((accumulator, item) => {
        accumulator[item.group] = [...(accumulator[item.group] || []), item];
        return accumulator;
      }, {}),
    [],
  );

  return (
    <aside className="h-full min-h-0 rounded-r-xl border-r border-slate-300 bg-[#f5f6f8]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="border-b border-slate-300 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Build Your Page</h2>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500"
              aria-label="Colapsar panel"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-slate-300 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onTabChange("elements")}
              className={cn(
                "h-8 rounded-md text-sm font-medium",
                activeTab === "elements" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
              )}
            >
              Elements
            </button>
            <button
              type="button"
              onClick={() => onTabChange("layers")}
              className={cn(
                "h-8 rounded-md text-sm font-medium",
                activeTab === "layers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
              )}
            >
              Sections
            </button>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value=""
              readOnly
              className="h-9 border-slate-300 bg-white pl-9 text-sm text-slate-500"
              aria-label="Buscar elemento"
              placeholder="Search"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Ctrl+F</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {activeTab === "elements" ? (
            <div className="space-y-4">
              {Object.entries(groupedCatalog).map(([group, items]) => (
                <section key={group} className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{group}</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <PaletteRow
                        key={item.type}
                        type={item.type}
                        label={item.label}
                        onAddBlock={onAddBlock}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {activeTab === "layers" ? (
            <div className="space-y-2">
              {layers.map(({ block, depth }) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onSelect(block.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left",
                    selectedId === block.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-300 bg-white hover:border-slate-400",
                  )}
                >
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-500"
                    style={{ marginLeft: `${depth * 10}px` }}
                  >
                    <Layers3 className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{block.type}</p>
                    <p className="truncate text-xs text-slate-500">{block.id}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {activeTab === "settings" ? (
            <div className="space-y-3">
              {!selectedBlock ? (
                <EmptyState label="Selecciona un bloque para editar contenido y ver el JSON." />
              ) : (
                <>
                  <div className="rounded-lg border border-slate-300 bg-white p-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Settings2 className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">Active block</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{selectedBlock.type}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">{selectedBlock.id}</p>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(selectedBlock.content).map(([field, value]) => {
                      const multiline =
                        value.length > 44 ||
                        field.toLowerCase().includes("body") ||
                        field.toLowerCase().includes("quote") ||
                        field.toLowerCase().includes("description") ||
                        field.toLowerCase().includes("subtitle") ||
                        field.toLowerCase().includes("summary");

                      return (
                        <div key={`${selectedBlock.id}-${field}`} className="space-y-1.5">
                          <Label
                            htmlFor={`content-${selectedBlock.id}-${field}`}
                            className="text-[10px] uppercase tracking-[0.16em] text-slate-500"
                          >
                            {field}
                          </Label>
                          {multiline ? (
                            <Textarea
                              id={`content-${selectedBlock.id}-${field}`}
                              value={value}
                              onChange={(event) => onUpdateContent(field, event.target.value)}
                              className="min-h-[82px] border-slate-300 bg-white text-slate-800"
                            />
                          ) : (
                            <Input
                              id={`content-${selectedBlock.id}-${field}`}
                              value={value}
                              onChange={(event) => onUpdateContent(field, event.target.value)}
                              className="h-9 border-slate-300 bg-white text-slate-800"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-slate-300 bg-white p-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Code2 className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">page_json</p>
                    </div>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-[10px] leading-5 text-slate-600">
                      {pageJson}
                    </pre>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        <footer className="border-t border-slate-300 px-3 py-2">
          <button
            type="button"
            onClick={() => onTabChange("settings")}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm",
              activeTab === "settings" ? "text-blue-600" : "text-slate-600",
            )}
          >
            <Plus className="h-4 w-4" />
            Open Block Settings
          </button>
        </footer>
      </div>
    </aside>
  );
}
