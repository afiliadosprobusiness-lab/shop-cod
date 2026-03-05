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
export type LegacySpacingToken = "compact" | "comfortable" | "spacious";
export type LegacyMarginToken = "none" | "sm" | "md" | "lg";
export type LegacyRadiusToken = "soft" | "rounded" | "pill";
export type LegacyFontFamilyToken = "sans" | "serif" | "mono";
export type LegacyFontSizeToken = "sm" | "base" | "lg" | "xl";
export type LegacyBorderWidthToken = "none" | "thin" | "medium";

export interface PageBuilderSeed {
  storeName?: string;
  productName?: string;
  headline?: string;
  subheadline?: string;
  price?: string;
  ctaText?: string;
}

export interface PageBuilderBoxValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: "px";
}

export interface PageBuilderTypography {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface PageBuilderBackground {
  color: string;
  imageUrl: string;
  size: "auto" | "cover" | "contain";
  position: string;
}

export interface PageBuilderBorder {
  style: "none" | "solid" | "dashed";
  width: number;
  color: string;
  radius: number;
}

export interface PageBuilderShadow {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export interface PageBuilderBlockStyle {
  // Legacy tokens kept for backward compatibility with persisted drafts.
  backgroundColor: string;
  textColor: string;
  align: "left" | "center" | "right";
  padding: LegacySpacingToken;
  margin: LegacyMarginToken;
  radius: LegacyRadiusToken;
  fontFamily: LegacyFontFamilyToken;
  fontSize: LegacyFontSizeToken;
  borderStyle: "none" | "solid" | "dashed";
  borderWidth: LegacyBorderWidthToken;
  borderColor: string;

  // Advanced style model used by the redesigned style panel.
  spacing: {
    margin: PageBuilderBoxValues;
    padding: PageBuilderBoxValues;
  };
  typography: PageBuilderTypography;
  background: PageBuilderBackground;
  border: PageBuilderBorder;
  shadow: PageBuilderShadow;
}

export interface PageBuilderDimensions {
  width: string;
  height: string;
  minHeight: string;
  maxWidth: string;
}

export interface PageBuilderBlockLayout {
  // Legacy values kept for compatibility with existing persisted blocks.
  width: "full" | "wide" | "narrow";
  gap: "tight" | "normal" | "loose";
  columns: number;
  minHeight: "auto" | "sm" | "md" | "lg";

  // Advanced dimensions used by the new builder UI.
  dimensions: PageBuilderDimensions;
  gapPx: number;
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

const paddingTokenMap: Record<LegacySpacingToken, number> = {
  compact: 12,
  comfortable: 20,
  spacious: 32,
};

const marginTokenMap: Record<LegacyMarginToken, number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 28,
};

const radiusTokenMap: Record<LegacyRadiusToken, number> = {
  soft: 12,
  rounded: 22,
  pill: 999,
};

const fontSizeTokenMap: Record<LegacyFontSizeToken, number> = {
  sm: 14,
  base: 16,
  lg: 20,
  xl: 28,
};

const borderWidthTokenMap: Record<LegacyBorderWidthToken, number> = {
  none: 0,
  thin: 1,
  medium: 2,
};

const gapTokenMap: Record<PageBuilderBlockLayout["gap"], number> = {
  tight: 10,
  normal: 18,
  loose: 28,
};

const widthTokenMap: Record<PageBuilderBlockLayout["width"], string> = {
  full: "100%",
  wide: "1080px",
  narrow: "760px",
};

const minHeightTokenMap: Record<PageBuilderBlockLayout["minHeight"], string> = {
  auto: "0px",
  sm: "96px",
  md: "180px",
  lg: "280px",
};

const fontFamilyTokenMap: Record<LegacyFontFamilyToken, string> = {
  sans: "Sora, 'Segoe UI', sans-serif",
  serif: "'Fraunces', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

function createBlockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createBoxValues(value: number): PageBuilderBoxValues {
  return {
    top: value,
    right: value,
    bottom: value,
    left: value,
    unit: "px",
  };
}

function safeNumber(value: unknown, fallback: number) {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeFontFamilyToken(value: unknown): LegacyFontFamilyToken {
  if (value === "serif" || value === "mono") {
    return value;
  }

  return "sans";
}

function normalizeFontSizeToken(value: unknown): LegacyFontSizeToken {
  if (value === "sm" || value === "base" || value === "lg" || value === "xl") {
    return value;
  }

  return "base";
}

function normalizePaddingToken(value: unknown): LegacySpacingToken {
  if (value === "compact" || value === "comfortable" || value === "spacious") {
    return value;
  }

  return "comfortable";
}

function normalizeMarginToken(value: unknown): LegacyMarginToken {
  if (value === "none" || value === "sm" || value === "md" || value === "lg") {
    return value;
  }

  return "sm";
}

function normalizeRadiusToken(value: unknown): LegacyRadiusToken {
  if (value === "soft" || value === "rounded" || value === "pill") {
    return value;
  }

  return "rounded";
}

function normalizeBorderWidthToken(value: unknown): LegacyBorderWidthToken {
  if (value === "none" || value === "thin" || value === "medium") {
    return value;
  }

  return "thin";
}

function normalizeWidthToken(value: unknown): PageBuilderBlockLayout["width"] {
  if (value === "full" || value === "wide" || value === "narrow") {
    return value;
  }

  return "full";
}

function normalizeGapToken(value: unknown): PageBuilderBlockLayout["gap"] {
  if (value === "tight" || value === "normal" || value === "loose") {
    return value;
  }

  return "normal";
}

function normalizeMinHeightToken(value: unknown): PageBuilderBlockLayout["minHeight"] {
  if (value === "auto" || value === "sm" || value === "md" || value === "lg") {
    return value;
  }

  return "auto";
}

function getDefaultStyle(): PageBuilderBlockStyle {
  const paddingToken: LegacySpacingToken = "comfortable";
  const marginToken: LegacyMarginToken = "sm";
  const fontFamilyToken: LegacyFontFamilyToken = "sans";
  const fontSizeToken: LegacyFontSizeToken = "base";
  const radiusToken: LegacyRadiusToken = "rounded";
  const borderWidthToken: LegacyBorderWidthToken = "thin";

  return {
    backgroundColor: "#0b1221",
    textColor: "#e2e8f0",
    align: "left",
    padding: paddingToken,
    margin: marginToken,
    radius: radiusToken,
    fontFamily: fontFamilyToken,
    fontSize: fontSizeToken,
    borderStyle: "solid",
    borderWidth: borderWidthToken,
    borderColor: "rgba(148,163,184,0.25)",
    spacing: {
      margin: createBoxValues(marginTokenMap[marginToken]),
      padding: createBoxValues(paddingTokenMap[paddingToken]),
    },
    typography: {
      family: fontFamilyTokenMap[fontFamilyToken],
      size: fontSizeTokenMap[fontSizeToken],
      weight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    background: {
      color: "#0b1221",
      imageUrl: "",
      size: "cover",
      position: "center",
    },
    border: {
      style: "solid",
      width: borderWidthTokenMap[borderWidthToken],
      color: "rgba(148,163,184,0.25)",
      radius: radiusTokenMap[radiusToken],
    },
    shadow: {
      enabled: true,
      x: 0,
      y: 14,
      blur: 36,
      spread: -16,
      color: "rgba(15, 23, 42, 0.55)",
    },
  };
}

function getDefaultLayout(): PageBuilderBlockLayout {
  const widthToken: PageBuilderBlockLayout["width"] = "full";
  const gapToken: PageBuilderBlockLayout["gap"] = "normal";
  const minHeightToken: PageBuilderBlockLayout["minHeight"] = "auto";

  return {
    width: widthToken,
    gap: gapToken,
    columns: 2,
    minHeight: minHeightToken,
    dimensions: {
      width: "100%",
      height: "auto",
      minHeight: minHeightTokenMap[minHeightToken],
      maxWidth: widthTokenMap[widthToken],
    },
    gapPx: gapTokenMap[gapToken],
  };
}

function normalizeStyle(
  style: Partial<PageBuilderBlockStyle> | undefined,
): PageBuilderBlockStyle {
  const fallback = getDefaultStyle();
  const backgroundColor = style?.background?.color || style?.backgroundColor || fallback.backgroundColor;
  const textColor = style?.textColor || fallback.textColor;

  const paddingToken = normalizePaddingToken(style?.padding);
  const marginToken = normalizeMarginToken(style?.margin);
  const fontFamilyToken = normalizeFontFamilyToken(style?.fontFamily);
  const fontSizeToken = normalizeFontSizeToken(style?.fontSize);
  const radiusToken = normalizeRadiusToken(style?.radius);
  const borderWidthToken = normalizeBorderWidthToken(style?.borderWidth);
  const borderStyle = style?.borderStyle === "none" || style?.borderStyle === "dashed" ? style.borderStyle : "solid";

  const spacing = {
    margin: {
      top: safeNumber(style?.spacing?.margin?.top, marginTokenMap[marginToken]),
      right: safeNumber(style?.spacing?.margin?.right, marginTokenMap[marginToken]),
      bottom: safeNumber(style?.spacing?.margin?.bottom, marginTokenMap[marginToken]),
      left: safeNumber(style?.spacing?.margin?.left, marginTokenMap[marginToken]),
      unit: "px" as const,
    },
    padding: {
      top: safeNumber(style?.spacing?.padding?.top, paddingTokenMap[paddingToken]),
      right: safeNumber(style?.spacing?.padding?.right, paddingTokenMap[paddingToken]),
      bottom: safeNumber(style?.spacing?.padding?.bottom, paddingTokenMap[paddingToken]),
      left: safeNumber(style?.spacing?.padding?.left, paddingTokenMap[paddingToken]),
      unit: "px" as const,
    },
  };

  const border = {
    style: style?.border?.style || borderStyle,
    width: safeNumber(style?.border?.width, borderWidthTokenMap[borderWidthToken]),
    color: style?.border?.color || style?.borderColor || fallback.borderColor,
    radius: safeNumber(style?.border?.radius, radiusTokenMap[radiusToken]),
  };

  const typography = {
    family: style?.typography?.family || fontFamilyTokenMap[fontFamilyToken],
    size: safeNumber(style?.typography?.size, fontSizeTokenMap[fontSizeToken]),
    weight: safeNumber(style?.typography?.weight, 500),
    lineHeight: safeNumber(style?.typography?.lineHeight, 1.5),
    letterSpacing: safeNumber(style?.typography?.letterSpacing, 0),
  };

  const background = {
    color: backgroundColor,
    imageUrl: style?.background?.imageUrl || "",
    size: style?.background?.size || "cover",
    position: style?.background?.position || "center",
  };

  const shadow = {
    enabled: style?.shadow?.enabled ?? fallback.shadow.enabled,
    x: safeNumber(style?.shadow?.x, fallback.shadow.x),
    y: safeNumber(style?.shadow?.y, fallback.shadow.y),
    blur: safeNumber(style?.shadow?.blur, fallback.shadow.blur),
    spread: safeNumber(style?.shadow?.spread, fallback.shadow.spread),
    color: style?.shadow?.color || fallback.shadow.color,
  };

  return {
    backgroundColor,
    textColor,
    align: style?.align === "center" || style?.align === "right" ? style.align : "left",
    padding: paddingToken,
    margin: marginToken,
    radius: radiusToken,
    fontFamily: fontFamilyToken,
    fontSize: fontSizeToken,
    borderStyle,
    borderWidth: borderWidthToken,
    borderColor: border.color,
    spacing,
    typography,
    background,
    border,
    shadow,
  };
}

function normalizeLayout(
  layout: Partial<PageBuilderBlockLayout> | undefined,
): PageBuilderBlockLayout {
  const fallback = getDefaultLayout();
  const widthToken = normalizeWidthToken(layout?.width);
  const gapToken = normalizeGapToken(layout?.gap);
  const minHeightToken = normalizeMinHeightToken(layout?.minHeight);

  return {
    width: widthToken,
    gap: gapToken,
    columns: Math.max(2, safeNumber(layout?.columns, 2)),
    minHeight: minHeightToken,
    dimensions: {
      width: layout?.dimensions?.width || "100%",
      height: layout?.dimensions?.height || "auto",
      minHeight: layout?.dimensions?.minHeight || minHeightTokenMap[minHeightToken],
      maxWidth: layout?.dimensions?.maxWidth || widthTokenMap[widthToken],
    },
    gapPx: safeNumber(layout?.gapPx, gapTokenMap[gapToken] || fallback.gapPx),
  };
}

function normalizeContent(content: unknown) {
  if (!content || typeof content !== "object") {
    return {};
  }

  return Object.entries(content as Record<string, unknown>).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      accumulator[key] = typeof value === "string" ? value : String(value ?? "");
      return accumulator;
    },
    {},
  );
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
        style: {
          ...base.style,
          backgroundColor: "#0f172a",
          background: {
            ...base.style.background,
            color: "#0f172a",
          },
        },
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
          backgroundColor: "#050a17",
          background: {
            ...base.style.background,
            color: "#050a17",
          },
          borderColor: "rgba(56,189,248,0.25)",
          border: {
            ...base.style.border,
            color: "rgba(56,189,248,0.25)",
          },
          spacing: {
            ...base.style.spacing,
            margin: createBoxValues(16),
          },
          margin: "md",
        },
        layout: {
          ...base.layout,
          minHeight: "md",
          dimensions: {
            ...base.layout.dimensions,
            minHeight: "180px",
          },
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
          background: {
            ...base.style.background,
            color: "transparent",
          },
          borderStyle: "none",
          borderWidth: "none",
          border: {
            ...base.style.border,
            style: "none",
            width: 0,
          },
          shadow: {
            ...base.style.shadow,
            enabled: false,
          },
        },
        layout: {
          ...base.layout,
          minHeight: "sm",
          dimensions: {
            ...base.layout.dimensions,
            minHeight: "96px",
          },
        },
        content: {
          label: "Separador",
        },
      };
  }
}

export function normalizePageBuilderBlock(
  block: Partial<PageBuilderBlock>,
  seed?: PageBuilderSeed,
): PageBuilderBlock {
  const fallbackType = isPageBuilderBlockType(String(block.type || ""))
    ? (block.type as PageBuilderBlockType)
    : "container";
  const fallback = createPageBuilderBlock(fallbackType, seed);

  return {
    ...fallback,
    id: typeof block.id === "string" && block.id.trim() ? block.id : fallback.id,
    type: fallbackType,
    content: {
      ...fallback.content,
      ...normalizeContent(block.content),
    },
    style: normalizeStyle(block.style),
    layout: normalizeLayout(block.layout),
    children: normalizePageBuilderBlocks(Array.isArray(block.children) ? block.children : [], seed),
  };
}

export function normalizePageBuilderBlocks(
  blocks: Partial<PageBuilderBlock>[],
  seed?: PageBuilderSeed,
): PageBuilderBlock[] {
  return blocks.map((block) => normalizePageBuilderBlock(block, seed));
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
    blocks: normalizePageBuilderBlocks(blocks),
  };
}

export function serializePageBuilderDocument(
  blocks: PageBuilderBlock[],
  options?: { id?: string; title?: string },
) {
  return JSON.stringify(createPageBuilderDocument(blocks, options), null, 2);
}
