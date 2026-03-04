export type BlockType =
  | "hero"
  | "problem"
  | "benefits"
  | "reviews"
  | "faq"
  | "checkout"
  | "cta";

export interface FunnelBlock {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

export interface StoredEditorState {
  blocks: FunnelBlock[];
  updatedAt: string;
  publishedAt: string | null;
}

const EDITOR_STORAGE_PREFIX = "shopcod-editor:";

function isBrowser() {
  return typeof window !== "undefined";
}

function getEditorStorageKey(storeId: string) {
  return `${EDITOR_STORAGE_PREFIX}${storeId}`;
}

function isValidBlock(candidate: unknown): candidate is FunnelBlock {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const block = candidate as Partial<FunnelBlock>;

  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    !!block.data &&
    typeof block.data === "object"
  );
}

export function loadEditorState(storeId: string) {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getEditorStorageKey(storeId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StoredEditorState>;

    if (!Array.isArray(parsedValue.blocks) || !parsedValue.blocks.every(isValidBlock)) {
      return null;
    }

    return {
      blocks: parsedValue.blocks,
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : new Date().toISOString(),
      publishedAt:
        typeof parsedValue.publishedAt === "string" ? parsedValue.publishedAt : null,
    } satisfies StoredEditorState;
  } catch {
    return null;
  }
}

export function saveEditorState(storeId: string, blocks: FunnelBlock[]) {
  const previousState = loadEditorState(storeId);
  const nextState: StoredEditorState = {
    blocks,
    updatedAt: new Date().toISOString(),
    publishedAt: previousState?.publishedAt ?? null,
  };

  if (isBrowser()) {
    window.localStorage.setItem(getEditorStorageKey(storeId), JSON.stringify(nextState));
  }

  return nextState;
}

export function publishEditorState(storeId: string, fallbackBlocks?: FunnelBlock[]) {
  const baseState =
    loadEditorState(storeId) ??
    (fallbackBlocks
      ? {
          blocks: fallbackBlocks,
          updatedAt: new Date().toISOString(),
          publishedAt: null,
        }
      : null);

  if (!baseState) {
    return null;
  }

  const nextState: StoredEditorState = {
    ...baseState,
    publishedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(getEditorStorageKey(storeId), JSON.stringify(nextState));
  }

  return nextState;
}
