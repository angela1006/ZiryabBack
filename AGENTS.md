# AGENTS.md — Backend Node (TFG)

> Guía rápida para cualquier agente de IA (Cursor, Copilot…) que trabaje en este
> repositorio. Para el detalle de cada convención, ver `.cursor/rules/`.

## Stack

- **Node.js** + **TypeScript** estricto con **ESM** (`"type": "module"` en `package.json`)
- **Express 5** como framework HTTP
- **Prisma** (PostgreSQL) como ORM (`prisma/schema.prisma`)
- **Firebase Admin** para verificar tokens del frontend
- **JWT** (jsonwebtoken) + cookies httpOnly para sesión
- **Zod** para validación de entradas
- **Winston** para logging
- **Swagger** (`swagger-jsdoc` + `swagger-ui-express`) en `/api-docs`
- **Jest + Supertest** para tests

## Comandos habituales

| Comando | Para qué |
|---|---|
| `npm run dev` | Arranca en dev con `nodemon` + `tsx` |
| `npm run build` | Compila TS → `dist/` |
| `npm start` | Ejecuta `dist/index.js` |
| `npm test` | Jest con `NODE_ENV=test` |
| `npm run test:watch` | Jest en modo watch |
| `npm run test:coverage` | Jest con cobertura |
| `npm run seed` | Ejecuta `prisma/seed.ts` |
| `npx prisma migrate dev --name <nombre>` | Crear migración |
| `npx prisma generate` | Regenerar cliente tras tocar `schema.prisma` |

## Estructura del código

```
src/
├── app.ts               # Configuración Express + registro de rutas
├── index.ts             # Entrypoint (arranque del servidor)
├── firebase.ts          # Inicialización Firebase Admin
├── config/
│   ├── env.ts           # Lectura validada de variables de entorno
│   ├── prisma.ts        # export default new PrismaClient()
│   ├── firebase.config.ts
│   └── swagger.ts       # Configuración swagger-jsdoc
├── middleware/
│   ├── auth.ts          # Valida JWT y rellena req.user
│   ├── authorize.ts     # Restringe por rol
│   ├── validate.ts      # Valida req.body con un ZodSchema
│   ├── restrictSelf.ts  # Restringe acceso a datos ajenos
│   ├── upload.ts        # multer
│   ├── rateLimiter.ts
│   ├── requestLogger.ts
│   └── error.ts         # Error handler global
├── modules/             # UN DIRECTORIO POR RECURSO DE NEGOCIO
│   └── <recurso>/
│       ├── <recurso>.routes.ts
│       ├── <recurso>.controller.ts
│       ├── <recurso>.service.ts
│       └── <recurso>.schema.ts   (opcional)
├── tests/               # Tests Jest
└── utils/
    └── logger.ts        # Winston
```

Módulos actuales: `auth`, `users`, `students`, `teachers`, `admin`, `subjects`,
`course`, `group`, `enrollments`, `weekSchedule`, `classSession`, `assistance`,
`task`, `student-task`, `student-registration`.

## Convenciones no negociables

1. **Patrón modular** obligatorio: `routes` → `controller` → `service`.
   - Routes solo declara endpoints y middlewares.
   - Controller parsea `req` y devuelve `res.status().json()`.
   - Service contiene la lógica y toca Prisma. No recibe `req`/`res`.
2. **ESM con `.js` en imports** relativos (aunque el fuente sea `.ts`):
   ```typescript
   import prisma from '../../config/prisma.js';
   import { auth } from '../../middleware/auth.js';
   ```
3. **Prisma centralizado**: siempre `import prisma from '../../config/prisma.js'`.
   Nunca `new PrismaClient()` en services.
4. **Respuestas HTTP** con contrato `{ message, data? }` compatible con el frontend.
5. **Errores**: devolver `res.status(4xx).json({ message })` o `throw new Error()`
   dentro del service (lo captura el controller o el `errorHandler` global).
6. **Logs**: usar `logger` de `src/utils/logger.ts`, nunca `console.log`.
7. **Swagger**: añadir bloque `@swagger` encima de cada `router.xxx(...)`.
8. **Commits**: `tipo(CURSO-XX): descripción` (conventional commits + clave Jira).
9. **TODOs**: `// TODO [CURSO-XX]: ...` con clave Jira entre corchetes.

## Registrar un módulo nuevo

1. Crear `src/modules/<recurso>/{routes,controller,service}.ts`.
2. En `src/app.ts`:
   ```typescript
   import <recurso>Routes from './modules/<recurso>/<recurso>.routes.js';
   app.use('/api/<recursos>', <recurso>Routes);
   ```
3. Si necesita modelo nuevo en Prisma → editar `schema.prisma` + `migrate dev`.

Hay una skill `node-module-generator` en `.cursor/skills/` que automatiza esto.

## Roles

`'STUDENT' | 'TEACHER' | 'ADMIN'`. El JWT incluye `role` en `req.user.role`
(ver `middleware/auth.ts`).

## Prisma — reglas clave

- **Nunca** `prisma migrate reset` ni `prisma db push --force-reset` sin confirmación
  explícita (borra datos).
- Usar `select` explícito para no devolver campos sensibles.
- `upsert` en el seed para evitar duplicados.
- `prisma.$transaction([...])` cuando hagan falta operaciones atómicas.

El hook `.cursor/hooks/guard-commands.sh` bloquea esos comandos sin confirmación.

## Trabajo con Jira / Confluence

Hay un MCP de **Atlassian Rovo** activo. El proyecto Jira es `CURSO` (compartido con
el frontend). Flujo por ticket:

1. `getJiraIssue(CURSO-XX)` al empezar + `transitionJiraIssue` → "In Progress".
2. Desarrollar.
3. `transitionJiraIssue` → "Done" + `addCommentToJiraIssue` con lo realizado.

Skills disponibles en `.cursor/skills/`: `jira-manager`, `api-docs-confluence`,
`node-module-generator`.

## Configuración Cursor

Todo lo específico del agente vive en `.cursor/`:

- `.cursor/rules/` — convenciones aplicadas por globs (controllers, services, routes,
  prisma, arquitectura).
- `.cursor/skills/` — workflows reutilizables.
- `.cursor/hooks.json` + `.cursor/hooks/` — auto-format (incluye `prisma format`),
  validación de commits, guard de comandos peligrosos (incluye comandos destructivos
  de Prisma), auditoría MCP.

Ver `.cursor/README.md` para el detalle.

## Cosas a evitar

- `console.log` → usar `logger`.
- Imports relativos sin extensión `.js` (romperá en runtime).
- Consultas Prisma dentro de controllers.
- Devolver campos sensibles (`password`, etc.) sin `select`.
- Editar migraciones Prisma ya aplicadas.
- Credenciales Firebase en el repo: deben estar en variables de entorno
  (`config/firebase.config.ts` lee de `env`).
