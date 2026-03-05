import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, Code2, Layers3, Search, Settings2, SquareDashedMousePointer } from "lucide-react";
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
  description,
  onAddBlock,
}: {
  type: PageBuilderBlockType;
  label: string;
  description: string;
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
        "flex w-full items-start gap-2 border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-blue-300",
        isDragging ? "opacity-60" : "",
      )}
    >
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600">
        <SquareDashedMousePointer className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-slate-300 bg-white px-3 py-5 text-sm text-slate-500">
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
  const [search, setSearch] = useState("");
  const layers = flattenPageBuilderBlocks(blocks);
  const query = search.trim().toLowerCase();
  const groupedCatalog = useMemo(() => {
    const filtered = query
      ? pageBuilderElementCatalog.filter((item) => {
          return `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(query);
        })
      : pageBuilderElementCatalog;

    return filtered.reduce<Record<string, typeof pageBuilderElementCatalog>>((accumulator, item) => {
      accumulator[item.group] = [...(accumulator[item.group] || []), item];
      return accumulator;
    }, {});
  }, [query]);

  return (
    <aside className="h-full min-h-0 border-r border-slate-300 bg-white">
      <div className="flex h-full min-h-0 flex-col">
        <header className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-xl font-semibold text-slate-900">Build Your Page</h2>
          <div className="mt-3 grid grid-cols-3 gap-1 border border-slate-200 bg-slate-50 p-1">
            {([
              { key: "elements", label: "Elements" },
              { key: "layers", label: "Layers" },
              { key: "settings", label: "Settings" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "h-8 px-1 text-xs font-semibold",
                  activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 border-slate-300 bg-white pl-9 text-sm"
              aria-label="Buscar elemento"
              placeholder="Search element"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              Ctrl+F
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {activeTab === "elements" ? (
            <div className="space-y-4">
              {Object.entries(groupedCatalog).map(([group, items]) => (
                <section key={group} className="space-y-2">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group}</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <PaletteRow
                        key={item.type}
                        type={item.type}
                        label={item.label}
                        description={item.description}
                        onAddBlock={onAddBlock}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {Object.keys(groupedCatalog).length === 0 ? (
                <EmptyState label="No hay elementos para ese termino." />
              ) : null}
            </div>
          ) : null}

          {activeTab === "layers" ? (
            <div className="space-y-1">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 border px-2 py-2 text-left text-sm",
                  !selectedId ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white",
                )}
              >
                <Layers3 className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-900">Page</span>
              </button>
              {layers.map(({ block, depth }) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onSelect(block.id)}
                  className={cn(
                    "flex w-full items-center gap-2 border px-2 py-2 text-left text-sm",
                    selectedId === block.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                  style={{ paddingLeft: `${10 + depth * 14}px` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="font-medium capitalize text-slate-900">{block.type}</span>
                </button>
              ))}
            </div>
          ) : null}

          {activeTab === "settings" ? (
            <div className="space-y-3">
              {!selectedBlock ? (
                <EmptyState label="Selecciona un nodo para editar su contenido y revisar page_json." />
              ) : (
                <>
                  <div className="border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Settings2 className="h-4 w-4" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Active node</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold capitalize text-slate-900">{selectedBlock.type}</p>
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
                              className="min-h-[82px] border-slate-300 bg-white text-slate-900"
                            />
                          ) : (
                            <Input
                              id={`content-${selectedBlock.id}-${field}`}
                              value={value}
                              onChange={(event) => onUpdateContent(field, event.target.value)}
                              className="h-9 border-slate-300 bg-white text-slate-900"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Code2 className="h-4 w-4" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">page_json</p>
                    </div>
                    <pre className="mt-2 max-h-44 overflow-auto border border-slate-200 bg-slate-50 p-2 text-[10px] leading-5 text-slate-600">
                      {pageJson}
                    </pre>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
