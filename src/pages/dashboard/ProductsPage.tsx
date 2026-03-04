import { useMemo, useState } from "react";
import { Copy, Filter, Package, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import MainContent from "@/components/dashboard/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duplicateProduct, loadProducts, type Product } from "@/lib/products";

type InventoryFilter = "all" | "in-stock" | "low" | "out";
type ShippingFilter = "all" | "shipping" | "digital";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function inventoryLabel(product: Product) {
  if (!product.inventoryTracking) {
    return "No rastreado";
  }

  if (product.inventory <= 0) {
    return "Sin stock";
  }

  if (product.inventory < 20) {
    return "Stock bajo";
  }

  return "Disponible";
}

export default function ProductsPage() {
  const [products, setProducts] = useState(() => loadProducts());
  const [search, setSearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>("all");
  const [shippingFilter, setShippingFilter] = useState<ShippingFilter>("all");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch) ||
        product.slug.toLowerCase().includes(normalizedSearch) ||
        product.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesInventory =
        inventoryFilter === "all" ||
        (inventoryFilter === "in-stock" && product.inventory > 0) ||
        (inventoryFilter === "low" && product.inventory > 0 && product.inventory < 20) ||
        (inventoryFilter === "out" && product.inventory <= 0);

      const matchesShipping =
        shippingFilter === "all" ||
        (shippingFilter === "shipping" && product.shipping) ||
        (shippingFilter === "digital" && !product.shipping);

      return matchesSearch && matchesInventory && matchesShipping;
    });
  }, [inventoryFilter, products, search, shippingFilter]);

  const trackedProducts = products.filter((product) => product.inventoryTracking).length;
  const totalInventory = products.reduce((sum, product) => sum + product.inventory, 0);

  const handleDuplicate = (productId: string) => {
    const duplicate = duplicateProduct(productId);

    if (!duplicate) {
      toast.error("No se pudo duplicar el producto.");
      return;
    }

    setProducts(loadProducts());
    toast.success("Producto duplicado.", {
      description: `${duplicate.name} ya aparece en el listado.`,
    });
  };

  const handleCopySlug = async (slug: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast("Tu navegador no permite copiar el slug automaticamente.");
      return;
    }

    try {
      await navigator.clipboard.writeText(slug);
      toast.success("Slug copiado.");
    } catch {
      toast.error("No se pudo copiar el slug.");
    }
  };

  return (
    <MainContent
      eyebrow="Catalogo"
      title="Productos"
      description="Gestiona el catalogo principal con tabla, filtros y alta rapida de productos listos para vender."
      actions={
        <Button asChild className="rounded-2xl">
          <Link to="/products/new">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Productos
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{products.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Inventario total
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{totalInventory}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Tracking activo
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{trackedProducts}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] xl:w-full">
            <label className="relative block">
              <span className="sr-only">Buscar producto</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, SKU, slug o tag"
                className="h-11 rounded-2xl border-border bg-secondary/40 pl-10"
              />
            </label>

            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Inventario
              </span>
              <select
                value={inventoryFilter}
                onChange={(event) => setInventoryFilter(event.target.value as InventoryFilter)}
                className="h-11 w-full rounded-2xl border border-border bg-secondary/40 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="all">Todos</option>
                <option value="in-stock">Con stock</option>
                <option value="low">Stock bajo</option>
                <option value="out">Sin stock</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Tipo
              </span>
              <select
                value={shippingFilter}
                onChange={(event) => setShippingFilter(event.target.value as ShippingFilter)}
                className="h-11 w-full rounded-2xl border border-border bg-secondary/40 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="all">Todos</option>
                <option value="shipping">Con envio</option>
                <option value="digital">Digital</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/80">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Inventario</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-border/70 bg-card/70 transition-colors hover:bg-secondary/20"
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="min-w-[14rem]">
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="mt-1 max-w-md break-words text-xs text-muted-foreground">
                            {product.description || "Sin descripcion"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-secondary-foreground">
                              {product.sku}
                            </span>
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{product.inventory}</p>
                          <p className="text-xs text-muted-foreground">{inventoryLabel(product)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(product.price)}
                          </p>
                          {product.comparePrice > product.price ? (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.comparePrice)}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleDuplicate(product.id)}
                          >
                            Duplicar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleCopySlug(product.slug)}
                          >
                            <Copy className="h-4 w-4" />
                            Slug
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-14">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border bg-secondary/40 text-muted-foreground">
                          <Package className="h-6 w-6" />
                        </span>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            No hay productos que coincidan
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ajusta los filtros o crea un nuevo producto para comenzar.
                          </p>
                        </div>
                        <Button asChild className="rounded-2xl">
                          <Link to="/products/new">
                            <Plus className="h-4 w-4" />
                            Nuevo Producto
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MainContent>
  );
}
