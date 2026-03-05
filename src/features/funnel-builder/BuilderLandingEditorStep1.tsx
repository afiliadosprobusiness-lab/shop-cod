import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LandingBlock } from "@/lib/funnel-system";
import { EditorShell } from "@/features/funnel-builder/components/EditorShell";
import { LeftSidebar } from "@/features/funnel-builder/components/LeftSidebar";
import { PropertiesPanel } from "@/features/funnel-builder/components/PropertiesPanel";
import { BuilderTopBar } from "@/features/funnel-builder/components/TopBar";
import { CanvasWysiwyg } from "@/features/funnel-builder/components/CanvasWysiwyg";
import {
  addElementAsSection,
  addSectionPreset,
  BUILDER_LIBRARY_ITEMS,
  filterLibraryItems,
  filterSectionPresets,
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
import { useEditorState } from "@/features/funnel-builder/useEditorState";
import type { BuilderPageNode } from "@/features/funnel-builder/types";

type SaveState = "idle" | "saving" | "saved" | "error";

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
  const { state, setState, currentPage, selectedNode, canUndo, canRedo, reset, commitPage, undo, redo } =
    useEditorState(initialPage);

  const filteredItems = useMemo(() => filterLibraryItems(state.query), [state.query]);
  const filteredPresets = useMemo(() => filterSectionPresets(state.query), [state.query]);

  useEffect(() => {
    if (incomingSerialized === lastSyncedSerializedRef.current) return;
    lastSyncedSerializedRef.current = incomingSerialized;
    persistedSerializedRef.current = incomingSerialized;
    setSaveState("idle");
    setLastSavedAt(null);
    reset(initialPage);
  }, [incomingSerialized, initialPage, reset]);

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
  }, [onPersist, setState]);

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
  }, [currentPage, flushPendingSave, setState]);

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
        undo();
        return;
      }
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

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
          onUndo={undo}
          onRedo={redo}
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
        <CanvasWysiwyg
          page={currentPage}
          breakpoint={state.breakpoint}
          selectedId={state.selectedId}
          hoveredId={state.hoveredId}
          dropIndicator={state.dropIndicator}
          onSelect={(id) => setState((prev) => ({ ...prev, selectedId: id }))}
          onHover={(id) => setState((prev) => ({ ...prev, hoveredId: id }))}
          onAddSection={() => commitPage(addElementAsSection(currentPage, "section"))}
          onMoveSelected={(direction) => {
            if (!state.selectedId) return;
            commitPage(moveNodeById(currentPage, state.selectedId, direction), state.selectedId);
          }}
          onDeleteSelected={() => {
            if (!state.selectedId) return;
            commitPage(removeNodeById(currentPage, state.selectedId));
          }}
          onDropIndicatorChange={(indicator) =>
            setState((prev) => ({
              ...prev,
              dropIndicator: indicator,
            }))
          }
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

// Paso 2/3 (scaffolding):
// - applyDropAtSectionIndex / applyDropAtColumnIndex ya implementan mutaciones del modelo.
// - CanvasWysiwyg expone onDropIndicatorChange para renderizar drop intent visual.
// - En el siguiente paso solo faltaria conectar handlers dragstart/dragover/drop reales del canvas.
