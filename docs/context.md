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
  - `Store builder` for product, offer, and commercial setup
  - `Funnel builder` for drag-and-drop sequencing
  - `Page builder` for page-level refinement on the same block set
3. User edits the store commercial profile in the store builder panel.
4. The editor behaves as a visual funnel workspace with:
  - drag-and-drop ordering
  - block library grouped by funnel stage
  - funnel map navigation
  - contextual insertion suggestions
  - heuristic conversion score and quick-win guidance
5. `Aplicar al funnel` syncs the profile into hero, CTA, FAQ, benefits, and checkout copy.
6. `Guardar` stores blocks and profile in browser storage.

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

### UI Layer

- `src/components/ui/*` contains shared shadcn-style primitives.

## Datos Y Persistencia

- Auth session persistence is handled by Firebase browser local persistence.
- Store drafts are stored in browser `localStorage`.
- Each draft stores:
  - funnel blocks
  - store commercial profile
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
