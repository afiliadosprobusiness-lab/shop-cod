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

export const blockPlaybooks: Record<
  BlockType,
  {
    stage: string;
    description: string;
    goal: string;
    metric: string;
    quickWins: string[];
  }
> = {
  hero: {
    stage: "Captura",
    description: "Abre la oferta con una promesa clara, precio visible y CTA inmediato.",
    goal: "Levantar el click inicial.",
    metric: "CTR del hero",
    quickWins: [
      "Usa una promesa especifica y medible.",
      "Muestra ahorro real junto al precio final.",
      "Mantiene un CTA de accion directa.",
    ],
  },
  problem: {
    stage: "Dolor",
    description: "Aumenta deseo mostrando fricciones reales que el producto elimina.",
    goal: "Subir la relevancia de la oferta.",
    metric: "Scroll depth",
    quickWins: [
      "Habla del costo de no resolverlo.",
      "Enumera 3 dolores maximo para mantener foco.",
      "Conecta el dolor con el producto, no con teoria.",
    ],
  },
  benefits: {
    stage: "Valor",
    description: "Transforma caracteristicas en resultados concretos y faciles de imaginar.",
    goal: "Incrementar percepcion de valor.",
    metric: "Tiempo en seccion",
    quickWins: [
      "Escribe beneficios orientados a resultado.",
      "Usa bloques cortos y escaneables.",
      "Refuerza velocidad, ahorro o simplicidad.",
    ],
  },
  reviews: {
    stage: "Prueba",
    description: "Refuerza confianza con validacion social y casos de uso.",
    goal: "Reducir objeciones.",
    metric: "Tasa de avance al checkout",
    quickWins: [
      "Menciona nombres y resultados concretos.",
      "Destaca frases que respondan dudas tipicas.",
      "Mantiene la prueba social cerca del CTA.",
    ],
  },
  faq: {
    stage: "Objeciones",
    description: "Resuelve dudas de pago, envio y riesgo antes del cierre.",
    goal: "Bajar friccion de compra.",
    metric: "Drop-off antes del checkout",
    quickWins: [
      "Responde pago, envio y garantia.",
      "Usa respuestas breves y tranquilizadoras.",
      "Prioriza preguntas que el equipo recibe mas.",
    ],
  },
  checkout: {
    stage: "Cierre",
    description: "Convierte el interes en pedido con un formulario simple y confiable.",
    goal: "Maximizar conversion final.",
    metric: "Completion rate",
    quickWins: [
      "Pide solo campos esenciales.",
      "Repite la promesa y el beneficio principal.",
      "Refuerza pago contraentrega y garantia.",
    ],
  },
  cta: {
    stage: "Remate",
    description: "Recaptura a quien duda con urgencia, claridad y un CTA final.",
    goal: "Recuperar compradores indecisos.",
    metric: "Clicks del CTA final",
    quickWins: [
      "Usa una llamada a la accion diferente al hero.",
      "Incluye urgencia sin sonar agresivo.",
      "Refuerza el beneficio mas deseado.",
    ],
  },
};
