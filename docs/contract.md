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

### `GET /login`

- Renders the authentication screen.
- Component: `LoginPage`.
- Supports:
  - Email/password sign-in
  - Google popup sign-in

### `GET /store/demo`

- Renders the public product demo landing.
- Component: `LandingPage`.

### `GET /checkout`

- Renders the public checkout flow.
- Component: `CheckoutPage`.

### `GET /order-confirmed`

- Renders the post-checkout confirmation screen.
- Component: `OrderConfirmedPage`.

### `GET /dashboard`

- Renders the authenticated dashboard.
- Component: `DashboardPage`.
- Access: protected by Firebase auth state.
- Includes:
  - existing mock stores
  - locally created stores from browser storage
  - modal-based store creation
  - modal-based quick actions and settings
  - local-store delete action for user-created drafts

### `GET /orders`

- Renders the authenticated order dashboard with mock orders.
- Component: `AdminDashboard`.
- Access: protected by Firebase auth state.

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
  - now includes builder modes for store setup, funnel ordering, and page refinement within the same route
  - store setup now uses a dedicated store builder for products, bundles, collections, checkout order bumps, multi-currency, and multi-domain configuration
  - page refinement uses a visual page builder with sidebar tabs, top bar controls, nested containers, and inline editing without full reloads
  - funnel ordering now also supports a node-based flow editor with pan, zoom, node connections, analytics badges, and page-level routing per node

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
  | "testimonial";

interface PageBuilderBlock {
  id: string;
  type: PageBuilderBlockType;
  content: Record<string, string>;
  style: {
    backgroundColor: string;
    textColor: string;
    align: "left" | "center" | "right";
    padding: "compact" | "comfortable" | "spacious";
    radius: "soft" | "rounded" | "pill";
  };
  layout: {
    width: "full" | "wide" | "narrow";
    gap: "tight" | "normal" | "loose";
    columns: number;
  };
  children: PageBuilderBlock[];
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
  | "thankyou";

interface FunnelGraph {
  id: string;
  name: string;
  nodes: FunnelNode[];
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

Rules:

- `id` must be unique within the in-memory editor session.
- `type` must be one of the supported block types above.
- `data` remains a string map compatible with `BlockPreview`.
- `profile` stores the commercial base used to hydrate the funnel.
- The store catalog is a browser-side index for user-created drafts.
- `pageBuilder` stores the visual page layout as nested JSON blocks.
- `pageBuilderPages` stores page-builder layouts keyed by `pageId`.
- Only `container` and `columns` may hold nested `children`.
- `funnelBuilder` stores the visual funnel graph and node connections.
- `storeBuilder` stores products, bundles, collections, checkout domains, currencies, and order bumps.
- `src/builders/shared/components/blocks/renderBlock.tsx` provides the shared `renderBlock(block)` engine used by Page Builder, Funnel Builder, and Store Builder UI.

## Auth Contract

- Auth provider: Firebase Authentication.
- Frontend methods:
  - Email/password
  - Google popup
- Protected routes redirect unauthenticated users to `/login`.
- Session persistence uses Firebase browser local persistence.

## State And Persistence Contract

- Editor changes are stored in `localStorage`.
- `Guardar` writes a local draft with blocks and profile.
- `Publicar` stores a local published timestamp and marks the local catalog item as active.
- The dashboard reads user-created stores from the local catalog in browser storage.
- Dashboard and order metrics still include mock fixtures for the base demo.
- Local user-created stores can be removed from browser storage from the dashboard action modal.
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
- Changing the `:storeId` route param shape.
- Renaming or removing any supported `BlockType`.
- Changing `FunnelBlock.data` away from a string map without updating all consumers.
- Renaming or removing any supported `PageBuilderBlockType`.
- Renaming or removing any supported `FunnelNodeType`.
- Removing required `StoreProduct` fields or changing `StoreBuilderState` shape without updating persistence and editor flows together.
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
