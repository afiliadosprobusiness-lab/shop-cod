# Contract

## Scope

ShopCOD expone un frontend SPA para un flujo de **single-product funnel**:

- Create Funnel
- Add Product
- Edit Landing Page
- Publish Funnel
- Receive Orders
- View Orders Dashboard

No define backend API propia; la persistencia funcional actual es local en navegador.

## Browser Route Contract

### `GET /`

- Landing principal del producto SaaS funnel-only.
- Componente: `Index`.

### `GET /login`

- Login con Firebase Auth.
- Componente: `LoginPage`.

### `GET /register`

- Registro con Firebase Auth.
- Componente: `LoginPage`.

### `GET /f/:slug`

- Landing page publica del funnel publicado.
- Componente: `PublicLandingPage`.

### `GET /f/:slug/checkout`

- Checkout publico autogenerado desde producto del funnel.
- Componente: `PublicCheckoutPage`.

### `GET /f/:slug/thank-you`

- Thank you page post compra/confirmacion.
- Componente: `PublicThankYouPage`.

### Protected Dashboard Shell Routes

Todas las rutas privadas pasan por auth y `DashboardLayout`.

### `GET /dashboard`

- Home del sistema funnel-only.
- Componente: `DashboardHomePage`.

### `GET /funnels`

- Lista y creacion de funnels.
- Componente: `FunnelsPage`.
- Al crear funnel, abre automaticamente el editor del funnel creado.
- Incluye accion de borrado de funnel (elimina producto, paginas y pedidos asociados).

### `GET /funnels/:funnelId/editor`

- Editor simple de funnel.
- Componente: `FunnelWorkspacePage`.
- Incluye:
  - wizard guiado por pasos
  - paso 1: seleccionar/crear producto + divisa (opcional, con accion de omitir)
  - paso 2: editor visual modular (`EditorShell`, `TopBar`, `LeftSidebar`, `CanvasWysiwyg`, `OverlayLayer`, `PropertiesPanel`)
  - modelo de pagina: `Page -> Sections -> Columns -> Elements`
  - `Elements/Sections` con insercion por click al canvas
  - canvas WYSIWYG de pagina real (hero/text/button/image/section/columns), no lista outline
  - seleccion + hover por `data-node-id` sobre contenido real con overlays absolutos (tooltip/handles)
  - historial (undo/redo) de estructura/propiedades
  - scaffolding de drop indicators y mutaciones para drag&drop interno
  - `PropertiesPanel` contextual editable para `Text`, `Image`, `Button`, `Section` y `Columns`
  - shortcuts desktop de historial: `Ctrl/Cmd+Z`, `Ctrl/Cmd+Y`, `Ctrl/Cmd+Shift+Z`
  - autosave debounced en el editor de paso 2 con indicador `saving/saved/error`
  - `Save`, `Volver` y `Continuar` ejecutan flush de guardado pendiente
  - paso 3: configuracion de upsell, bundle y descuento
  - accion publicar/despublicar
  - `Publicar funnel` expone feedback de estado (`publishing/published/error`) y marca de tiempo
  - enlaces publicos de landing/checkout/thank-you
  - guardado automatico de cambios en pasos de edicion
  - en mobile: modo solo metricas (sin edicion)

### `GET /orders`

- Dashboard de pedidos con filtro por funnel.
- Componente: `OrdersPage`.
- Columnas:
  - `customer_name`
  - `phone`
  - `product`
  - `payment_type`
  - `order_status`
  - `created_at`

### `GET /settings`

- Ajustes del workspace (legacy activo).

### Legacy routes

- El repositorio conserva rutas legacy para compatibilidad tecnica, fuera del contrato operativo principal funnel-only.

## Data Contract (Frontend Local DB)

Definido en `src/lib/funnel-system.ts`.

### `users`

```ts
interface UserRow {
  id: string;
  email: string;
  password: string;
}
```

### `funnels`

```ts
interface FunnelRow {
  id: string;
  name: string;
  slug: string;
  user_id: string;
  currency: "USD" | "EUR" | "PEN";
  created_at: string;
  published_at: string | null;
}
```

### `products`

```ts
interface ProductRow {
  id: string;
  funnel_id: string;
  name: string;
  price: number;
  type: "physical" | "digital";
  payment_type: "stripe" | "paypal" | "cash_on_delivery";
}
```

Rule:

- `products` es 0..1 por funnel (si existe, sigue siendo un solo producto por funnel).
- el wizard puede reutilizar productos existentes del usuario para rellenar el paso 1.

### `pages`

```ts
interface PageRow {
  id: string;
  funnel_id: string;
  type: "landing" | "checkout" | "thankyou";
  content_json: string;
}
```

Landing JSON:

```json
{
  "sections": [
    { "type": "headline", "content": "Amazing Product" },
    { "type": "image", "src": "image.jpg" },
    { "type": "button", "text": "Buy Now" }
  ]
}
```

Bloques permitidos:

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

### `orders`

```ts
interface OrderRow {
  id: string;
  funnel_id: string;
  product_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  payment_type: "stripe" | "paypal" | "cash_on_delivery";
  status: "new" | "processing" | "shipped" | "completed";
  created_at: string;
}
```

### `offers` (wizard paso 3)

```ts
interface FunnelOfferRow {
  id: string;
  funnel_id: string;
  upsell_enabled: boolean;
  upsell_name: string;
  upsell_price: number;
  bundle_enabled: boolean;
  bundle_name: string;
  bundle_quantity: number;
  bundle_discount_percentage: number;
  discount_enabled: boolean;
  discount_percentage: number;
  discount_code: string;
}
```

## Checkout Rules Contract

- Siempre muestra producto y precio.
- Si `payment_type` es `stripe` o `paypal`: mostrar boton de pago.
- Si `payment_type` es `cash_on_delivery`: exigir `name`, `phone`, `address`, `city` y boton `Confirm Order`.

## Persistence Contract

- Key principal: `shopcod-funnel-system-db-v1` (`localStorage`).
- No backend API persistente activa en runtime actual.
- SQL de referencia para backend futuro: `docs/funnel_schema.sql`.

## Environment Contract

Required Vite env vars:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Change Guard

Cambios breaking que requieren versionado/coordinacion:

- Renombrar o eliminar `/f/:slug`, `/f/:slug/checkout`, `/f/:slug/thank-you`.
- Permitir mas de un producto por funnel.
- Renombrar estados de `orders.status`.
- Cambiar tipos permitidos de `pages.type` o bloques de landing sin migracion.
- Cambiar shape de filas base (`funnels/products/pages/orders`) sin migracion.

## Changelog del Contrato

- 2026-03-05 | Se redefine el contrato operativo a sistema funnel-only de producto unico con rutas publicas `/f/:slug*`, editor simple por bloques y dashboard de pedidos por funnel | non-breaking | Alinea contrato al nuevo flujo principal sin eliminar rutas legacy de compatibilidad
- 2026-03-05 | Se expande el editor basico con bloques `hero/section/footer/cod_form`, se agrega borrado de funnel y creacion con apertura directa del editor | non-breaking | Mejora UX operativa sin cambiar rutas ni romper modelos base
- 2026-03-05 | `/funnels/:funnelId/editor` evoluciona a wizard guiado con paso de producto/divisa, landing drag&drop y paso de ofertas (upsell/bundle/descuento) | non-breaking | Mantiene rutas y persistencia local, mejora la experiencia paso a paso
- 2026-03-05 | Paso 2 adopta editor visual de 3 paneles dentro del layout actual y se bloquea edicion en mobile (solo metricas) | non-breaking | Refuerza UX de escritorio sin romper rutas ni contratos de datos
- 2026-03-05 | Paso 2 mejora UX con tabs `Elements/Sections`, buscador, presets basicos de diseno, duplicado de bloque y overlay visual en drag | non-breaking | Mantiene modelo de datos y rutas, mejora velocidad de edicion en escritorio
- 2026-03-05 | Se corrige insercion de bloques con drag&drop al canvas y se agrega fallback por click en `Elements` | non-breaking | Evita perdida de insercion por deteccion de drop y mejora confiabilidad del editor
- 2026-03-05 | Refactor inicial del editor a arquitectura modular con modelo `Page -> Sections -> Columns -> Elements`, seleccion/hover/outlines e historial base | non-breaking | Prepara base mantenible para drag&drop avanzado y panel de propiedades editable
- 2026-03-05 | Paso 2 agrega handles contextuales en canvas para mover/duplicar/borrar nodos seleccionados | non-breaking | Mejora sensacion de builder profesional manteniendo compatibilidad de datos
- 2026-03-05 | Paso 2 activa drag&drop real en arquitectura modular (insertar desde sidebar, mover/reordenar en canvas con drop indicators) | non-breaking | Completa MVP de interaccion builder sin cambiar rutas ni modelos de datos
- 2026-03-05 | Paso 4 habilita edicion de propiedades contextual en el panel derecho para nodos clave del builder | non-breaking | Permite ajustar contenido y layout sin romper el modelo ni el flujo de autosave
- 2026-03-05 | Paso 5 mejora historial con merge inteligente para escritura en propiedades y shortcuts de undo/redo | non-breaking | Hace el editor mas usable sin cambiar rutas ni contratos de datos
- 2026-03-05 | Paso 6 mueve autosave al builder con debounce + flush en acciones de salida/guardado | non-breaking | Reduce condiciones de carrera y mejora confiabilidad del guardado de landing
- 2026-03-05 | Paso 1 del wizard permite omitir configuracion de producto para casos landing-only | non-breaking | Mantiene compatibilidad del modelo y habilita uso sin checkout de producto
- 2026-03-05 | Se refuerza publicacion del funnel con feedback visual de estado y timestamp en paso 3 | non-breaking | Hace observable el resultado de publicar y reduce confusion de UX
- 2026-03-05 | Inicio de migracion a canvas WYSIWYG real (Paso 1): render de pagina + overlay layer + seleccion por event delegation | non-breaking | Reemplaza experiencia tipo lista por edicion visual y prepara drag/drop de siguientes pasos
