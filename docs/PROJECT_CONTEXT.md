# PROJECT_CONTEXT

## Estado Actual

- Proyecto: ShopCOD
- Tipo: frontend SPA
- Estado funcional: frontend navegable con auth en Firebase, persistencia local del editor y despliegue objetivo en Vercel

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui / Radix UI
- React Router
- Framer Motion
- dnd-kit
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
- Crear tienda: dashboard -> `/editor/new`
- Guardar: editor -> `localStorage`
- Preview: editor -> `/preview/:storeId`
- Publicar: guarda `publishedAt` local
- Demo e-commerce: `/store/demo` -> `/checkout` -> `/order-confirmed`

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
- Falta habilitar en Firebase Console los metodos Email/Password y Google.
- Falta agregar `shop-cod.vercel.app` y cualquier dominio custom a Authorized Domains en Firebase Auth.
- Este archivo resume `docs/context.md` y debe mantenerse alineado con esa fuente de verdad.
