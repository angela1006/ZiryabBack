---
name: node-module-generator
description: >-
  Genera un módulo completo del backend Node/Express/Prisma siguiendo la estructura
  routes/controller/service/schema que usa el proyecto. Úsala cuando el usuario pida
  "nuevo módulo", "crear recurso", "scaffold de endpoint", "nueva entidad" o
  "CRUD de X".
---

# Skill — Generador de módulo backend

Crea un módulo nuevo en `src/modules/{recurso}/` respetando el patrón de la API.
Registra también la ruta en `src/app.ts` bajo `/api/{recurso}`.

## Entrada

Preguntar al usuario si faltan:

1. **Nombre del recurso** en singular y kebab-case (ej. `product`, `class-report`).
2. **Operaciones** a exponer: cualquiera de `list | get | create | update | delete`.
3. **Protección**: ¿requiere `auth`? ¿`authorize(['ADMIN'])` u otros roles?
4. **Modelo Prisma** (si aplica): nombre en `schema.prisma` que usará el service.
5. **Clave de Jira** (ej. `CURSO-4`).

## Ficheros generados

```
src/modules/{recurso}/
├── {recurso}.routes.ts
├── {recurso}.controller.ts
├── {recurso}.service.ts
└── {recurso}.schema.ts        # solo si hay endpoints que reciben body
```

Ver `templates.md` para los contenidos base.

## Pasos del workflow

1. **Validar** que `src/modules/{recurso}/` no exista.
2. **Crear los 3–4 ficheros** a partir de los templates sustituyendo:
   - `{recurso}` → kebab-case singular
   - `{Recurso}` → PascalCase singular (`Product`, `ClassReport`)
   - `{recursos}` → plural kebab-case (si aplica)
   - `{Modelo}` → nombre del modelo Prisma (ej. `product`)
3. **Registrar la ruta** en `src/app.ts`:

   ```typescript
   import {recurso}Routes from './modules/{recurso}/{recurso}.routes.js';
   // ...
   app.use('/api/{recursos}', {recurso}Routes);
   ```

   Respetar el orden y el bloque "Rutas de la API".
4. **Swagger tags** — si procede, añadir el bloque `@swagger` en cada endpoint del router.
5. **Prisma** — si el modelo aún no existe en `schema.prisma`, NO modificar el schema
   automáticamente: **avisar** al usuario y ofrecer guía para añadirlo + migración.
6. **Tests** — crear opcionalmente un `src/tests/{recurso}.test.ts` mínimo con Supertest.
7. **MCP Jira**:
   - `transitionJiraIssue` → "In Progress" al comenzar.
   - `addCommentToJiraIssue` al terminar con lista de endpoints creados.

## Recordatorios clave del proyecto

- **Imports relativos con `.js`** (ESM) — imprescindible.
- **Controller** no toca Prisma: lo hace el **service**.
- **Prisma** solo desde `src/config/prisma.ts`.
- Respuesta en formato `{ message, data }`.
- `req.user` está definido globalmente por `middleware/auth.ts`.

## Ejemplo de uso

> "Crea el módulo `product` con list y create, protegido por auth, para TEACHER. Ticket CURSO-4"

Resultado:
- `src/modules/product/{product.routes.ts, product.controller.ts, product.service.ts, product.schema.ts}`
- Registro en `src/app.ts`: `app.use('/api/products', productRoutes);`
- Comentario en CURSO-4 con los endpoints `POST /api/products` y `GET /api/products`.
