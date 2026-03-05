import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Code2, Layers3, Plus, Settings2, Sparkles, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { pageBuilderElementCatalog } from "../block-engine/catalog";
import {
  type PageBuilderBlock,
  type PageBuilderBlockType,
} from "../block-engine/schema";
import { flattenPageBuilderBlocks } from "../block-engine/tree";

interface PageBuilderSidebarProps {
  blocks: PageBuilderBlock[];
  selectedBlock: PageBuilderBlock | null;
  selectedId: string | null;
  pageJson: string;
  onSelect: (id: string) => void;
  onAddBlock: (type: PageBuilderBlockType) => void;
  onUpdateContent: (field: string, value: string) => void;
}

function PaletteItem({
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
        "w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-left transition-colors hover:border-cyan-400/40",
        isDragging ? "opacity-60" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-100">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        </div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200">
          <Plus className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

function EmptyInspector({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
      {label}
    </div>
  );
}

export function PageBuilderSidebar({
  blocks,
  selectedBlock,
  selectedId,
  pageJson,
  onSelect,
  onAddBlock,
  onUpdateContent,
}: PageBuilderSidebarProps) {
  const layers = flattenPageBuilderBlocks(blocks);
  const groupedCatalog = pageBuilderElementCatalog.reduce<Record<string, typeof pageBuilderElementCatalog>>(
    (accumulator, item) => {
      accumulator[item.group] = [...(accumulator[item.group] || []), item];
      return accumulator;
    },
    {},
  );

  return (
    <aside className="w-full rounded-2xl border border-slate-700/80 bg-[#0a1020] p-3 shadow-[0_24px_80px_rgba(2,6,23,0.35)] xl:w-[18rem]">
      <header className="mb-3 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-200">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Left panel</p>
            <p className="text-xs text-slate-400">Elements, layers y contenido</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="elements" className="mt-2">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-slate-700 bg-slate-950/80 p-1">
          <TabsTrigger value="elements" className="rounded-lg px-2 text-[11px]">
            Elements
          </TabsTrigger>
          <TabsTrigger value="layers" className="rounded-lg px-2 text-[11px]">
            Layers
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg px-2 text-[11px]">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="space-y-4">
          <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
            {Object.entries(groupedCatalog).map(([group, items]) => (
              <div key={group} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-cyan-200" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {group}
                  </p>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <PaletteItem
                      key={item.type}
                      type={item.type}
                      label={item.label}
                      description={item.description}
                      onAddBlock={onAddBlock}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="layers" className="space-y-3">
          <div className="max-h-[72vh] space-y-2 overflow-y-auto pr-1">
            {layers.map(({ block, depth }) => (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelect(block.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                  selectedId === block.id
                    ? "border-cyan-400/50 bg-cyan-400/10"
                    : "border-slate-700 bg-slate-950/70 hover:border-slate-500",
                )}
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300"
                  style={{ marginLeft: `${depth * 10}px` }}
                >
                  <Layers3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-100">{block.type}</p>
                  <p className="truncate text-[11px] text-slate-400">{block.id}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">
          {!selectedBlock ? (
            <EmptyInspector label="Selecciona un bloque para editar contenido y revisar su JSON." />
          ) : (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-cyan-200" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Bloque activo</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-100">{selectedBlock.type}</p>
                <p className="mt-1 break-all text-[11px] text-slate-400">{selectedBlock.id}</p>
              </div>

              <div className="max-h-[34vh] space-y-3 overflow-y-auto pr-1">
                {Object.entries(selectedBlock.content).map(([field, value]) => {
                  const multiline =
                    value.length > 48 ||
                    field.toLowerCase().includes("body") ||
                    field.toLowerCase().includes("quote") ||
                    field.toLowerCase().includes("description") ||
                    field.toLowerCase().includes("subtitle") ||
                    field.toLowerCase().includes("summary");

                  return (
                    <div key={`${selectedBlock.id}-${field}`} className="space-y-1.5">
                      <Label
                        htmlFor={`content-${selectedBlock.id}-${field}`}
                        className="text-[10px] uppercase tracking-[0.16em] text-slate-400"
                      >
                        {field}
                      </Label>
                      {multiline ? (
                        <Textarea
                          id={`content-${selectedBlock.id}-${field}`}
                          value={value}
                          onChange={(event) => onUpdateContent(field, event.target.value)}
                          className="min-h-[84px] border-slate-700 bg-slate-950/80 text-slate-100"
                        />
                      ) : (
                        <Input
                          id={`content-${selectedBlock.id}-${field}`}
                          value={value}
                          onChange={(event) => onUpdateContent(field, event.target.value)}
                          className="h-9 border-slate-700 bg-slate-950/80 text-slate-100"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-200" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">page_json</p>
            </div>
            <pre className="mt-2 max-h-44 overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-2 text-[10px] leading-5 text-slate-300">
              {pageJson}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
