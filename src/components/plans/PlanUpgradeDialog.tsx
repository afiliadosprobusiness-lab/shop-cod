import { Crown, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { applyPlanToSettings, getPlanDefinition, type ShopPlanId } from "@/lib/plans";
import { loadPlatformSettings } from "@/lib/platform-data";

interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  reason: string;
  requiredPlanId: ShopPlanId;
}

export default function PlanUpgradeDialog({
  open,
  onOpenChange,
  featureName,
  reason,
  requiredPlanId,
}: PlanUpgradeDialogProps) {
  const requiredPlan = getPlanDefinition(requiredPlanId);

  const handleUpgrade = () => {
    applyPlanToSettings(loadPlatformSettings(), requiredPlanId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Actualiza tu plan para desbloquear esta accion</DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Crown className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{featureName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Disponible con el plan {requiredPlan.name} ({requiredPlan.monthlyPriceLabel}).
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">
                  {requiredPlan.storeLimit === Number.POSITIVE_INFINITY
                    ? "Tiendas ilimitadas"
                    : `${requiredPlan.storeLimit} tiendas activas`}
                </span>
                <span className="rounded-full border border-border px-3 py-1">
                  {requiredPlan.orderLimit === Number.POSITIVE_INFINITY
                    ? "Pedidos ilimitados"
                    : `${requiredPlan.orderLimit} pedidos/mes`}
                </span>
                <span className="rounded-full border border-border px-3 py-1">
                  {requiredPlan.hasAdvancedAnalytics ? "Analytics avanzados" : "Analytics basicos"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Al confirmar, el plan del workspace se actualizara localmente para que puedas continuar.
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleUpgrade}>
            Subir a {requiredPlan.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
