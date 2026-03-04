# Context

## Resumen

ShopCOD is a frontend-only single page application that prototypes a COD-focused funnel builder for LATAM sellers. The current product is a clickable demo with mocked data and in-memory editor state.

## Stack Tecnologico

- Vite 5
- React 18
- TypeScript
- React Router DOM 6
- Tailwind CSS 3
- shadcn-ui / Radix UI components
- Framer Motion
- dnd-kit
- TanStack Query (provider mounted, no remote queries implemented yet)
- Vitest + Testing Library

## Punto De Entrada

- `src/main.tsx` mounts the React app into `#root`.
- `src/App.tsx` wraps the app with:
  - `QueryClientProvider`
  - `TooltipProvider`
  - shadcn `Toaster`
  - Sonner toaster
  - `BrowserRouter`

## Rutas Principales

- `/`
  - Marketing landing page for the SaaS offer.
  - Current component: `SaaSLandingPage`.
- `/dashboard`
  - Mock dashboard listing stores and summary metrics.
  - Current component: `DashboardPage`.
- `/editor/:storeId`
  - Drag-and-drop visual editor for funnel blocks.
  - Current component: `EditorPage`.
- `/preview/:storeId`
  - Public-facing storefront preview.
  - Current component: `PreviewPage`.
- `*`
  - Fallback not found route.
  - Current component: `NotFound`.

## Flujos Principales

### Acquisition Flow

1. User lands on `/`.
2. User clicks a primary CTA.
3. App navigates to `/dashboard`.

### Store Creation Flow

1. User opens `/dashboard`.
2. User clicks `Nueva Tienda` or `Crear nueva tienda`.
3. App navigates to `/editor/new`.
4. Editor boots with a minimal default block set.

### Store Editing Flow

1. User opens `/dashboard`.
2. User clicks `Editar` on a store card.
3. App navigates to `/editor/:storeId`.
4. User can reorder blocks, add blocks, delete blocks, and edit block field values in memory.

### Preview Flow

1. User opens `/editor/:storeId`.
2. User clicks `Preview`.
3. App navigates to `/preview/:storeId`.
4. Preview renders a static product layout with mock content.

## Arquitectura

### Page Layer

- `src/pages/*` contains the route-level views.
- Some additional page files exist (`LandingPage`, `CheckoutPage`, `OrderConfirmedPage`, `AdminDashboard`, `Index`) but they are not wired into `src/App.tsx` right now.

### UI Layer

- `src/components/ui/*` contains shadcn-style primitives and wrappers.
- `src/components/editor/BlockPreview.tsx` centralizes visual rendering and default field maps for editor blocks.

### Utility Layer

- `src/lib/utils.ts` provides shared helpers such as `cn()`.
- `src/hooks/*` contains lightweight UI hooks.

## Datos Y Persistencia

- No backend is connected.
- No remote fetches are performed.
- No auth flow exists.
- Dashboard data is mocked in-page.
- Editor data is in component state only.
- Preview content is static and not hydrated from editor state.

## Integraciones Externas

- None at runtime.
- The repository includes Lovable-generated scaffolding remnants in docs/metadata, but the running app does not depend on Lovable services.

## Variables De Entorno

- None required at this stage.

## Restricciones Y Riesgos

- Because the app uses `BrowserRouter`, static hosting must rewrite unknown paths to `index.html`.
- Current save/publish actions are non-functional placeholders.
- Some UI text shows mojibake characters, which indicates an encoding cleanup is still needed.
- Several existing pages are not reachable from the current router and can drift if not maintained intentionally.

## Convenciones Para Cambios Futuros

- Treat this file as the architectural source of truth.
- If routes, flows, integrations, dependencies, or env vars change, update this file in the same commit.
