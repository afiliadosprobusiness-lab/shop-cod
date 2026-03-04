# PROJECT_CONTEXT

## Estado Actual

- Proyecto: ShopCOD
- Tipo: frontend SPA
- Estado funcional: frontend navegable con auth en Firebase, creador guiado de tiendas y persistencia local de drafts

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
- `/dashboard` -> dashboard protegido
- `/orders` -> dashboard de pedidos protegido
- `/editor/:storeId` -> editor visual protegido
- `/preview/:storeId` -> preview protegido
- `*` -> 404

## Flujos Operativos

- Inicio de sesion: `/login` con email/password o Google
- Rutas privadas: redirigen a `/login` si no hay sesion
- Crear tienda: dashboard abre modal, crea draft local con funnel completo (hero, problema, beneficios, reviews, FAQ, checkout y CTA) y navega a `/editor/:storeId`
- Editor: mismo `/editor/:storeId` ahora incluye `Store builder`, `Funnel builder` y `Page builder`; el store builder configura catalogo, bundles, checkout, order bumps, monedas y dominios; el funnel builder usa canvas con pan/zoom, nodos conectables y analytics
- Shared engine: los tres builders ahora comparten `src/builders/shared` para modelos canonicos, `renderBlock(block)` y shells UI (`canvas`, `toolbar`, `sidebar`, `blocks`, `editor`)
- Guardar: editor guarda bloques + perfil comercial + layout JSON del page builder + layouts por `pageId` + grafo del funnel + estado del store builder en `localStorage`
- Aplicar al funnel: sincroniza el perfil comercial con el contenido del funnel
- Preview: usa el perfil guardado para poblar hero, CTA y checkout
- Publicar: guarda `publishedAt` local y marca la tienda como activa en el catalogo local
- Dashboard: las tiendas locales tambien pueden eliminarse desde el modal de acciones

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
- El dashboard mezcla tiendas demo con tiendas creadas localmente en el navegador.
- El creador actual no depende de backend; los drafts viven en `localStorage`.
- El modulo visual del page builder vive en `src/builders/page-builder` y persiste su arbol de bloques dentro del mismo draft del editor.
- El modulo visual del funnel builder vive en `src/builders/funnel-builder` y persiste nodos/conexiones junto con los layouts por `pageId`.
- El modulo visual del store builder vive en `src/builders/store-builder` y persiste productos, bundles, order bumps, colecciones y checkout dentro del mismo draft.
- Los tres builders delegan modelos, renderer y shells reutilizables a `src/builders/shared`.
- Este archivo resume `docs/context.md` y debe mantenerse alineado con esa fuente de verdad.
