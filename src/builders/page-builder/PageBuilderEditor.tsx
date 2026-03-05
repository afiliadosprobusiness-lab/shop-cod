import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Layers3, Plus, Settings2, SlidersHorizontal, SquarePen } from "lucide-react";
import { BuilderEditorShell } from "@/builders/shared";
import { PageBuilderCanvas } from "./canvas/PageBuilderCanvas";
import { renderBlock } from "./renderer/renderBlock";
import { type PageBuilderLeftTab, PageBuilderSidebar } from "./sidebar/PageBuilderSidebar";
import { PageBuilderStylePanel } from "./style-panel/PageBuilderStylePanel";
import { type PageBuilderBlock, type PageBuilderSeed, createPageBuilderBlock } from "./block-engine/schema";
import { findPageBuilderBlock } from "./block-engine/tree";
import { usePageBuilderState } from "./state-manager";
import { PageBuilderTopbar } from "./topbar/PageBuilderTopbar";

interface PageBuilderEditorProps {
  editorKey: string;
  initialBlocks: PageBuilderBlock[];
  seed?: PageBuilderSeed;
  pageTitle?: string;
  onBlocksChange: (blocks: PageBuilderBlock[]) => void;
  onSave: (blocks: PageBuilderBlock[]) => void;
  onPreview: (blocks: PageBuilderBlock[]) => void;
  onPublish: (blocks: PageBuilderBlock[]) => void;
}

export function PageBuilderEditor({
  editorKey,
  initialBlocks,
  seed,
  pageTitle,
  onBlocksChange,
  onSave,
  onPreview,
  onPublish,
}: PageBuilderEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [leftTab, setLeftTab] = useState<PageBuilderLeftTab>("elements");

  const {
    blocks,
    selectedId,
    selectedBlock,
    device,
    activeDrag,
    pageJson,
    canUndo,
    canRedo,
    setSelectedId,
    setDevice,
    addBlock,
    deleteBlock,
    duplicateBlock,
    undo,
    redo,
    updateInlineContent,
    updateSelectedContent,
    updateSelectedStyle,
    updateSelectedLayout,
    resizeBlock,
    handleDragStart,
    handleDragEnd,
  } = usePageBuilderState({
    editorKey,
    initialBlocks,
    seed,
    pageTitle,
    onBlocksChange,
  });

  const overlay = useMemo(() => {
    if (!activeDrag) {
      return null;
    }

    if (activeDrag.kind === "palette") {
      return renderBlock(createPageBuilderBlock(activeDrag.blockType, seed), {
        device,
      });
    }

    const activeBlock = findPageBuilderBlock(blocks, activeDrag.blockId);

    if (!activeBlock) {
      return null;
    }

    return renderBlock(activeBlock, { device });
  }, [activeDrag, blocks, device, seed]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <BuilderEditorShell
        toolbar={
          <PageBuilderTopbar
            device={device}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onDeviceChange={setDevice}
            onSave={() => onSave(blocks)}
            onPreview={() => onPreview(blocks)}
            onPublish={() => onPublish(blocks)}
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-[#eef1f5] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 xl:grid-cols-[3.2rem_18rem_minmax(0,1fr)_19rem]">
            <aside className="hidden border-r border-slate-300 bg-[#f8f9fb] xl:block">
              <div className="flex h-full flex-col items-center gap-2 py-3">
                {[
                  { key: "elements" as const, label: "Add", icon: Plus },
                  { key: "settings" as const, label: "Edit", icon: SquarePen },
                  { key: "layers" as const, label: "Layers", icon: Layers3 },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = leftTab === item.key;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setLeftTab(item.key)}
                      className="flex w-full flex-col items-center gap-1 px-1"
                    >
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${active ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-300 bg-white text-slate-500"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={`text-[11px] ${active ? "font-semibold text-blue-600" : "text-slate-500"}`}>{item.label}</span>
                    </button>
                  );
                })}
                <div className="mt-2 h-px w-8 bg-slate-300" />
                <button
                  type="button"
                  className="flex w-full flex-col items-center gap-1 px-1"
                  aria-label="Styles"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500">
                    <SlidersHorizontal className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] text-slate-500">Styles</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("settings")}
                  className="flex w-full flex-col items-center gap-1 px-1"
                  aria-label="Settings"
                >
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${leftTab === "settings" ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-300 bg-white text-slate-500"}`}>
                    <Settings2 className="h-4 w-4" />
                  </span>
                  <span className={`text-[11px] ${leftTab === "settings" ? "font-semibold text-blue-600" : "text-slate-500"}`}>Config</span>
                </button>
              </div>
            </aside>

            <PageBuilderSidebar
              blocks={blocks}
              selectedBlock={selectedBlock}
              selectedId={selectedId}
              pageJson={pageJson}
              activeTab={leftTab}
              onTabChange={setLeftTab}
              onSelect={setSelectedId}
              onAddBlock={addBlock}
              onUpdateContent={updateSelectedContent}
            />

            <PageBuilderCanvas
              blocks={blocks}
              selectedId={selectedId}
              device={device}
              onSelect={setSelectedId}
              onDelete={deleteBlock}
              onDuplicate={duplicateBlock}
              onResize={resizeBlock}
              onInlineChange={updateInlineContent}
            />

            <PageBuilderStylePanel
              selectedBlock={selectedBlock}
              onUpdateStyle={updateSelectedStyle}
              onUpdateLayout={updateSelectedLayout}
            />
          </div>
        </div>
      </BuilderEditorShell>

      <DragOverlay>
        {overlay ? <div className="w-[min(100vw-2rem,32rem)] opacity-95">{overlay}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
