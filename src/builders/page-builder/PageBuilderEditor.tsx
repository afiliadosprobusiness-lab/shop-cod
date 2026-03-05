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
import { Layers3, Plus, Settings2 } from "lucide-react";
import { BuilderEditorShell } from "@/builders/shared";
import { PageBuilderCanvas } from "./canvas/PageBuilderCanvas";
import { type PageBuilderLeftTab, PageBuilderSidebar } from "./sidebar/PageBuilderSidebar";
import { PageBuilderStylePanel } from "./style-panel/PageBuilderStylePanel";
import { type PageBuilderBlock, type PageBuilderSeed } from "./block-engine/schema";
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
  const [previewMode, setPreviewMode] = useState(false);

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
      return (
        <div className="border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {activeDrag.blockType}
        </div>
      );
    }

    const activeBlock = findPageBuilderBlock(blocks, activeDrag.blockId);

    if (!activeBlock) {
      return null;
    }

    return (
      <div className="border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        {activeBlock.type}
      </div>
    );
  }, [activeDrag, blocks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        if (previewMode) {
          return;
        }
        handleDragStart(event);
      }}
      onDragEnd={(event) => {
        if (previewMode) {
          return;
        }
        handleDragEnd(event);
      }}
    >
      <BuilderEditorShell
        toolbar={
          <PageBuilderTopbar
            device={device}
            canUndo={canUndo}
            canRedo={canRedo}
            previewMode={previewMode}
            onUndo={undo}
            onRedo={redo}
            onTogglePreviewMode={() => setPreviewMode((current) => !current)}
            onDeviceChange={setDevice}
            onSave={() => onSave(blocks)}
            onOpenPreview={() => onPreview(blocks)}
            onPublish={() => onPublish(blocks)}
          />
        }
      >
        <div className="overflow-hidden border border-slate-300 bg-[#e9edf2]">
          <div className="grid grid-cols-1 xl:grid-cols-[3.2rem_19rem_minmax(0,1fr)_20rem]">
            <aside className="hidden border-r border-slate-300 bg-[#f7f8fa] xl:block">
              <div className="flex h-full flex-col items-center gap-2 py-3">
                {[
                  { key: "elements" as const, label: "Add", icon: Plus },
                  { key: "layers" as const, label: "Layers", icon: Layers3 },
                  { key: "settings" as const, label: "Settings", icon: Settings2 },
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
                      <span className={`inline-flex h-8 w-8 items-center justify-center border ${active ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-300 bg-white text-slate-500"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={`text-[11px] ${active ? "font-semibold text-blue-600" : "text-slate-500"}`}>{item.label}</span>
                    </button>
                  );
                })}
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
              previewMode={previewMode}
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
