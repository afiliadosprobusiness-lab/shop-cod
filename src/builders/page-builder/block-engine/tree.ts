import {
  canAcceptChildren,
  createPageBuilderBlock,
  type PageBuilderBlock,
  type PageBuilderBlockType,
} from "./schema";

export interface PageBuilderBlockLocation {
  parentId: string | null;
  parentType: PageBuilderBlockType | null;
  index: number;
}

export interface FlattenedPageBuilderBlock {
  block: PageBuilderBlock;
  depth: number;
  parentId: string | null;
}

export function findPageBuilderBlock(
  blocks: PageBuilderBlock[],
  id: string,
): PageBuilderBlock | null {
  for (const block of blocks) {
    if (block.id === id) {
      return block;
    }

    const nested = findPageBuilderBlock(block.children, id);

    if (nested) {
      return nested;
    }
  }

  return null;
}

export function findPageBuilderBlockLocation(
  blocks: PageBuilderBlock[],
  id: string,
  parentId: string | null = null,
  parentType: PageBuilderBlockType | null = null,
): PageBuilderBlockLocation | null {
  const directIndex = blocks.findIndex((block) => block.id === id);

  if (directIndex >= 0) {
    return {
      parentId,
      parentType,
      index: directIndex,
    };
  }

  for (const block of blocks) {
    const nested = findPageBuilderBlockLocation(block.children, id, block.id, block.type);

    if (nested) {
      return nested;
    }
  }

  return null;
}

export function flattenPageBuilderBlocks(
  blocks: PageBuilderBlock[],
  depth = 0,
  parentId: string | null = null,
): FlattenedPageBuilderBlock[] {
  return blocks.flatMap((block) => [
    { block, depth, parentId },
    ...flattenPageBuilderBlocks(block.children, depth + 1, block.id),
  ]);
}

function cloneBlockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function clonePageBuilderBlock(
  block: PageBuilderBlock,
): PageBuilderBlock {
  const clonedChildren = block.children.map((child) => clonePageBuilderBlock(child));
  const freshBlock = createPageBuilderBlock(block.type);

  return {
    ...block,
    id: cloneBlockId(block.type),
    content: { ...block.content },
    style: { ...block.style },
    layout: { ...block.layout },
    children: clonedChildren,
    // preserve deterministic shape from the current type
    type: freshBlock.type,
  };
}

function updateChildrenAtPath(
  blocks: PageBuilderBlock[],
  id: string,
  updater: (block: PageBuilderBlock) => PageBuilderBlock,
): PageBuilderBlock[] {
  let changed = false;

  const nextBlocks = blocks.map((block) => {
    if (block.id === id) {
      changed = true;
      return updater(block);
    }

    if (!block.children.length) {
      return block;
    }

    const nextChildren = updateChildrenAtPath(block.children, id, updater);

    if (nextChildren === block.children) {
      return block;
    }

    changed = true;

    return {
      ...block,
      children: nextChildren,
    };
  });

  return changed ? nextBlocks : blocks;
}

export function updatePageBuilderBlock(
  blocks: PageBuilderBlock[],
  id: string,
  updater: (block: PageBuilderBlock) => PageBuilderBlock,
) {
  return updateChildrenAtPath(blocks, id, updater);
}

export function removePageBuilderBlock(
  blocks: PageBuilderBlock[],
  id: string,
): { blocks: PageBuilderBlock[]; removed: PageBuilderBlock | null } {
  let removed: PageBuilderBlock | null = null;
  let changed = false;

  const nextBlocks = blocks.flatMap((block) => {
    if (block.id === id) {
      removed = block;
      changed = true;
      return [];
    }

    if (!block.children.length) {
      return [block];
    }

    const result = removePageBuilderBlock(block.children, id);

    if (!result.removed) {
      return [block];
    }

    removed = result.removed;
    changed = true;

    return [
      {
        ...block,
        children: result.blocks,
      },
    ];
  });

  return {
    blocks: changed ? nextBlocks : blocks,
    removed,
  };
}

export function insertPageBuilderBlock(
  blocks: PageBuilderBlock[],
  parentId: string | null,
  index: number,
  blockToInsert: PageBuilderBlock,
) {
  if (parentId === null) {
    const nextBlocks = [...blocks];
    const safeIndex = Math.max(0, Math.min(index, nextBlocks.length));
    nextBlocks.splice(safeIndex, 0, blockToInsert);
    return nextBlocks;
  }

  return updatePageBuilderBlock(blocks, parentId, (parentBlock) => {
    if (!canAcceptChildren(parentBlock.type)) {
      return parentBlock;
    }

    const nextChildren = [...parentBlock.children];
    const safeIndex = Math.max(0, Math.min(index, nextChildren.length));
    nextChildren.splice(safeIndex, 0, blockToInsert);

    return {
      ...parentBlock,
      children: nextChildren,
    };
  });
}

function listContainsId(blocks: PageBuilderBlock[], id: string): boolean {
  return blocks.some((block) => block.id === id || listContainsId(block.children, id));
}

export function movePageBuilderBlock(
  blocks: PageBuilderBlock[],
  blockId: string,
  targetParentId: string | null,
  targetIndex: number,
) {
  const sourceLocation = findPageBuilderBlockLocation(blocks, blockId);

  if (!sourceLocation) {
    return blocks;
  }

  if (targetParentId === blockId) {
    return blocks;
  }

  const targetParent =
    targetParentId === null ? null : findPageBuilderBlock(blocks, targetParentId);

  if (targetParentId !== null && (!targetParent || !canAcceptChildren(targetParent.type))) {
    return blocks;
  }

  const removalResult = removePageBuilderBlock(blocks, blockId);

  if (!removalResult.removed) {
    return blocks;
  }

  if (targetParentId && listContainsId(removalResult.removed.children, targetParentId)) {
    return blocks;
  }

  let resolvedTargetIndex = targetIndex;

  if (sourceLocation.parentId === targetParentId && sourceLocation.index < targetIndex) {
    resolvedTargetIndex -= 1;
  }

  return insertPageBuilderBlock(
    removalResult.blocks,
    targetParentId,
    resolvedTargetIndex,
    removalResult.removed,
  );
}

export function duplicatePageBuilderBlock(
  blocks: PageBuilderBlock[],
  id: string,
): { blocks: PageBuilderBlock[]; duplicated: PageBuilderBlock | null } {
  const block = findPageBuilderBlock(blocks, id);
  const location = findPageBuilderBlockLocation(blocks, id);

  if (!block || !location) {
    return {
      blocks,
      duplicated: null,
    };
  }

  const duplicated = clonePageBuilderBlock(block);

  return {
    blocks: insertPageBuilderBlock(blocks, location.parentId, location.index + 1, duplicated),
    duplicated,
  };
}
