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

1. Crear funnel por nombre (`/funnels`) -> se crean 3 paginas (`landing`, `checkout`, `thankyou`) y se abre editor automaticamente.
2. Configurar producto unico (`/funnels/:funnelId/editor`) con wizard guiado:
  - seleccionar producto existente o crear producto nuevo
  - `product_name`
  - `price`
  - `product_type`
  - `payment_type`
  - `currency`
3. Editar landing en paso 2 con editor visual dentro del layout actual:
  - sidebar izquierda (biblioteca de bloques arrastrables)
  - canvas central (drop/reorder)
  - panel derecho (propiedades del bloque seleccionado)
  - guardado automatico
  - selector de preview desktop/tablet/mobile
4. En mobile no se permite editar; solo se muestran metricas/analisis.
5. Configurar ofertas en paso 3:
  - upsell
  - bundle
  - descuento
6. Publicar funnel desde el editor.
7. Checkout autogenerado desde producto en `/f/:slug/checkout`.
8. Registrar pedido y ver tabla en `/orders`.
9. Desde `/funnels` se puede borrar funnel completo (con producto, paginas y pedidos).

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
