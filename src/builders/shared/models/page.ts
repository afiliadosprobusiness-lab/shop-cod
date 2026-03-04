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
  radius: "soft" | "rounded" | "pill";
}

export interface PageBuilderBlockLayout {
  width: "full" | "wide" | "narrow";
  gap: "tight" | "normal" | "loose";
  columns: number;
}

export interface PageBuilderBlock {
  id: string;
  type: PageBuilderBlockType;
  content: Record<string, string>;
  style: PageBuilderBlockStyle;
  layout: PageBuilderBlockLayout;
  children: PageBuilderBlock[];
}

const nestableTypes = new Set<PageBuilderBlockType>(["container", "columns"]);

function createBlockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getDefaultStyle(): PageBuilderBlockStyle {
  return {
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    align: "left",
    padding: "comfortable",
    radius: "rounded",
  };
}

function getDefaultLayout(): PageBuilderBlockLayout {
  return {
    width: "full",
    gap: "normal",
    columns: 2,
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

    case "container":
      return {
        ...base,
        type,
        content: {
          title: "Contenedor",
          subtitle: "Agrupa bloques y ordena una seccion completa.",
        },
      };

    case "columns":
      return {
        ...base,
        type,
        content: {
          title: "Columnas",
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
  }
}

export function createDefaultPageBuilderBlocks(seed?: PageBuilderSeed) {
  const heroContainer = createPageBuilderBlock("container", seed);
  heroContainer.content.title = "Hero premium";
  heroContainer.content.subtitle = "Titular, visual y CTA en una misma seccion.";
  heroContainer.children = [
    createPageBuilderBlock("text", seed),
    createPageBuilderBlock("button", seed),
  ];

  const socialProof = createPageBuilderBlock("columns", seed);
  socialProof.content.title = "Confianza";
  socialProof.content.subtitle = "Prueba social, producto y urgencia.";
  socialProof.children = [
    createPageBuilderBlock("testimonial", seed),
    createPageBuilderBlock("product", seed),
    createPageBuilderBlock("countdown", seed),
  ];

  const closingSection = createPageBuilderBlock("container", seed);
  closingSection.content.title = "Cierre";
  closingSection.content.subtitle = "Formulario y refuerzo final.";
  closingSection.children = [
    createPageBuilderBlock("form", seed),
    createPageBuilderBlock("video", seed),
  ];

  return [heroContainer, socialProof, closingSection];
}
