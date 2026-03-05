import { useCallback, useEffect, useMemo, useRef } from "react";
import { type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import {
  canAcceptChildren,
  createDefaultPageBuilderBlocks,
  createPageBuilderBlock,
  normalizePageBuilderBlocks,
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

interface PageBuilderStoreState {
  history: BuilderHistory;
  selectedId: string | null;
  device: PageBuilderDevice;
  activeDrag: PageBuilderDragMeta;
}

const widthTokenMap: Record<PageBuilderBlock["layout"]["width"], string> = {
  full: "100%",
  wide: "1080px",
  narrow: "760px",
};

function cycleWidth(width: PageBuilderBlock["layout"]["width"]): PageBuilderBlock["layout"]["width"] {
  if (width === "narrow") {
    return "wide";
  }

  if (width === "wide") {
    return "full";
  }

  return "narrow";
}

function getCurrentBlocks(state: PageBuilderStoreState) {
  return state.history.timeline[state.history.index] || [];
}

function createPageBuilderStore(seedBlocks: PageBuilderBlock[]): StoreApi<PageBuilderStoreState> {
  return createStore<PageBuilderStoreState>(() => ({
    history: {
      timeline: [seedBlocks],
      index: 0,
    },
    selectedId: seedBlocks[0]?.id || null,
    device: "desktop",
    activeDrag: null,
  }));
}

function resolveDefaultInsertTarget(blocks: PageBuilderBlock[], selectedId: string | null) {
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
}

function resolveTargetFromDrop(
  blocks: PageBuilderBlock[],
  overId: string,
  overData: Record<string, unknown>,
) {
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
    normalizePageBuilderBlocks(
      initialBlocks.length ? initialBlocks : createDefaultPageBuilderBlocks(seed),
      seed,
    ),
  );
  const previousEditorKeyRef = useRef<string | null>(null);
  const previousBlocksRef = useRef<PageBuilderBlock[] | null>(null);
  const skipNextOnChangeRef = useRef(true);

  const storeRef = useRef<StoreApi<PageBuilderStoreState>>(
    createPageBuilderStore(initialSeedRef.current),
  );

  const store = storeRef.current;
  const history = useStore(store, (state) => state.history);
  const selectedId = useStore(store, (state) => state.selectedId);
  const device = useStore(store, (state) => state.device);
  const activeDrag = useStore(store, (state) => state.activeDrag);

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
      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);

      if (nextBlocks === currentBlocks) {
        if (nextSelectedId !== undefined && nextSelectedId !== state.selectedId) {
          store.setState({ selectedId: nextSelectedId });
        }
        return;
      }

      const trimmedTimeline = state.history.timeline.slice(0, state.history.index + 1);
      const nextTimeline = [...trimmedTimeline, nextBlocks];
      let resolvedSelectedId = state.selectedId;

      if (nextSelectedId !== undefined) {
        resolvedSelectedId = nextSelectedId;
      } else if (resolvedSelectedId && !findPageBuilderBlock(nextBlocks, resolvedSelectedId)) {
        resolvedSelectedId = nextBlocks[0]?.id || null;
      }

      store.setState({
        history: {
          timeline: nextTimeline,
          index: nextTimeline.length - 1,
        },
        selectedId: resolvedSelectedId,
      });
    },
    [store],
  );

  const setSelectedId = useCallback(
    (id: string | null) => {
      store.setState({ selectedId: id });
    },
    [store],
  );

  const setDevice = useCallback(
    (nextDevice: PageBuilderDevice) => {
      store.setState({ device: nextDevice });
    },
    [store],
  );

  const undo = useCallback(() => {
    const state = store.getState();

    if (state.history.index <= 0) {
      return;
    }

    const nextIndex = state.history.index - 1;
    const nextBlocks = state.history.timeline[nextIndex] || [];
    let resolvedSelected = state.selectedId;

    if (resolvedSelected && !findPageBuilderBlock(nextBlocks, resolvedSelected)) {
      resolvedSelected = nextBlocks[0]?.id || null;
    }

    store.setState({
      history: {
        timeline: state.history.timeline,
        index: nextIndex,
      },
      selectedId: resolvedSelected,
    });
  }, [store]);

  const redo = useCallback(() => {
    const state = store.getState();

    if (state.history.index >= state.history.timeline.length - 1) {
      return;
    }

    const nextIndex = state.history.index + 1;
    const nextBlocks = state.history.timeline[nextIndex] || [];
    let resolvedSelected = state.selectedId;

    if (resolvedSelected && !findPageBuilderBlock(nextBlocks, resolvedSelected)) {
      resolvedSelected = nextBlocks[0]?.id || null;
    }

    store.setState({
      history: {
        timeline: state.history.timeline,
        index: nextIndex,
      },
      selectedId: resolvedSelected,
    });
  }, [store]);

  const addBlock = useCallback(
    (type: PageBuilderBlockType) => {
      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);
      const target = resolveDefaultInsertTarget(currentBlocks, state.selectedId);
      const nextBlock = createPageBuilderBlock(type, seed);
      const nextBlocks = insertPageBuilderBlock(
        currentBlocks,
        target.parentId,
        target.index,
        nextBlock,
      );

      commitBlocks(nextBlocks, nextBlock.id);
    },
    [commitBlocks, seed, store],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);
      const result = removePageBuilderBlock(currentBlocks, id);

      if (!result.removed) {
        return;
      }

      commitBlocks(result.blocks, result.blocks[0]?.id || null);
    },
    [commitBlocks, store],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);
      const result = duplicatePageBuilderBlock(currentBlocks, id);

      if (!result.duplicated) {
        return;
      }

      commitBlocks(result.blocks, result.duplicated.id);
    },
    [commitBlocks, store],
  );

  const updateInlineContent = useCallback(
    (id: string, field: string, value: string) => {
      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);
      const nextBlocks = updatePageBuilderBlock(currentBlocks, id, (block) => ({
        ...block,
        content: {
          ...block.content,
          [field]: value,
        },
      }));

      commitBlocks(nextBlocks);
    },
    [commitBlocks, store],
  );

  const updateSelectedContent = useCallback(
    (field: string, value: string) => {
      const state = store.getState();
      if (!state.selectedId) {
        return;
      }

      updateInlineContent(state.selectedId, field, value);
    },
    [store, updateInlineContent],
  );

  const updateSelectedStyle = useCallback(
    (nextStyle: PageBuilderBlock["style"]) => {
      const state = store.getState();
      if (!state.selectedId) {
        return;
      }

      const currentBlocks = getCurrentBlocks(state);
      const nextBlocks = updatePageBuilderBlock(currentBlocks, state.selectedId, (block) => ({
        ...block,
        style: nextStyle,
      }));

      commitBlocks(nextBlocks);
    },
    [commitBlocks, store],
  );

  const updateSelectedLayout = useCallback(
    (nextLayout: PageBuilderBlock["layout"]) => {
      const state = store.getState();
      if (!state.selectedId) {
        return;
      }

      const currentBlocks = getCurrentBlocks(state);
      const nextBlocks = updatePageBuilderBlock(currentBlocks, state.selectedId, (block) => ({
        ...block,
        layout: {
          ...nextLayout,
          columns: Math.max(2, Number.parseInt(String(nextLayout.columns || 2), 10) || 2),
          gapPx: Math.max(0, Number.parseInt(String(nextLayout.gapPx || 0), 10) || 0),
        },
      }));

      commitBlocks(nextBlocks);
    },
    [commitBlocks, store],
  );

  const resizeBlock = useCallback(
    (id: string) => {
      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);
      const nextBlocks = updatePageBuilderBlock(currentBlocks, id, (block) => {
        const nextWidth = cycleWidth(block.layout.width);
        return {
          ...block,
          layout: {
            ...block.layout,
            width: nextWidth,
            dimensions: {
              ...block.layout.dimensions,
              maxWidth: widthTokenMap[nextWidth],
            },
          },
        };
      });

      commitBlocks(nextBlocks, id);
    },
    [commitBlocks, store],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeData = event.active.data.current as PageBuilderDragMeta;
      store.setState({ activeDrag: activeData });
    },
    [store],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      store.setState({ activeDrag: null });

      const activeData = event.active.data.current as PageBuilderDragMeta;
      const overData = event.over?.data.current as Record<string, unknown> | undefined;
      const overId = event.over?.id;

      if (!activeData || !overData || !overId) {
        return;
      }

      const state = store.getState();
      const currentBlocks = getCurrentBlocks(state);
      const target = resolveTargetFromDrop(currentBlocks, String(overId), overData);

      if (activeData.kind === "palette") {
        const nextBlock = createPageBuilderBlock(activeData.blockType, seed);
        const nextBlocks = insertPageBuilderBlock(
          currentBlocks,
          target.parentId,
          target.index,
          nextBlock,
        );

        commitBlocks(nextBlocks, nextBlock.id);
        return;
      }

      const nextBlocks = movePageBuilderBlock(
        currentBlocks,
        activeData.blockId,
        target.parentId,
        target.index,
      );

      commitBlocks(nextBlocks, activeData.blockId);
    },
    [commitBlocks, seed, store],
  );

  useEffect(() => {
    if (previousEditorKeyRef.current === editorKey) {
      return;
    }

    previousEditorKeyRef.current = editorKey;

    const seedBlocks = normalizePageBuilderBlocks(
      initialBlocks.length ? initialBlocks : createDefaultPageBuilderBlocks(seed),
      seed,
    );

    initialSeedRef.current = seedBlocks;
    previousBlocksRef.current = seedBlocks;
    skipNextOnChangeRef.current = true;

    store.setState({
      history: {
        timeline: [seedBlocks],
        index: 0,
      },
      selectedId: seedBlocks[0]?.id || null,
      device: "desktop",
      activeDrag: null,
    });
  }, [editorKey, initialBlocks, seed, store]);

  useEffect(() => {
    if (skipNextOnChangeRef.current) {
      skipNextOnChangeRef.current = false;
      previousBlocksRef.current = blocks;
      return;
    }

    if (previousBlocksRef.current === blocks) {
      return;
    }

    previousBlocksRef.current = blocks;
    onBlocksChange(blocks);
  }, [blocks, onBlocksChange]);

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
