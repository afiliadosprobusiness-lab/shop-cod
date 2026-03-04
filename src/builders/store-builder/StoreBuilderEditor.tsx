import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  Globe,
  Layers3,
  PackagePlus,
  Plus,
  Save,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import {
  BuilderBlockCard,
  BuilderEditorShell,
  BuilderSidebar,
  BuilderToolbar,
  renderBlock,
} from "@/builders/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createOrderBump,
  createStoreBundle,
  createStoreCollection,
  createStoreProduct,
  supportedCurrencies,
  type CurrencyCode,
  type StoreBuilderState,
  type StoreBundle,
  type StoreCollection,
  type StoreOrderBump,
  type StoreProduct,
} from "./schema";

interface StoreBuilderEditorProps {
  state: StoreBuilderState;
  onChange: (state: StoreBuilderState) => void;
  onSave: () => void;
  onGoToFunnel: () => void;
  onGoToPage: () => void;
}

function parseList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function stringifyList(items: string[]) {
  return items.join(", ");
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function StoreBuilderEditor({
  state,
  onChange,
  onSave,
  onGoToFunnel,
  onGoToPage,
}: StoreBuilderEditorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    state.products[0]?.id || null,
  );

  useEffect(() => {
    if (!state.products.length) {
      setSelectedProductId(null);
      return;
    }

    if (!selectedProductId || !state.products.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(state.products[0]?.id || null);
    }
  }, [selectedProductId, state.products]);

  const selectedProduct = useMemo(
    () => state.products.find((product) => product.id === selectedProductId) || null,
    [selectedProductId, state.products],
  );
  const selectedOrderBump = useMemo(
    () =>
      selectedProduct
        ? state.checkout.orderBumps.find((orderBump) => orderBump.productId === selectedProduct.id) || null
        : null,
    [selectedProduct, state.checkout.orderBumps],
  );

  const updateState = (recipe: (current: StoreBuilderState) => StoreBuilderState) => {
    onChange(recipe(state));
  };

  const updateProduct = (productId: string, updater: (product: StoreProduct) => StoreProduct) => {
    updateState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? updater(product) : product,
      ),
    }));
  };

  const removeProduct = (productId: string) => {
    updateState((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== productId),
      bundles: current.bundles.map((bundle) => ({
        ...bundle,
        productIds: bundle.productIds.filter((id) => id !== productId),
      })),
      collections: current.collections.map((collection) => ({
        ...collection,
        productIds: collection.productIds.filter((id) => id !== productId),
      })),
      checkout: {
        ...current.checkout,
        orderBumps: current.checkout.orderBumps.filter(
          (orderBump) => orderBump.productId !== productId,
        ),
      },
    }));
  };

  const updateBundle = (bundleId: string, nextBundle: StoreBundle) => {
    updateState((current) => ({
      ...current,
      bundles: current.bundles.map((bundle) => (bundle.id === bundleId ? nextBundle : bundle)),
    }));
  };

  const updateCollection = (collectionId: string, nextCollection: StoreCollection) => {
    updateState((current) => ({
      ...current,
      collections: current.collections.map((collection) =>
        collection.id === collectionId ? nextCollection : collection,
      ),
    }));
  };

  const updateOrderBump = (index: number, nextOrderBump: StoreOrderBump) => {
    updateState((current) => ({
      ...current,
      checkout: {
        ...current.checkout,
        orderBumps: current.checkout.orderBumps.map((orderBump, currentIndex) =>
          currentIndex === index ? nextOrderBump : orderBump,
        ),
      },
    }));
  };

  const toggleCurrency = (currency: CurrencyCode) => {
    updateState((current) => {
      const enabled = current.checkout.enabledCurrencies.includes(currency);
      const nextCurrencies = enabled
        ? current.checkout.enabledCurrencies.filter((item) => item !== currency)
        : [...current.checkout.enabledCurrencies, currency];

      return {
        ...current,
        checkout: {
          ...current.checkout,
          enabledCurrencies: nextCurrencies.length ? nextCurrencies : [currency],
        },
      };
    });
  };

  return (
    <BuilderEditorShell
      toolbar={
        <BuilderToolbar
          eyebrow="Store builder"
          title="Configura tienda, catalogo y checkout"
          description="Crea productos, arma bundles, define order bumps y administra dominios y monedas desde un solo panel."
          accentClassName="text-emerald-200"
          actions={
            <>
              <Button type="button" variant="outline" onClick={onGoToFunnel}>
                <TrendingUp className="h-4 w-4" />
                Ir a Funnel
              </Button>
              <Button type="button" variant="outline" onClick={onGoToPage}>
                <Sparkles className="h-4 w-4" />
                Ir a Page
              </Button>
              <Button type="button" variant="cta" onClick={onSave}>
                <Save className="h-4 w-4" />
                Guardar store
              </Button>
            </>
          }
        >
          <div className="mt-1 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Productos", value: state.products.length, icon: ShoppingCart },
              { label: "Bundles", value: state.bundles.length, icon: Boxes },
              { label: "Order bumps", value: state.checkout.orderBumps.length, icon: Tag },
              { label: "Domains", value: state.checkout.domains.length, icon: Globe },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <BuilderBlockCard key={item.label} className="bg-white/[0.03] p-4 shadow-none">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Icon className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">{item.label}</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                </BuilderBlockCard>
              );
            })}
          </div>
        </BuilderToolbar>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)_24rem]">
        <BuilderSidebar
          eyebrow="Catalogo"
          description="Productos del store listos para editar."
          accentClassName="text-emerald-200"
          className="bg-slate-950/70"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Productos</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextProduct = createStoreProduct();
                updateState((current) => ({
                  ...current,
                  products: [...current.products, nextProduct],
                }));
                setSelectedProductId(nextProduct.id);
              }}
            >
              <PackagePlus className="h-4 w-4" />
              Crear
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {state.products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className="w-full text-left"
              >
                <BuilderBlockCard
                  selected={selectedProductId === product.id}
                  interactive={selectedProductId !== product.id}
                  className={cn(
                    "p-4 shadow-none",
                    selectedProductId === product.id ? "border-emerald-300/40" : "",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">Stock: {product.stock}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                </BuilderBlockCard>
              </button>
            ))}
          </div>
        </BuilderSidebar>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Product editor
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {selectedProduct ? selectedProduct.name : "Selecciona un producto"}
                </h3>
              </div>
              {selectedProduct ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeProduct(selectedProduct.id)}>
                  Quitar
                </Button>
              ) : null}
            </div>

            {selectedProduct ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <BuilderBlockCard className="bg-slate-950/85 p-4">
                    {renderBlock(selectedProduct, { orderBump: selectedOrderBump })}
                  </BuilderBlockCard>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-name">Nombre</Label>
                  <Input
                    id="product-name"
                    value={selectedProduct.name}
                    onChange={(event) =>
                      updateProduct(selectedProduct.id, (product) => ({
                        ...product,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-description">Descripcion</Label>
                  <Textarea
                    id="product-description"
                    value={selectedProduct.description}
                    onChange={(event) =>
                      updateProduct(selectedProduct.id, (product) => ({
                        ...product,
                        description: event.target.value,
                      }))
                    }
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Precio base</Label>
                  <Input
                    id="product-price"
                    value={String(selectedProduct.price)}
                    onChange={(event) =>
                      updateProduct(selectedProduct.id, (product) => ({
                        ...product,
                        price: toNumber(event.target.value, product.price),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Stock</Label>
                  <Input
                    id="product-stock"
                    value={String(selectedProduct.stock)}
                    onChange={(event) =>
                      updateProduct(selectedProduct.id, (product) => ({
                        ...product,
                        stock: Math.max(0, Math.trunc(toNumber(event.target.value, product.stock))),
                      }))
                    }
                  />
                </div>
                {supportedCurrencies.map((currency) => (
                  <div key={currency} className="space-y-2">
                    <Label htmlFor={`product-${currency}`}>{currency}</Label>
                    <Input
                      id={`product-${currency}`}
                      value={String(selectedProduct.prices[currency])}
                      onChange={(event) =>
                        updateProduct(selectedProduct.id, (product) => ({
                          ...product,
                          prices: {
                            ...product.prices,
                            [currency]: toNumber(event.target.value, product.prices[currency]),
                          },
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-images">Imagenes (coma separada)</Label>
                  <Textarea
                    id="product-images"
                    value={stringifyList(selectedProduct.images)}
                    onChange={(event) =>
                      updateProduct(selectedProduct.id, (product) => ({
                        ...product,
                        images: parseList(event.target.value),
                      }))
                    }
                    className="min-h-[96px]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-variants">Variantes (coma separada)</Label>
                  <Input
                    id="product-variants"
                    value={stringifyList(selectedProduct.variants)}
                    onChange={(event) =>
                      updateProduct(selectedProduct.id, (product) => ({
                        ...product,
                        variants: parseList(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Crea o selecciona un producto para editar catalogo, precio e inventario.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Checkout
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">Order bumps y domains</h3>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkout-domains">Multiple domains (coma separada)</Label>
                <Input
                  id="checkout-domains"
                  value={stringifyList(state.checkout.domains)}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      checkout: {
                        ...current.checkout,
                        domains: parseList(event.target.value),
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Multiple currencies
                </Label>
                <div className="flex flex-wrap gap-2">
                  {supportedCurrencies.map((currency) => {
                    const active = state.checkout.enabledCurrencies.includes(currency);

                    return (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => toggleCurrency(currency)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                          active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300",
                        )}
                      >
                        {currency}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Order bumps</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateState((current) => ({
                        ...current,
                        checkout: {
                          ...current.checkout,
                          orderBumps: [
                            ...current.checkout.orderBumps,
                            createOrderBump(current.products[0]?.id || ""),
                          ],
                        },
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                {state.checkout.orderBumps.map((orderBump, index) => (
                  <div key={`${orderBump.productId}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3">
                      <select
                        value={orderBump.productId}
                        onChange={(event) =>
                          updateOrderBump(index, {
                            ...orderBump,
                            productId: event.target.value,
                          })
                        }
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      >
                        <option value="">Selecciona un producto</option>
                        {state.products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={String(orderBump.price)}
                        onChange={(event) =>
                          updateOrderBump(index, {
                            ...orderBump,
                            price: toNumber(event.target.value, orderBump.price),
                          })
                        }
                      />
                      <Textarea
                        value={orderBump.description}
                        onChange={(event) =>
                          updateOrderBump(index, {
                            ...orderBump,
                            description: event.target.value,
                          })
                        }
                        className="min-h-[88px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateState((current) => ({
                            ...current,
                            checkout: {
                              ...current.checkout,
                              orderBumps: current.checkout.orderBumps.filter(
                                (_, currentIndex) => currentIndex !== index,
                              ),
                            },
                          }))
                        }
                      >
                        Quitar order bump
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Bundles
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Paquetes</h3>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {state.bundles.map((bundle) => (
                <div key={bundle.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <select
                    multiple
                    value={bundle.productIds}
                    onChange={(event) =>
                      updateBundle(bundle.id, {
                        ...bundle,
                        productIds: Array.from(event.target.selectedOptions, (option) => option.value),
                      })
                    }
                    className="min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    {state.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="mt-3"
                    value={String(bundle.bundlePrice)}
                    onChange={(event) =>
                      updateBundle(bundle.id, {
                        ...bundle,
                        bundlePrice: toNumber(event.target.value, bundle.bundlePrice),
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      updateState((current) => ({
                        ...current,
                        bundles: current.bundles.filter((item) => item.id !== bundle.id),
                      }))
                    }
                  >
                    Quitar bundle
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={() =>
                updateState((current) => ({
                  ...current,
                  bundles: [
                    ...current.bundles,
                    createStoreBundle(current.products.slice(0, 2).map((product) => product.id)),
                  ],
                }))
              }
            >
              <Plus className="h-4 w-4" />
              Crear bundle
            </Button>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Colecciones
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Agrupaciones</h3>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {state.collections.map((collection) => (
                <div key={collection.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <Input
                    value={collection.name}
                    onChange={(event) =>
                      updateCollection(collection.id, {
                        ...collection,
                        name: event.target.value,
                      })
                    }
                  />
                  <select
                    multiple
                    value={collection.productIds}
                    onChange={(event) =>
                      updateCollection(collection.id, {
                        ...collection,
                        productIds: Array.from(event.target.selectedOptions, (option) => option.value),
                      })
                    }
                    className="mt-3 min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    {state.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      updateState((current) => ({
                        ...current,
                        collections: current.collections.filter((item) => item.id !== collection.id),
                      }))
                    }
                  >
                    Quitar coleccion
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={() =>
                updateState((current) => ({
                  ...current,
                  collections: [
                    ...current.collections,
                    createStoreCollection(current.products.slice(0, 3).map((product) => product.id)),
                  ],
                }))
              }
            >
              <Plus className="h-4 w-4" />
              Crear coleccion
            </Button>
          </div>
        </div>
      </div>
    </BuilderEditorShell>
  );
}
