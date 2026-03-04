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
        <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-card via-card to-secondary/20">
          <div className="border-b border-border/70 px-4 py-3">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Oferta principal
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <h3 className="text-lg font-bold leading-tight">
                {data.title || "Tu Producto Increible"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.subtitle || "Descripcion corta del producto"}
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{data.price || "$49.900"}</span>
                <span className="text-sm text-muted-foreground line-through">
                  {data.originalPrice || "$89.900"}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                  Ahorro hoy
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Pago al recibir", "Envio rapido", "Garantia"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-border/70 bg-secondary/60 px-3 py-2 text-[11px] font-medium text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-gradient-gold px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-gold">
                {data.ctaText || "Comprar Ahora"}
              </div>
            </div>

            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <div className="grid w-full max-w-[13rem] gap-3">
                <div className="h-5 w-16 rounded-full bg-primary/15" />
                <div className="h-24 rounded-2xl bg-background/80 shadow-inner" />
                <div className="grid gap-2">
                  <div className="h-3 rounded-full bg-muted" />
                  <div className="h-3 w-3/4 rounded-full bg-muted" />
                  <div className="h-9 rounded-xl bg-primary/15" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "problem":
      return (
        <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-300">
                Dolor del cliente
              </p>
              <h3 className="mt-2 text-base font-bold">
                {data.title || "Te suena familiar?"}
              </h3>
            </div>
            <div className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300">
              3 objeciones
            </div>
          </div>

          <div className="grid gap-2">
            {[
              data.pain1 || "Problema 1",
              data.pain2 || "Problema 2",
              data.pain3 || "Problema 3",
            ].map((pain, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/50 px-3 py-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-xs font-bold text-rose-300">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "benefits":
      return (
        <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card p-4">
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Transformacion
            </p>
            <h3 className="text-base font-bold">
              {data.title || "Por que elegirnos?"}
            </h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Resultado rapido",
              "Uso simple",
              "Mas confianza",
              "Mejor valor",
            ].map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-border/70 bg-secondary/50 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300">
                    +
                  </span>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Beneficio escrito para que se entienda en segundos.
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "reviews":
      return (
        <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                Prueba social
              </p>
              <h3 className="mt-2 text-base font-bold">
                {data.title || "Lo que dicen nuestros clientes"}
              </h3>
            </div>
            <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              4.9 / 5
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Maria G. - Increible calidad",
              "Carlos R. - Lo recomiendo",
            ].map((review) => (
              <div
                key={review}
                className="rounded-2xl border border-border/70 bg-secondary/50 p-3"
              >
                <div className="mb-2 flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="text-xs">
                      *
                    </span>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground">"{review}"</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card p-4">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              Objeciones
            </p>
            <h3 className="text-base font-bold">
              {data.title || "Preguntas frecuentes"}
            </h3>
          </div>
          <div className="space-y-2">
            {[
              "Como funciona el pago?",
              "Cuanto tarda el envio?",
              "Puedo devolver?",
            ].map((question) => (
              <div
                key={question}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/50 px-3 py-3 text-sm text-muted-foreground"
              >
                <span>{question}</span>
                <span className="text-primary">&gt;</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "checkout":
      return (
        <div className="space-y-4 rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Cierre
              </p>
              <h3 className="mt-2 text-base font-bold">
                {data.title || "Finalizar Pedido"}
              </h3>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
              Pago contraentrega
            </div>
          </div>
          <div className="space-y-2">
            {["Nombre completo", "Telefono / WhatsApp", "Direccion"].map((field) => (
              <div
                key={field}
                className="rounded-2xl border border-border/80 bg-background/80 px-3 py-3 text-sm text-muted-foreground"
              >
                {field}
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-gradient-gold px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-gold">
            Confirmar Pedido
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4 rounded-[1.75rem] border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-5 text-center">
          <div className="mx-auto inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Ultimo empuje
          </div>
          <h3 className="text-lg font-bold">
            {data.title || "No dejes pasar esta oportunidad"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {data.subtitle || "Oferta por tiempo limitado"}
          </p>
          <div className="mx-auto max-w-xs rounded-xl bg-gradient-gold px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-gold">
            {data.ctaText || "Pedir Ahora"}
          </div>
          <div className="flex justify-center gap-2">
            {["Urgencia", "Prueba", "CTA"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="text-center text-sm text-muted-foreground">Bloque desconocido</div>;
  }
}
