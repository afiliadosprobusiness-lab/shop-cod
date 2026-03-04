import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Phone,
  Star,
  Zap,
  Heart,
  Award,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import heroProduct from "@/assets/hero-product.png";
import { loadEditorState, publishEditorState } from "@/lib/editor";
import { toast } from "sonner";

export default function PreviewPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const resolvedStoreId = storeId || "new";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const editorState = useMemo(() => loadEditorState(resolvedStoreId), [resolvedStoreId]);
  const profile = editorState?.profile;
  const heroBlock = editorState?.blocks.find((block) => block.type === "hero");
  const checkoutBlock = editorState?.blocks.find((block) => block.type === "checkout");

  const heroTitle = heroBlock?.data.title || profile?.headline || "Tu producto estrella";
  const heroSubtitle =
    heroBlock?.data.subtitle ||
    profile?.subheadline ||
    "Una oferta lista para vender desde hoy.";
  const heroPrice = heroBlock?.data.price || profile?.price || "$49.900";
  const heroOriginalPrice =
    heroBlock?.data.originalPrice || profile?.originalPrice || "$89.900";
  const ctaText = heroBlock?.data.ctaText || profile?.ctaText || "Comprar ahora";
  const storeName = profile?.storeName || "ShopCOD Store";
  const productName = profile?.productName || "Producto principal";
  const checkoutTitle =
    checkoutBlock?.data.title || `Pide ${productName} con entrega contra pago`;

  const faqs = [
    {
      q: "Como funciona el pago contraentrega?",
      a: "Realizas tu pedido y pagas en efectivo cuando recibes el producto.",
    },
    {
      q: "Cuanto tarda el envio?",
      a: "Entre 2 y 5 dias habiles, segun la ciudad de destino.",
    },
    {
      q: "Puedo devolver el producto?",
      a: "Si. Tienes 30 dias de garantia de satisfaccion.",
    },
  ];

  const handlePublish = () => {
    const publishedState = publishEditorState(
      resolvedStoreId,
      editorState?.blocks,
      editorState?.profile,
    );

    if (!publishedState) {
      toast.error("Primero guarda el funnel desde el editor.");
      return;
    }

    toast.success("Preview publicado.", {
      description: `Publicacion: ${new Date(
        publishedState.publishedAt || "",
      ).toLocaleString()}`,
    });
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 border-b border-primary/20 bg-primary/10 backdrop-blur-xl">
        <div className="container flex h-10 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/editor/${resolvedStoreId}`)}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al editor
          </button>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Vista previa de {storeName}
          </span>
          <Button variant="cta" size="sm" className="h-7 text-xs" onClick={handlePublish}>
            Publicar
          </Button>
        </div>
      </div>

      <section className="py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-4 w-4" /> Oferta principal de {storeName}
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground">{heroSubtitle}</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gradient-gold">{heroPrice}</span>
              <span className="text-xl text-muted-foreground line-through">
                {heroOriginalPrice}
              </span>
              <span className="rounded bg-primary/20 px-2 py-0.5 text-sm font-semibold text-primary">
                Oferta
              </span>
            </div>
            <Button
              variant="cta"
              size="xl"
              className="w-full sm:w-auto"
              onClick={() => navigate("/checkout")}
            >
              {ctaText}
            </Button>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" /> Envio gratis
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Garantia 30 dias
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-primary" /> Pago contraentrega
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <img
              src={heroProduct}
              alt={productName}
              className="mx-auto w-full max-w-md rounded-2xl shadow-gold-lg"
            />
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary/20 py-16">
        <div className="container">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Por que <span className="text-gradient-gold">elegir {productName}</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Award className="h-7 w-7" />,
                title: "Calidad Premium",
                desc: `${productName} esta pensado para vender con confianza.`,
              },
              {
                icon: <Truck className="h-7 w-7" />,
                title: "Envio Express",
                desc: "Despacho rapido para no perder impulso comercial.",
              },
              {
                icon: <Heart className="h-7 w-7" />,
                title: "Garantia Total",
                desc: "Mensajes de confianza listos para convertir mejor.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="space-y-3 rounded-xl border border-border bg-card p-6"
              >
                <div className="text-primary">{benefit.icon}</div>
                <h3 className="font-bold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="mb-2 text-center text-3xl font-bold">
            Lo que dicen quienes compraron{" "}
            <span className="text-gradient-gold">{productName}</span>
          </h2>
          <div className="mb-8 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Maria G.", city: "Bogota", text: "La oferta se entiende rapido." },
              { name: "Carlos R.", city: "CDMX", text: "Me dio confianza desde el primer scroll." },
              { name: "Ana L.", city: "Lima", text: "El checkout se siente claro y directo." },
            ].map((review) => (
              <div
                key={review.name}
                className="space-y-3 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm">"{review.text}"</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {review.name} - {review.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/20 py-16">
        <div className="container max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Preguntas <span className="text-gradient-gold">frecuentes</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.q} className="overflow-hidden rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index ? (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-lg">
          <div className="space-y-4 rounded-xl border border-primary/20 bg-card p-6">
            <h2 className="text-center text-2xl font-bold">{checkoutTitle}</h2>
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">Pago Contraentrega</span> - Pagas
              al recibir
            </div>
            <div className="space-y-3">
              {[
                "Nombre completo",
                "Telefono / WhatsApp",
                "Departamento",
                "Ciudad",
                "Direccion completa",
              ].map((field) => (
                <div
                  key={field}
                  className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground"
                >
                  {field}
                </div>
              ))}
            </div>
            <Button
              variant="cta"
              size="xl"
              className="w-full"
              onClick={() => navigate("/checkout")}
            >
              {ctaText}
            </Button>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Envio gratis
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Garantia 30 dias
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
