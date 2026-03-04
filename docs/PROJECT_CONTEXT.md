# PROJECT_CONTEXT

## Estado Actual

- Proyecto: ShopCOD
- Tipo: frontend SPA
- Estado funcional: frontend navegable con auth en Firebase, shell SaaS protegido y flujos visuales legacy para editor/preview

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui / Radix UI
- React Router
- Framer Motion
- dnd-kit
- TanStack Query
- Firebase Auth
- Vitest

## Rutas Activas

- `/` -> landing SaaS
- `/login` -> login con Firebase
- `/store/demo` -> landing demo de producto
- `/checkout` -> checkout demo
- `/order-confirmed` -> confirmacion de compra
- `/dashboard` -> home del panel SaaS protegido
- `/products` -> modulo protegido de productos
- `/products/new` -> alta protegida de producto
- `/funnels` -> modulo protegido de funnels
- `/stores` -> modulo protegido de tiendas
- `/stores/:storeId` -> panel interno protegido de cada tienda
- `/orders` -> modulo protegido de pedidos
- `/analytics` -> modulo protegido de analiticas
- `/contacts` -> modulo protegido de contactos
- `/offers` -> modulo protegido de ofertas
- `/apps` -> modulo protegido de aplicaciones
- `/settings` -> modulo protegido de configuracion
- `/editor/:storeId` -> editor visual protegido
- `/preview/:storeId` -> preview protegido
- `*` -> 404

## Flujos Operativos

- Inicio de sesion: `/login` con email/password o Google
- Rutas privadas: redirigen a `/login` si no hay sesion
- Shell del panel: `DashboardLayout` monta sidebar izquierda, topbar superior y contenido dinamico con `Outlet`
- Home del panel: `/dashboard` muestra dos tarjetas principales (`Crear tienda online` y `Crear funnel`) con CTA `Comenzar`
- Navegacion entre modulos: el sidebar enlaza `Inicio`, `Productos`, `Funnels`, `Tiendas`, `Pedidos`, `Analiticas`, `Contactos`, `Ofertas`, `Aplicaciones` y `Configuracion`
- Topbar: mantiene buscador global, selector de workspace, notificaciones y avatar del usuario en todos los modulos
- Modulos internos: `/products`, `/funnels`, `/stores`, `/orders`, `/analytics`, `/contacts`, `/offers`, `/apps` y `/settings` reutilizan el mismo layout compartido
- Productos: `/products` ahora muestra tabla con buscador, filtros y acciones; `/products/new` crea productos con formulario dividido en informacion, detalles, configuracion e incrementos de pedido
- Funnels: `/funnels` ahora muestra listado con preview, conversion y visitas, e incluye wizard de 3 pasos para crear funnels y redirigir al editor
- Tiendas: `/stores` ahora muestra listado con preview, metodo de pago y cantidad de paginas, e incluye wizard de 3 pasos para crear tiendas con plantilla, pagos y configuracion
- Dashboard interno de tienda: `/stores/:storeId` muestra navegacion interna por secciones y un resumen con metricas, top productos y fuentes de trafico derivadas del estado local
- Editor: el flujo visual existente sigue disponible en `/editor/:storeId` con `Store builder`, `Funnel builder` y `Page builder`; cada nodo/pagina del funnel abre su propia vista del Page Builder
- Preview: sigue disponible en `/preview/:storeId` para revisar drafts por `storeId`

## Integraciones

- Firebase solo para autenticacion
- Proyecto Firebase: `shopcod-auth-20260304`
- Vercel para hosting SPA
- Proyecto Vercel vinculado: `shop-cod`

## Variables De Entorno

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Notas Operativas

- Las envs publicas de Firebase ya fueron cargadas en Vercel para `Production` y `Preview`.
- El shell del dashboard vive en `src/layouts/DashboardLayout.tsx`.
- Los componentes del shell viven en `src/components/dashboard/*` (`Sidebar`, `Topbar`, `MainContent` y `navigation`).
- El home del panel vive en `src/pages/dashboard/DashboardHomePage.tsx`.
- Los modulos genericos (`/orders`, `/analytics`, `/contacts`, `/offers`, `/apps`, `/settings`) comparten `src/pages/dashboard/DashboardModulePage.tsx`.
- El modulo real de productos vive en `src/pages/dashboard/ProductsPage.tsx`.
- El alta de productos vive en `src/pages/dashboard/ProductCreatePage.tsx`.
- El modelo y almacenamiento local de productos viven en `src/lib/products.ts`.
- El modulo real de funnels vive en `src/pages/dashboard/FunnelsPage.tsx`.
- El modelo, templates y almacenamiento local de funnels viven en `src/lib/funnels.ts`.
- El modulo real de tiendas vive en `src/pages/dashboard/StoresPage.tsx`.
- El panel interno por tienda vive en `src/pages/dashboard/StoreDashboardPage.tsx`.
- El modelo, templates, selector de pagos, almacenamiento local y analytics derivados de tiendas viven en `src/lib/stores.ts`.
- El editor visual y el preview legacy siguen operativos por ruta directa.
- El creador actual no depende de backend; los drafts viven en `localStorage`.
- El modulo visual del page builder vive en `src/builders/page-builder` y persiste su arbol de bloques dentro del mismo draft del editor, sincronizado por pagina del funnel.
- El page builder ahora se organiza en `canvas`, `sidebar`, `topbar`, `renderer`, `block-engine` y `state-manager`.
- El page builder ya soporta drag/drop desde sidebar, reordenamiento, duplicado, resize por bloque, nesting, tabs `Elements/Layers/Styles/Settings` y serializacion `page_json`.
- El modulo visual del funnel builder vive en `src/builders/funnel-builder` y persiste nodos/conexiones junto con `pages[]` (id, funnelId, type, contentJson) y los layouts por `pageId`.
- El funnel builder ahora soporta canvas infinito con zoom/pan/drag, nodos duplicables/eliminables, conexion visual y tipos de pagina extendidos (`product`, `checkout`, `upsell`, `downsell`, `thankyou`, `leadCapture`, `article`, `blank`).
- El modulo visual del store builder vive en `src/builders/store-builder` y persiste productos, bundles, order bumps, colecciones y checkout dentro del mismo draft.
- Los tres builders delegan modelos, renderer y shells reutilizables a `src/builders/shared`.
- Este archivo resume `docs/context.md` y debe mantenerse alineado con esa fuente de verdad.
