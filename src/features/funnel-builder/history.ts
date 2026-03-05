import type { BuilderPageNode } from "@/features/funnel-builder/types";

export interface BuilderHistoryCommitMeta {
  source: "structure" | "props";
  nodeId: string | null;
  at: number;
}

export interface BuilderHistorySlice {
  history: BuilderPageNode[];
  historyIndex: number;
  lastCommit: BuilderHistoryCommitMeta | null;
}

export interface BuilderHistoryCommitOptions {
  mode?: "push" | "merge";
  source?: "structure" | "props";
  nodeId?: string | null;
  now?: number;
  mergeWindowMs?: number;
}

export function commitBuilderHistory(
  slice: BuilderHistorySlice,
  nextPage: BuilderPageNode,
  options: BuilderHistoryCommitOptions = {},
): BuilderHistorySlice {
  const source = options.source ?? "structure";
  const mode = options.mode ?? "push";
  const now = options.now ?? Date.now();
  const nodeId = options.nodeId ?? null;
  const mergeWindowMs = options.mergeWindowMs ?? 900;

  const trimmed = slice.history.slice(0, slice.historyIndex + 1);
  const currentIndex = trimmed.length - 1;
  const canMerge =
    mode === "merge" &&
    currentIndex > 0 &&
    slice.historyIndex === currentIndex &&
    slice.lastCommit?.source === "props" &&
    source === "props" &&
    slice.lastCommit.nodeId === nodeId &&
    now - slice.lastCommit.at <= mergeWindowMs;

  if (canMerge) {
    const merged = [...trimmed];
    merged[currentIndex] = nextPage;
    return {
      history: merged,
      historyIndex: currentIndex,
      lastCommit: { source, nodeId, at: now },
    };
  }

  return {
    history: [...trimmed, nextPage],
    historyIndex: trimmed.length,
    lastCommit: { source, nodeId, at: now },
  };
}
