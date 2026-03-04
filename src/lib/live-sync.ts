const DATA_UPDATED_EVENT = "shopcod:data-updated";

function canUseWindow() {
  return typeof window !== "undefined";
}

export function emitShopcodDataUpdated() {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
}

export function subscribeToShopcodData(callback: () => void) {
  if (!canUseWindow()) {
    return () => undefined;
  }

  const handleCustomEvent = () => callback();
  const handleStorage = () => callback();

  window.addEventListener(DATA_UPDATED_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(DATA_UPDATED_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
  };
}
