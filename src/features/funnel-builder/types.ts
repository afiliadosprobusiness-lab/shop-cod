import type { LandingBlockType } from "@/lib/funnel-system";

export type BuilderBreakpoint = "desktop" | "tablet" | "mobile";
export type BuilderSidebarTab = "elements" | "sections";

export type BuilderElementType = LandingBlockType;
export type BuilderNodeType = "page" | "section" | "column" | BuilderElementType;

export interface BuilderNodeBase<T extends BuilderNodeType> {
  id: string;
  type: T;
  props: Record<string, unknown>;
}

export interface BuilderElementNode extends BuilderNodeBase<BuilderElementType> {}

export interface BuilderColumnNode extends BuilderNodeBase<"column"> {
  children: BuilderElementNode[];
}

export interface BuilderSectionNode extends BuilderNodeBase<"section"> {
  children: BuilderColumnNode[];
}

export interface BuilderPageNode extends BuilderNodeBase<"page"> {
  children: BuilderSectionNode[];
}

export type BuilderAnyNode =
  | BuilderPageNode
  | BuilderSectionNode
  | BuilderColumnNode
  | BuilderElementNode;

export interface BuilderLibraryItem {
  type: BuilderElementType;
  label: string;
  description: string;
}

export interface BuilderSectionPreset {
  id: string;
  label: string;
  description: string;
}

export interface BuilderNodeLookup {
  node: BuilderAnyNode;
  sectionId?: string;
  columnId?: string;
}

export type BuilderDragPayload =
  | {
      kind: "library-element";
      elementType: BuilderElementType;
    }
  | {
      kind: "canvas-section";
      sectionId: string;
    }
  | {
      kind: "canvas-element";
      elementId: string;
    };
