import { useMemo } from "react";
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
import { BuilderEditorShell } from "@/builders/shared";
import { PageBuilderCanvas } from "./canvas/PageBuilderCanvas";
import { renderBlock } from "./renderer/renderBlock";
import { PageBuilderSidebar } from "./sidebar/PageBuilderSidebar";
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-[#070d1a] p-3 shadow-[0_34px_120px_rgba(2,6,23,0.5)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.1),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.08),transparent_35%)]" />
          <div className="relative grid grid-cols-1 gap-3 xl:grid-cols-[18rem_minmax(0,1fr)_19rem]">
            <PageBuilderSidebar
              blocks={blocks}
              selectedBlock={selectedBlock}
              selectedId={selectedId}
              pageJson={pageJson}
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
