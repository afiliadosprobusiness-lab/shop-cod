import { useCallback, useMemo, useState } from "react";
import { commitBuilderHistory, type BuilderHistoryCommitMeta } from "@/features/funnel-builder/history";
import { findNodeById } from "@/features/funnel-builder/model";
import type {
  BuilderBreakpoint,
  BuilderDragPayload,
  BuilderDropIndicator,
  BuilderNodeLookup,
  BuilderPageNode,
  BuilderSidebarTab,
} from "@/features/funnel-builder/types";

interface EditorState {
  selectedId: string | null;
  hoveredId: string | null;
  breakpoint: BuilderBreakpoint;
  tab: BuilderSidebarTab;
  query: string;
  dragPayload: BuilderDragPayload | null;
  dropIndicator: BuilderDropIndicator | null;
  history: BuilderPageNode[];
  historyIndex: number;
  lastCommit: BuilderHistoryCommitMeta | null;
  dirty: boolean;
}

function buildInitialState(initialPage: BuilderPageNode): EditorState {
  return {
    selectedId: null,
    hoveredId: null,
    breakpoint: "desktop",
    tab: "elements",
    query: "",
    dragPayload: null,
    dropIndicator: null,
    history: [initialPage],
    historyIndex: 0,
    lastCommit: null,
    dirty: false,
  };
}

export function useEditorState(initialPage: BuilderPageNode) {
  const [state, setState] = useState<EditorState>(() => buildInitialState(initialPage));
  const currentPage = state.history[state.historyIndex];
  const selectedNode = useMemo<BuilderNodeLookup | null>(
    () => (state.selectedId ? findNodeById(currentPage, state.selectedId) : null),
    [currentPage, state.selectedId],
  );
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const reset = useCallback((nextPage: BuilderPageNode) => {
    setState(buildInitialState(nextPage));
  }, []);

  const commitPage = useCallback(
    (
      nextPage: BuilderPageNode,
      preferredSelectedId?: string | null,
      options?: { mode?: "push" | "merge"; source?: "structure" | "props"; nodeId?: string | null },
    ) => {
      setState((prev) => {
        const historyState = commitBuilderHistory(
          {
            history: prev.history,
            historyIndex: prev.historyIndex,
            lastCommit: prev.lastCommit,
          },
          nextPage,
          {
            mode: options?.mode ?? "push",
            source: options?.source ?? "structure",
            nodeId: options?.nodeId ?? preferredSelectedId ?? prev.selectedId ?? null,
          },
        );
        const currentSelection = preferredSelectedId ?? prev.selectedId;
        const selectedId =
          currentSelection && findNodeById(nextPage, currentSelection) ? currentSelection : nextPage.id;

        return {
          ...prev,
          dragPayload: null,
          dropIndicator: null,
          history: historyState.history,
          historyIndex: historyState.historyIndex,
          lastCommit: historyState.lastCommit,
          selectedId,
          dirty: true,
        };
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const nextIndex = prev.historyIndex - 1;
      const nextPage = prev.history[nextIndex] ?? prev.history[0];
      const nextSelected =
        prev.selectedId && findNodeById(nextPage, prev.selectedId) ? prev.selectedId : nextPage.id;
      return {
        ...prev,
        dragPayload: null,
        dropIndicator: null,
        historyIndex: nextIndex,
        selectedId: nextSelected,
        lastCommit: null,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const nextIndex = prev.historyIndex + 1;
      const nextPage = prev.history[nextIndex] ?? prev.history[prev.history.length - 1];
      const nextSelected =
        prev.selectedId && findNodeById(nextPage, prev.selectedId) ? prev.selectedId : nextPage.id;
      return {
        ...prev,
        dragPayload: null,
        dropIndicator: null,
        historyIndex: nextIndex,
        selectedId: nextSelected,
        lastCommit: null,
      };
    });
  }, []);

  return {
    state,
    setState,
    currentPage,
    selectedNode,
    canUndo,
    canRedo,
    reset,
    commitPage,
    undo,
    redo,
  };
}
