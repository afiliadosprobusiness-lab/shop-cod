import { loadPlatformSettings, savePlatformSettings, type PlatformSettings } from "@/lib/platform-data";

export type ShopPlanId = "starter" | "pro" | "scale";

export interface ShopPlanDefinition {
  id: ShopPlanId;
  name: "Starter" | "Pro" | "Scale";
  monthlyPrice: number;
  monthlyPriceLabel: string;
  storeLimit: number;
  orderLimit: number;
  hasAdvancedAnalytics: boolean;
  canUseMultiUser: boolean;
  hasPrioritySupport: boolean;
}

export interface PlanAccessResult {
  allowed: boolean;
  reason: string;
  currentPlan: ShopPlanDefinition;
  requiredPlan: ShopPlanDefinition;
}

const UNLIMITED = Number.POSITIVE_INFINITY;

const planDefinitions: Record<ShopPlanId, ShopPlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    monthlyPriceLabel: "Gratis",
    storeLimit: 1,
    orderLimit: 100,
    hasAdvancedAnalytics: false,
    canUseMultiUser: false,
    hasPrioritySupport: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 9.9,
    monthlyPriceLabel: "$9.9/mes",
    storeLimit: 2,
    orderLimit: UNLIMITED,
    hasAdvancedAnalytics: true,
    canUseMultiUser: false,
    hasPrioritySupport: false,
  },
  scale: {
    id: "scale",
    name: "Scale",
    monthlyPrice: 50,
    monthlyPriceLabel: "$50/mes",
    storeLimit: UNLIMITED,
    orderLimit: UNLIMITED,
    hasAdvancedAnalytics: true,
    canUseMultiUser: true,
    hasPrioritySupport: true,
  },
};

export function getPlanDefinition(planId: ShopPlanId) {
  return planDefinitions[planId];
}

export function resolvePlanId(planName: string | null | undefined): ShopPlanId {
  const normalized = planName?.trim().toLowerCase() || "";

  if (normalized === "scale") {
    return "scale";
  }

  if (normalized === "pro" || normalized === "growth") {
    return "pro";
  }

  return "starter";
}

export function getCurrentPlanDefinition() {
  const settings = loadPlatformSettings();
  return getPlanDefinition(resolvePlanId(settings.billing.planName));
}

export function applyPlanToSettings(
  currentSettings: PlatformSettings,
  nextPlanId: ShopPlanId,
): PlatformSettings {
  const nextPlan = getPlanDefinition(nextPlanId);

  return savePlatformSettings({
    ...currentSettings,
    billing: {
      ...currentSettings.billing,
      planName: nextPlan.name,
      planPrice: nextPlan.monthlyPrice,
      memberLimit: nextPlan.canUseMultiUser ? 14 : 1,
      domainsIncluded: nextPlan.storeLimit === UNLIMITED ? 999 : Math.max(1, nextPlan.storeLimit),
      nextPaymentDate: nextPlan.monthlyPrice > 0 ? currentSettings.billing.nextPaymentDate : "No aplica",
      billingThreshold:
        nextPlan.monthlyPrice > 0 ? "$2.00 o cada 5 dias" : "Sin cobro recurrente",
    },
  });
}

export function getStoreCreationAccess(currentStoreCount: number): PlanAccessResult {
  const currentPlan = getCurrentPlanDefinition();

  if (currentStoreCount < currentPlan.storeLimit) {
    return {
      allowed: true,
      reason: "",
      currentPlan,
      requiredPlan: currentPlan,
    };
  }

  const requiredPlan = currentPlan.id === "starter" ? planDefinitions.pro : planDefinitions.scale;

  return {
    allowed: false,
    reason:
      currentPlan.id === "starter"
        ? "Tu plan Starter solo permite 1 tienda activa. Sube a Pro para crear una segunda tienda."
        : "Tu plan Pro solo permite 2 tiendas activas. Sube a Scale para crear mas tiendas.",
    currentPlan,
    requiredPlan,
  };
}

export function getAdvancedAnalyticsAccess(): PlanAccessResult {
  const currentPlan = getCurrentPlanDefinition();

  if (currentPlan.hasAdvancedAnalytics) {
    return {
      allowed: true,
      reason: "",
      currentPlan,
      requiredPlan: currentPlan,
    };
  }

  return {
    allowed: false,
    reason: "Las analiticas avanzadas estan disponibles desde el plan Pro.",
    currentPlan,
    requiredPlan: planDefinitions.pro,
  };
}

export function getMultiUserAccess(): PlanAccessResult {
  const currentPlan = getCurrentPlanDefinition();

  if (currentPlan.canUseMultiUser) {
    return {
      allowed: true,
      reason: "",
      currentPlan,
      requiredPlan: currentPlan,
    };
  }

  return {
    allowed: false,
    reason: "Multi-usuario y gestion de miembros estan disponibles en el plan Scale.",
    currentPlan,
    requiredPlan: planDefinitions.scale,
  };
}
