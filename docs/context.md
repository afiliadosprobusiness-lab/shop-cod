# Context

## Resumen

ShopCOD is a frontend SPA for COD-focused funnel selling. It uses Firebase Authentication for access control, runs on Vercel with SPA rewrites, and now exposes a protected SaaS dashboard shell with shared sidebar, topbar, and module navigation while keeping the legacy editor and preview routes available by direct path.

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
- `/superadmin`
  - Protected superadmin control panel
  - Components: `SuperAdminRoute` + `SuperAdminPage`
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
  - Protected dashboard home
  - Components: `DashboardLayout` + `DashboardHomePage`
- `/products`
  - Protected products list
  - Components: `DashboardLayout` + `ProductsPage`
- `/products/new`
  - Protected product creation form
  - Components: `DashboardLayout` + `ProductCreatePage`
- `/funnels`
  - Protected funnels list and wizard
  - Components: `DashboardLayout` + `FunnelsPage`
- `/stores`
  - Protected stores list and creation wizard
  - Components: `DashboardLayout` + `StoresPage`
- `/stores/:storeId`
  - Protected internal store dashboard
  - Components: `DashboardLayout` + `StoreDashboardPage`
- `/orders`
  - Protected orders module
  - Components: `DashboardLayout` + `OrdersPage`
- `/analytics`
  - Protected analytics module
  - Components: `DashboardLayout` + `AnalyticsPage`
- `/contacts`
  - Protected contacts module
  - Components: `DashboardLayout` + `ContactsPage`
- `/offers`
  - Protected offers module
  - Components: `DashboardLayout` + `OffersPage`
- `/apps`
  - Protected apps module
  - Components: `DashboardLayout` + `AppsPage`
- `/settings`
  - Protected settings module
  - Components: `DashboardLayout` + `SettingsPage`
- `/editor/:storeId`
  - Protected visual editor
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
4. If the email is `afiliadosprobusiness@gmail.com`, the app redirects to `/superadmin`.
5. All other authenticated users continue into the regular dashboard routes.

### Dashboard Shell Flow

1. User opens any protected dashboard route such as `/dashboard`.
2. `ProtectedRoute` validates the Firebase session.
3. `DashboardLayout` renders the shared shell:
  - left sidebar
  - topbar with global search, workspace selector, notifications, and avatar
  - central dynamic content area via `Outlet`
4. Sidebar links switch between `/dashboard`, `/products`, `/funnels`, `/stores`, `/orders`, `/analytics`, `/contacts`, `/offers`, `/apps`, and `/settings`.
5. The home screen at `/dashboard` shows two primary cards:
  - `Crear tienda online`
  - `Crear funnel`

### Products Flow

1. User opens `/products`.
2. The products module renders a searchable table with:
  - product
  - inventory
  - created
  - price
  - actions
3. The table includes:
  - global search
  - inventory filter
  - product type filter
  - `Nuevo Producto` CTA
4. User opens `/products/new`.
5. The creation screen renders a structured form with:
  - product information
  - details
  - configuration
  - order bump and upsell controls
6. On save, the product is normalized and stored in browser `localStorage`.
7. The app navigates back to `/products` and the new row appears in the listing.

### Funnels Flow

1. User opens `/funnels`.
2. The funnels module renders a list with:
  - preview image area
  - name
  - conversion
  - visits
3. The user clicks `Nuevo Funnel` to open the creation wizard inside the same route.
4. Step 1 lets the user select one of the available templates:
  - `Blank`
  - `IA`
  - `Plantillas predisenadas`
5. Step 2 collects:
  - `name`
  - `slug`
  - `currency`
6. Step 3 saves the funnel configuration in browser `localStorage`.
7. The app initializes a compatible editor draft and redirects to `/editor/:storeId`.

### Stores Flow

1. User opens `/stores`.
2. The stores module renders a local list of created stores with:
  - template preview
  - payment method
  - page count
3. The user clicks `Nueva tienda` to open the creation wizard inside the same route.
4. Step 1 lets the user select one of the available templates:
  - `One Product`
  - `Catalog`
  - `Flash Sale`
5. Step 2 lets the user select the payment method:
  - `Checkout separado`
  - `Pago en pagina de producto`
6. Step 3 collects:
  - `name`
  - `slug`
  - `currency`
7. On save, the app stores the new store in browser `localStorage`, initializes a compatible editor draft, and keeps the new item visible in the list.
8. `Ver panel` opens `/stores/:storeId` for the internal dashboard.
9. `Abrir editor` opens `/editor/:storeId` using the same store id and draft.

### Store Dashboard Flow

1. User opens `/stores/:storeId`.
2. The route loads the local store and ensures a compatible local draft exists.
3. The page renders internal navigation sections:
  - `Resumen`
  - `Productos`
  - `Colecciones`
  - `Pedidos`
  - `Pages`
  - `Idiomas`
  - `Configuracion`
4. `Resumen` shows basic analytics:
  - visitors
  - orders
  - sales
  - conversion rate
5. The summary also renders two basic analytics tables:
  - top products
  - traffic sources
6. The remaining sections expose operational views derived from the local draft and store model.

### Editor Flow

1. User opens `/editor/:storeId`.
2. The editor starts with builder modes inside the same route:
  - `Store builder` for product, catalog, bundle, checkout, and collection setup
  - `Funnel builder` for drag-and-drop sequencing and node-based page flow editing
  - `Page builder` for page-level refinement of the currently selected funnel page
3. User edits the store commercial profile in the store builder panel.
4. The editor behaves as a visual funnel workspace with:
  - drag-and-drop ordering
  - block library grouped by funnel stage
  - funnel map navigation
  - contextual insertion suggestions
  - heuristic conversion score and quick-win guidance
5. `Page builder` mounts a dedicated module at `src/builders/page-builder` with:
  - `sidebar` tabs: Elements, Layers, Styles, Settings
  - `topbar` controls: undo, redo, responsive desktop/tablet/mobile, save, preview, publish
  - `canvas` tree: drag, drop, reorder, duplicate, resize, nested containers, inline editing, hover controls
  - `renderer/renderBlock(block)` for block-by-block rendering
  - `block-engine` for schema, catalog, tree ops, and page JSON serialization
  - `state-manager` for history, selection, device mode, drag state, and hot updates
6. The visual page layout is stored as nested JSON blocks alongside the funnel draft and serialized into each funnel page record.
7. `Funnel builder` mounts a dedicated module at `src/builders/funnel-builder` with:
  - infinite-feel canvas with pan and zoom
  - draggable page nodes
  - duplicate and delete node actions
  - SVG node connections with disconnect controls
  - per-node analytics badges (visits, clicks, conversion rate)
  - supported node types for product, checkout, upsell, downsell, thank you, lead capture, article, and blank page
  - click-on-node transition into the `Page builder`
8. Page builder layouts are also stored by `pageId` so each funnel node can own a distinct page draft and reopen the correct visual editor state.
9. `Store builder` mounts a dedicated module at `src/builders/store-builder` with:
  - product creation and catalog management
  - bundle configuration
  - checkout setup with order bumps
  - multi-currency and multi-domain inputs
  - collection grouping for catalog organization
10. `Aplicar al funnel` syncs the profile into hero, CTA, FAQ, benefits, and checkout copy.
11. The page, funnel, and store builders share a common engine in `src/builders/shared` for canonical models, block rendering, and editor shell components (`canvas`, `toolbar`, `sidebar`, `blocks`, `editor`).
12. `Guardar` stores blocks, page-builder JSON, page layouts by `pageId`, funnel graph page records (`contentJson` per funnel page), store builder state, and profile in browser storage.

### Preview Flow

1. User opens `/preview/:storeId`.
2. Preview reads the saved draft profile when present.
3. The hero, CTA, and checkout copy reflect the saved store data.
4. El checkout demo tambien registra pedidos y contactos reales en browser storage, y esos datos alimentan `/orders`, `/analytics` y `/contacts`.
5. `Publicar` marks the local draft as active.

## Arquitectura

### Auth Layer

- `src/lib/firebase.ts` initializes Firebase app and auth.
- `src/lib/auth.tsx` exposes auth context and Firebase-backed session methods.
- `src/components/auth/ProtectedRoute.tsx` gates private routes.
- `src/components/auth/SuperAdminRoute.tsx` gates the root-only superadmin route.
- `src/lib/superadmin.ts` defines the frontend-only superadmin client registry, the protected root account rule, and local client actions.

### Dashboard Shell Layer

- `src/layouts/DashboardLayout.tsx` provides the shared protected shell for dashboard modules.
- `src/components/dashboard/navigation.ts` defines the internal module map and metadata.
- `src/components/dashboard/Sidebar.tsx` renders the left navigation and mobile drawer behavior.
- `src/components/dashboard/Topbar.tsx` renders global search, workspace switching, notifications, and the user avatar.
- `src/components/dashboard/MainContent.tsx` standardizes the content header and responsive inner container.
- `src/pages/dashboard/DashboardHomePage.tsx` renders the dashboard landing view.
- `src/pages/dashboard/ProductsPage.tsx` renders the products management table, search, filters, and row actions.
- `src/pages/dashboard/ProductCreatePage.tsx` renders the multi-section product creation workflow.
- `src/pages/dashboard/FunnelsPage.tsx` renders the funnels list and the multi-step creation wizard.
- `src/pages/dashboard/StoresPage.tsx` renders the stores list and the 3-step store creation wizard.
- `src/pages/dashboard/StoreDashboardPage.tsx` renders the per-store internal dashboard and section navigation.
- `src/pages/dashboard/OrdersPage.tsx` renders real COD orders and operational status updates.
- `src/pages/dashboard/AnalyticsPage.tsx` renders real-time KPI snapshots from persisted platform data.
- `src/pages/dashboard/ContactsPage.tsx` renders the persisted buyers/leads base from COD submissions.
- `src/pages/dashboard/OffersPage.tsx` renders bundle and discount creation.
- `src/pages/dashboard/AppsPage.tsx` renders the "coming soon" integrations state.
- `src/pages/dashboard/SettingsPage.tsx` renders a multi-section settings hub for general account data, shipping, members, billing, domains, digital files, legal copy, abandoned-cart email recovery, security, payment gateways, tracking, webhooks, and the temporary store password payment modal.
- `src/pages/SuperAdminPage.tsx` renders the root control panel for managing client accounts, statuses, and deletions while keeping the root account protected.
- `src/lib/products.ts` defines the frontend product model and browser persistence helpers.
- `src/lib/funnels.ts` defines the frontend funnel model, template selector data, local persistence, and editor bootstrapping.
- `src/lib/stores.ts` defines the frontend store model, template selector data, payment selector, local persistence, editor bootstrapping, and derived store analytics snapshots.
- `src/lib/platform-data.ts` defines real orders, contacts, offers, settings, and shared analytics snapshots for the dashboard.
- `src/lib/live-sync.ts` dispatches browser events so local modules refresh when persisted data changes.
- `src/components/analytics/PlatformTelemetry.tsx` tracks real page views / checkout starts and bootstraps optional Firestore synchronization.

### Store Builder Layer

- `src/lib/editor.ts` centralizes:
  - block types
  - store profile model
  - local draft persistence
  - local store catalog persistence
- `src/components/editor/BlockPreview.tsx` renders editor block previews and default templates.

### Page Layer

- `src/pages/EditorPage.tsx` manages the guided builder, store/funnel/page modes, drag-and-drop composition, per-funnel-page visual editing, and conversion guidance UI.
- `src/pages/PreviewPage.tsx` renders the saved commercial profile into the storefront preview.

### Page Builder Module

- `src/builders/page-builder/sidebar/*` renders the left inspector and draggable element library.
- `src/builders/page-builder/topbar/*` renders history, preview/publish, and responsive controls.
- `src/builders/page-builder/canvas/*` renders the nested visual canvas and drop zones.
- `src/builders/page-builder/block-engine/*` contains the page schema, element catalog, immutable tree helpers, and `page_json` serialization helpers.
- `src/builders/page-builder/state-manager/*` contains the editor state hook for history, selection, device mode, and drag-drop mutations.
- `src/builders/page-builder/blocks/*` remains as compatibility re-exports for the current internal import surface.
- `src/builders/page-builder/renderer/renderBlock.tsx` delegates to the shared block renderer.

### Funnel Builder Module

- `src/builders/funnel-builder/schema.ts` re-exports the shared funnel model and helpers.
- `src/builders/funnel-builder/FunnelBuilderEditor.tsx` renders the interactive canvas, node cards, previews, analytics, pan/zoom, duplicate/delete actions, and connection UX.

### Store Builder Module

- `src/builders/store-builder/schema.ts` re-exports the shared product/store model and helper factories.
- `src/builders/store-builder/StoreBuilderEditor.tsx` renders the store configuration workspace for catalog, order bumps, currencies, domains, and collections.

### Shared Builder Engine

- `src/builders/shared/models/page.ts` is the canonical page-builder schema and factories.
- `src/builders/shared/models/funnel.ts` is the canonical funnel graph schema and helpers, including per-page `contentJson` persistence.
- `src/builders/shared/models/product.ts` is the canonical product/store schema and helpers.
- `src/builders/shared/components/*` provides shared editor shells for `canvas`, `toolbar`, `sidebar`, `blocks`, `editor`, plus the shared `renderBlock(block)` renderer.

### UI Layer

- `src/components/ui/*` contains shared shadcn-style primitives.

## Datos Y Persistencia

- Auth session persistence is handled by Firebase browser local persistence.
- Store drafts are stored in browser `localStorage`.
- Product catalog data for `/products` is stored in browser `localStorage`.
- Funnel catalog data for `/funnels` is stored in browser `localStorage`.
- Store catalog data for `/stores` is stored in browser `localStorage`.
- Each draft stores:
  - funnel blocks
  - store commercial profile
  - page builder nested layout JSON
  - page builder layouts keyed by `pageId`
  - funnel graph nodes, per-page records, and connections
  - store builder products, bundles, collections, and checkout settings
  - timestamps
- Additional browser storage also persists:
  - COD orders
  - contacts captured from COD submissions
  - bundle and discount offers
  - workspace settings
- When Firebase config is available, platform operational data is also mirrored to Firestore and merged back into local state on app bootstrap.
- A browser-side store catalog is also stored in `localStorage` for dashboard and editor-adjacent flows.
- A browser-side product catalog is also stored in `localStorage` with seeded fallback data for the products module.
- A browser-side funnel catalog is also stored in `localStorage` with seeded fallback data for the funnels module.
- A browser-side store catalog for `/stores` is also stored in `localStorage` with seeded fallback data for the stores module.
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
- Dashboard and superadmin operations are still browser-local and do not yet map to a shared backend source of truth.
- There is still no backend API for stores, orders, or publishing.

## Convenciones Para Cambios Futuros

- Treat this file as the architectural source of truth.
- If routes, auth flow, integrations, dependencies, hosting, or persistence behavior change, update this file in the same commit.
