import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, Star, ChevronDown, Phone, MapPin, Clock, CheckCircle2, Zap, Heart, Award } from "lucide-react";
import heroProduct from "@/assets/hero-product.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─── HERO ───
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-gradient-to-l from-primary/10 to-transparent" />
      <div className="container relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-0">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="w-4 h-4" /> Oferta por tiempo limitado
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Transforma tu vida con{" "}
            <span className="text-gradient-gold">tecnología premium</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-md">
            Diseñado para quienes exigen lo mejor. Envío rápido a todo LATAM. Pagas cuando lo recibes.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gradient-gold">$49.900</span>
            <span className="text-xl text-muted-foreground line-through">$89.900</span>
            <span className="bg-primary/20 text-primary text-sm font-semibold px-2 py-0.5 rounded">-44%</span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <Button variant="cta" size="xl" onClick={() => navigate("/checkout")} className="w-full sm:w-auto">
              🛒 Comprar Ahora — Pago Contraentrega
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" /> Envío gratis</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Garantía 30 días</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-primary" /> Pago contraentrega</span>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex justify-center"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
          <img src={heroProduct} alt="Producto premium" className="relative z-10 w-full max-w-md rounded-2xl shadow-gold-lg animate-float" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── PAIN POINTS ───
function PainSection() {
  const pains = [
    { icon: "😤", text: "¿Cansado de productos que no cumplen lo que prometen?" },
    { icon: "💸", text: "¿Harto de pagar antes y recibir algo diferente?" },
    { icon: "⏰", text: "¿Esperando semanas por un envío que nunca llega?" },
  ];
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center space-y-12">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
            ¿Te suena <span className="text-gradient-gold">familiar</span>?
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {pains.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
                <span className="text-4xl">{p.icon}</span>
                <p className="text-foreground font-medium">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── BENEFITS ───
function BenefitsSection() {
  const benefits = [
    { icon: <Award className="w-8 h-8" />, title: "Calidad Premium", desc: "Materiales de primera que duran años" },
    { icon: <Truck className="w-8 h-8" />, title: "Envío Express", desc: "Recibe en 2-5 días hábiles" },
    { icon: <ShieldCheck className="w-8 h-8" />, title: "Pago Seguro", desc: "Pagas solo cuando lo tienes en tus manos" },
    { icon: <Heart className="w-8 h-8" />, title: "Garantía Total", desc: "30 días de garantía de satisfacción" },
    { icon: <Zap className="w-8 h-8" />, title: "Tecnología Avanzada", desc: "Lo último en innovación para ti" },
    { icon: <Star className="w-8 h-8" />, title: "+10,000 Clientes", desc: "Únete a miles de clientes satisfechos" },
  ];
  return (
    <section className="py-20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-12">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-center">
            ¿Por qué <span className="text-gradient-gold">elegirnos</span>?
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary/30 transition-colors">
                <div className="text-primary">{b.icon}</div>
                <h3 className="font-bold text-lg">{b.title}</h3>
                <p className="text-muted-foreground text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ───
function SocialProofSection() {
  const reviews = [
    { name: "María G.", city: "Bogotá, CO", rating: 5, text: "Increíble calidad, llegó en 3 días. ¡100% recomendado! El pago contraentrega me dio mucha confianza." },
    { name: "Carlos R.", city: "CDMX, MX", rating: 5, text: "Mejor compra del año. La calidad supera mis expectativas. Pedí 2 más para mis hermanos." },
    { name: "Ana L.", city: "Lima, PE", rating: 5, text: "Al principio dudé pero pagué cuando llegó y es exactamente como se ve. Excelente servicio." },
    { name: "José M.", city: "Santiago, CL", rating: 5, text: "Rápido, seguro y sin sorpresas. El producto es premium de verdad. Ya soy cliente fiel." },
  ];
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-12">
          <motion.div variants={fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold">Lo que dicen nuestros <span className="text-gradient-gold">clientes</span></h2>
            <div className="flex justify-center gap-1">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-6 h-6 fill-primary text-primary" />)}</div>
            <p className="text-muted-foreground">4.9/5 basado en +2,400 reseñas verificadas</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex gap-0.5">{Array(r.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}</div>
                <p className="text-sm text-foreground">"{r.text}"</p>
                <div className="text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-muted-foreground"> — {r.city}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── TRUST ───
function TrustSection() {
  const trusts = [
    { icon: <Phone className="w-10 h-10" />, title: "Pago Contraentrega", desc: "Pagas cuando recibes. Sin riesgo." },
    { icon: <Truck className="w-10 h-10" />, title: "Envío Rápido", desc: "2-5 días hábiles a todo LATAM." },
    { icon: <ShieldCheck className="w-10 h-10" />, title: "Garantía 30 Días", desc: "No te gusta, te devolvemos tu dinero." },
  ];
  return (
    <section className="py-20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-12">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-center">
            Compra con <span className="text-gradient-gold">total confianza</span>
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {trusts.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">{t.icon}</div>
                <h3 className="font-bold text-xl">{t.title}</h3>
                <p className="text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ───
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Cómo funciona el pago contraentrega?", a: "Realizas tu pedido en línea y pagas en efectivo cuando el mensajero entrega el producto en tu puerta. Sin tarjetas, sin riesgo." },
    { q: "¿Cuánto tarda el envío?", a: "El envío tarda entre 2 y 5 días hábiles dependiendo de tu ubicación. Recibirás un número de seguimiento." },
    { q: "¿Puedo devolver el producto?", a: "Sí, tienes 30 días de garantía de satisfacción. Si no estás conforme, te devolvemos tu dinero sin preguntas." },
    { q: "¿El producto es original?", a: "100% original con garantía de fábrica. Trabajamos directamente con los fabricantes." },
    { q: "¿Hacen envíos a todo el país?", a: "Sí, realizamos envíos a todo LATAM. Cobertura completa en las principales ciudades." },
  ];
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container max-w-2xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-center">
            Preguntas <span className="text-gradient-gold">frecuentes</span>
          </motion.h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-secondary/50 transition-colors"
                >
                  {f.q}
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-5 pb-5 text-muted-foreground text-sm">
                    {f.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ───
function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative rounded-3xl bg-gradient-card border border-primary/20 p-8 sm:p-16 text-center space-y-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5" />
          <motion.h2 variants={fadeUp} className="relative text-3xl sm:text-4xl font-bold">
            No dejes pasar esta <span className="text-gradient-gold">oportunidad</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="relative text-muted-foreground max-w-lg mx-auto">
            Oferta válida por tiempo limitado. Envío gratis + pago contraentrega. Sin riesgo.
          </motion.p>
          <motion.div variants={fadeUp} className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="xl" onClick={() => navigate("/checkout")}>
              🛒 Pedir Ahora — $49.900
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} className="relative flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Envío gratis</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Pago contraentrega</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Garantía 30 días</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PAGE ───
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <PainSection />
      <BenefitsSection />
      <SocialProofSection />
      <TrustSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  );
}
