import { type BlockType } from "@/lib/editor";

export function BlockPreview({
  type,
  data,
}: {
  type: BlockType;
  data: Record<string, string>;
}) {
  switch (type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div className="mx-auto h-16 w-16 rounded-xl bg-primary/10" />
          <h3 className="text-center text-lg font-bold">
            {data.title || "Tu Producto Increible"}
          </h3>
          <p className="text-center text-sm text-muted-foreground">
            {data.subtitle || "Descripcion corta del producto"}
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-xl font-bold text-primary">{data.price || "$49.900"}</span>
            <span className="text-sm text-muted-foreground line-through">
              {data.originalPrice || "$89.900"}
            </span>
          </div>
          <div className="rounded-lg bg-gradient-gold py-2 text-center text-sm font-semibold text-primary-foreground">
            {data.ctaText || "Comprar Ahora"}
          </div>
        </div>
      );

    case "problem":
      return (
        <div className="space-y-3">
          <h3 className="text-center font-bold">{data.title || "Te suena familiar?"}</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              data.pain1 || "Problema 1",
              data.pain2 || "Problema 2",
              data.pain3 || "Problema 3",
            ].map((pain, index) => (
              <div
                key={index}
                className="rounded-lg bg-secondary p-2 text-center text-xs text-muted-foreground"
              >
                {pain}
              </div>
            ))}
          </div>
        </div>
      );

    case "benefits":
      return (
        <div className="space-y-3">
          <h3 className="text-center font-bold">
            {data.title || "Por que elegirnos?"}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Beneficio 1",
              "Beneficio 2",
              "Beneficio 3",
              "Beneficio 4",
            ].map((benefit) => (
              <div
                key={benefit}
                className="rounded p-2 text-xs text-muted-foreground bg-secondary"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      );

    case "reviews":
      return (
        <div className="space-y-3">
          <h3 className="text-center font-bold">
            {data.title || "Lo que dicen nuestros clientes"}
          </h3>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="text-primary">
                *
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Maria G. - Increible calidad",
              "Carlos R. - Lo recomiendo",
            ].map((review) => (
              <div
                key={review}
                className="rounded bg-secondary p-2 text-xs italic text-muted-foreground"
              >
                "{review}"
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3">
          <h3 className="text-center font-bold">
            {data.title || "Preguntas frecuentes"}
          </h3>
          <div className="space-y-1.5">
            {[
              "Como funciona el pago?",
              "Cuanto tarda el envio?",
              "Puedo devolver?",
            ].map((question) => (
              <div
                key={question}
                className="flex items-center gap-2 rounded bg-secondary p-2 text-xs text-muted-foreground"
              >
                <span className="text-primary">&gt;</span> {question}
              </div>
            ))}
          </div>
        </div>
      );

    case "checkout":
      return (
        <div className="space-y-3">
          <h3 className="text-center font-bold">
            {data.title || "Finalizar Pedido"}
          </h3>
          <div className="space-y-1.5">
            {["Nombre completo", "Telefono / WhatsApp", "Direccion"].map((field) => (
              <div
                key={field}
                className="rounded border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground"
              >
                {field}
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-gradient-gold py-2 text-center text-sm font-semibold text-primary-foreground">
            Confirmar Pedido
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3 text-center">
          <h3 className="font-bold">{data.title || "No dejes pasar esta oportunidad"}</h3>
          <p className="text-xs text-muted-foreground">
            {data.subtitle || "Oferta por tiempo limitado"}
          </p>
          <div className="rounded-lg bg-gradient-gold py-2 text-center text-sm font-semibold text-primary-foreground">
            {data.ctaText || "Pedir Ahora"}
          </div>
        </div>
      );

    default:
      return <div className="text-center text-sm text-muted-foreground">Bloque desconocido</div>;
  }
}
