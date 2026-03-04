# Contract

## Scope

This repository is a frontend SPA built with Vite, React, TypeScript, Tailwind CSS, shadcn-ui, and React Router.

Firebase is used only for authentication.
Vercel is the target hosting platform for the frontend build and routing.

There is still no custom backend API implemented in this codebase.

## Browser Route Contract

### `GET /`

- Renders the ShopCOD SaaS landing page.
- Component: `SaaSLandingPage`.
- Includes:
  - a product-led hero centered on ShopCOD tools (builders, checkout COD, analytics, operations)
  - public pricing tiers for `Starter`, `Pro`, and `Scale`

### `GET /login`

- Renders the authentication screen.
- Component: `LoginPage`.
- Supports:
  - Email/password sign-in for existing accounts
  - Google popup sign-in
  - root redirect to `/superadmin` when the authenticated email is `afiliadosprobusiness@gmail.com`

### `GET /register`

- Renders the registration screen.
- Component: `LoginPage`.
- Supports:
  - Email/password account creation
  - Google popup sign-in
  - cross-link back to `/login`

### `GET /superadmin`

- Renders the protected superadmin control panel.
- Components: `SuperAdminRoute` + `SuperAdminPage`.
- Access:
  - authenticated only
  - restricted to `afiliadosprobusiness@gmail.com`
- Includes:
  - client list search and status filtering
  - activate / deactivate actions
  - delete client action for non-protected clients
  - a protected root client row that cannot be deleted or deactivated

### `GET /store/demo`

- Renders the public product demo landing.
- Component: `LandingPage`.

### `GET /checkout`

- Renders the public checkout flow.
- Component: `CheckoutPage`.

### `GET /order-confirmed`

- Renders the post-checkout confirmation screen.
- Component: `OrderConfirmedPage`.

### Protected Dashboard Shell Routes

All routes below are protected by Firebase auth state and render inside the shared `DashboardLayout`, which includes:

- left sidebar navigation
- topbar with global search, workspace selector, notifications, and avatar
- a central dynamic content area via React Router `Outlet`

### `GET /dashboard`

- Renders the dashboard home.
- Components: `DashboardLayout` + `DashboardHomePage`.
- Includes:
  - a primary card for `Crear tienda online`
  - a primary card for `Crear funnel`
  - internal navigation entrypoint for the protected modules

### `GET /products`

- Renders the products management module.
- Components: `DashboardLayout` + `ProductsPage`.
- Includes:
  - searchable product table
  - inventory and type filters
  - `Nuevo Producto` CTA
  - row actions for duplicate and slug copy

### `GET /products/new`

- Renders the product creation workflow.
- Components: `DashboardLayout` + `ProductCreatePage`.
- Includes:
  - product information section
  - details section
  - configuration section
  - order bump and upsell controls

### `GET /funnels`

- Renders the funnels management module.
- Components: `DashboardLayout` + `FunnelsPage`.
- Includes:
  - a funnel list with preview image area, name, conversion, and visits
  - `Nuevo Funnel` CTA
  - a 3-step creation wizard inside the same route

### `GET /stores`

- Renders the stores management module.
- Components: `DashboardLayout` + `StoresPage`.
- Includes:
  - a store list with template preview, payment method, and page count
  - `Nueva tienda` CTA
  - a 3-step creation wizard inside the same route

### `GET /stores/:storeId`

- Renders the internal dashboard for a specific store.
- Components: `DashboardLayout` + `StoreDashboardPage`.
- Route param:
  - `storeId: string`
- Includes:
  - internal section navigation for `Resumen`, `Productos`, `Colecciones`, `Pedidos`, `Pages`, `Idiomas`, and `Configuracion`
  - summary metric cards for visitors, orders, sales, and conversion rate
  - summary tables for top products and traffic sources
  - local operational views derived from the current store draft

### `GET /orders`

- Renders the orders module.
- Components: `DashboardLayout` + `OrdersPage`.

### `GET /analytics`

- Renders the analytics module.
- Components: `DashboardLayout` + `AnalyticsPage`.

### `GET /contacts`

- Renders the contacts module.
- Components: `DashboardLayout` + `ContactsPage`.

### `GET /offers`

- Renders the offers module.
- Components: `DashboardLayout` + `OffersPage`.

### `GET /apps`

- Renders the apps module.
- Components: `DashboardLayout` + `AppsPage`.

### `GET /settings`

- Renders the settings module.
- Components: `DashboardLayout` + `SettingsPage`.
- Includes:
  - sectioned internal navigation for general, shipping, members, billing, domains, digital products, legal, emails, security, payment gateways, tracking, and webhooks
  - local forms and lists backed by `PlatformSettings`
  - modal flows for member invites, webhook creation, gateway registration, and the payment-method requirement before removing the temporary store password

### `GET /editor/:storeId`

- Renders the authenticated funnel editor.
- Component: `EditorPage`.
- Access: protected by Firebase auth state.
- Route param:
  - `storeId: string`
- Behavior:
  - loads local draft state when available
  - edits both funnel blocks and base commercial profile
  - new drafts open with a full starter funnel (hero, problem, benefits, reviews, FAQ, checkout, and CTA)
  - exposes a drag-and-drop funnel workspace with block library, funnel map, quick insertion, and conversion guidance
  - includes builder modes for store setup, funnel ordering, and page refinement within the same route
  - store setup uses a dedicated store builder for products, bundles, collections, checkout order bumps, multi-currency, and multi-domain configuration
  - page refinement uses a visual page builder with sidebar tabs (`Elements`, `Layers`, `Styles`, `Settings`), top bar controls, nested containers, duplicate/resize controls, and inline editing without full reloads
  - funnel ordering supports a node-based flow editor with pan, zoom, drag, node duplication/deletion, visible page previews, node connections, analytics badges, and page-level routing per node

### `GET /preview/:storeId`

- Renders the authenticated store preview.
- Component: `PreviewPage`.
- Access: protected by Firebase auth state.
- Route param:
  - `storeId: string`
- Behavior:
  - uses saved draft/profile data when available

### `GET *`

- Renders the fallback 404 page.
- Component: `NotFound`.

## Shared UI Data Contract

### Funnel Block Model

Defined in `src/lib/editor.ts`.

```ts
type BlockType = "hero" | "problem" | "benefits" | "reviews" | "faq" | "checkout" | "cta";

interface FunnelBlock {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

interface StoreProfile {
  storeName: string;
  productName: string;
  headline: string;
  subheadline: string;
  price: string;
  originalPrice: string;
  ctaText: string;
  category: string;
}

interface StoreCatalogItem {
  id: string;
  name: string;
  product: string;
  category: string;
  status: "activa" | "borrador" | "pausada";
  orders: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface StoredEditorState {
  blocks: FunnelBlock[];
  profile: StoreProfile | null;
  pageBuilder: PageBuilderBlock[] | null;
  pageBuilderPages: Record<string, PageBuilderBlock[]> | null;
  funnelBuilder: FunnelGraph | null;
  storeBuilder: StoreBuilderState | null;
  updatedAt: string;
  publishedAt: string | null;
}
```

### Platform Operations Model

Defined in `src/lib/platform-data.ts`.

```ts
interface PlatformOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  quantity: number;
  total: number;
  status: "new" | "confirmed" | "fulfilled" | "cancelled";
  items: PlatformOrderItem[];
  createdAt: string;
}

interface PlatformContact {
  id: string;
  fullName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderId: string | null;
}

interface PlatformEvent {
  id: string;
  type: "page_view" | "checkout_started" | "order_placed";
  path: string;
  visitorId: string;
  createdAt: string;
}

type PlatformOffer = BundleOffer | DiscountOffer;

interface SuperAdminClient {
  id: string;
  workspaceName: string;
  companyName: string;
  ownerEmail: string;
  planName: string;
  status: "active" | "inactive";
  isProtected: boolean;
}

interface PlatformSettings {
  accountName: string;
  ownerEmail: string;
  supportEmail: string;
  subdomain: string;
  legalName: string;
  companyName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  timezone: string;
  shipping: { groups: Array<{ id: string }>; advancedRegions: Array<{ id: string }> };
  members: { admins: Array<{ id: string }>; members: Array<{ id: string; permissions: string[]; apps: string[] }> };
  billing: { planName: string; status: "active" | "past_due" };
  domains: { connectorEnabled: boolean; connectedDomains: Array<{ id: string; host: string; isPrimary: boolean }> };
  digitalProducts: { files: Array<{ id: string; name: string; sizeLabel: string }> };
  legal: { refundPolicy: string; privacyPolicy: string; termsOfService: string };
  emails: { abandonedCartEnabled: boolean; abandonedCartDelayMinutes: number };
  security: { blockedCountries: string[]; blockedIps: string[]; supportAccess: boolean; captchaEnabled: boolean };
  payments: { accountCurrency: string; gateways: Array<{ id: string; name: string; active: boolean }>; temporaryStorePassword: string };
  tracking: Record<string, string>;
  webhooks: { items: Array<{ id: string; event: string; url: string; version: string }> };
}
```

### Page Builder Model

Defined canonically in `src/builders/shared/models/page.ts` and re-exported by `src/builders/page-builder/blocks/schema.ts`.

```ts
type PageBuilderBlockType =
  | "text"
  | "image"
  | "button"
  | "container"
  | "columns"
  | "video"
  | "product"
  | "form"
  | "countdown"
  | "testimonial"
  | "section"
  | "divider";

interface PageBuilderBlock {
  id: string;
  type: PageBuilderBlockType;
  content: Record<string, string>;
  style: {
    backgroundColor: string;
    textColor: string;
    align: "left" | "center" | "right";
    padding: "compact" | "comfortable" | "spacious";
    margin: "none" | "sm" | "md" | "lg";
    radius: "soft" | "rounded" | "pill";
    fontFamily: "sans" | "serif" | "mono";
    fontSize: "sm" | "base" | "lg" | "xl";
    borderStyle: "none" | "solid" | "dashed";
    borderWidth: "none" | "thin" | "medium";
    borderColor: string;
  };
  layout: {
    width: "full" | "wide" | "narrow";
    gap: "tight" | "normal" | "loose";
    columns: number;
    minHeight: "auto" | "sm" | "md" | "lg";
  };
  children: PageBuilderBlock[];
}

interface PageBuilderDocument {
  id: string;
  title: string;
  blocks: PageBuilderBlock[];
}
```

### Funnel Builder Model

Defined canonically in `src/builders/shared/models/funnel.ts` and re-exported by `src/builders/funnel-builder/schema.ts`.

```ts
type FunnelNodeType =
  | "landing"
  | "product"
  | "checkout"
  | "upsell"
  | "downsell"
  | "thankyou"
  | "leadCapture"
  | "article"
  | "blank";

interface FunnelGraph {
  id: string;
  name: string;
  nodes: FunnelNode[];
  pages: FunnelPage[];
  connections: FunnelConnection[];
}

interface FunnelNode {
  id: string;
  pageId: string;
  type: FunnelNodeType;
  position: { x: number; y: number };
  analytics: {
    visits: number;
    clicks: number;
    conversionRate: number;
  };
}

interface FunnelPage {
  id: string;
  funnelId: string;
  type: FunnelNodeType;
  contentJson: string;
}

interface FunnelConnection {
  from: string;
  to: string;
}
```

### Store Builder Model

Defined canonically in `src/builders/shared/models/product.ts` and re-exported by `src/builders/store-builder/schema.ts`.

```ts
interface StoreBuilderState {
  products: StoreProduct[];
  bundles: StoreBundle[];
  collections: StoreCollection[];
  checkout: StoreCheckoutConfig;
}

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  prices: { USD: number; EUR: number; PEN: number };
  images: string[];
  variants: string[];
  stock: number;
}

interface StoreBundle {
  id: string;
  productIds: string[];
  bundlePrice: number;
}

interface StoreOrderBump {
  productId: string;
  price: number;
  description: string;
}
```

### Product Catalog Model

Defined in `src/lib/products.ts`.

```ts
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  images: string[];
  variants: string[];
  inventory: number;
  sku: string;
  slug: string;
  tags: string[];
  createdAt: string;
  inventoryTracking: boolean;
  shipping: boolean;
  customFields: ProductCustomField[];
  orderBump: ProductOffer | null;
  upsell: ProductOffer | null;
}
```

### Funnel Catalog Model

Defined in `src/lib/funnels.ts`.

```ts
interface Funnel {
  id: string;
  name: string;
  slug: string;
  currency: "USD" | "EUR" | "PEN";
  pages: FunnelPage[];
  templateId: "blank" | "ai" | "preset";
  conversion: number;
  visits: number;
  createdAt: string;
}
```

Rules:

- `id` must be unique within the in-memory editor session.
- `type` must be one of the supported block types above.
- `data` remains a string map compatible with `BlockPreview`.
- `profile` stores the commercial base used to hydrate the funnel.
- The store catalog is a browser-side index for user-created drafts.
- `pageBuilder` stores the visual page layout as nested JSON blocks.
- `pageBuilderPages` stores page-builder layouts keyed by `pageId`.
- Only `section`, `container`, and `columns` may hold nested `children`.
- `funnelBuilder` stores the visual funnel graph, node connections, and `pages[]` records.
- The funnel builder must support page add, delete, duplicate, and connection actions on the visual graph.
- Each `FunnelPage.contentJson` stores the serialized page document for that funnel page and acts as the frontend mirror of the persisted `content_json` field.
- `storeBuilder` stores products, bundles, collections, checkout domains, currencies, and order bumps.
- `src/builders/shared/components/blocks/renderBlock.tsx` provides the shared `renderBlock(block)` engine used by Page Builder, Funnel Builder, and Store Builder UI.
- The page builder exposes a serializable `PageBuilderDocument` (`page_json`) for storage/export of the current page state.
- `Product.slug` must remain unique within the browser-side catalog.
- `/products` and `/products/new` use browser local persistence only.
- `Funnel.slug` must remain unique within the browser-side catalog.
- `/funnels` uses browser local persistence only and must initialize a compatible `/editor/:storeId` draft when creating a new funnel.
- `/orders`, `/analytics`, `/contacts`, `/offers`, and `/settings` use browser local persistence only.
- `/superadmin` uses browser local persistence only for the managed client registry.
- Submitting the COD checkout must create a persisted `PlatformOrder` and upsert a linked `PlatformContact`.
- Public-facing route visits and checkout starts must be tracked as `PlatformEvent` records and feed analytics KPIs.
- Products, funnels, stores, and offers must support deletion without reloading the page.
- The superadmin root client must remain protected and cannot be deleted or deactivated from the UI.
- Platform operational data may mirror to Firestore when Firebase configuration is available, but the UI must continue working with local persistence as the immediate fallback.

### Store Catalog Model

Defined in `src/lib/stores.ts`.

```ts
type StorePaymentMethod = "separateCheckout" | "productPagePayment";

interface StorePage {
  id: string;
  name: string;
  type: "home" | "catalog" | "product" | "checkout" | "thankyou";
}

interface Store {
  id: string;
  name: string;
  slug: string;
  currency: "USD" | "EUR" | "PEN";
  pages: StorePage[];
  paymentMethod: StorePaymentMethod;
  templateId: "singleProduct" | "catalog" | "flashSale";
  createdAt: string;
  updatedAt: string;
}
```

Rules:

- `Store.slug` must remain unique within the browser-side catalog.
- `Store.pages` changes based on the selected payment method:
  - `separateCheckout` keeps a dedicated checkout page
  - `productPagePayment` removes the dedicated checkout page and embeds payment in the product page
- `/stores` uses browser local persistence only and must initialize a compatible `/editor/:storeId` draft when creating a new store.

### Store Dashboard Snapshot Model

Defined in `src/lib/stores.ts`.

```ts
interface StoreDashboardSnapshot {
  store: Store;
  metrics: {
    visitors: number;
    orders: number;
    sales: number;
    conversionRate: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    stock: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    orders: number;
    conversionRate: number;
  }>;
  languages: Array<{
    code: string;
    label: string;
    status: "principal" | "activo" | "borrador";
  }>;
}
```

Rules:

- `/stores/:storeId` derives the dashboard snapshot client-side from the local store and local draft.
- Dashboard analytics remain browser-only and are not backed by a server API.

## Auth Contract

- Auth provider: Firebase Authentication.
- Frontend methods:
  - Email/password
  - Google popup
- Protected routes redirect unauthenticated users to `/login`.
- Session persistence uses Firebase browser local persistence.

## State And Persistence Contract

- Editor changes are stored in `localStorage`.
- Product catalog changes are stored in `localStorage`.
- Funnel catalog changes are stored in `localStorage`.
- Store catalog changes for `/stores` are stored in `localStorage`.
- `Guardar` writes a local draft with blocks and profile.
- `Publicar` stores a local published timestamp and marks the local catalog item as active.
- The browser can still read user-created stores from the local catalog for editor-adjacent flows.
- The products module seeds demo products until a browser-local product catalog is written.
- The funnels module seeds demo funnels until a browser-local funnel catalog is written.
- The stores module seeds demo stores until a browser-local store catalog is written.
- No custom backend persistence exists yet.

## Environment Contract

Required Vite env vars:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

These are public client configuration values, not server secrets.

## Hosting Contract

- Vercel project: `shop-cod`
- SPA routing depends on `vercel.json` rewrites to `/index.html`.

## Change Guard

The following are breaking changes and must be versioned or coordinated before implementation:

- Removing or renaming existing public routes.
- Removing or renaming any of the protected dashboard shell routes.
- Removing or renaming `/products/new` after exposing it publicly.
- Changing the `:storeId` route param shape.
- Renaming or removing any supported `BlockType`.
- Changing `FunnelBlock.data` away from a string map without updating all consumers.
- Renaming or removing any supported `PageBuilderBlockType`.
- Renaming or removing any supported `FunnelNodeType`.
- Removing required `StoreProduct` fields or changing `StoreBuilderState` shape without updating persistence and editor flows together.
- Removing required `Product` fields without updating the products table and creation flow together.
- Removing required `Funnel` fields without updating the funnels list, wizard, and editor bootstrap flow together.
- Removing required `Store` fields without updating the stores list, wizard, and editor bootstrap flow together.
- Removing `StoreProfile` fields without updating dashboard, editor, and preview flows together.
- Replacing Firebase auth without updating the login and protected-route flow.

## Changelog del Contrato

- 2026-03-04 | Creacion inicial del contrato del frontend SPA actual | non-breaking | Documenta el comportamiento existente sin cambiar runtime
- 2026-03-04 | Se agregan login con Firebase, rutas protegidas, persistencia local del editor y hosting en Vercel | non-breaking | Amplia el contrato publico sin romper rutas previas activas
- 2026-03-04 | Se agrega creador guiado, catalogo local de tiendas y preview alimentado por perfil comercial | non-breaking | Mejora el flujo de creacion sin cambiar las rutas publicas
- 2026-03-04 | Los nuevos borradores se inicializan con un funnel completo y el dashboard usa un creador guiado mas robusto | non-breaking | Refuerza el flujo de creacion sin alterar rutas ni shapes compartidos
- 2026-03-04 | El editor evoluciona a un workspace visual tipo funnel builder con score heuristico y controles de optimizacion | non-breaking | Mejora la UX del editor sin cambiar rutas ni contratos de datos
- 2026-03-04 | El dashboard permite eliminar tiendas locales y el editor agrega modos Store, Funnel y Page builder | non-breaking | Amplia la gestion local sin cambiar rutas ni shapes compartidos
- 2026-03-04 | El page builder agrega un arbol JSON propio con sidebar, top bar, drag and drop anidado e historial local | non-breaking | Amplia el estado compartido del editor sin romper las rutas ni el contrato del funnel existente
- 2026-03-04 | El funnel builder agrega un flow editor con nodos, conexiones, analytics y layouts por pageId | non-breaking | Amplia la edicion visual del editor sin romper el contrato del funnel legacy
- 2026-03-04 | El store builder agrega catalogo, bundles, order bumps, monedas y dominios persistidos en el draft | non-breaking | Amplia la configuracion comercial sin romper rutas ni contratos previos
- 2026-03-04 | Se centralizan modelos y renderer de Page, Funnel y Store builders en `src/builders/shared` | non-breaking | Mantiene shapes publicos y unifica la arquitectura interna de los builders
- 2026-03-04 | Se reemplaza el panel privado por un shell SaaS con layout compartido y rutas modulares internas | non-breaking | Mantiene las rutas protegidas y agrega la nueva arquitectura base del dashboard
- 2026-03-04 | Se implementa gestion de productos con listado, alta y modelo frontend persistido en navegador | non-breaking | Agrega `GET /products/new` y vuelve operativo el modulo de productos sin romper rutas existentes
- 2026-03-04 | Se implementa gestion de funnels con wizard, templates y modelo frontend persistido en navegador | non-breaking | Vuelve operativo `GET /funnels` y redirige nuevos funnels al editor sin romper rutas existentes
- 2026-03-04 | Se implementa gestion de tiendas con wizard, selector de pagos y modelo frontend persistido en navegador | non-breaking | Vuelve operativo `GET /stores` sin cambiar la ruta protegida existente
- 2026-03-04 | Se agrega `GET /stores/:storeId` con panel interno, analytics basicos y navegacion por secciones | non-breaking | Amplia el modulo de tiendas sin romper la ruta base ni el creador existente
- 2026-03-04 | El page builder adopta `block-engine` y `state-manager`, suma `section` y `divider`, y expone `page_json` serializable | non-breaking | Amplia el editor visual sin romper el contrato base de `PageBuilderBlock`
- 2026-03-04 | El funnel builder agrega tipos de pagina extendidos y acciones visibles de editar, duplicar, eliminar y conectar | non-breaking | Refuerza el editor visual sin cambiar rutas ni romper el modelo persistido
- 2026-03-04 | Cada pagina del funnel ahora persiste `contentJson` dentro de `funnelBuilder.pages[]` y abre el Page Builder dedicado | non-breaking | Conecta el Funnel Builder con el Page Builder sin romper el draft existente
- 2026-03-04 | El panel agrega pedidos, analiticas, contactos, ofertas y configuracion funcionales con storage local reactivo | non-breaking | Convierte modulos placeholder en flujos operativos del producto sin cambiar rutas protegidas
- 2026-03-04 | El panel agrega tracking real de visitas/conversion y sincronizacion remota opcional con Firestore para datos operativos | non-breaking | Mantiene fallback local mientras habilita KPIs y datos compartidos entre dispositivos
- 2026-03-04 | `GET /settings` evoluciona a un hub multi-seccion con miembros, pagos, seguridad y webhooks, y se alinean las rutas reales del dashboard operativo | non-breaking | Actualiza el contrato al comportamiento ya implementado sin romper rutas ni persistencia local
- 2026-03-04 | Se agrega `GET /superadmin` con acceso root por email y gestion local de clientes protegidos | non-breaking | Amplia el panel con un flujo de superadmin sin romper el dashboard existente
- 2026-03-04 | Se agrega `GET /register` y el login deja de autocrear cuentas silenciosamente | non-breaking | Se separan registro e inicio de sesion sin romper rutas existentes
- 2026-03-04 | Se actualiza la landing publica de ShopCOD y cambian los precios publicos de `Pro` y `Scale` | non-breaking | Ajusta el mensaje comercial y los planes sin alterar rutas ni contratos internos
