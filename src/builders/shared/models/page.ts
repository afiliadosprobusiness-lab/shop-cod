export const pageBuilderBlockTypes = [
  "text",
  "image",
  "button",
  "container",
  "columns",
  "video",
  "product",
  "form",
  "countdown",
  "testimonial",
  "section",
  "divider",
] as const;

export type PageBuilderBlockType = (typeof pageBuilderBlockTypes)[number];
export type PageBuilderDevice = "desktop" | "tablet" | "mobile";

export interface PageBuilderSeed {
  storeName?: string;
  productName?: string;
  headline?: string;
  subheadline?: string;
  price?: string;
  ctaText?: string;
}

export interface PageBuilderBlockStyle {
  backgroundColor: string;
  textColor: string;
  align: "left" | "center" | "right";
  padding: "compact" | "comfortable" | "spacious";
  margin: "none" | "sm" | "md" | "lg";
  radius: "soft" | "rounded" | "pill";
  fontFamily: "sans" | "serif" | "mono";
  fontSize: "sm" | "base" | "lg" | "xl";
  borderStyle: "none" | "solid" | "dashed";
  borderWidth: "none" | "thin" | "medium";
  borderColor: string;
}

export interface PageBuilderBlockLayout {
  width: "full" | "wide" | "narrow";
  gap: "tight" | "normal" | "loose";
  columns: number;
  minHeight: "auto" | "sm" | "md" | "lg";
}

export interface PageBuilderBlock {
  id: string;
  type: PageBuilderBlockType;
  content: Record<string, string>;
  style: PageBuilderBlockStyle;
  layout: PageBuilderBlockLayout;
  children: PageBuilderBlock[];
}

export interface PageBuilderDocument {
  id: string;
  title: string;
  blocks: PageBuilderBlock[];
}

const nestableTypes = new Set<PageBuilderBlockType>(["section", "container", "columns"]);

function createBlockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getDefaultStyle(): PageBuilderBlockStyle {
  return {
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    align: "left",
    padding: "comfortable",
    margin: "sm",
    radius: "rounded",
    fontFamily: "sans",
    fontSize: "base",
    borderStyle: "solid",
    borderWidth: "thin",
    borderColor: "rgba(255,255,255,0.12)",
  };
}

function getDefaultLayout(): PageBuilderBlockLayout {
  return {
    width: "full",
    gap: "normal",
    columns: 2,
    minHeight: "auto",
  };
}

export function isPageBuilderBlockType(value: string): value is PageBuilderBlockType {
  return pageBuilderBlockTypes.includes(value as PageBuilderBlockType);
}

export function canAcceptChildren(type: PageBuilderBlockType) {
  return nestableTypes.has(type);
}

export function createPageBuilderBlock(
  type: PageBuilderBlockType,
  seed?: PageBuilderSeed,
): PageBuilderBlock {
  const productName = seed?.productName || "Producto principal";
  const headline = seed?.headline || "Construye una pagina que convierta desde el primer scroll";
  const subheadline =
    seed?.subheadline || "Secciones flexibles para storytelling, prueba social y cierre.";
  const ctaText = seed?.ctaText || "Comprar ahora";
  const storeName = seed?.storeName || "ShopCOD";
  const price = seed?.price || "$49.900";

  const base: Omit<PageBuilderBlock, "type" | "content"> = {
    id: createBlockId(type),
    style: getDefaultStyle(),
    layout: getDefaultLayout(),
    children: [],
  };

  switch (type) {
    case "text":
      return {
        ...base,
        type,
        content: {
          title: headline,
          body: subheadline,
        },
      };

    case "image":
      return {
        ...base,
        type,
        content: {
          src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
          alt: productName,
          caption: `Visual principal de ${productName}`,
        },
      };

    case "button":
      return {
        ...base,
        type,
        content: {
          label: ctaText,
          href: "#checkout",
          helper: "CTA principal",
        },
      };

    case "section":
      return {
        ...base,
        type,
        style: {
          ...base.style,
          backgroundColor: "#111827",
          borderColor: "rgba(59,130,246,0.18)",
          margin: "md",
        },
        layout: {
          ...base.layout,
          minHeight: "md",
        },
        content: {
          title: "Section",
          subtitle: "Agrupa bloques y define el ritmo general de la pagina.",
        },
      };

    case "container":
      return {
        ...base,
        type,
        content: {
          title: "Container",
          subtitle: "Agrupa bloques y ordena una seccion completa.",
        },
      };

    case "columns":
      return {
        ...base,
        type,
        content: {
          title: "Columns",
          subtitle: "Comparacion, beneficios o grids de confianza.",
        },
      };

    case "video":
      return {
        ...base,
        type,
        content: {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: `Demo de ${productName}`,
          summary: "Video corto para explicar la oferta.",
        },
      };

    case "product":
      return {
        ...base,
        type,
        content: {
          name: productName,
          price,
          badge: "Pago contraentrega",
          description: `Oferta lista para publicar desde ${storeName}.`,
        },
      };

    case "form":
      return {
        ...base,
        type,
        content: {
          title: "Formulario de pedido",
          subtitle: "Captura datos sin friccion.",
          cta: ctaText,
        },
      };

    case "countdown":
      return {
        ...base,
        type,
        content: {
          label: "Oferta termina en",
          days: "02",
          hours: "14",
          minutes: "36",
        },
      };

    case "testimonial":
      return {
        ...base,
        type,
        content: {
          quote: `"${productName}" me ayudo a cerrar mas ventas en menos tiempo.`,
          author: "Cliente destacado",
          role: "Comprador verificado",
        },
      };

    case "divider":
      return {
        ...base,
        type,
        style: {
          ...base.style,
          backgroundColor: "transparent",
          borderStyle: "none",
          borderWidth: "none",
        },
        layout: {
          ...base.layout,
          minHeight: "sm",
        },
        content: {
          label: "Separador",
        },
      };
  }
}

export function createDefaultPageBuilderBlocks(seed?: PageBuilderSeed) {
  const heroSection = createPageBuilderBlock("section", seed);
  heroSection.content.title = "Hero premium";
  heroSection.content.subtitle = "Titular, visual y CTA en una misma seccion.";

  const heroContainer = createPageBuilderBlock("container", seed);
  heroContainer.content.title = "Contenedor principal";
  heroContainer.content.subtitle = "Titulo, subtitulo y CTA.";
  heroContainer.children = [
    createPageBuilderBlock("text", seed),
    createPageBuilderBlock("button", seed),
  ];
  heroSection.children = [heroContainer];

  const socialSection = createPageBuilderBlock("section", seed);
  socialSection.content.title = "Prueba social";
  socialSection.content.subtitle = "Combina testimonio, producto y urgencia.";
  const socialColumns = createPageBuilderBlock("columns", seed);
  socialColumns.layout.columns = 3;
  socialColumns.children = [
    createPageBuilderBlock("testimonial", seed),
    createPageBuilderBlock("product", seed),
    createPageBuilderBlock("countdown", seed),
  ];
  socialSection.children = [socialColumns];

  const closingSection = createPageBuilderBlock("section", seed);
  closingSection.content.title = "Cierre";
  closingSection.content.subtitle = "Formulario, video y separacion visual.";
  const closingContainer = createPageBuilderBlock("container", seed);
  closingContainer.children = [
    createPageBuilderBlock("divider", seed),
    createPageBuilderBlock("form", seed),
    createPageBuilderBlock("video", seed),
  ];
  closingSection.children = [closingContainer];

  return [heroSection, socialSection, closingSection];
}

export function createPageBuilderDocument(
  blocks: PageBuilderBlock[],
  options?: { id?: string; title?: string },
): PageBuilderDocument {
  return {
    id: options?.id || createBlockId("page"),
    title: options?.title?.trim() || "Nueva pagina",
    blocks,
  };
}

export function serializePageBuilderDocument(
  blocks: PageBuilderBlock[],
  options?: { id?: string; title?: string },
) {
  return JSON.stringify(createPageBuilderDocument(blocks, options), null, 2);
}
