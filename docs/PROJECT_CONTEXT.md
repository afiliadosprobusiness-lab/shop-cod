# PROJECT_CONTEXT

## Estado Actual

- Proyecto: ShopCOD
- Tipo: frontend SPA
- Estado funcional: demo navegable con datos mock e interacciones locales

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui / Radix UI
- React Router
- Framer Motion
- dnd-kit
- Vitest

## Rutas Activas

- `/` -> landing SaaS
- `/dashboard` -> dashboard mock
- `/editor/:storeId` -> editor visual
- `/preview/:storeId` -> preview de tienda
- `*` -> 404

## Flujos Operativos

- CTA principal: landing -> dashboard
- Crear tienda: dashboard -> `/editor/new`
- Editar tienda: dashboard -> `/editor/:storeId`
- Preview: editor -> `/preview/:storeId`

## Integraciones

- No hay APIs conectadas
- No hay persistencia real
- No hay variables de entorno requeridas

## Notas Operativas

- `Guardar` y `Publicar` no persisten datos todavia.
- El dashboard y el editor trabajan con fixtures y estado en memoria.
- Existen paginas adicionales no conectadas al router principal.
- Este archivo resume `docs/context.md` y debe mantenerse alineado con esa fuente de verdad.
