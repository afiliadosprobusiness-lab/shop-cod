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
  updatedAt: string;
  publishedAt: string | null;
}
```

Rules:

- `id` must be unique within the in-memory editor session.
- `type` must be one of the supported block types above.
- `data` remains a string map compatible with `BlockPreview`.
- `profile` stores the commercial base used to hydrate the funnel.
- The store catalog is a browser-side index for user-created drafts.

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
- Removing `StoreProfile` fields without updating dashboard, editor, and preview flows together.
- Replacing Firebase auth without updating the login and protected-route flow.

## Changelog del Contrato

- 2026-03-04 | Creacion inicial del contrato del frontend SPA actual | non-breaking | Documenta el comportamiento existente sin cambiar runtime
- 2026-03-04 | Se agregan login con Firebase, rutas protegidas, persistencia local del editor y hosting en Vercel | non-breaking | Amplia el contrato publico sin romper rutas previas activas
- 2026-03-04 | Se agrega creador guiado, catalogo local de tiendas y preview alimentado por perfil comercial | non-breaking | Mejora el flujo de creacion sin cambiar las rutas publicas
- 2026-03-04 | Los nuevos borradores se inicializan con un funnel completo y el dashboard usa un creador guiado mas robusto | non-breaking | Refuerza el flujo de creacion sin alterar rutas ni shapes compartidos
- 2026-03-04 | El editor evoluciona a un workspace visual tipo funnel builder con score heuristico y controles de optimizacion | non-breaking | Mejora la UX del editor sin cambiar rutas ni contratos de datos
