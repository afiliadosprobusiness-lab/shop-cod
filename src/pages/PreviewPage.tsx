import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Truck, Phone, Star, Zap, Heart, Award, CheckCircle2, ChevronDown } from "lucide-react";
import heroProduct from "@/assets/hero-product.png";
import { useState } from "react";

// This is a preview of what the generated store looks like
export default function PreviewPage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "¿Cómo funciona el pago contraentrega?", a: "Realizas tu pedido y pagas en efectivo al recibir." },
    { q: "¿Cuánto tarda el envío?", a: "Entre 2 y 5 días hábiles." },
    { q: "¿Puedo devolver el producto?", a: "Sí, 30 días de garantía de satisfacción." },
  ];

  return (
    <div className="min-h-screen">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-10">
          <button onClick={() => navigate(`/editor/${storeId}`)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver al editor
          </button>
          <span className="text-xs text-muted-foreground">Vista previa — Modo desktop</span>
          <Button variant="cta" size="sm" className="text-xs h-7">Publicar</Button>
        </div>
      </div>

      {/* Hero */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Zap className="w-4 h-4" /> Oferta por tiempo limitado
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Auriculares Bluetooth <span className="text-gradient-gold">Pro Max</span>
            </h1>
            <p className="text-lg text-muted-foreground">Sonido premium, cancelación de ruido activa y 40 horas de batería. Diseñados para quienes exigen lo mejor.</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gradient-gold">$49.900</span>
              <span className="text-xl text-muted-foreground line-through">$89.900</span>
              <span className="bg-primary/20 text-primary text-sm font-semibold px-2 py-0.5 rounded">-44%</span>
            </div>
            <Button variant="cta" size="xl" className="w-full sm:w-auto">🛒 Comprar Ahora — Pago Contraentrega</Button>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" /> Envío gratis</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Garantía 30 días</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-primary" /> Pago contraentrega</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <img src={heroProduct} alt="Producto" className="w-full max-w-md mx-auto rounded-2xl shadow-gold-lg" />
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-secondary/20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">¿Por qué <span className="text-gradient-gold">elegirnos</span>?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Award className="w-7 h-7" />, title: "Calidad Premium", desc: "Materiales de primera línea" },
              { icon: <Truck className="w-7 h-7" />, title: "Envío Express", desc: "2-5 días hábiles" },
              { icon: <Heart className="w-7 h-7" />, title: "Garantía Total", desc: "30 días de garantía" },
            ].map((b, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
                <div className="text-primary">{b.icon}</div>
                <h3 className="font-bold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-2">Lo que dicen nuestros <span className="text-gradient-gold">clientes</span></h2>
          <div className="flex justify-center gap-1 mb-8">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "María G.", city: "Bogotá", text: "Increíble calidad y sonido. Llegó en 3 días." },
              { name: "Carlos R.", city: "CDMX", text: "Mejor compra del año, los uso todos los días." },
              { name: "Ana L.", city: "Lima", text: "Pagué al recibir y es exactamente como se ve." },
            ].map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex gap-0.5">{Array(5).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}</div>
                <p className="text-sm">"{r.text}"</p>
                <p className="text-xs text-muted-foreground font-semibold">{r.name} — {r.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-secondary/20">
        <div className="container max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">Preguntas <span className="text-gradient-gold">frecuentes</span></h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm">
                  {f.q}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section className="py-16">
        <div className="container max-w-lg">
          <div className="bg-card border border-primary/20 rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Finalizar <span className="text-gradient-gold">Pedido</span></h2>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold">Pago Contraentrega</span> — Pagas al recibir
            </div>
            <div className="space-y-3">
              {["Nombre completo", "Teléfono / WhatsApp", "Departamento", "Ciudad", "Dirección completa"].map((f, i) => (
                <div key={i} className="bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">{f}</div>
              ))}
            </div>
            <Button variant="cta" size="xl" className="w-full">✅ Confirmar Pedido — $49.900</Button>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Envío gratis</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Garantía 30 días</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
