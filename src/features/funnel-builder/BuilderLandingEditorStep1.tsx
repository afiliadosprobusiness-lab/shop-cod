import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LandingBlock } from "@/lib/funnel-system";
import { EditorShell } from "@/features/funnel-builder/components/EditorShell";
import { BuilderTopBar } from "@/features/funnel-builder/components/TopBar";
import { LeftSidebar } from "@/features/funnel-builder/components/LeftSidebar";
import { BuilderCanvas } from "@/features/funnel-builder/components/Canvas";
import { PropertiesPanel } from "@/features/funnel-builder/components/PropertiesPanel";
import { commitBuilderHistory, type BuilderHistoryCommitMeta } from "@/features/funnel-builder/history";
import {
  addElementAsSection,
  addSectionPreset,
  BUILDER_LIBRARY_ITEMS,
  duplicateNodeById,
  filterLibraryItems,
  filterSectionPresets,
  findNodeById,
  insertElementAsSectionAt,
  insertElementToColumnIndex,
  landingSectionsFromPage,
  moveElementToColumnIndex,
  moveNodeById,
  moveSectionToIndex,
  pageFromLandingSections,
  removeNodeById,
  updateNodePropsById,
} from "@/features/funnel-builder/model";
import type {
  BuilderBreakpoint,
  BuilderDragPayload,
  BuilderPageNode,
  BuilderSidebarTab,
} from "@/features/funnel-builder/types";

type SaveState = "idle" | "saving" | "saved" | "error";

interface EditorState {
  selectedId: string | null;
  hoveredId: string | null;
  breakpoint: BuilderBreakpoint;
  tab: BuilderSidebarTab;
  query: string;
  dragPayload: BuilderDragPayload | null;
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
    history: [initialPage],
    historyIndex: 0,
    lastCommit: null,
    dirty: false,
  };
}

function listElementIds(page: BuilderPageNode) {
  return page.children.flatMap((section) =>
    section.children.flatMap((column) => column.children.map((element) => element.id)),
  );
}

export function BuilderLandingEditorStep1({
  funnelName,
  funnelSlug,
  initialSections,
  onSectionsChange,
  onPersist,
  onBack,
  onContinue,
}: {
  funnelName: string;
  funnelSlug: string;
  initialSections: LandingBlock[];
  onSectionsChange: (sections: LandingBlock[]) => void;
  onPersist: (sections: LandingBlock[]) => void | Promise<void>;
  onBack: () => void;
  onContinue: () => void;
}) {
  const initialPage = useMemo(() => pageFromLandingSections(initialSections), [initialSections]);
  const incomingSerialized = useMemo(() => JSON.stringify(initialSections), [initialSections]);
  const lastSyncedSerializedRef = useRef(incomingSerialized);
  const persistedSerializedRef = useRef(incomingSerialized);
  const currentPageRef = useRef(initialPage);
  const saveTimerRef = useRef<number | null>(null);
  const saveInFlightPromiseRef = useRef<Promise<void> | null>(null);
  const saveQueuedRef = useRef(false);
  const mountedRef = useRef(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [state, setState] = useState<EditorState>(() => buildInitialState(initialPage));
  const currentPage = state.history[state.historyIndex];

  const filteredItems = useMemo(() => filterLibraryItems(state.query), [state.query]);
  const filteredPresets = useMemo(() => filterSectionPresets(state.query), [state.query]);

  useEffect(() => {
    if (incomingSerialized === lastSyncedSerializedRef.current) return;
    lastSyncedSerializedRef.current = incomingSerialized;
    persistedSerializedRef.current = incomingSerialized;
    setSaveState("idle");
    setLastSavedAt(null);
    setState(buildInitialState(initialPage));
  }, [incomingSerialized, initialPage]);

  useEffect(() => {
    const nextSections = landingSectionsFromPage(currentPage);
    const nextSerialized = JSON.stringify(nextSections);
    if (nextSerialized === lastSyncedSerializedRef.current) return;
    lastSyncedSerializedRef.current = nextSerialized;
    onSectionsChange(nextSections);
  }, [currentPage, onSectionsChange]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const persistCurrentPage = useCallback(async () => {
    const sections = landingSectionsFromPage(currentPageRef.current);
    const serialized = JSON.stringify(sections);
    if (serialized === persistedSerializedRef.current) {
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, dirty: false }));
        setSaveState((prev) => (prev === "error" ? prev : "idle"));
      }
      return;
    }

    if (mountedRef.current) setSaveState("saving");
    await Promise.resolve(onPersist(sections));
    persistedSerializedRef.current = serialized;
    if (mountedRef.current) {
      setSaveState("saved");
      setLastSavedAt(new Date().toISOString());
      setState((prev) => ({ ...prev, dirty: false }));
    }
  }, [onPersist]);

  const flushPendingSave = useCallback(async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (saveInFlightPromiseRef.current) {
      saveQueuedRef.current = true;
      await saveInFlightPromiseRef.current;
      return;
    }

    const run = async () => {
      do {
        saveQueuedRef.current = false;
        try {
          await persistCurrentPage();
        } catch {
          if (mountedRef.current) setSaveState("error");
          throw new Error("save_failed");
        }
      } while (saveQueuedRef.current);
    };

    const inFlight = run();
    saveInFlightPromiseRef.current = inFlight;
    try {
      await inFlight;
    } finally {
      if (saveInFlightPromiseRef.current === inFlight) {
        saveInFlightPromiseRef.current = null;
      }
    }
  }, [persistCurrentPage]);

  useEffect(() => {
    const sections = landingSectionsFromPage(currentPage);
    const serialized = JSON.stringify(sections);
    if (serialized === persistedSerializedRef.current) {
      setState((prev) => ({ ...prev, dirty: false }));
      return;
    }

    setState((prev) => ({ ...prev, dirty: true }));
    setSaveState("saving");
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void flushPendingSave();
    }, 650);
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [currentPage, flushPendingSave]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    },
    [],
  );

  const selectedNode = useMemo(
    () => (state.selectedId ? findNodeById(currentPage, state.selectedId) : null),
    [currentPage, state.selectedId],
  );

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const commitPage = (
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
        history: historyState.history,
        historyIndex: historyState.historyIndex,
        lastCommit: historyState.lastCommit,
        selectedId,
        dirty: true,
      };
    });
  };

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    setState((prev) => {
      const nextIndex = prev.historyIndex - 1;
      const nextPage = prev.history[nextIndex] ?? prev.history[0];
      const nextSelected =
        prev.selectedId && findNodeById(nextPage, prev.selectedId) ? prev.selectedId : nextPage.id;
      return {
        ...prev,
        dragPayload: null,
        historyIndex: nextIndex,
        selectedId: nextSelected,
        lastCommit: null,
        dirty:
          JSON.stringify(landingSectionsFromPage(nextPage)) !==
          persistedSerializedRef.current,
      };
    });
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    setState((prev) => {
      const nextIndex = prev.historyIndex + 1;
      const nextPage = prev.history[nextIndex] ?? prev.history[prev.history.length - 1];
      const nextSelected =
        prev.selectedId && findNodeById(nextPage, prev.selectedId) ? prev.selectedId : nextPage.id;
      return {
        ...prev,
        dragPayload: null,
        historyIndex: nextIndex,
        selectedId: nextSelected,
        lastCommit: null,
        dirty:
          JSON.stringify(landingSectionsFromPage(nextPage)) !==
          persistedSerializedRef.current,
      };
    });
  }, [canRedo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      const isTypingTarget =
        target?.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select";
      if (isTypingTarget) return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRedo, handleUndo]);

  const applyDropAtSectionIndex = (index: number) => {
    const payload = state.dragPayload;
    if (!payload) return;
    if (payload.kind === "library-element") {
      const beforeIds = new Set(currentPage.children.map((section) => section.id));
      const nextPage = insertElementAsSectionAt(currentPage, payload.elementType, index);
      const insertedSectionId = nextPage.children.find((section) => !beforeIds.has(section.id))?.id ?? null;
      commitPage(nextPage, insertedSectionId);
      return;
    }
    if (payload.kind === "canvas-section") {
      const fromIndex = currentPage.children.findIndex((section) => section.id === payload.sectionId);
      const normalizedIndex = fromIndex >= 0 && index > fromIndex ? index - 1 : index;
      commitPage(moveSectionToIndex(currentPage, payload.sectionId, normalizedIndex), payload.sectionId);
    }
  };

  const applyDropAtColumnIndex = (columnId: string, index: number) => {
    const payload = state.dragPayload;
    if (!payload) return;
    if (payload.kind === "library-element") {
      const beforeIds = new Set(listElementIds(currentPage));
      const nextPage = insertElementToColumnIndex(currentPage, payload.elementType, columnId, index);
      const insertedElementId = listElementIds(nextPage).find((id) => !beforeIds.has(id)) ?? null;
      commitPage(nextPage, insertedElementId);
      return;
    }
    if (payload.kind === "canvas-element") {
      commitPage(moveElementToColumnIndex(currentPage, payload.elementId, columnId, index), payload.elementId);
    }
  };

  const handleSaveNow = useCallback(async () => {
    await flushPendingSave();
  }, [flushPendingSave]);

  const handleBack = useCallback(async () => {
    try {
      await flushPendingSave();
      onBack();
    } catch {
      // keep editor open if save fails
    }
  }, [flushPendingSave, onBack]);

  const handleContinue = useCallback(async () => {
    try {
      await flushPendingSave();
      onContinue();
    } catch {
      // keep editor open if save fails
    }
  }, [flushPendingSave, onContinue]);

  return (
    <EditorShell
      topbar={
        <BuilderTopBar
          title={`Editor visual de landing - ${funnelName}`}
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          breakpoint={state.breakpoint}
          onBreakpointChange={(value) => setState((prev) => ({ ...prev, breakpoint: value }))}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSaveNow={() => void handleSaveNow()}
          previewHref={`/f/${funnelSlug}`}
          onBack={() => void handleBack()}
          onContinue={() => void handleContinue()}
        />
      }
      leftSidebar={
        <LeftSidebar
          tab={state.tab}
          query={state.query}
          items={filteredItems}
          presets={filteredPresets}
          onTabChange={(value) => setState((prev) => ({ ...prev, tab: value }))}
          onQueryChange={(value) => setState((prev) => ({ ...prev, query: value }))}
          onAddElement={(type) => commitPage(addElementAsSection(currentPage, type))}
          onAddPreset={(presetId) => commitPage(addSectionPreset(currentPage, presetId))}
          onDragElementStart={(type) =>
            setState((prev) => ({ ...prev, dragPayload: { kind: "library-element", elementType: type } }))
          }
          onDragElementEnd={() => setState((prev) => ({ ...prev, dragPayload: null }))}
        />
      }
      canvas={
        <BuilderCanvas
          page={currentPage}
          breakpoint={state.breakpoint}
          dragPayload={state.dragPayload}
          selectedId={state.selectedId}
          hoveredId={state.hoveredId}
          onSelect={(id) => setState((prev) => ({ ...prev, selectedId: id }))}
          onHover={(id) => setState((prev) => ({ ...prev, hoveredId: id }))}
          onDragPayloadChange={(payload) => setState((prev) => ({ ...prev, dragPayload: payload }))}
          onDropAtSectionIndex={applyDropAtSectionIndex}
          onDropAtColumnIndex={applyDropAtColumnIndex}
          onMoveNode={(id, direction) => commitPage(moveNodeById(currentPage, id, direction))}
          onDeleteNode={(id) => commitPage(removeNodeById(currentPage, id))}
          onDuplicateNode={(id) => commitPage(duplicateNodeById(currentPage, id))}
        />
      }
      properties={
        <PropertiesPanel
          selected={selectedNode}
          onPatchNodeProps={(patch) => {
            if (!state.selectedId) return;
            commitPage(updateNodePropsById(currentPage, state.selectedId, patch), state.selectedId, {
              mode: "merge",
              source: "props",
              nodeId: state.selectedId,
            });
          }}
        />
      }
    />
  );
}

export const BUILDER_STEP1_CATALOG = BUILDER_LIBRARY_ITEMS;
