import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Code2, Layers3, Plus, Settings2, Sparkles, Wand2 } from "lucide-react";
import { BuilderBlockCard, BuilderSidebar } from "@/builders/shared";
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
      className={cn("w-full text-left", isDragging ? "opacity-60" : "")}
    >
      <BuilderBlockCard interactive className="rounded-2xl border-slate-700/70 bg-slate-900/80 p-3 shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">{label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
          </div>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200">
            <Plus className="h-4 w-4" />
          </span>
        </div>
      </BuilderBlockCard>
    </button>
  );
}

function EmptyInspector({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-400">
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
    <BuilderSidebar
      eyebrow="Builder panel"
      description="Elements, layers y contenido del nodo activo."
      icon={<Sparkles className="h-5 w-5 text-cyan-200" />}
      className="max-w-sm xl:w-[19rem]"
    >
      <Tabs defaultValue="elements" className="mt-4">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-slate-700 bg-slate-900 p-1">
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
          <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-1">
            {Object.entries(groupedCatalog).map(([group, items]) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-cyan-200" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {group}
                  </p>
                </div>
                <div className="space-y-2.5">
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
          <div className="max-h-[62vh] space-y-2 overflow-y-auto pr-1">
            {layers.map(({ block, depth }) => (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelect(block.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  selectedId === block.id
                    ? "border-cyan-400/40 bg-cyan-500/10"
                    : "border-slate-700 bg-slate-900/70 hover:border-slate-500",
                )}
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-200"
                  style={{ marginLeft: `${depth * 10}px` }}
                >
                  <Layers3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">{block.type}</p>
                  <p className="truncate text-xs text-slate-400">{block.id}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {!selectedBlock ? (
            <EmptyInspector label="Selecciona un bloque para editar contenido y revisar su JSON." />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-cyan-200" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Nodo activo
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-100">{selectedBlock.type}</p>
                <p className="mt-1 break-all text-xs text-slate-400">{selectedBlock.id}</p>
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
                    <div key={`${selectedBlock.id}-${field}`} className="space-y-2">
                      <Label
                        htmlFor={`content-${selectedBlock.id}-${field}`}
                        className="text-xs uppercase tracking-[0.14em] text-slate-400"
                      >
                        {field}
                      </Label>
                      {multiline ? (
                        <Textarea
                          id={`content-${selectedBlock.id}-${field}`}
                          value={value}
                          onChange={(event) => onUpdateContent(field, event.target.value)}
                          className="min-h-[90px] border-slate-700 bg-slate-900/70 text-slate-100"
                        />
                      ) : (
                        <Input
                          id={`content-${selectedBlock.id}-${field}`}
                          value={value}
                          onChange={(event) => onUpdateContent(field, event.target.value)}
                          className="border-slate-700 bg-slate-900/70 text-slate-100"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                page_json
              </p>
            </div>
            <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-[11px] leading-5 text-slate-300">
              {pageJson}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </BuilderSidebar>
  );
}
