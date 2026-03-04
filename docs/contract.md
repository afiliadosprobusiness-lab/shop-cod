# Contract

## Scope

This repository is currently a frontend-only SPA built with Vite, React, TypeScript, Tailwind CSS, shadcn-ui, and React Router.

There is no backend integration implemented in the current codebase. No `fetch`, no external API client, and no persisted data flow exist yet.

## Browser Route Contract

### `GET /`

- Renders the marketing landing page for the ShopCOD SaaS product.
- Component: `SaaSLandingPage`.
- Primary CTAs navigate to `/dashboard`.

### `GET /dashboard`

- Renders the internal dashboard with mock store metrics and store cards.
- Component: `DashboardPage`.
- Data source: in-memory mock array inside the page component.

### `GET /editor/:storeId`

- Renders the funnel editor for a store.
- Component: `EditorPage`.
- Route param:
  - `storeId: string`
- Special case:
  - `storeId === "new"` initializes a reduced default block set for new store creation.
- Any other `storeId` initializes a richer predefined mock block set.

### `GET /preview/:storeId`

- Renders a storefront preview for the current store.
- Component: `PreviewPage`.
- Route param:
  - `storeId: string`
- Current behavior is presentational only; the preview does not load store-specific persisted data.

### `GET *`

- Renders the fallback 404 page.
- Component: `NotFound`.

## Shared UI Data Contract

### Funnel Block Model

Defined in `src/pages/EditorPage.tsx`.

```ts
type BlockType = "hero" | "problem" | "benefits" | "reviews" | "faq" | "checkout" | "cta";

interface FunnelBlock {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}
```

Rules:

- `id` must be unique within the in-memory editor session.
- `type` must be one of the supported block types above.
- `data` is a string map that must match the editable fields expected by `BlockPreview` for the selected block type.

## State And Persistence Contract

- All current state is client-side only.
- Editor changes are stored in React state and are lost on refresh.
- The `Guardar` and `Publicar` buttons are UI placeholders and do not persist or publish data.
- Dashboard metrics and store records are mock fixtures.

## Environment Contract

- No environment variables are required by the current implementation.
- No server secrets should be introduced into this repository.

## Change Guard

The following are breaking changes and must be versioned or coordinated before implementation:

- Removing or renaming existing public routes.
- Changing the `:storeId` route param shape.
- Renaming or removing any supported `BlockType`.
- Changing `FunnelBlock.data` away from a string map without updating all consumers.

## Changelog del Contrato

- 2026-03-04 | Creacion inicial del contrato del frontend SPA actual | non-breaking | Documenta el comportamiento existente sin cambiar runtime
