import type { LandingBlock, LandingBlockType } from "@/lib/funnel-system";
import type {
  BuilderElementNode,
  BuilderLibraryItem,
  BuilderNodeLookup,
  BuilderPageNode,
  BuilderSectionNode,
  BuilderSectionPreset,
} from "@/features/funnel-builder/types";

export const BUILDER_LIBRARY_ITEMS: BuilderLibraryItem[] = [
  { type: "hero", label: "Hero", description: "Encabezado principal con CTA." },
  { type: "section", label: "Section", description: "Bloque para beneficios o detalles." },
  { type: "headline", label: "Headline", description: "Titulo corto de impacto." },
  { type: "text", label: "Text", description: "Parrafo explicativo." },
  { type: "image", label: "Image", description: "Imagen del producto o uso." },
  { type: "video", label: "Video", description: "Demo en video." },
  { type: "button", label: "Button", description: "Boton de llamada a la accion." },
  { type: "testimonials", label: "Testimonials", description: "Prueba social de clientes." },
  { type: "faq", label: "FAQ", description: "Pregunta y respuesta." },
  { type: "cod_form", label: "COD Form", description: "Formulario contra entrega." },
  { type: "footer", label: "Footer", description: "Pie de pagina." },
];

export const BUILDER_SECTION_PRESETS: BuilderSectionPreset[] = [
  { id: "hero-basic", label: "Hero Basic", description: "Seccion principal con llamada a la accion." },
  { id: "benefits", label: "Benefits", description: "Beneficios + imagen en una seccion." },
  { id: "faq-cod", label: "FAQ + COD", description: "Resuelve dudas y agrega formulario COD." },
];

function createNodeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultPropsByType(type: LandingBlockType): Record<string, unknown> {
  if (type === "hero") {
    return {
      title: "Oferta principal",
      subtitle: "Explica en una frase clara por que tu producto vale la pena.",
      text: "Comprar ahora",
      href: "#checkout",
    };
  }
  if (type === "section") {
    return { title: "Beneficio principal", content: "Explica el resultado para tu cliente." };
  }
  if (type === "headline") return { content: "Titulo de alto impacto" };
  if (type === "text") return { content: "Texto descriptivo de apoyo." };
  if (type === "image") {
    return {
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=80&auto=format&fit=crop",
    };
  }
  if (type === "video") return { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
  if (type === "button") return { text: "Comprar ahora", href: "#checkout" };
  if (type === "testimonials") return { content: '"Excelente producto." - Cliente verificado' };
  if (type === "faq") return { question: "Pregunta frecuente", answer: "Respuesta breve y clara." };
  if (type === "cod_form") return { title: "Formulario COD", text: "Confirm Order" };
  return { content: "Copyright 2026 - Todos los derechos reservados." };
}

function elementFromType(type: LandingBlockType): BuilderElementNode {
  return {
    id: createNodeId("el"),
    type,
    props: defaultPropsByType(type),
  };
}

function sectionFromElement(type: LandingBlockType): BuilderSectionNode {
  return {
    id: createNodeId("sec"),
    type: "section",
    props: {
      label: `${type} section`,
      paddingY: 24,
    },
    children: [
      {
        id: createNodeId("col"),
        type: "column",
        props: { span: 12 },
        children: [elementFromType(type)],
      },
    ],
  };
}

function readString(props: Record<string, unknown>, key: string) {
  const value = props[key];
  return typeof value === "string" ? value : undefined;
}

function landingToElement(block: LandingBlock): BuilderElementNode {
  const props: Record<string, unknown> = {};
  if (block.title) props.title = block.title;
  if (block.subtitle) props.subtitle = block.subtitle;
  if (block.content) props.content = block.content;
  if (block.src) props.src = block.src;
  if (block.text) props.text = block.text;
  if (block.href) props.href = block.href;
  if (block.question) props.question = block.question;
  if (block.answer) props.answer = block.answer;
  return { id: block.id, type: block.type, props };
}

function elementToLanding(element: BuilderElementNode): LandingBlock {
  return {
    id: element.id,
    type: element.type,
    title: readString(element.props, "title"),
    subtitle: readString(element.props, "subtitle"),
    content: readString(element.props, "content"),
    src: readString(element.props, "src"),
    text: readString(element.props, "text"),
    href: readString(element.props, "href"),
    question: readString(element.props, "question"),
    answer: readString(element.props, "answer"),
  };
}

export function pageFromLandingSections(sections: LandingBlock[]): BuilderPageNode {
  return {
    id: "page_root",
    type: "page",
    props: { title: "Landing Page" },
    children: sections.map((block) => ({
      id: `sec_${block.id}`,
      type: "section",
      props: { label: block.type, paddingY: 24 },
      children: [
        {
          id: `col_${block.id}`,
          type: "column",
          props: { span: 12 },
          children: [landingToElement(block)],
        },
      ],
    })),
  };
}

export function landingSectionsFromPage(page: BuilderPageNode): LandingBlock[] {
  return page.children.flatMap((section) =>
    section.children.flatMap((column) => column.children.map((element) => elementToLanding(element))),
  );
}

export function addElementAsSection(page: BuilderPageNode, type: LandingBlockType): BuilderPageNode {
  return { ...page, children: [...page.children, sectionFromElement(type)] };
}

export function insertElementAsSectionAt(page: BuilderPageNode, type: LandingBlockType, index: number): BuilderPageNode {
  const safeIndex = Math.max(0, Math.min(index, page.children.length));
  const nextSection = sectionFromElement(type);
  return {
    ...page,
    children: [...page.children.slice(0, safeIndex), nextSection, ...page.children.slice(safeIndex)],
  };
}

export function addSectionPreset(page: BuilderPageNode, presetId: string): BuilderPageNode {
  if (presetId === "hero-basic") {
    return {
      ...page,
      children: [...page.children, sectionFromElement("hero"), sectionFromElement("button")],
    };
  }
  if (presetId === "benefits") {
    return {
      ...page,
      children: [...page.children, sectionFromElement("headline"), sectionFromElement("section"), sectionFromElement("image")],
    };
  }
  return {
    ...page,
    children: [...page.children, sectionFromElement("faq"), sectionFromElement("cod_form")],
  };
}

export function findNodeById(page: BuilderPageNode, id: string): BuilderNodeLookup | null {
  if (page.id === id) return { node: page };

  for (const section of page.children) {
    if (section.id === id) return { node: section, sectionId: section.id };
    for (const column of section.children) {
      if (column.id === id) return { node: column, sectionId: section.id, columnId: column.id };
      const element = column.children.find((item) => item.id === id);
      if (element) return { node: element, sectionId: section.id, columnId: column.id };
    }
  }

  return null;
}

export function filterLibraryItems(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return BUILDER_LIBRARY_ITEMS;
  return BUILDER_LIBRARY_ITEMS.filter(
    (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
  );
}

export function filterSectionPresets(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return BUILDER_SECTION_PRESETS;
  return BUILDER_SECTION_PRESETS.filter(
    (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
  );
}

function moveArray<T>(items: T[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function moveNodeById(page: BuilderPageNode, nodeId: string, direction: "up" | "down"): BuilderPageNode {
  const sectionIndex = page.children.findIndex((section) => section.id === nodeId);
  if (sectionIndex >= 0) {
    const target = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    return { ...page, children: moveArray(page.children, sectionIndex, target) };
  }

  return {
    ...page,
    children: page.children.map((section) => ({
      ...section,
      children: section.children.map((column) => {
        const index = column.children.findIndex((element) => element.id === nodeId);
        if (index < 0) return column;
        const target = direction === "up" ? index - 1 : index + 1;
        return { ...column, children: moveArray(column.children, index, target) };
      }),
    })),
  };
}

export function removeNodeById(page: BuilderPageNode, nodeId: string): BuilderPageNode {
  if (nodeId === page.id) return page;

  const nextSections = page.children
    .filter((section) => section.id !== nodeId)
    .map((section) => ({
      ...section,
      children: section.children.map((column) => ({
        ...column,
        children: column.children.filter((element) => element.id !== nodeId),
      })),
    }))
    .filter((section) => section.children.some((column) => column.children.length > 0));

  return { ...page, children: nextSections };
}

export function duplicateNodeById(page: BuilderPageNode, nodeId: string): BuilderPageNode {
  return {
    ...page,
    children: page.children.map((section) => ({
      ...section,
      children: section.children.map((column) => {
        const index = column.children.findIndex((element) => element.id === nodeId);
        if (index < 0) return column;
        const current = column.children[index];
        const clone: BuilderElementNode = {
          ...current,
          id: createNodeId("el"),
          props: { ...current.props },
        };
        return {
          ...column,
          children: [...column.children.slice(0, index + 1), clone, ...column.children.slice(index + 1)],
        };
      }),
    })),
  };
}

export function moveSectionToIndex(page: BuilderPageNode, sectionId: string, targetIndex: number): BuilderPageNode {
  const fromIndex = page.children.findIndex((section) => section.id === sectionId);
  if (fromIndex < 0) return page;
  const safeTarget = Math.max(0, Math.min(targetIndex, page.children.length - 1));
  if (fromIndex === safeTarget) return page;
  return { ...page, children: moveArray(page.children, fromIndex, safeTarget) };
}

export function insertElementToColumnIndex(
  page: BuilderPageNode,
  elementType: LandingBlockType,
  columnId: string,
  targetIndex: number,
): BuilderPageNode {
  return {
    ...page,
    children: page.children.map((section) => ({
      ...section,
      children: section.children.map((column) => {
        if (column.id !== columnId) return column;
        const safeIndex = Math.max(0, Math.min(targetIndex, column.children.length));
        const next = elementFromType(elementType);
        return {
          ...column,
          children: [...column.children.slice(0, safeIndex), next, ...column.children.slice(safeIndex)],
        };
      }),
    })),
  };
}

function locateElement(page: BuilderPageNode, elementId: string) {
  for (let sectionIndex = 0; sectionIndex < page.children.length; sectionIndex += 1) {
    const section = page.children[sectionIndex];
    for (let columnIndex = 0; columnIndex < section.children.length; columnIndex += 1) {
      const column = section.children[columnIndex];
      const elementIndex = column.children.findIndex((item) => item.id === elementId);
      if (elementIndex >= 0) {
        return { sectionIndex, columnIndex, elementIndex };
      }
    }
  }
  return null;
}

function locateColumn(page: BuilderPageNode, columnId: string) {
  for (let sectionIndex = 0; sectionIndex < page.children.length; sectionIndex += 1) {
    const section = page.children[sectionIndex];
    const columnIndex = section.children.findIndex((column) => column.id === columnId);
    if (columnIndex >= 0) {
      return { sectionIndex, columnIndex };
    }
  }
  return null;
}

export function moveElementToColumnIndex(
  page: BuilderPageNode,
  elementId: string,
  targetColumnId: string,
  targetIndex: number,
): BuilderPageNode {
  const source = locateElement(page, elementId);
  const target = locateColumn(page, targetColumnId);
  if (!source || !target) return page;

  const nextSections = page.children.map((section) => ({
    ...section,
    children: section.children.map((column) => ({
      ...column,
      children: [...column.children],
    })),
  }));

  const sourceColumn = nextSections[source.sectionIndex].children[source.columnIndex];
  const [movingElement] = sourceColumn.children.splice(source.elementIndex, 1);
  if (!movingElement) return page;

  const targetColumn = nextSections[target.sectionIndex].children[target.columnIndex];
  let safeIndex = Math.max(0, Math.min(targetIndex, targetColumn.children.length));
  const sameColumn = source.sectionIndex === target.sectionIndex && source.columnIndex === target.columnIndex;
  if (sameColumn && source.elementIndex < safeIndex) {
    safeIndex -= 1;
  }
  targetColumn.children.splice(safeIndex, 0, movingElement);

  return { ...page, children: nextSections };
}

function patchRecord(
  source: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...source };
  Object.keys(patch).forEach((key) => {
    next[key] = patch[key];
  });
  return next;
}

export function updateNodePropsById(
  page: BuilderPageNode,
  nodeId: string,
  patch: Record<string, unknown>,
): BuilderPageNode {
  if (!Object.keys(patch).length) return page;

  if (page.id === nodeId) {
    return { ...page, props: patchRecord(page.props, patch) };
  }

  let touched = false;
  const nextSections = page.children.map((section) => {
    if (section.id === nodeId) {
      touched = true;
      return { ...section, props: patchRecord(section.props, patch) };
    }

    const nextColumns = section.children.map((column) => {
      if (column.id === nodeId) {
        touched = true;
        return { ...column, props: patchRecord(column.props, patch) };
      }

      const nextElements = column.children.map((element) => {
        if (element.id !== nodeId) return element;
        touched = true;
        return { ...element, props: patchRecord(element.props, patch) };
      });

      if (nextElements === column.children) return column;
      return { ...column, children: nextElements };
    });

    if (nextColumns === section.children) return section;
    return { ...section, children: nextColumns };
  });

  if (!touched) return page;
  return { ...page, children: nextSections };
}
