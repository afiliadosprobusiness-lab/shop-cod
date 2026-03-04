import { type BlockType } from "@/lib/editor";

export const blockMeta: Record<BlockType, { label: string; emoji: string }> = {
  hero: { label: "Hero", emoji: "H" },
  problem: { label: "Problema", emoji: "P" },
  benefits: { label: "Beneficios", emoji: "B" },
  reviews: { label: "Reviews", emoji: "R" },
  faq: { label: "FAQ", emoji: "?" },
  checkout: { label: "Checkout", emoji: "C" },
  cta: { label: "CTA Final", emoji: "!" },
};

export const defaultBlockData: Record<BlockType, Record<string, string>> = {
  hero: {
    title: "Tu Producto Increible",
    subtitle: "Descripcion corta del producto",
    price: "$49.900",
    originalPrice: "$89.900",
    ctaText: "Comprar Ahora",
  },
  problem: {
    title: "Te suena familiar?",
    pain1: "Productos de mala calidad",
    pain2: "Precios inflados",
    pain3: "Envios que nunca llegan",
  },
  benefits: { title: "Por que elegirnos?" },
  reviews: { title: "Lo que dicen nuestros clientes" },
  faq: { title: "Preguntas frecuentes" },
  checkout: { title: "Finalizar Pedido" },
  cta: {
    title: "No dejes pasar esta oportunidad",
    subtitle: "Oferta por tiempo limitado",
    ctaText: "Pedir Ahora",
  },
};
