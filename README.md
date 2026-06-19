# Ziryab — Backend API

API REST del proyecto **Ziryab**, plataforma de gestión educativa para centros formativos. Expone los recursos académicos (alumnos, profesores, horarios, asistencia, tareas, calificaciones, incidencias…) consumidos por el frontend Angular.

Parte del **Trabajo Fin de Grado / Proyecto Intermodular** del CPIFP Alan Turing (2º DAM, 2025–2026).

| Recurso | Enlace |
| --- | --- |
| Proyecto completo | [TFG-Ziryab](../TFG-Ziryab) |
| Frontend Angular | [ZiryabFront](https://github.com/Paco168889/ZiryabFront) |
| API en producción | [ziryabback.onrender.com](https://ziryabback.onrender.com/api) |
| Swagger | [ziryabback.onrender.com/api-docs](https://ziryabback.onrender.com/api-docs) |
| Jira | Proyecto `CURSO` |

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Dominio funcional](#dominio-funcional)
- [Arquitectura](#arquitectura)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Autenticación](#autenticación)
- [Base de datos y Prisma](#base-de-datos-y-prisma)
- [Subida de ficheros](#subida-de-ficheros)
- [Notificaciones en tiempo real](#notificaciones-en-tiempo-real)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)
- [Documentación adicional](#documentación-adicional)

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Runtime | Node.js ≥ 18, **TypeScript** estricto, **ESM** (`"type": "module"`) |
| Framework HTTP | **Express 5** |
| Base de datos | **PostgreSQL 16** |
| ORM | **Prisma 5** |
| Validación | **Zod 4** |
| Autenticación | **Firebase Admin** (verificación de ID tokens) + **JWT** (sesión propia) |
| Ficheros | **Cloudinary** + ruta legacy `/uploads` |
| Seguridad | Helmet, CORS, rate limiting, cookies httpOnly |
| Logging | **Winston** |
| Documentación API | **Swagger** (`swagger-jsdoc` + `swagger-ui-express`) |
| Tests | **Jest** + **Supertest** |
| Despliegue | **Render** (Docker multi-stage) |

---

## Dominio funcional

Ziryab modela la operativa diaria de un centro educativo con tres roles: `STUDENT`, `TEACHER` y `ADMIN`.

| Área | Qué cubre |
| --- | --- |
| **Usuarios y roles** | Alumnos, profesores y administradores vinculados a Firebase (`firebaseUID`) |
| **Estructura académica** | Ciclos (`Course`), grupos (`Group`), clases reales (`CourseGroup`), asignaturas |
| **Asignaciones** | Profesor ↔ asignatura ↔ grupo por año lectivo (`TeacherOnSubjectOnGroup`) |
| **Matrículas** | Alumno ↔ asignatura ↔ grupo (`StudentOnSubjectOnGroup`) |
| **Horarios** | Plantillas semanales (`WeekSchedule`) y sesiones concretas (`SessionClass`) |
| **Asistencia** | Pase de lista por sesión, estados y justificantes |
| **Tareas** | Creación por profesor, entregas de alumnos, calificación y feedback |
| **Calificaciones** | Notas por trimestre / periodo de evaluación |
| **Incidencias** | Comunicados administrativos con audiencias segmentadas (`Issue`) |
| **Notificaciones** | Avisos in-app con SSE al cliente |

---

## Arquitectura

Patrón modular obligatorio: cada recurso vive en `src/modules/{recurso}/` con separación estricta:

```
routes  →  declara endpoints y middlewares (sin lógica de negocio)
controller  →  parsea req/res, llama al service
service  →  lógica + Prisma (no toca req/res)
schema  →  validación Zod (opcional)
```

```
node/
├── prisma/
│   ├── schema.prisma       # Modelo relacional completo
│   ├── migrations/         # Historial versionado
│   ├── seed.ts             # Datos de desarrollo/demo
│   └── seed-demo.ts        # Seed alternativo
├── src/
│   ├── app.ts              # Express: middlewares + registro de rutas
│   ├── index.ts            # Arranque del servidor
│   ├── config/             # env, prisma, swagger, firebase
│   ├── middleware/         # auth, authorize, validate, rateLimiter…
│   ├── modules/            # Un directorio por recurso de negocio
│   ├── tests/              # Tests de integración Jest
│   └── utils/              # logger, helpers
├── docs/                   # Guías Bruno y ejemplos API
├── Dockerfile              # Imagen de producción (Render)
├── docker-compose.yml      # PostgreSQL local
└── AGENTS.md               # Guía para agentes de IA / convenciones
```

**Contrato de respuestas HTTP** (compatible con el frontend Angular):

```json
{ "message": "Descripción del resultado", "data": { ... } }
```

Los endpoints de auth devuelven además el JWT en el cuerpo y en cookie `auth_token` (httpOnly).

---

## Inicio rápido

### Requisitos

- Node.js ≥ 18
- Docker y Docker Compose (PostgreSQL local)
- Proyecto Firebase `ziryab-7006e` con credenciales de servicio
- Cuenta Cloudinary (subida de adjuntos)

### Pasos

```bash
# 1. Instalar dependencias (ejecuta prisma generate vía postinstall)
npm install

# 2. Crear .env en la raíz (ver sección Variables de entorno)
cp .env.example .env   # si existe; si no, crear manualmente

# 3. Levantar PostgreSQL
docker compose up -d

# 4. Aplicar migraciones
npx prisma migrate dev

# 5. (Opcional) Poblar datos de prueba
npm run seed
# npm run seed:demo   # dataset alternativo

# 6. Arrancar en desarrollo (hot-reload con tsx)
npm run dev
```

Servidor por defecto en `http://localhost:3000`.

### Comprobaciones rápidas

```bash
curl http://localhost:3000/health
# {"ok":true}

# Documentación interactiva
# http://localhost:3000/api-docs
```

---

## Variables de entorno

Todas se validan en `src/config/env.ts` con Zod al arrancar. El fichero `.env` **no** se commitea.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | URL PostgreSQL (`postgresql://postgres:postgres@localhost:5432/app_db`) |
| `JWT_SECRET` | Sí | Clave de firma JWT (mín. 32 caracteres) |
| `JWT_EXPIRY` | No | Expiración del token (`7d` dev, `24h` prod por defecto) |
| `NODE_ENV` | No | `development` \| `production` \| `test` |
| `PORT` | No | Puerto HTTP (default `3000`) |
| `FIREBASE_PROJECT_ID` | Sí | ID del proyecto Firebase |
| `FIREBASE_PRIVATE_KEY` | Sí | Clave privada del service account |
| `FIREBASE_CLIENT_EMAIL` | Sí | Email del service account |
| `FIREBASE_WEB_API_KEY` | Sí | Web API Key (Identity Toolkit) |
| `FRONTEND_URL` | Sí | Origen del SPA (CORS y CSP), p. ej. `http://localhost:4200` |
| `API_PUBLIC_URL` | No | URL pública del API para Swagger (Render en prod) |
| `CLOUDINARY_CLOUD_NAME` | Sí | Cloud name de Cloudinary |
| `CLOUDINARY_API_KEY` | Sí | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | Sí | API secret de Cloudinary |
| `CREDENTIALS_ENCRYPTION_KEY` | Sí* | Clave AES-256 para `StudentPassword`: 64 caracteres hex (32 bytes). Generar con `openssl rand -hex 32`. En `NODE_ENV=test` se usa una clave fija si falta |
| `SKIP_TLS_VERIFY` | No | Solo dev: `true` si la red bloquea TLS hacia Firebase |

Ejemplo mínimo para desarrollo local:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
JWT_SECRET=cambia_esto_por_una_clave_segura_de_al_menos_32_caracteres
FIREBASE_PROJECT_ID=ziryab-7006e
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ziryab-7006e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=AIzaSy...
FRONTEND_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CREDENTIALS_ENCRYPTION_KEY=<64_hex_chars>   # openssl rand -hex 32
```

---

## Endpoints de la API

Prefijo base: `/api`. Documentación completa e interactiva en `/api-docs`.

| Prefijo | Módulo | Descripción |
| --- | --- | --- |
| `/api/auth` | Auth | Login, registro, `/me`, logout, verificación Firebase |
| `/api/users` | Users | Perfil y gestión de usuarios autenticados |
| `/api/students` | Students | CRUD alumnos |
| `/api/teachers` | Teachers | CRUD profesores |
| `/api/admins` | Admins | CRUD administradores |
| `/api/courses` | Course | Ciclos formativos |
| `/api/groups` | Group | Grupos (turnos) |
| `/api/course-groups` | CourseGroup | Clase = ciclo + grupo + curso |
| `/api/subjects` | Subjects | Asignaturas por ciclo |
| `/api/assignments` | Assignments | Asignación profesor–asignatura–grupo |
| `/api/enrollments` | Enrollments | Matrículas alumno–asignatura–grupo |
| `/api/studentregistration` | Student registration | Alta/matrícula de alumnos |
| `/api/horarios-semanales` | WeekSchedule | Plantillas de horario semanal |
| `/api/sessions` | ClassSession | Sesiones de clase concretas |
| `/api/assistances` | Assistance | Asistencia por sesión |
| `/api/tasks` | Task | Tareas del profesor |
| `/api/student-tasks` | StudentTask | Entregas y calificaciones |
| `/api/grades` | Grade | Calificaciones por periodo |
| `/api/issues` | Issue | Incidencias / comunicados admin |
| `/api/notifications` | Notifications | Notificaciones + stream SSE |

**Utilidades:**

| Ruta | Descripción |
| --- | --- |
| `GET /health` | Health check |
| `GET /` | Metadatos y enlaces útiles |
| `GET /api-docs` | Swagger UI |
| `GET /uploads/*` | Ficheros legacy en disco local |

---

## Autenticación

Flujo híbrido **Firebase + JWT propio**:

```mermaid
sequenceDiagram
    participant C as Cliente Angular
    participant F as Firebase Auth
    participant A as API Ziryab

    C->>F: email + password
    F-->>C: ID token Firebase
    C->>A: POST /api/auth/login { token, ... }
    A->>F: Verifica ID token (Firebase Admin)
    A-->>C: JWT + cookie auth_token + perfil (role, id…)
    C->>A: Peticiones con Bearer JWT o cookie
```

- El middleware `auth` acepta JWT desde **cookie `auth_token`**, cabecera **`Authorization: Bearer`** o query `?token=` (SSE / EventSource).
- El payload incluye `sub`, `email`, `firebaseUID` y `role`.
- Middleware `authorize(['ADMIN'])` restringe por rol.
- Rate limiting de auth desactivado en `NODE_ENV=test`.

---

## Base de datos y Prisma

Modelo relacional completo en `prisma/schema.prisma`: entidades principales, enums (`TaskType`, `SubmissionStatus`, `AssistanceStatus`, `EvaluationPeriod`…), índices y restricciones de unicidad.

### Comandos habituales

```bash
npx prisma studio              # UI web para inspeccionar datos
npx prisma migrate dev --name descripcion
npx prisma migrate deploy      # Producción (Render)
npx prisma generate            # Regenerar cliente tras cambiar schema
npm run seed                   # Datos semilla
```

> **Importante:** no ejecutar `prisma migrate reset` ni `db push --force-reset` sin confirmación explícita (borran datos).

Diagrama relacional documentado en `prisma/esquema-relacional.md` (si existe en el repo).

---

## Subida de ficheros

Las subidas nuevas se almacenan en **Cloudinary** (tareas, justificantes de asistencia, adjuntos de incidencias…). Multer gestiona el multipart en endpoints concretos.

La ruta estática `/uploads` se mantiene solo para ficheros antiguos en disco local.

---

## Notificaciones en tiempo real

El módulo `notifications` expone un stream **Server-Sent Events (SSE)** para avisos in-app. El cliente Angular se conecta con el JWT (vía query param porque `EventSource` no admite cabeceras custom).

Modelo `Notification` indexado por `recipientFirebaseUID`.

---

## Testing

Tests de integración con Jest + Supertest en `src/tests/`:

| Fichero | Ámbito |
| --- | --- |
| `auth.test.ts` | Registro, login, sesión |
| `users.test.ts` | Perfil y usuarios |
| `tasks.test.ts` | Tareas |
| `studentTasks.test.ts` | Entregas |
| `assignments.test.ts` | Asignaciones profesor |
| `announcements.test.ts` | Anuncios |
| `classSession.suspend.test.ts` | Suspensión de sesiones |
| `course-grades.test.ts` | Calificaciones |

```bash
npm test                 # Suite completa (NODE_ENV=test)
npm run test:watch       # Modo watch
npm run test:coverage    # Informe de cobertura
```

Requiere PostgreSQL accesible con la `DATABASE_URL` configurada (o `.env.test`).

---

## Despliegue

### Render (producción actual)

Scripts en `package.json`:

```bash
npm run render:build   # Compila TypeScript
npm run render:start   # prisma migrate deploy && node dist/index.js
```

URL producción: [https://ziryabback.onrender.com](https://ziryabback.onrender.com)

### Docker

```bash
docker build -t ziryab-api .
docker run -p 3000:3000 --env-file .env ziryab-api
```

El `Dockerfile` usa build multi-stage (`node:20-alpine`), ejecuta migraciones al arrancar y corre como usuario `node`.

### PostgreSQL local

```bash
docker compose up -d     # postgres:16 en puerto 5432
docker compose down      # Parar contenedor
docker compose logs -f   # Ver logs
```

---

## Convenciones de desarrollo

- **Imports ESM** con extensión `.js` en rutas relativas (aunque el fuente sea `.ts`).
- **Un solo PrismaClient** en `src/config/prisma.ts`.
- **Logs** con `src/utils/logger.ts` (no `console.log` en código de producción).
- **Swagger:** bloque `@swagger` encima de cada ruta en `*.routes.ts`.
- **Commits:** `tipo(CURSO-XX): descripción` (Conventional Commits + Jira).
- **TODOs en código:** `// TODO [CURSO-XX]: ...`

Guía detallada para agentes de IA: [`AGENTS.md`](./AGENTS.md).  
Reglas Cursor en `.cursor/rules/`.

### Añadir un módulo nuevo

1. Crear `src/modules/{recurso}/{recurso}.{routes,controller,service,schema}.ts`
2. Registrar en `src/app.ts`: `app.use('/api/{recurso}', {recurso}Routes)`
3. Si hay modelo nuevo → editar `schema.prisma` + `npx prisma migrate dev`

Skill disponible: `.cursor/skills/node-module-generator/`.

---

## Documentación adicional

| Documento | Ubicación |
| --- | --- |
| Ejemplos de peticiones API | `docs/API_EXAMPLES.md` |
| Colección Bruno | `docs/BRUNO_GUIDE.md` |
| Convenciones backend | `AGENTS.md` |
| Proyecto completo (TFG) | [TFG-Ziryab/README.md](../TFG-Ziryab/README.md) |

---

## Scripts npm

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Desarrollo con `tsx watch` |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta `dist/index.js` |
| `npm test` | Jest + Supertest |
| `npm run seed` | Ejecuta `prisma/seed.ts` |
| `npm run seed:demo` | Seed alternativo |
| `npm run render:build` | Build para Render |
| `npm run render:start` | Migraciones + arranque en Render |

---

## Licencia

ISC — Proyecto académico (CPIFP Alan Turing, 2025–2026).
