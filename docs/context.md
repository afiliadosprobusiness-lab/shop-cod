# Context

## Resumen

ShopCOD is a frontend SPA for COD-focused funnel selling. It uses Firebase Authentication for access control, runs on Vercel with SPA rewrites, and now includes a guided local store creation flow backed by browser persistence.

## Stack Tecnologico

- Vite 5
- React 18
- TypeScript
- React Router DOM 6
- Tailwind CSS 3
- shadcn-ui / Radix UI
- Framer Motion
- dnd-kit
- TanStack Query
- Firebase Web SDK (Auth only)
- Vitest + Testing Library

## Integraciones Activas

### Firebase

- Firebase project for auth: `shopcod-auth-20260304`
- Web app: `shopcod-web`
- Usage scope:
  - Firebase Authentication only
- Current auth methods wired in the frontend:
  - Email/password
  - Google popup

### Vercel

- Local directory is linked to Vercel project: `shop-cod`
- Public Firebase config was added to Vercel `Production` and `Preview` envs
- `vercel.json` rewrites all routes to `index.html` for BrowserRouter compatibility

## Punto De Entrada

- `src/main.tsx` mounts the React app into `#root`.
- `src/App.tsx` wraps the app with:
  - `QueryClientProvider`
  - `AuthProvider`
  - `TooltipProvider`
  - shadcn `Toaster`
  - Sonner toaster
  - `BrowserRouter`

## Rutas Principales

- `/`
  - SaaS landing page
  - Component: `SaaSLandingPage`
- `/login`
  - Login screen backed by Firebase Auth
  - Component: `LoginPage`
- `/store/demo`
  - Product demo landing
  - Component: `LandingPage`
- `/checkout`
  - Public checkout
  - Component: `CheckoutPage`
- `/order-confirmed`
  - Post-checkout confirmation
  - Component: `OrderConfirmedPage`
- `/dashboard`
  - Protected store dashboard
  - Component: `DashboardPage`
- `/orders`
  - Protected orders dashboard
  - Component: `AdminDashboard`
- `/editor/:storeId`
  - Protected funnel editor
  - Component: `EditorPage`
- `/preview/:storeId`
  - Protected store preview
  - Component: `PreviewPage`
- `*`
  - 404 fallback
  - Component: `NotFound`

## Flujos Principales

### Auth Flow

1. User clicks `Iniciar sesion`.
2. App opens `/login`.
3. User signs in with email/password or Google through Firebase Auth.
4. Protected routes become accessible.

### Guided Store Creation Flow

1. User opens `/dashboard`.
2. User clicks `Nueva Tienda` or the creation card.
3. A modal collects store name, product, category, pricing, CTA, and base headline.
4. The app creates a local draft with a unique `storeId`.
5. The app navigates to `/editor/:storeId` with a prefilled funnel that includes hero, problem, benefits, reviews, FAQ, checkout, and closing CTA.

### Editor Flow

1. User edits blocks in `/editor/:storeId`.
2. The editor now starts with builder modes inside the same route:
  - `Store builder` for product, catalog, bundle, checkout, and collection setup
  - `Funnel builder` for drag-and-drop sequencing and node-based page flow editing
  - `Page builder` for page-level refinement on the same block set
3. User edits the store commercial profile in the store builder panel.
4. The editor behaves as a visual funnel workspace with:
  - drag-and-drop ordering
  - block library grouped by funnel stage
  - funnel map navigation
  - contextual insertion suggestions
  - heuristic conversion score and quick-win guidance
5. `Page builder` now mounts a dedicated module at `src/builders/page-builder` with:
  - `sidebar` tabs: Add Elements, Edit Elements, Layers, Styles
  - `topbar` controls: undo, redo, responsive desktop/tablet/mobile, save, preview, publish
  - `canvas` tree: drag, drop, reorder, nested containers, inline editing, hover controls
  - `renderer/renderBlock(block)` for block-by-block rendering
6. The visual page layout is stored as nested JSON blocks alongside the funnel draft.
7. `Funnel builder` now mounts a dedicated module at `src/builders/funnel-builder` with:
  - infinite-feel canvas with pan and zoom
  - draggable page nodes
  - SVG node connections with disconnect controls
  - per-node analytics badges (visits, clicks, conversion rate)
  - click-on-node transition into the `Page builder`
8. Page builder layouts are now also stored by `pageId` so each funnel node can own a distinct page draft.
9. `Store builder` now mounts a dedicated module at `src/builders/store-builder` with:
  - product creation and catalog management
  - bundle configuration
  - checkout setup with order bumps
  - multi-currency and multi-domain inputs
  - collection grouping for catalog organization
10. `Aplicar al funnel` syncs the profile into hero, CTA, FAQ, benefits, and checkout copy.
11. The page, funnel, and store builders now share a common engine in `src/builders/shared` for canonical models, block rendering, and editor shell components (`canvas`, `toolbar`, `sidebar`, `blocks`, `editor`).
12. `Guardar` stores blocks, page-builder JSON, page layouts by `pageId`, funnel graph, store builder state, and profile in browser storage.

### Preview Flow

1. User opens `/preview/:storeId`.
2. Preview reads the saved draft profile when present.
3. The hero, CTA, and checkout copy reflect the saved store data.
4. `Publicar` marks the local draft as active.

### Dashboard Management Flow

1. Dashboard merges base demo stores with locally created stores from browser storage.
2. Store action modal supports:
  - open editor
  - open preview
  - go to orders
  - duplicate draft
  - pause local store
  - delete local store

## Arquitectura

### Auth Layer

- `src/lib/firebase.ts` initializes Firebase app and auth.
- `src/lib/auth.tsx` exposes auth context and Firebase-backed session methods.
- `src/components/auth/ProtectedRoute.tsx` gates private routes.

### Store Builder Layer

- `src/lib/editor.ts` centralizes:
  - block types
  - store profile model
  - local draft persistence
  - local store catalog persistence
- `src/components/editor/BlockPreview.tsx` renders editor block previews and default templates.

### Page Layer

- `src/pages/DashboardPage.tsx` manages store creation and local catalog UX.
- `src/pages/EditorPage.tsx` manages the guided builder, store/funnel/page modes, drag-and-drop composition, and conversion guidance UI.
- `src/pages/PreviewPage.tsx` renders the saved commercial profile into the storefront preview.

### Page Builder Module

- `src/builders/page-builder/sidebar/*` renders the left inspector and draggable element library.
- `src/builders/page-builder/topbar/*` renders history, preview/publish, and responsive controls.
- `src/builders/page-builder/canvas/*` renders the nested visual canvas and drop zones.
- `src/builders/page-builder/blocks/*` re-exports the shared page model and keeps immutable tree helpers local.
- `src/builders/page-builder/renderer/renderBlock.tsx` delegates to the shared block renderer.

### Funnel Builder Module

- `src/builders/funnel-builder/schema.ts` re-exports the shared funnel model and helpers.
- `src/builders/funnel-builder/FunnelBuilderEditor.tsx` renders the interactive canvas, node cards, analytics, pan/zoom, and connection UX.

### Store Builder Module

- `src/builders/store-builder/schema.ts` re-exports the shared product/store model and helper factories.
- `src/builders/store-builder/StoreBuilderEditor.tsx` renders the store configuration workspace for catalog, order bumps, currencies, domains, and collections.

### Shared Builder Engine

- `src/builders/shared/models/page.ts` is now the canonical page-builder schema and factories.
- `src/builders/shared/models/funnel.ts` is now the canonical funnel graph schema and helpers.
- `src/builders/shared/models/product.ts` is now the canonical product/store schema and helpers.
- `src/builders/shared/components/*` provides shared editor shells for `canvas`, `toolbar`, `sidebar`, `blocks`, `editor`, plus the shared `renderBlock(block)` renderer.

### UI Layer

- `src/components/ui/*` contains shared shadcn-style primitives.

## Datos Y Persistencia

- Auth session persistence is handled by Firebase browser local persistence.
- Store drafts are stored in browser `localStorage`.
- Each draft stores:
  - funnel blocks
  - store commercial profile
  - page builder nested layout JSON
  - page builder layouts keyed by `pageId`
  - funnel graph nodes and connections
  - store builder products, bundles, collections, and checkout settings
  - timestamps
- A browser-side store catalog is also stored in `localStorage` for dashboard listing.
- Dashboard and orders still include mock fixture metrics for the base demo.
- No custom backend or database persistence exists yet.

## Variables De Entorno

Required:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Restricciones Y Riesgos

- Browser storage powers the creator; drafts are local to the current browser/session context.
- Google popup on deployed domains still depends on the Firebase authorized domain configuration.
- The build currently produces a large JS chunk and may benefit from later code-splitting.
- There is still no backend API for stores, orders, or publishing.

## Convenciones Para Cambios Futuros

- Treat this file as the architectural source of truth.
- If routes, auth flow, integrations, dependencies, hosting, or persistence behavior change, update this file in the same commit.
