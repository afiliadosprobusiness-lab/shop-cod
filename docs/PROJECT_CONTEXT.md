# PROJECT_CONTEXT

## Estado Actual

- Proyecto: ShopCOD
- Enfoque: SIMPLE funnel builder de producto unico
- Objetivo operativo:
  - crear funnel
  - agregar 1 producto
  - editar landing por bloques verticales
  - publicar funnel
  - recibir pedidos
  - gestionar pedidos por estado

## Stack

- Vite + React + TypeScript
- Tailwind + shadcn-ui
- React Router
- Firebase Auth
- Vitest

## Rutas Activas Principales

Publicas:

- `/`
- `/login`
- `/register`
- `/f/:slug`
- `/f/:slug/checkout`
- `/f/:slug/thank-you`

Privadas:

- `/dashboard`
- `/funnels`
- `/funnels/:funnelId/editor`
- `/orders`
- `/settings`

Legacy:

- Se mantienen rutas antiguas para compatibilidad tecnica, fuera del flujo funnel-only principal.

## Flujo Principal

1. Crear funnel por nombre (`/funnels`) -> se crean 3 paginas (`landing`, `checkout`, `thankyou`).
2. Configurar producto unico (`/funnels/:funnelId/editor`) con:
  - `product_name`
  - `price`
  - `product_type`
  - `payment_type`
3. Editar landing en orden vertical con bloques permitidos:
  - `headline`, `text`, `image`, `video`, `button`, `testimonials`, `faq`
4. Publicar funnel desde el editor.
5. Checkout autogenerado desde producto en `/f/:slug/checkout`.
6. Registrar pedido y ver tabla en `/orders`.

## Persistencia

- Base frontend local en `localStorage`:
  - `users`
  - `funnels`
  - `products`
  - `pages`
  - `orders`
- Modulo: `src/lib/funnel-system.ts`
- SQL de referencia: `docs/funnel_schema.sql`

## Notas Operativas

- Los pedidos usan estados: `new`, `processing`, `shipped`, `completed`.
- `products` es 1:1 con `funnels` (producto unico por funnel).
- No hay backend API persistente para funnels/pedidos en runtime actual.
- Este archivo resume `docs/context.md` y debe mantenerse alineado.
