import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import {
  canAcceptChildren,
  createDefaultPageBuilderBlocks,
  createPageBuilderBlock,
  serializePageBuilderDocument,
  type PageBuilderBlock,
  type PageBuilderBlockType,
  type PageBuilderDevice,
  type PageBuilderSeed,
} from "../block-engine/schema";
import {
  duplicatePageBuilderBlock,
  findPageBuilderBlock,
  findPageBuilderBlockLocation,
  insertPageBuilderBlock,
  movePageBuilderBlock,
  removePageBuilderBlock,
  updatePageBuilderBlock,
} from "../block-engine/tree";

type BuilderHistory = {
  timeline: PageBuilderBlock[][];
  index: number;
};

export type PageBuilderDragMeta =
  | { kind: "palette"; blockType: PageBuilderBlockType }
  | { kind: "block"; blockId: string }
  | null;

function serializeBlocks(blocks: PageBuilderBlock[]) {
  return JSON.stringify(blocks);
}

function cycleWidth(width: PageBuilderBlock["layout"]["width"]): PageBuilderBlock["layout"]["width"] {
  if (width === "narrow") {
    return "wide";
  }

  if (width === "wide") {
    return "full";
  }

  return "narrow";
}

export interface UsePageBuilderStateArgs {
  editorKey: string;
  initialBlocks: PageBuilderBlock[];
  seed?: PageBuilderSeed;
  pageTitle?: string;
  onBlocksChange: (blocks: PageBuilderBlock[]) => void;
}

export function usePageBuilderState({
  editorKey,
  initialBlocks,
  seed,
  pageTitle,
  onBlocksChange,
}: UsePageBuilderStateArgs) {
  const initialSeedRef = useRef<PageBuilderBlock[]>(
    initialBlocks.length ? initialBlocks : createDefaultPageBuilderBlocks(seed),
  );
  const previousEditorKeyRef = useRef<string | null>(null);

  const [history, setHistory] = useState<BuilderHistory>(() => ({
    timeline: [initialSeedRef.current],
    index: 0,
  }));
  const [selectedId, setSelectedId] = useState<string | null>(initialSeedRef.current[0]?.id || null);
  const [device, setDevice] = useState<PageBuilderDevice>("desktop");
  const [activeDrag, setActiveDrag] = useState<PageBuilderDragMeta>(null);

  useEffect(() => {
    if (previousEditorKeyRef.current === editorKey) {
      return;
    }

    previousEditorKeyRef.current = editorKey;

    const seedBlocks = initialBlocks.length ? initialBlocks : createDefaultPageBuilderBlocks(seed);

    initialSeedRef.current = seedBlocks;

    setHistory({
      timeline: [seedBlocks],
      index: 0,
    });
    setSelectedId(seedBlocks[0]?.id || null);
    setDevice("desktop");
    setActiveDrag(null);
  }, [editorKey, initialBlocks, seed]);

  const blocks = useMemo(() => history.timeline[history.index] || [], [history]);
  const selectedBlock = selectedId ? findPageBuilderBlock(blocks, selectedId) : null;
  const canUndo = history.index > 0;
  const canRedo = history.index < history.timeline.length - 1;
  const pageJson = useMemo(
    () =>
      serializePageBuilderDocument(blocks, {
        id: editorKey,
        title: pageTitle || seed?.headline || "Nueva pagina",
      }),
    [blocks, editorKey, pageTitle, seed],
  );

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

  const undo = useCallback(() => {
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
  }, [canUndo, history, onBlocksChange, selectedId]);

  const redo = useCallback(() => {
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
  }, [canRedo, history, onBlocksChange, selectedId]);

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

  const addBlock = useCallback(
    (type: PageBuilderBlockType) => {
      const nextBlock = createPageBuilderBlock(type, seed);
      const nextBlocks = insertPageBuilderBlock(
        blocks,
        resolveDefaultInsertTarget.parentId,
        resolveDefaultInsertTarget.index,
        nextBlock,
      );

      commitBlocks(nextBlocks, nextBlock.id);
    },
    [blocks, commitBlocks, resolveDefaultInsertTarget, seed],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      const result = removePageBuilderBlock(blocks, id);

      if (!result.removed) {
        return;
      }

      commitBlocks(result.blocks, result.blocks[0]?.id || null);
    },
    [blocks, commitBlocks],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const result = duplicatePageBuilderBlock(blocks, id);

      if (!result.duplicated) {
        return;
      }

      commitBlocks(result.blocks, result.duplicated.id);
    },
    [blocks, commitBlocks],
  );

  const updateInlineContent = useCallback(
    (id: string, field: string, value: string) => {
      const nextBlocks = updatePageBuilderBlock(blocks, id, (block) => ({
        ...block,
        content: {
          ...block.content,
          [field]: value,
        },
      }));

      commitBlocks(nextBlocks);
    },
    [blocks, commitBlocks],
  );

  const updateSelectedContent = useCallback(
    (field: string, value: string) => {
      if (!selectedBlock) {
        return;
      }

      updateInlineContent(selectedBlock.id, field, value);
    },
    [selectedBlock, updateInlineContent],
  );

  const updateSelectedStyle = useCallback(
    (field: keyof PageBuilderBlock["style"], value: string) => {
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
    },
    [blocks, commitBlocks, selectedBlock],
  );

  const updateSelectedLayout = useCallback(
    (field: keyof PageBuilderBlock["layout"], value: string) => {
      if (!selectedBlock) {
        return;
      }

      const nextValue =
        field === "columns"
          ? Math.max(2, Number.parseInt(value || "2", 10) || 2)
          : value;

      const nextBlocks = updatePageBuilderBlock(blocks, selectedBlock.id, (block) => ({
        ...block,
        layout: {
          ...block.layout,
          [field]: nextValue,
        },
      }));

      commitBlocks(nextBlocks);
    },
    [blocks, commitBlocks, selectedBlock],
  );

  const resizeBlock = useCallback(
    (id: string) => {
      const nextBlocks = updatePageBuilderBlock(blocks, id, (block) => ({
        ...block,
        layout: {
          ...block.layout,
          width: cycleWidth(block.layout.width),
        },
      }));

      commitBlocks(nextBlocks, id);
    },
    [blocks, commitBlocks],
  );

  const resolveTargetFromDrop = useCallback(
    (overId: string, overData: Record<string, unknown>) => {
      if (overData.kind === "slot") {
        return {
          parentId: typeof overData.parentId === "string" ? overData.parentId : null,
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
    },
    [blocks],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeData = event.active.data.current as PageBuilderDragMeta;

    setActiveDrag(activeData);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null);

      const activeData = event.active.data.current as PageBuilderDragMeta;
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
    },
    [blocks, commitBlocks, resolveTargetFromDrop, seed],
  );

  return {
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
  };
}
