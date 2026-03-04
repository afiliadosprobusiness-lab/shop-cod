import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  BarChart3,
  Smartphone,
  MousePointerClick,
  Truck,
  CheckCircle2,
  Layers,
  Palette,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold">ShopCOD</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Funciones
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Precios
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Iniciar sesion
          </Button>
          <Button variant="cta" size="sm" onClick={() => navigate("/dashboard")}>
            Crear tienda gratis <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 space-y-8 py-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-3xl space-y-6"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary"
          >
            <Zap className="h-4 w-4" /> La plataforma #1 para vender con pago contraentrega en LATAM
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl"
          >
            Crea tu tienda. <span className="text-gradient-gold">Vende mas.</span>
            <br />
            Cobra al entregar.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Construye landings de alta conversion con un editor visual, optimiza para
            trafico de Meta y TikTok Ads, y cobra contraentrega sin codigo.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Button variant="cta" size="xl" onClick={() => navigate("/dashboard")}>
              Crear mi tienda gratis <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ctaOutline"
              size="xl"
              onClick={() => navigate("/store/demo")}
            >
              Ver demo
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
            Sin tarjeta de credito · Configura en 5 minutos · Cancela cuando quieras
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mx-auto mt-12 max-w-4xl"
        >
          <div className="rounded-xl border border-border bg-card p-2 shadow-gold-lg">
            <div className="overflow-hidden rounded-lg border border-border bg-secondary/50">
              <div className="flex items-center gap-2 border-b border-border bg-card/50 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 text-center font-mono text-xs text-muted-foreground">
                  editor.shopcod.app
                </div>
              </div>

              <div className="flex h-[300px] sm:h-[400px]">
                <div className="hidden w-48 space-y-2 border-r border-border p-3 sm:block">
                  <p className="mb-3 text-xs font-semibold text-muted-foreground">BLOQUES</p>
                  {["Hero", "Problema", "Beneficios", "Reviews", "FAQ", "Checkout"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground"
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>

                <div className="flex-1 space-y-3 overflow-hidden p-4">
                  <div className="flex h-24 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 p-4">
                    <span className="text-sm font-semibold text-primary">
                      Bloque Hero - Producto premium
                    </span>
                  </div>
                  <div className="flex h-16 items-center justify-center rounded-lg border border-border bg-secondary p-4">
                    <span className="text-xs text-muted-foreground">
                      Seccion de beneficios
                    </span>
                  </div>
                  <div className="flex h-16 items-center justify-center rounded-lg border border-border bg-secondary p-4">
                    <span className="text-xs text-muted-foreground">Prueba social</span>
                  </div>
                  <div className="flex h-16 items-center justify-center rounded-lg border border-border bg-secondary p-4">
                    <span className="text-xs text-muted-foreground">Checkout COD</span>
                  </div>
                </div>

                <div className="hidden w-56 border-l border-border p-3 md:block">
                  <p className="mb-3 text-xs font-semibold text-muted-foreground">
                    PROPIEDADES
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Titulo</span>
                      <div className="rounded border border-border bg-secondary px-2 py-1.5">
                        Producto premium
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Precio</span>
                      <div className="rounded border border-border bg-secondary px-2 py-1.5">
                        $49.900
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Color CTA</span>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-gradient-gold" />
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
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Editor Drag and Drop",
      desc: "Arrastra bloques listos para crear landings de alta conversion en minutos.",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Checkout COD",
      desc: "Formulario optimizado para pago contraentrega y mas conversion.",
    },
    {
      icon: <MousePointerClick className="h-6 w-6" />,
      title: "Optimizado para Ads",
      desc: "Landings pensadas para trafico frio de Meta Ads y TikTok Ads.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Panel de Pedidos",
      desc: "Dashboard con metricas, estados y seguimiento operativo.",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile First",
      desc: "Tus clientes compran facil desde cualquier dispositivo.",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Templates Premium",
      desc: "Plantillas listas para personalizar y publicar rapido.",
    },
  ];

  return (
    <section id="features" className="bg-secondary/20 py-24">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-16"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-2xl space-y-4 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Todo lo que necesitas para{" "}
              <span className="text-gradient-gold">vender mas</span>
            </h2>
            <p className="text-muted-foreground">
              Herramientas hechas para el modelo contraentrega en Latinoamerica.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group space-y-3 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
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
    {
      num: "01",
      title: "Crea tu tienda",
      desc: "Entra, crea tu cuenta y empieza a construir tu funnel en minutos.",
    },
    {
      num: "02",
      title: "Disena tu landing",
      desc: "Usa el editor visual para montar una landing lista para convertir.",
    },
    {
      num: "03",
      title: "Publica y vende",
      desc: "Guarda, publica y recibe pedidos contraentrega.",
    },
  ];

  return (
    <section id="how" className="py-24">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="space-y-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Empieza en <span className="text-gradient-gold">3 pasos</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <motion.div key={step.num} variants={fadeUp} className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
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
    {
      name: "Starter",
      price: "Gratis",
      desc: "Para empezar a vender",
      features: ["1 tienda activa", "100 pedidos/mes", "Checkout COD", "Editor basico"],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29/mes",
      desc: "Para vendedores serios",
      features: [
        "5 tiendas activas",
        "Pedidos ilimitados",
        "Editor completo",
        "Analytics avanzados",
      ],
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$79/mes",
      desc: "Para equipos y agencias",
      features: ["Tiendas ilimitadas", "Todo en Pro", "Multi-usuario", "Soporte prioritario"],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="bg-secondary/20 py-24">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="space-y-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Planes que <span className="text-gradient-gold">crecen contigo</span>
            </h2>
            <p className="text-muted-foreground">Empieza gratis y escala cuando quieras.</p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative space-y-6 rounded-xl p-6 ${
                  plan.highlighted
                    ? "border-2 border-primary bg-card shadow-gold"
                    : "border border-border bg-card"
                }`}
              >
                {plan.highlighted ? (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-primary-foreground">
                    MAS POPULAR
                  </div>
                ) : null}

                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>

                <div className="text-3xl font-bold">{plan.price}</div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "cta" : "ctaOutline"}
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative space-y-6 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-card p-10 text-center sm:p-16"
        >
          <div className="absolute inset-0 bg-primary/5" />
          <motion.h2 variants={fadeUp} className="relative text-3xl font-bold sm:text-4xl">
            Listo para <span className="text-gradient-gold">vender mas</span>?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="relative mx-auto max-w-lg text-muted-foreground"
          >
            Miles de vendedores ya usan ShopCOD para crear tiendas de alta conversion.
          </motion.p>
          <motion.div variants={fadeUp} className="relative">
            <Button variant="cta" size="xl" onClick={() => navigate("/dashboard")}>
              Crear mi tienda gratis <ArrowRight className="h-5 w-5" />
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
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-foreground">ShopCOD</span>
        </div>
        <p>© 2026 ShopCOD. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="/login" className="transition-colors hover:text-foreground">
            Acceso
          </a>
          <a href="/store/demo" className="transition-colors hover:text-foreground">
            Demo
          </a>
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
