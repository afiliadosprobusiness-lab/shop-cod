import { beforeEach, describe, expect, it } from "vitest";
import {
  loadEditorState,
  publishEditorState,
  saveEditorState,
  type FunnelBlock,
} from "@/lib/editor";

describe("editor storage", () => {
  const storeId = "test-store";
  const blocks: FunnelBlock[] = [
    {
      id: "b1",
      type: "hero",
      data: {
        title: "Producto",
      },
    },
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads a draft", () => {
    saveEditorState(storeId, blocks);

    const storedState = loadEditorState(storeId);

    expect(storedState?.blocks).toEqual(blocks);
    expect(storedState?.publishedAt).toBeNull();
    expect(typeof storedState?.updatedAt).toBe("string");
  });

  it("keeps a published timestamp after publish", () => {
    saveEditorState(storeId, blocks);
    const publishedState = publishEditorState(storeId);
    const storedState = loadEditorState(storeId);

    expect(publishedState?.publishedAt).not.toBeNull();
    expect(storedState?.publishedAt).toBe(publishedState?.publishedAt);
  });
});
