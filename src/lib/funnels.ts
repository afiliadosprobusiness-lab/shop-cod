import { defaultBlockData } from "@/components/editor/block-config";
import {
  loadEditorState,
  saveEditorState,
  type FunnelBlock,
} from "@/lib/editor";

export type FunnelCurrency = "USD" | "EUR" | "PEN";
export type FunnelTemplateId = "blank" | "ai" | "preset";

export interface FunnelPage {
  id: string;
  name: string;
  type: "landing" | "offer" | "checkout" | "upsell" | "thankyou";
}

export interface FunnelTemplate {
  id: FunnelTemplateId;
  name: string;
  category: string;
  description: string;
  pages: FunnelPage[];
}

export interface Funnel {
  id: string;
  name: string;
  slug: string;
  currency: FunnelCurrency;
  pages: FunnelPage[];
  templateId: FunnelTemplateId;
  conversion: number;
  visits: number;
  createdAt: string;
}

export interface FunnelInput {
  name: string;
  slug: string;
  currency: FunnelCurrency;
  templateId: FunnelTemplateId;
}

const FUNNELS_STORAGE_KEY = "shopcod-funnels-v1";

const funnelTemplates: FunnelTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    category: "Base",
    description: "Arranca desde cero con una estructura minima y control total.",
    pages: [
      { id: "page-landing", name: "Landing", type: "landing" },
      { id: "page-checkout", name: "Checkout", type: "checkout" },
      { id: "page-thankyou", name: "Thank You", type: "thankyou" },
    ],
  },
  {
    id: "ai",
    name: "IA",
    category: "Automatizado",
    description: "Usa una base sugerida para lanzar mas rapido con copy orientado a conversion.",
    pages: [
      { id: "page-hero", name: "Hero Offer", type: "landing" },
      { id: "page-proof", name: "Proof Stack", type: "offer" },
      { id: "page-checkout", name: "Checkout", type: "checkout" },
      { id: "page-thankyou", name: "Thank You", type: "thankyou" },
    ],
  },
  {
    id: "preset",
    name: "Plantillas predisenadas",
    category: "Ecommerce",
    description: "Parte de una secuencia lista para COD con upsell y cierre posterior.",
    pages: [
      { id: "page-main", name: "Main Offer", type: "landing" },
      { id: "page-checkout", name: "Checkout", type: "checkout" },
      { id: "page-upsell", name: "Upsell", type: "upsell" },
      { id: "page-thankyou", name: "Thank You", type: "thankyou" },
    ],
  },
];

const seedFunnels: Funnel[] = [
  {
    id: "funnel-101",
    name: "Glow COD Sprint",
    slug: "glow-cod-sprint",
    currency: "USD",
    pages: clonePages(funnelTemplates[2].pages),
    templateId: "preset",
    conversion: 4.8,
    visits: 18240,
    createdAt: "2026-03-01T09:20:00.000Z",
  },
  {
    id: "funnel-102",
    name: "AI Gadget Push",
    slug: "ai-gadget-push",
    currency: "PEN",
    pages: clonePages(funnelTemplates[1].pages),
    templateId: "ai",
    conversion: 6.2,
    visits: 9340,
    createdAt: "2026-02-26T14:05:00.000Z",
  },
];

function clonePages(pages: FunnelPage[]) {
  return pages.map((page) => ({ ...page }));
}

function cloneSeedFunnels() {
  return seedFunnels.map((funnel) => ({
    ...funnel,
    pages: clonePages(funnel.pages),
  }));
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredFunnels() {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(FUNNELS_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Funnel[];

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function writeStoredFunnels(funnels: Funnel[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(FUNNELS_STORAGE_KEY, JSON.stringify(funnels));
}

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function templateById(templateId: FunnelTemplateId) {
  return funnelTemplates.find((template) => template.id === templateId) ?? funnelTemplates[0];
}

function createPageId(baseId: string) {
  return `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
}

function createBlocksForTemplate(template: FunnelTemplate, funnel: Funnel): FunnelBlock[] {
  const priceByCurrency: Record<FunnelCurrency, string> = {
    USD: "$49.00",
    EUR: "EUR 45.00",
    PEN: "S/ 179.00",
  };

  return [
    {
      id: createEntityId("b"),
      type: "hero",
      data: {
        ...defaultBlockData.hero,
        title: funnel.name,
        subtitle: `${template.name} listo para vender con una estructura de ${template.pages.length} paginas.`,
        price: priceByCurrency[funnel.currency],
        originalPrice: template.id === "blank" ? "" : priceByCurrency[funnel.currency],
        ctaText: "Comenzar ahora",
      },
    },
    {
      id: createEntityId("b"),
      type: "problem",
      data: {
        ...defaultBlockData.problem,
        title: `Objeciones que ${funnel.name} busca resolver`,
      },
    },
    {
      id: createEntityId("b"),
      type: "benefits",
      data: {
        ...defaultBlockData.benefits,
        title: `Beneficios principales de ${funnel.name}`,
      },
    },
    {
      id: createEntityId("b"),
      type: "reviews",
      data: {
        ...defaultBlockData.reviews,
        title: "Prueba social para acelerar conversion",
      },
    },
    {
      id: createEntityId("b"),
      type: "faq",
      data: {
        ...defaultBlockData.faq,
        title: "Preguntas frecuentes antes del checkout",
      },
    },
    {
      id: createEntityId("b"),
      type: "checkout",
      data: {
        ...defaultBlockData.checkout,
        title: `Checkout en ${funnel.currency}`,
      },
    },
    {
      id: createEntityId("b"),
      type: "cta",
      data: {
        ...defaultBlockData.cta,
        title: `Activa ${funnel.name} hoy`,
        subtitle: `Template ${template.name} preparado para seguir refinando en el editor visual.`,
        ctaText: "Entrar al editor",
      },
    },
  ];
}

function ensureEditorDraft(funnel: Funnel) {
  if (loadEditorState(funnel.id)) {
    return;
  }

  const template = templateById(funnel.templateId);
  const blocks = createBlocksForTemplate(template, funnel);

  saveEditorState(funnel.id, blocks, null);
}

function normalizePage(candidate: unknown): FunnelPage | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const page = candidate as Partial<FunnelPage>;

  if (
    typeof page.id !== "string" ||
    typeof page.name !== "string" ||
    (page.type !== "landing" &&
      page.type !== "offer" &&
      page.type !== "checkout" &&
      page.type !== "upsell" &&
      page.type !== "thankyou")
  ) {
    return null;
  }

  return {
    id: page.id,
    name: page.name,
    type: page.type,
  };
}

function normalizeFunnel(candidate: unknown): Funnel | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const funnel = candidate as Partial<Funnel>;

  if (
    typeof funnel.id !== "string" ||
    typeof funnel.name !== "string" ||
    typeof funnel.slug !== "string" ||
    (funnel.currency !== "USD" && funnel.currency !== "EUR" && funnel.currency !== "PEN") ||
    !Array.isArray(funnel.pages) ||
    (funnel.templateId !== "blank" &&
      funnel.templateId !== "ai" &&
      funnel.templateId !== "preset")
  ) {
    return null;
  }

  const pages = funnel.pages
    .map((page) => normalizePage(page))
    .filter((page): page is FunnelPage => Boolean(page));

  return {
    id: funnel.id,
    name: funnel.name,
    slug: funnel.slug,
    currency: funnel.currency,
    pages,
    templateId: funnel.templateId,
    conversion: typeof funnel.conversion === "number" ? funnel.conversion : 0,
    visits: typeof funnel.visits === "number" ? funnel.visits : 0,
    createdAt: typeof funnel.createdAt === "string" ? funnel.createdAt : new Date().toISOString(),
  };
}

function ensureUniqueSlug(baseSlug: string, funnels: Funnel[]) {
  const normalizedBase = slugifyFunnelName(baseSlug) || "nuevo-funnel";
  let candidate = normalizedBase;
  let counter = 2;

  while (funnels.some((funnel) => funnel.slug === candidate)) {
    candidate = `${normalizedBase}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function slugifyFunnelName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getFunnelTemplates() {
  return funnelTemplates.map((template) => ({
    ...template,
    pages: clonePages(template.pages),
  }));
}

export function loadFunnels() {
  const storedFunnels = readStoredFunnels();
  const normalizedFunnels = storedFunnels
    ?.map((funnel) => normalizeFunnel(funnel))
    .filter((funnel): funnel is Funnel => Boolean(funnel));

  return (normalizedFunnels?.length ? normalizedFunnels : cloneSeedFunnels()).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function ensureFunnelEditorDraft(funnelId: string) {
  const funnel = loadFunnels().find((item) => item.id === funnelId);

  if (!funnel) {
    return null;
  }

  ensureEditorDraft(funnel);
  return funnel;
}

export function saveFunnel(input: FunnelInput) {
  const currentFunnels = loadFunnels();
  const template = templateById(input.templateId);
  const funnel: Funnel = {
    id: createEntityId("funnel"),
    name: input.name.trim() || "Nuevo funnel",
    slug: ensureUniqueSlug(input.slug || input.name, currentFunnels),
    currency: input.currency,
    pages: template.pages.map((page) => ({
      ...page,
      id: createPageId(page.id),
    })),
    templateId: template.id,
    conversion: 0,
    visits: 0,
    createdAt: new Date().toISOString(),
  };

  writeStoredFunnels([funnel, ...currentFunnels]);
  ensureEditorDraft(funnel);
  return funnel;
}
