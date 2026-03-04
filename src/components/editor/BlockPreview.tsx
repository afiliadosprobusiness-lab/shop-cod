import { type BlockType } from "@/lib/editor";

// Renders a preview of each block type for the canvas
export function BlockPreview({ type, data }: { type: BlockType; data: Record<string, string> }) {
  switch (type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-xl bg-primary/10 mx-auto" />
          <h3 className="font-bold text-lg text-center">{data.title || "Tu Producto Increíble"}</h3>
          <p className="text-sm text-muted-foreground text-center">{data.subtitle || "Descripción corta del producto"}</p>
          <div className="flex justify-center gap-2 items-baseline">
            <span className="font-bold text-xl text-primary">{data.price || "$49.900"}</span>
            <span className="text-sm text-muted-foreground line-through">{data.originalPrice || "$89.900"}</span>
          </div>
          <div className="bg-gradient-gold text-primary-foreground text-center py-2 rounded-lg text-sm font-semibold">
            {data.ctaText || "🛒 Comprar Ahora"}
          </div>
        </div>
      );

    case "problem":
      return (
        <div className="space-y-3">
          <h3 className="font-bold text-center">{data.title || "¿Te suena familiar?"}</h3>
          <div className="grid grid-cols-3 gap-2">
            {[data.pain1 || "😤 Problema 1", data.pain2 || "💸 Problema 2", data.pain3 || "⏰ Problema 3"].map((p, i) => (
              <div key={i} className="bg-secondary rounded-lg p-2 text-xs text-center text-muted-foreground">{p}</div>
            ))}
          </div>
        </div>
      );

    case "benefits":
      return (
        <div className="space-y-3">
          <h3 className="font-bold text-center">{data.title || "¿Por qué elegirnos?"}</h3>
          <div className="grid grid-cols-2 gap-2">
            {["✅ Beneficio 1", "✅ Beneficio 2", "✅ Beneficio 3", "✅ Beneficio 4"].map((b, i) => (
              <div key={i} className="bg-secondary rounded p-2 text-xs text-muted-foreground">{b}</div>
            ))}
          </div>
        </div>
      );

    case "reviews":
      return (
        <div className="space-y-3">
          <h3 className="font-bold text-center">{data.title || "Lo que dicen nuestros clientes"}</h3>
          <div className="flex justify-center gap-1">
            {Array(5).fill(0).map((_, i) => <span key={i} className="text-primary">⭐</span>)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["María G. — 'Increíble calidad'", "Carlos R. — 'Lo recomiendo'"].map((r, i) => (
              <div key={i} className="bg-secondary rounded p-2 text-xs text-muted-foreground italic">"{r}"</div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3">
          <h3 className="font-bold text-center">{data.title || "Preguntas frecuentes"}</h3>
          <div className="space-y-1.5">
            {["¿Cómo funciona el pago?", "¿Cuánto tarda el envío?", "¿Puedo devolver?"].map((q, i) => (
              <div key={i} className="bg-secondary rounded p-2 text-xs text-muted-foreground flex items-center gap-2">
                <span className="text-primary">▸</span> {q}
              </div>
            ))}
          </div>
        </div>
      );

    case "checkout":
      return (
        <div className="space-y-3">
          <h3 className="font-bold text-center">{data.title || "Finalizar Pedido"}</h3>
          <div className="space-y-1.5">
            {["Nombre completo", "Teléfono / WhatsApp", "Dirección"].map((f, i) => (
              <div key={i} className="bg-secondary rounded px-3 py-2 text-xs text-muted-foreground border border-border">{f}</div>
            ))}
          </div>
          <div className="bg-gradient-gold text-primary-foreground text-center py-2 rounded-lg text-sm font-semibold">
            ✅ Confirmar Pedido
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3 text-center">
          <h3 className="font-bold">{data.title || "No dejes pasar esta oportunidad"}</h3>
          <p className="text-xs text-muted-foreground">{data.subtitle || "Oferta por tiempo limitado"}</p>
          <div className="bg-gradient-gold text-primary-foreground text-center py-2 rounded-lg text-sm font-semibold">
            {data.ctaText || "🛒 Pedir Ahora"}
          </div>
        </div>
      );

    default:
      return <div className="text-sm text-muted-foreground text-center">Bloque desconocido</div>;
  }
}

// Block type metadata
export const blockMeta: Record<BlockType, { label: string; emoji: string }> = {
  hero: { label: "Hero", emoji: "🎯" },
  problem: { label: "Problema", emoji: "😤" },
  benefits: { label: "Beneficios", emoji: "✨" },
  reviews: { label: "Reviews", emoji: "⭐" },
  faq: { label: "FAQ", emoji: "❓" },
  checkout: { label: "Checkout", emoji: "🛒" },
  cta: { label: "CTA Final", emoji: "🔥" },
};

// Default data for each block type
export const defaultBlockData: Record<BlockType, Record<string, string>> = {
  hero: { title: "Tu Producto Increíble", subtitle: "Descripción corta del producto", price: "$49.900", originalPrice: "$89.900", ctaText: "🛒 Comprar Ahora" },
  problem: { title: "¿Te suena familiar?", pain1: "😤 Productos de mala calidad", pain2: "💸 Precios inflados", pain3: "⏰ Envíos que nunca llegan" },
  benefits: { title: "¿Por qué elegirnos?" },
  reviews: { title: "Lo que dicen nuestros clientes" },
  faq: { title: "Preguntas frecuentes" },
  checkout: { title: "Finalizar Pedido" },
  cta: { title: "No dejes pasar esta oportunidad", subtitle: "Oferta por tiempo limitado", ctaText: "🛒 Pedir Ahora" },
};
