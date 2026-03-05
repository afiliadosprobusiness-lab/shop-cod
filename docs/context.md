# Context

## Resumen

ShopCOD ahora opera como un **SIMPLE funnel builder** de producto unico.  
El flujo principal es:

1. Crear funnel (nombre).
2. Crear producto unico del funnel.
3. Editar landing page con bloques verticales simples.
4. Publicar funnel.
5. Recibir y gestionar pedidos por funnel.

No se agregan ni amplian funcionalidades de ecommerce multi-producto.

## Stack Tecnologico

- Vite 5
- React 18
- TypeScript
- React Router DOM 6
- Tailwind CSS 3
- shadcn-ui / Radix UI
- Firebase Auth (sesion/autenticacion)
- Vitest

## Integraciones Activas

### Firebase

- Proyecto: `shopcod-auth-20260304`
- Uso activo:
  - Firebase Authentication (login/register/protected routes)

### Vercel

- Proyecto: `shop-cod`
- `vercel.json` mantiene rewrite SPA a `index.html`

## Punto De Entrada

- `src/main.tsx` monta React en `#root`
- `src/App.tsx` configura providers y rutas

## Rutas Principales

### Publicas

- `/` -> landing simple del SaaS funnel-only (`Index`)
- `/login` -> login Firebase (`LoginPage`)
- `/register` -> registro Firebase (`LoginPage`)
- `/f/:slug` -> landing publicada de funnel (`PublicLandingPage`)
- `/f/:slug/checkout` -> checkout autogenerado por producto (`PublicCheckoutPage`)
- `/f/:slug/thank-you` -> confirmacion (`PublicThankYouPage`)

### Privadas

- `/dashboard` -> home funnel workflow (`DashboardHomePage`)
- `/funnels` -> listado + creacion de funnels (`FunnelsPage`)
- `/funnels/:funnelId/editor` -> editor simple de funnel (`FunnelWorkspacePage`)
- `/orders` -> dashboard de pedidos por funnel (`OrdersPage`)
- `/settings` -> ajustes de workspace (`SettingsPage`, legado activo)

### Legacy (compatibilidad)

Se mantienen rutas legacy del repo para compatibilidad tecnica, pero no forman parte del flujo funnel-only principal.

## Flujos Principales

### Funnel Creation Flow

1. Usuario entra a `/funnels`.
2. Ingresa nombre y crea funnel.
3. El sistema abre inmediatamente `/funnels/:funnelId/editor`.
4. El sistema genera automaticamente 3 paginas:
  - `landing`
  - `checkout`
  - `thankyou`
5. Desde el listado tambien puede borrar un funnel completo (incluye producto/paginas/pedidos asociados).

### Product Flow (one product per funnel)

1. Usuario abre `/funnels/:funnelId/editor`.
2. Paso 1 del wizard:
  - puede seleccionar producto existente o crear uno nuevo
3. Configura:
  - `product_name`
  - `price`
  - `product_type` (`physical` | `digital`)
  - `payment_type` (`stripe` | `paypal` | `cash_on_delivery`)
  - `currency` (`USD` | `EUR` | `PEN`)
4. Si ya existe producto, se actualiza el mismo registro (unicidad por funnel).

### Landing Editor Flow

1. Paso 2 del wizard abre el editor de landing.
2. El editor se muestra dentro del layout actual con:
  - panel izquierdo (biblioteca de elementos drag&drop)
  - canvas central (drop/reorder visual)
  - panel derecho (propiedades del bloque seleccionado)
  - guardado automatico con estado visible
3. El editor soporta drag&drop vertical para reordenar bloques.
4. Bloques permitidos:
  - `hero`
  - `section`
  - `headline`
  - `text`
  - `image`
  - `video`
  - `button`
  - `testimonials`
  - `faq`
  - `cod_form`
  - `footer`
5. Se guarda JSON en `pages.content_json`.

### Mobile Policy

1. En mobile no se permite editar funnels.
2. `/funnels/:funnelId/editor` muestra solo metricas/analisis.
3. La edicion completa queda reservada para escritorio.

### Offers Flow

1. Paso 3 del wizard permite configurar:
  - `upsell`
  - `bundle`
  - `discount`
2. Configuracion se persiste por funnel en almacenamiento local.

### Checkout Flow

1. Checkout se genera desde el producto del funnel.
2. Muestra nombre, precio y formulario.
3. Reglas de pago:
  - `stripe`/`paypal`: boton de pago y registro de orden.
  - `cash_on_delivery`: campos `name`, `phone`, `address`, `city` + boton `Confirm Order`.
4. Tras enviar, navega a thank you y persiste orden.

### Orders Flow

1. Usuario abre `/orders`.
2. Tabla por funnel con columnas:
  - `customer_name` (mapeado desde `orders.name`)
  - `phone`
  - `product`
  - `payment_type`
  - `order_status`
  - `created_at`
3. Estados permitidos:
  - `new`
  - `processing`
  - `shipped`
  - `completed`

## Arquitectura

### Data Layer (frontend local database)

- `src/lib/funnel-system.ts` centraliza el modelo tipo tablas:
  - `users`
  - `funnels`
  - `products`
  - `pages`
  - `orders`
- Persistencia en `localStorage` (`shopcod-funnel-system-db-v1`)
- Emite `shopcod:data-updated` para refrescar UI

### Dashboard Layer

- `src/layouts/DashboardLayout.tsx`
- `src/components/dashboard/navigation.ts` (menu simplificado: Inicio, Funnels, Pedidos, Configuracion)
- `src/pages/dashboard/FunnelsPage.tsx`
- `src/pages/funnel/FunnelWorkspacePage.tsx`
- `src/pages/dashboard/OrdersPage.tsx`

### Public Funnel Layer

- `src/pages/funnel/PublicLandingPage.tsx`
- `src/pages/funnel/PublicCheckoutPage.tsx`
- `src/pages/funnel/PublicThankYouPage.tsx`

## Datos Y Persistencia

- Auth session: Firebase local persistence
- Funnel database: `localStorage`
- No backend API ni base de datos de servidor activa en runtime
- SQL de referencia de tablas: `docs/funnel_schema.sql`

## Variables De Entorno

Required:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Restricciones Y Riesgos

- Persistencia local (no multi-dispositivo real para funnels/pedidos)
- Sin backend de pagos real (checkout es flujo demo operativo local)
- La compatibilidad legacy permanece en rutas no principales

## Convenciones Para Cambios Futuros

- Mantener enfoque single-product funnel
- Evitar features de store/catalogo/carrito/inventario multi-producto
- Si cambian rutas/flujos/modelos/env vars, actualizar este archivo y `docs/PROJECT_CONTEXT.md` en el mismo commit
