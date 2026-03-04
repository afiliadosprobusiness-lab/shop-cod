import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { BuilderEditorShell } from "@/builders/shared";
import { PageBuilderCanvas } from "./canvas/PageBuilderCanvas";
import { PageBuilderSidebar } from "./sidebar/PageBuilderSidebar";
import { PageBuilderTopbar } from "./topbar/PageBuilderTopbar";
import {
  canAcceptChildren,
  createDefaultPageBuilderBlocks,
  createPageBuilderBlock,
  type PageBuilderBlock,
  type PageBuilderBlockType,
  type PageBuilderDevice,
  type PageBuilderSeed,
} from "./blocks/schema";
import {
  findPageBuilderBlock,
  findPageBuilderBlockLocation,
  insertPageBuilderBlock,
  movePageBuilderBlock,
  removePageBuilderBlock,
  updatePageBuilderBlock,
} from "./blocks/tree";
import { renderBlock } from "./renderer/renderBlock";

interface PageBuilderEditorProps {
  editorKey: string;
  initialBlocks: PageBuilderBlock[];
  seed?: PageBuilderSeed;
  onBlocksChange: (blocks: PageBuilderBlock[]) => void;
  onSave: (blocks: PageBuilderBlock[]) => void;
  onPreview: (blocks: PageBuilderBlock[]) => void;
  onPublish: (blocks: PageBuilderBlock[]) => void;
}

type BuilderHistory = {
  timeline: PageBuilderBlock[][];
  index: number;
};

type DragMeta =
  | { kind: "palette"; blockType: PageBuilderBlockType }
  | { kind: "block"; blockId: string }
  | null;

function serializeBlocks(blocks: PageBuilderBlock[]) {
  return JSON.stringify(blocks);
}

export function PageBuilderEditor({
  editorKey,
  initialBlocks,
  seed,
  onBlocksChange,
  onSave,
  onPreview,
  onPublish,
}: PageBuilderEditorProps) {
  const initialSeedRef = useRef<PageBuilderBlock[]>(
    initialBlocks.length ? initialBlocks : createDefaultPageBuilderBlocks(seed),
  );
  const previousEditorKeyRef = useRef<string | null>(null);

  const [history, setHistory] = useState<BuilderHistory>(() => {
    return {
      timeline: [initialSeedRef.current],
      index: 0,
    };
  });
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSeedRef.current[0]?.id || null,
  );
  const [device, setDevice] = useState<PageBuilderDevice>("desktop");
  const [activeDrag, setActiveDrag] = useState<DragMeta>(null);

  useEffect(() => {
    if (previousEditorKeyRef.current === editorKey) {
      return;
    }

    previousEditorKeyRef.current = editorKey;

    const seedBlocks =
      initialBlocks.length ? initialBlocks : createDefaultPageBuilderBlocks(seed);

    initialSeedRef.current = seedBlocks;

    setHistory({
      timeline: [seedBlocks],
      index: 0,
    });
    setSelectedId(seedBlocks[0]?.id || null);
    setDevice("desktop");
  }, [editorKey, initialBlocks, seed]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const blocks = useMemo(() => history.timeline[history.index] || [], [history]);
  const selectedBlock = selectedId ? findPageBuilderBlock(blocks, selectedId) : null;
  const canUndo = history.index > 0;
  const canRedo = history.index < history.timeline.length - 1;

  const commitBlocks = useCallback(
    (nextBlocks: PageBuilderBlock[], nextSelectedId?: string | null) => {
      const currentBlocks = history.timeline[history.index] || [];

      if (serializeBlocks(currentBlocks) === serializeBlocks(nextBlocks)) {
        if (nextSelectedId !== undefined) {
          setSelectedId(nextSelectedId);
        }
        return;
      }

      const nextTimeline = [...history.timeline.slice(0, history.index + 1), nextBlocks];

      setHistory({
        timeline: nextTimeline,
        index: nextTimeline.length - 1,
      });

      if (nextSelectedId !== undefined) {
        setSelectedId(nextSelectedId);
      } else if (selectedId && !findPageBuilderBlock(nextBlocks, selectedId)) {
        setSelectedId(nextBlocks[0]?.id || null);
      }

      onBlocksChange(nextBlocks);
    },
    [history, onBlocksChange, selectedId],
  );

  const handleUndo = () => {
    if (!canUndo) {
      return;
    }

    const nextIndex = history.index - 1;
    const nextBlocks = history.timeline[nextIndex];

    setHistory({
      timeline: history.timeline,
      index: nextIndex,
    });

    if (selectedId && !findPageBuilderBlock(nextBlocks, selectedId)) {
      setSelectedId(nextBlocks[0]?.id || null);
    }

    onBlocksChange(nextBlocks);
  };

  const handleRedo = () => {
    if (!canRedo) {
      return;
    }

    const nextIndex = history.index + 1;
    const nextBlocks = history.timeline[nextIndex];

    setHistory({
      timeline: history.timeline,
      index: nextIndex,
    });

    if (selectedId && !findPageBuilderBlock(nextBlocks, selectedId)) {
      setSelectedId(nextBlocks[0]?.id || null);
    }

    onBlocksChange(nextBlocks);
  };

  const resolveDefaultInsertTarget = useMemo(() => {
    if (!selectedId) {
      return {
        parentId: null,
        index: blocks.length,
      };
    }

    const selected = findPageBuilderBlock(blocks, selectedId);

    if (selected && canAcceptChildren(selected.type)) {
      return {
        parentId: selected.id,
        index: selected.children.length,
      };
    }

    const location = findPageBuilderBlockLocation(blocks, selectedId);

    if (!location) {
      return {
        parentId: null,
        index: blocks.length,
      };
    }

    return {
      parentId: location.parentId,
      index: location.index + 1,
    };
  }, [blocks, selectedId]);

  const handleAddBlock = (type: PageBuilderBlockType) => {
    const nextBlock = createPageBuilderBlock(type, seed);
    const nextBlocks = insertPageBuilderBlock(
      blocks,
      resolveDefaultInsertTarget.parentId,
      resolveDefaultInsertTarget.index,
      nextBlock,
    );

    commitBlocks(nextBlocks, nextBlock.id);
  };

  const handleDeleteBlock = (id: string) => {
    const result = removePageBuilderBlock(blocks, id);

    if (!result.removed) {
      return;
    }

    commitBlocks(result.blocks, result.blocks[0]?.id || null);
  };

  const handleInlineChange = (id: string, field: string, value: string) => {
    const nextBlocks = updatePageBuilderBlock(blocks, id, (block) => ({
      ...block,
      content: {
        ...block.content,
        [field]: value,
      },
    }));

    commitBlocks(nextBlocks);
  };

  const handleContentUpdate = (field: string, value: string) => {
    if (!selectedBlock) {
      return;
    }

    handleInlineChange(selectedBlock.id, field, value);
  };

  const handleStyleUpdate = (
    field: keyof PageBuilderBlock["style"],
    value: string,
  ) => {
    if (!selectedBlock) {
      return;
    }

    const nextBlocks = updatePageBuilderBlock(blocks, selectedBlock.id, (block) => ({
      ...block,
      style: {
        ...block.style,
        [field]: value,
      },
    }));

    commitBlocks(nextBlocks);
  };

  const handleLayoutUpdate = (
    field: keyof PageBuilderBlock["layout"],
    value: string,
  ) => {
    if (!selectedBlock) {
      return;
    }

    const nextValue =
      field === "columns" ? Math.max(2, Number.parseInt(value || "2", 10) || 2) : value;

    const nextBlocks = updatePageBuilderBlock(blocks, selectedBlock.id, (block) => ({
      ...block,
      layout: {
        ...block.layout,
        [field]: nextValue,
      },
    }));

    commitBlocks(nextBlocks);
  };

  const resolveTargetFromDrop = (overId: string, overData: Record<string, unknown>) => {
    if (overData.kind === "slot") {
      return {
        parentId:
          typeof overData.parentId === "string" ? overData.parentId : null,
        index: typeof overData.index === "number" ? overData.index : 0,
      };
    }

    const location = findPageBuilderBlockLocation(blocks, overId);

    if (!location) {
      return {
        parentId: null,
        index: blocks.length,
      };
    }

    return {
      parentId: location.parentId,
      index: location.index,
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current as DragMeta;

    setActiveDrag(activeData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);

    const activeData = event.active.data.current as DragMeta;
    const overData = event.over?.data.current as Record<string, unknown> | undefined;
    const overId = event.over?.id;

    if (!activeData || !overData || !overId) {
      return;
    }

    const target = resolveTargetFromDrop(String(overId), overData);

    if (activeData.kind === "palette") {
      const nextBlock = createPageBuilderBlock(activeData.blockType, seed);
      const nextBlocks = insertPageBuilderBlock(
        blocks,
        target.parentId,
        target.index,
        nextBlock,
      );

      commitBlocks(nextBlocks, nextBlock.id);
      return;
    }

    const nextBlocks = movePageBuilderBlock(
      blocks,
      activeData.blockId,
      target.parentId,
      target.index,
    );

    commitBlocks(nextBlocks, activeData.blockId);
  };

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
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDeviceChange={setDevice}
            onSave={() => onSave(blocks)}
            onPreview={() => onPreview(blocks)}
            onPublish={() => onPublish(blocks)}
          />
        }
      >
        <div className="flex flex-col gap-5 xl:flex-row">
          <PageBuilderSidebar
            blocks={blocks}
            selectedBlock={selectedBlock}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddBlock={handleAddBlock}
            onUpdateContent={handleContentUpdate}
            onUpdateStyle={handleStyleUpdate}
            onUpdateLayout={handleLayoutUpdate}
          />

          <PageBuilderCanvas
            blocks={blocks}
            selectedId={selectedId}
            device={device}
            onSelect={setSelectedId}
            onDelete={handleDeleteBlock}
            onInlineChange={handleInlineChange}
          />
        </div>
      </BuilderEditorShell>

      <DragOverlay>
        {overlay ? <div className="w-[min(100vw-2rem,32rem)] opacity-95">{overlay}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
