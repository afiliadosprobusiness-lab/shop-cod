# PROJECT_CONTEXT

## Estado Actual

- Proyecto: ShopCOD
- Tipo: frontend SPA
- Estado funcional: frontend navegable con auth en Firebase, shell SaaS protegido, superadmin con registro compartido Firestore (fallback local) y flujos visuales legacy para editor/preview

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
- Firebase Firestore (registro compartido de clientes superadmin)
- Vitest

## Rutas Activas

- `/` -> landing SaaS
- `/login` -> login con Firebase
- `/register` -> registro con Firebase
- `/superadmin` -> panel protegido de superadmin
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

- Landing: `/` ahora vende ShopCOD como sistema integral (builders, checkout COD, operacion, analiticas) y muestra planes `Starter`, `Pro` ($9.9/mes) y `Scale` ($50/mes)
- Auth: `/login` sirve para iniciar sesion y `/register` para crear cuentas; Google sigue disponible en ambos, y si el correo es `afiliadosprobusiness@gmail.com`, redirige al panel `/superadmin`; las sesiones no-root registran/actualizan automaticamente su workspace en el registro de clientes del superadmin
- Planes: el workspace ahora bloquea acciones segun el plan activo y muestra un modal de upgrade para subir localmente a `Pro` o `Scale` cuando corresponde
- Rutas privadas: redirigen a `/login` si no hay sesion
- Shell del panel: `DashboardLayout` monta sidebar izquierda, topbar superior y contenido dinamico con `Outlet`
- Home del panel: `/dashboard` muestra dos tarjetas principales (`Crear tienda online` y `Crear funnel`) con CTA `Comenzar`
- Navegacion entre modulos: el sidebar enlaza `Inicio`, `Productos`, `Funnels`, `Tiendas`, `Pedidos`, `Analiticas`, `Contactos`, `Ofertas`, `Aplicaciones` y `Configuracion`
- Topbar: mantiene buscador global, selector de workspace, notificaciones y avatar del usuario en todos los modulos
- Modulos internos: `/products`, `/funnels`, `/stores`, `/orders`, `/analytics`, `/contacts`, `/offers`, `/apps` y `/settings` reutilizan el mismo layout compartido, pero ya muestran vistas funcionales del negocio
- Productos: `/products` ahora muestra tabla con buscador, filtros, duplicado, borrado y metricas reactivas segun catalogo y pedidos reales
- Funnels: `/funnels` ahora muestra listado con preview, conversion y visitas, e incluye wizard de 3 pasos para crear funnels, abrir el editor y borrar funnels
- Tiendas: `/stores` ahora muestra listado con preview, metodo de pago y cantidad de paginas, e incluye wizard de 3 pasos para crear tiendas con plantilla, pagos, configuracion y borrado
- Dashboard interno de tienda: `/stores/:storeId` muestra navegacion interna por secciones y un resumen con metricas, top productos y fuentes de trafico derivadas del estado local
- Pedidos: `/orders` lista pedidos reales que entran desde el checkout COD y permite actualizar su estado
- Analiticas: `/analytics` consolida KPIs en tiempo real usando pedidos, contactos, productos, funnels y tiendas persistidos localmente
- Contactos: `/contacts` guarda los clientes capturados por el formulario COD y su historial comercial
- Ofertas: `/offers` permite crear bundles y descuentos persistidos localmente
- Aplicaciones: `/apps` muestra un estado de "Proximamente" para el marketplace de integraciones
- Configuracion: `/settings` ahora concentra secciones reales para cuenta, envio, miembros, facturacion, dominios, productos digitales, legal, correos, seguridad, pasarelas, seguimiento y webhooks, incluyendo la contrasena temporal protegida por modal de metodo de pago
- Editor: el flujo visual existente sigue disponible en `/editor/:storeId` con `Store builder`, `Funnel builder` y `Page builder`; cada nodo/pagina del funnel abre su propia vista del Page Builder
- Preview: sigue disponible en `/preview/:storeId` para revisar drafts por `storeId`

## Integraciones

- Firebase para autenticacion y sincronizacion compartida del registro de clientes superadmin
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
- `src/pages/dashboard/OrdersPage.tsx` renderiza el flujo operativo de pedidos reales.
- `src/pages/dashboard/AnalyticsPage.tsx` renderiza KPIs y tendencias comerciales en tiempo real.
- `src/pages/dashboard/ContactsPage.tsx` renderiza la base de clientes y leads capturados.
- `src/pages/dashboard/OffersPage.tsx` renderiza la gestion de bundles y descuentos.
- `src/pages/dashboard/AppsPage.tsx` renderiza el estado de proximas integraciones.
- `src/pages/dashboard/SettingsPage.tsx` renderiza el hub completo de configuracion del workspace con formularios, listas y modales operativos por seccion.
- `src/pages/SuperAdminPage.tsx` renderiza el panel root para activar, desactivar, cambiar de plan con un clic y eliminar clientes reales visibles, hidratando desde Firestore cuando esta disponible y manteniendo protegida la cuenta superadmin.
- `src/lib/auth.tsx` registra automaticamente workspaces no-root en el registro compartido del superadmin al autenticar usuarios.
- El modulo real de productos vive en `src/pages/dashboard/ProductsPage.tsx`.
- El alta de productos vive en `src/pages/dashboard/ProductCreatePage.tsx`.
- El modelo y almacenamiento local de productos viven en `src/lib/products.ts`.
- El modulo real de funnels vive en `src/pages/dashboard/FunnelsPage.tsx`.
- El modelo, templates y almacenamiento local de funnels viven en `src/lib/funnels.ts`.
- El modulo real de tiendas vive en `src/pages/dashboard/StoresPage.tsx`.
- El panel interno por tienda vive en `src/pages/dashboard/StoreDashboardPage.tsx`.
- El modelo, templates, selector de pagos, almacenamiento local y analytics derivados de tiendas viven en `src/lib/stores.ts`.
- Los pedidos, contactos, ofertas, configuracion global y el snapshot de analytics en tiempo real viven en `src/lib/platform-data.ts`.
- `src/lib/superadmin.ts` mantiene el registro local de clientes gestionados por el root, filtra cuentas demo legacy, registra workspaces autenticados, hidrata/sincroniza con Firestore cuando esta disponible y evita borrar o degradar la cuenta superadmin.
- `src/lib/plans.ts` centraliza limites y desbloqueos por plan para `Starter`, `Pro` y `Scale`.
- `src/lib/live-sync.ts` emite eventos locales para refrescar modulos en tiempo real cuando cambia la data persistida.
- `src/components/analytics/PlatformTelemetry.tsx` registra visitas reales, inicios de checkout y hace bootstrap de sincronizacion remota.
- El editor visual y el preview legacy siguen operativos por ruta directa.
- El creador actual no depende de backend; los drafts viven en `localStorage`.
- El checkout demo guarda pedidos y contactos reales en `localStorage`, y esos datos alimentan `Pedidos`, `Analiticas` y `Contactos`.
- `platform-data` ahora hace sincronizacion remota opcional con Firestore (mismo proyecto Firebase) cuando la configuracion esta disponible; `localStorage` sigue siendo el fallback inmediato.
- El modulo visual del page builder vive en `src/builders/page-builder` y persiste su arbol de bloques dentro del mismo draft del editor, sincronizado por pagina del funnel.
- El page builder ahora se organiza en `canvas`, `sidebar`, `topbar`, `renderer`, `block-engine` y `state-manager`.
- El page builder ya soporta drag/drop desde sidebar, reordenamiento, duplicado, resize por bloque, nesting, tabs `Elements/Layers/Styles/Settings` y serializacion `page_json`.
- El modulo visual del funnel builder vive en `src/builders/funnel-builder` y persiste nodos/conexiones junto con `pages[]` (id, funnelId, type, contentJson) y los layouts por `pageId`.
- El funnel builder ahora soporta canvas infinito con zoom/pan/drag, nodos duplicables/eliminables, conexion visual y tipos de pagina extendidos (`product`, `checkout`, `upsell`, `downsell`, `thankyou`, `leadCapture`, `article`, `blank`).
- El modulo visual del store builder vive en `src/builders/store-builder` y persiste productos, bundles, order bumps, colecciones y checkout dentro del mismo draft.
- Los tres builders delegan modelos, renderer y shells reutilizables a `src/builders/shared`.
- Este archivo resume `docs/context.md` y debe mantenerse alineado con esa fuente de verdad.
