import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Truck, Phone, CheckCircle2, Minus, Plus, ArrowLeft } from "lucide-react";
import heroProduct from "@/assets/hero-product.png";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const departments = [
  "Bogotá D.C.", "Antioquia", "Valle del Cauca", "Cundinamarca", "Atlántico",
  "Santander", "Bolívar", "Nariño", "Meta", "Tolima", "Boyacá", "Cauca",
  "Norte de Santander", "Risaralda", "Caldas", "Huila", "Cesar", "Magdalena",
  "Córdoba", "Sucre", "La Guajira", "Quindío",
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", department: "", city: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = 49900;
  const total = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.department || !form.city) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    if (form.phone.length < 7) {
      toast.error("Ingresa un número de teléfono válido");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/order-confirmed");
    }, 1500);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <main className="min-h-screen py-6 lg:py-12">
      <div className="container max-w-5xl">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver al producto
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div initial="hidden" animate="visible" className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Finalizar <span className="text-gradient-gold">Pedido</span></h1>
              <p className="text-muted-foreground mt-1">Completa tus datos para envío contraentrega</p>
            </div>

            <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-primary">Pago Contraentrega</span> — Pagas en efectivo cuando recibes tu pedido
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" placeholder="Tu nombre completo" value={form.name} onChange={e => update("name", e.target.value)} className="h-12 bg-secondary border-border" />
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                <Input id="phone" type="tel" placeholder="Ej: 300 123 4567" value={form.phone} onChange={e => update("phone", e.target.value)} className="h-12 bg-secondary border-border" />
                <p className="text-xs text-muted-foreground">Te contactaremos por WhatsApp para confirmar tu pedido</p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departamento *</Label>
                  <Select value={form.department} onValueChange={v => update("department", v)}>
                    <SelectTrigger className="h-12 bg-secondary border-border">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input id="city" placeholder="Tu ciudad" value={form.city} onChange={e => update("city", e.target.value)} className="h-12 bg-secondary border-border" />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="address">Dirección completa *</Label>
                <Input id="address" placeholder="Calle, número, barrio, referencias" value={form.address} onChange={e => update("address", e.target.value)} className="h-12 bg-secondary border-border" />
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Input id="notes" placeholder="Indicaciones para el mensajero" value={form.notes} onChange={e => update("notes", e.target.value)} className="h-12 bg-secondary border-border" />
              </motion.div>

              {/* Quantity */}
              <motion.div variants={fadeUp} className="space-y-2">
                <Label>Cantidad</Label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(5, quantity + 1))} className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              <Button type="submit" variant="cta" size="xl" className="w-full" disabled={submitting}>
                {submitting ? "Procesando..." : `✅ Confirmar Pedido — $${total.toLocaleString()}`}
              </Button>

              <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Datos protegidos</span>
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-primary" /> Envío gratis</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Garantía 30 días</span>
              </div>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <div className="sticky top-6 bg-card border border-border rounded-xl p-6 space-y-5">
              <h3 className="font-bold text-lg">Resumen del pedido</h3>
              <div className="flex gap-4">
                <img src={heroProduct} alt="Producto" className="w-20 h-20 rounded-lg object-cover" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Producto Premium</p>
                  <p className="text-sm text-muted-foreground">Cantidad: {quantity}</p>
                  <p className="text-sm text-primary font-bold">${unitPrice.toLocaleString()} c/u</p>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className="text-primary font-semibold">GRATIS</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Total</span><span className="text-gradient-gold">${total.toLocaleString()}</span></div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center text-sm">
                <span className="text-primary font-semibold">💵 Pagas ${ total.toLocaleString()} al recibir</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
