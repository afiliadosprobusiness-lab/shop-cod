import { motion } from "framer-motion";
import { CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmedPage() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container max-w-md text-center space-y-6"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">¡Pedido <span className="text-gradient-gold">Confirmado</span>!</h1>
        <p className="text-muted-foreground">
          Tu pedido ha sido registrado exitosamente. Te contactaremos por WhatsApp para confirmar los detalles del envío.
        </p>
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Phone className="w-4 h-4" /> Confirmación por WhatsApp
          </div>
          <p className="text-muted-foreground">Recibirás un mensaje en los próximos minutos con los detalles de tu pedido y seguimiento de envío.</p>
        </div>
        <Button variant="ctaOutline" size="lg" onClick={() => navigate("/")}>
          Volver a la tienda
        </Button>
      </motion.div>
    </main>
  );
}
