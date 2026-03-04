import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Globe,
  Layers,
  LayoutDashboard,
  MousePointerClick,
  Package,
  Palette,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

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
          <a href="#product" className="transition-colors hover:text-foreground">
            Producto
          </a>
          <a href="#tools" className="transition-colors hover:text-foreground">
            Herramientas
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Precios
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Iniciar sesion
          </Button>
          <Button variant="cta" size="sm" onClick={() => navigate("/register")}>
            Crear cuenta <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  const heroStats = [
    { label: "Checkout COD", value: "Activo" },
    { label: "Funnels", value: "Visuales" },
    { label: "Pedidos", value: "En tiempo real" },
    { label: "Tiendas", value: "Multiformato" },
  ];

  return (
    <section id="product" className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-20 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-7">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <ShieldCheck className="h-4 w-4" />
              La solucion completa para vender con pago contraentrega
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                ShopCOD centraliza tu
                <span className="text-gradient-gold"> tienda, funnel, checkout y operacion</span>
                .
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Crea landings, administra productos, recibe pedidos, mide conversiones y
                opera tu negocio COD desde un solo sistema pensado para vender en LATAM.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row">
              <Button variant="cta" size="xl" onClick={() => navigate("/register")}>
                Crear mi cuenta <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="ctaOutline" size="xl" onClick={() => navigate("/store/demo")}>
                Ver demo en vivo
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-border/80 bg-card/90 p-3 shadow-gold-lg">
              <div className="rounded-[1.5rem] border border-border/80 bg-background/90 p-4">
                <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Panel ShopCOD</p>
                      <p className="text-xs text-muted-foreground">
                        Pedidos, analiticas y control comercial
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    En vivo
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[15rem_minmax(0,1fr)]">
                  <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Herramientas
                    </p>
                    {[
                      { label: "Page Builder", icon: Palette },
                      { label: "Funnel Builder", icon: Workflow },
                      { label: "Tiendas", icon: Store },
                      { label: "Checkout COD", icon: Truck },
                      { label: "Contactos", icon: Users },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-3 py-2"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Visitantes", value: "8.4K", icon: MousePointerClick },
                        { label: "Pedidos", value: "312", icon: ShoppingCart },
                        { label: "Ventas", value: "$9.8K", icon: CreditCard },
                      ].map((card) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.label}
                            className="rounded-2xl border border-border/80 bg-secondary/20 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                {card.label}
                              </p>
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <p className="mt-3 text-2xl font-semibold text-foreground">
                              {card.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            Flujo activo
                          </p>
                          <div className="grid gap-3 sm:grid-cols-4">
                            {["Landing", "Producto", "Checkout", "Thank you"].map((node) => (
                              <div
                                key={node}
                                className="rounded-2xl border border-primary/20 bg-background/90 px-3 py-3 text-center text-sm font-medium text-foreground"
                              >
                                {node}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-border/80 bg-background/90 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Conversion
                          </p>
                          <p className="mt-3 text-3xl font-semibold text-foreground">6.8%</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Optimizada para trafico de Meta y TikTok.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Producto
                        </p>
                        <div className="mt-3 rounded-2xl border border-border/80 bg-background/80 p-4">
                          <div className="h-24 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5" />
                          <p className="mt-3 font-semibold text-foreground">Glow Serum Pro</p>
                          <p className="text-sm text-muted-foreground">$39.90 · COD activo</p>
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Seguimiento
                        </p>
                        <div className="mt-3 space-y-3">
                          {["Pixel Meta conectado", "Eventos de checkout en tiempo real", "Alertas de pedidos activas"].map(
                            (item) => (
                              <div
                                key={item}
                                className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/80 px-3 py-3 text-sm text-foreground"
                              >
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                {item}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  const toolGroups = [
    {
      icon: Layers,
      title: "Page Builder visual",
      description:
        "Construye paginas con drag and drop, edicion inline, bloques reutilizables y estilos desde sidebar.",
      bullets: ["Texto, imagen, botones, columnas", "Bloques anidados", "Preview responsive"],
    },
    {
      icon: Workflow,
      title: "Funnel Builder conectado",
      description:
        "Organiza la secuencia de venta con nodos, conexiones y edicion visual por cada pagina del funnel.",
      bullets: ["Landing, checkout, upsell", "Paginas ligadas al Page Builder", "Reordenamiento visual"],
    },
    {
      icon: Store,
      title: "Tiendas y catalogo",
      description:
        "Administra storefronts, productos, paginas, metodos de pago y configuracion por tienda.",
      bullets: ["Wizard de tiendas", "Panel por tienda", "Borrado y gestion reactiva"],
    },
    {
      icon: BarChart3,
      title: "Operacion en tiempo real",
      description:
        "Pedidos, contactos, analiticas, ofertas y settings viven dentro del mismo dashboard operativo.",
      bullets: ["KPIs en vivo", "Pedidos COD reales", "Contactos y ofertas"],
    },
  ];

  return (
    <section id="tools" className="bg-secondary/20 py-24">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Un sistema completo para <span className="text-gradient-gold">vender y operar</span>
            </h2>
            <p className="text-muted-foreground">
              ShopCOD no es solo una landing bonita: integra builders, checkout COD,
              seguimiento comercial y gestion del negocio en un mismo panel.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {toolGroups.map((group) => {
              const Icon = group.icon;

              return (
                <motion.div
                  key={group.title}
                  variants={fadeUp}
                  className="rounded-[2rem] border border-border/80 bg-card/90 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground">{group.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {group.bullets.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  const capabilities = [
    {
      title: "Builders conectados",
      description:
        "Store Builder, Funnel Builder y Page Builder trabajan sobre el mismo estado y aceleran la publicacion.",
      icon: Palette,
    },
    {
      title: "Checkout contraentrega",
      description:
        "Captura pedidos COD, guarda contactos reales y alimenta pedidos y analiticas automaticamente.",
      icon: Truck,
    },
    {
      title: "Mobile-first real",
      description:
        "Las paginas y el checkout estan pensados para convertir bien desde celulares.",
      icon: Smartphone,
    },
    {
      title: "Control de equipo",
      description:
        "Administra miembros, dominios, seguridad, webhooks y pasarelas desde configuracion.",
      icon: Users,
    },
    {
      title: "Catalogo y ofertas",
      description:
        "Crea productos, bundles, descuentos y organiza la venta de forma centralizada.",
      icon: Package,
    },
    {
      title: "Escala con datos",
      description:
        "Mide visitantes, checkouts, ventas y conversion para optimizar cada funnel.",
      icon: Globe,
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Hecho para <span className="text-gradient-gold">vender con velocidad</span>
            </h2>
            <p className="text-muted-foreground">
              Cada modulo de ShopCOD esta alineado para que lances rapido y operes mejor.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;

              return (
                <motion.div
                  key={capability.title}
                  variants={fadeUp}
                  className="rounded-[1.75rem] border border-border/80 bg-card/90 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {capability.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {capability.description}
                  </p>
                </motion.div>
              );
            })}
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
      title: "Crea tu cuenta",
      desc: "Entra a ShopCOD, activa tu workspace y define si vas a vender con tienda o funnel.",
    },
    {
      num: "02",
      title: "Construye tu flujo",
      desc: "Usa los builders visuales para montar paginas, secuencias y checkout COD sin codigo.",
    },
    {
      num: "03",
      title: "Publica y opera",
      desc: "Recibe pedidos, mide conversiones y gestiona clientes y ofertas desde el panel.",
    },
  ];

  return (
    <section className="bg-secondary/20 py-24">
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
              Activa tu negocio en <span className="text-gradient-gold">3 pasos</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="rounded-[1.75rem] border border-border/80 bg-card/90 p-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold">
                  <span className="text-2xl font-bold text-primary-foreground">{step.num}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
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
      price: "$9.9/mes",
      desc: "Para vendedores serios",
      features: ["2 tiendas activas", "Pedidos ilimitados", "Editor completo", "Analytics avanzados"],
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$50/mes",
      desc: "Para equipos y agencias",
      features: ["Tiendas ilimitadas", "Todo en Pro", "Multi-usuario", "Soporte prioritario"],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
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
            <p className="text-muted-foreground">
              Empieza gratis, valida rapido y escala cuando tu operacion lo necesite.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative rounded-[2rem] p-6 ${
                  plan.highlighted
                    ? "border-2 border-primary bg-card shadow-gold"
                    : "border border-border bg-card/90"
                }`}
              >
                {plan.highlighted ? (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-gold px-4 py-1 text-xs font-bold text-primary-foreground">
                    MAS POPULAR
                  </div>
                ) : null}

                <div>
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                </div>

                <div className="mt-6 text-4xl font-bold text-foreground">{plan.price}</div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "cta" : "ctaOutline"}
                  className="mt-8 w-full"
                  onClick={() => navigate("/register")}
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
    <section className="pb-24 pt-8">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-card p-10 text-center sm:p-16"
        >
          <div className="absolute inset-0 bg-primary/5" />
          <motion.div variants={fadeUp} className="relative mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Lanza con ShopCOD y conviertelo en tu{" "}
              <span className="text-gradient-gold">centro de ventas COD</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Crea tu cuenta, arma tu primer funnel o tienda y empieza a vender con una
              operacion conectada de punta a punta.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="cta" size="xl" onClick={() => navigate("/register")}>
                Crear mi cuenta <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="ctaOutline" size="xl" onClick={() => navigate("/login")}>
                Ya tengo cuenta
              </Button>
            </div>
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
          <a href="/register" className="transition-colors hover:text-foreground">
            Registro
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
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ToolsSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
