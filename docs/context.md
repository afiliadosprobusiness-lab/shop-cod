# Context

## Resumen

ShopCOD is a frontend SPA for COD-focused funnel selling. It now includes Firebase Authentication for access control and is configured to run on Vercel with SPA rewrites.

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

- Firebase project created for auth: `shopcod-auth-20260304`
- Web app: `shopcod-web`
- Usage scope:
  - Firebase Authentication only
- Current auth methods wired in the frontend:
  - Email/password
  - Google popup

Operational note:

- Firebase CLI does not directly finish sign-in method toggles in this repo workflow.
- Email/Password and Google must be enabled in Firebase Console.
- Add `shop-cod.vercel.app` and any custom domain to Firebase Authorized Domains.

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

### Protected Access Flow

1. User navigates to `/dashboard`, `/orders`, `/editor/:storeId`, or `/preview/:storeId`.
2. `ProtectedRoute` checks Firebase auth state.
3. If unauthenticated, app redirects to `/login`.
4. After success, user returns to the intended route.

### Store Creation Flow

1. User opens `/dashboard`.
2. User clicks `Nueva Tienda`.
3. App navigates to `/editor/new`.
4. Editor boots with default blocks and can save locally.

### Editor Persistence Flow

1. User edits blocks in `/editor/:storeId`.
2. `Guardar` stores the draft in `localStorage`.
3. `Preview` saves the current draft and opens `/preview/:storeId`.
4. `Publicar` stores a local `publishedAt` timestamp.

### Demo Commerce Flow

1. User opens `/store/demo`.
2. CTA navigates to `/checkout`.
3. Checkout validates fields locally.
4. App navigates to `/order-confirmed`.

## Arquitectura

### Auth Layer

- `src/lib/firebase.ts` initializes Firebase app and auth.
- `src/lib/auth.tsx` exposes auth context and Firebase-backed session methods.
- `src/components/auth/ProtectedRoute.tsx` gates private routes.

### Page Layer

- `src/pages/*` contains route-level views.
- The previously disconnected pages are now wired into the router where relevant.

### Editor Layer

- `src/lib/editor.ts` centralizes block types and draft persistence.
- `src/components/editor/BlockPreview.tsx` renders block previews and defaults.

### UI Layer

- `src/components/ui/*` contains shared shadcn-style primitives.

## Datos Y Persistencia

- Auth session persistence is handled by Firebase browser local persistence.
- Editor drafts and publish timestamps are stored in browser `localStorage`.
- Dashboard and orders still use mock in-memory fixtures.
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

- Login success depends on Firebase sign-in methods being enabled in Firebase Console.
- Google popup on deployed domains requires Authorized Domains to include the Vercel domain.
- The build currently produces a large JS chunk and may benefit from later code-splitting.
- There is still no backend API for stores, orders, or publishing.

## Convenciones Para Cambios Futuros

- Treat this file as the architectural source of truth.
- If routes, auth flow, integrations, dependencies, hosting, or env vars change, update this file in the same commit.
