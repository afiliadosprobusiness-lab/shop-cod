import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, Smartphone, ShieldCheck, MousePointerClick, Truck, Star, CheckCircle2, Layers, Palette, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl">FunnelCOD</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Funciones</a>
          <a href="#how" className="hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Iniciar sesión</Button>
          <Button variant="cta" size="sm" onClick={() => navigate("/dashboard")}>
            Crear tienda gratis <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>
      <div className="container relative z-10 text-center space-y-8 py-20">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="w-4 h-4" /> La plataforma #1 para vender con pago contraentrega en LATAM
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
            Crea tu tienda.{" "}
            <span className="text-gradient-gold">Vende más.</span>
            <br />Cobra al entregar.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Construye landings de alta conversión con nuestro editor visual, optimiza para tráfico de Meta y TikTok Ads, y cobra contraentrega. Sin código. Sin complicaciones.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="xl" onClick={() => navigate("/dashboard")}>
              Crear mi tienda gratis <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="ctaOutline" size="xl">
              Ver demo
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
            Sin tarjeta de crédito · Configura en 5 minutos · Cancela cuando quieras
          </motion.p>
        </motion.div>

        {/* Editor Preview Mock */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="rounded-xl border border-border bg-card p-2 shadow-gold-lg">
            <div className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
              {/* Fake editor toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-mono">editor.funnelcod.com</div>
              </div>
              <div className="flex h-[300px] sm:h-[400px]">
                {/* Sidebar blocks */}
                <div className="w-48 border-r border-border p-3 space-y-2 hidden sm:block">
                  <p className="text-xs text-muted-foreground font-semibold mb-3">BLOQUES</p>
                  {["🎯 Hero", "😤 Problema", "✨ Beneficios", "⭐ Reviews", "❓ FAQ", "🛒 Checkout"].map((b, i) => (
                    <div key={i} className="text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-muted-foreground">{b}</div>
                  ))}
                </div>
                {/* Canvas */}
                <div className="flex-1 p-4 space-y-3 overflow-hidden">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 h-24 flex items-center justify-center">
                    <span className="text-sm text-primary font-semibold">🎯 Bloque Hero — Producto Premium</span>
                  </div>
                  <div className="bg-secondary border border-border rounded-lg p-4 h-16 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">✨ Sección de Beneficios</span>
                  </div>
                  <div className="bg-secondary border border-border rounded-lg p-4 h-16 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">⭐ Prueba Social</span>
                  </div>
                  <div className="bg-secondary border border-border rounded-lg p-4 h-16 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">🛒 Checkout COD</span>
                  </div>
                </div>
                {/* Properties */}
                <div className="w-56 border-l border-border p-3 hidden md:block">
                  <p className="text-xs text-muted-foreground font-semibold mb-3">PROPIEDADES</p>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Título</span>
                      <div className="bg-secondary border border-border rounded px-2 py-1.5">Producto Premium</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Precio</span>
                      <div className="bg-secondary border border-border rounded px-2 py-1.5">$49.900</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Color CTA</span>
                      <div className="flex gap-2 items-center">
                        <div className="w-5 h-5 rounded bg-gradient-gold" />
                        <span className="text-muted-foreground">#E5A800</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <Layers className="w-6 h-6" />, title: "Editor Drag & Drop", desc: "Arrastra bloques pre-diseñados para crear landings de alta conversión en minutos." },
    { icon: <Truck className="w-6 h-6" />, title: "Checkout COD", desc: "Formulario optimizado para pago contraentrega. Sin fricción, máxima conversión." },
    { icon: <MousePointerClick className="w-6 h-6" />, title: "Optimizado para Ads", desc: "Landings diseñadas para tráfico frío de Meta Ads y TikTok Ads." },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Panel de Pedidos", desc: "Dashboard completo con métricas, estados y confirmación por WhatsApp." },
    { icon: <Smartphone className="w-6 h-6" />, title: "Mobile-First", desc: "100% responsive. Tus clientes compran fácil desde cualquier dispositivo." },
    { icon: <Palette className="w-6 h-6" />, title: "Templates Premium", desc: "Plantillas probadas de alta conversión listas para personalizar." },
  ];
  return (
    <section id="features" className="py-24 bg-secondary/20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-16">
          <motion.div variants={fadeUp} className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold">Todo lo que necesitas para <span className="text-gradient-gold">vender más</span></h2>
            <p className="text-muted-foreground">Herramientas profesionales diseñadas específicamente para el modelo de negocio contraentrega en Latinoamérica.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">{f.icon}</div>
                <h3 className="font-bold text-lg">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Crea tu tienda", desc: "Regístrate gratis y comienza a construir tu funnel de venta en minutos." },
    { num: "02", title: "Diseña tu landing", desc: "Usa el editor drag & drop para crear una landing de alta conversión." },
    { num: "03", title: "Publica y vende", desc: "Conecta tu dominio, lanza tus ads y empieza a recibir pedidos contraentrega." },
  ];
  return (
    <section id="how" className="py-24">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-16">
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Empieza en <span className="text-gradient-gold">3 pasos</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">{s.num}</span>
                </div>
                <h3 className="font-bold text-xl">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const navigate = useNavigate();
  const plans = [
    { name: "Starter", price: "Gratis", desc: "Para empezar a vender", features: ["1 tienda activa", "100 pedidos/mes", "Checkout COD", "Editor básico", "Soporte por email"], highlighted: false },
    { name: "Pro", price: "$29/mes", desc: "Para vendedores serios", features: ["5 tiendas activas", "Pedidos ilimitados", "Checkout COD + Online", "Editor completo", "Dominio personalizado", "WhatsApp integrado", "Analytics avanzados"], highlighted: true },
    { name: "Scale", price: "$79/mes", desc: "Para equipos y agencias", features: ["Tiendas ilimitadas", "Pedidos ilimitados", "Todo en Pro", "Multi-usuario", "API access", "Soporte prioritario", "Templates exclusivos"], highlighted: false },
  ];
  return (
    <section id="pricing" className="py-24 bg-secondary/20">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-16">
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Planes que <span className="text-gradient-gold">crecen contigo</span></h2>
            <p className="text-muted-foreground">Empieza gratis, escala cuando quieras.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className={`rounded-xl p-6 space-y-6 ${p.highlighted ? "bg-card border-2 border-primary shadow-gold relative" : "bg-card border border-border"}`}>
                {p.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</div>}
                <div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </div>
                <div className="text-3xl font-bold">{p.price}</div>
                <ul className="space-y-2">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={p.highlighted ? "cta" : "ctaOutline"}
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  Empezar ahora
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="relative rounded-3xl bg-gradient-card border border-primary/20 p-10 sm:p-16 text-center space-y-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5" />
          <motion.h2 variants={fadeUp} className="relative text-3xl sm:text-4xl font-bold">
            ¿Listo para <span className="text-gradient-gold">vender más</span>?
          </motion.h2>
          <motion.p variants={fadeUp} className="relative text-muted-foreground max-w-lg mx-auto">
            Únete a miles de vendedores en LATAM que ya usan FunnelCOD para crear tiendas de alta conversión con pago contraentrega.
          </motion.p>
          <motion.div variants={fadeUp} className="relative">
            <Button variant="cta" size="xl" onClick={() => navigate("/dashboard")}>
              Crear mi tienda gratis <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-foreground">FunnelCOD</span>
        </div>
        <p>© 2026 FunnelCOD. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Términos</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}

export default function SaaSLandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
