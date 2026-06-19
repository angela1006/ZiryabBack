---
name: api-docs-confluence
description: >-
  Analiza un módulo del backend (routes/controller/service) y publica o actualiza
  su documentación en Confluence usando el MCP de Atlassian Rovo. Úsala cuando el
  usuario pida "documentar el módulo X", "publicar doc de endpoints en Confluence"
  o "actualizar la documentación del servicio".
---

# Skill — Documentación de API en Confluence

Convierte un módulo `src/modules/{recurso}/` en una página Confluence con formato
estándar. Si existe, la actualiza; si no, la crea.

## Herramientas MCP

- `searchConfluenceUsingCql`
- `createConfluencePage`
- `updateConfluencePage`

## Entrada

- **Nombre del módulo** (p. ej. `users`, `auth`, `task`).
- **Espacio Confluence** (por defecto `Curso Cursor + Angular`).
- **Clave de Jira** asociada (opcional, para enlazar).

## Workflow

1. **Leer el router** `src/modules/{recurso}/{recurso}.routes.ts` y extraer:
   - Método HTTP + path relativo.
   - Middlewares aplicados (`auth`, `authorize(['...'])`, `validate(...)`, `upload`…).
   - Comentarios Swagger si existen.

2. **Leer el controller** y extraer, para cada handler:
   - Nombre del handler y firma.
   - Body esperado / params / query.
   - Posibles códigos de respuesta usados (`res.status(...)`).

3. **Leer el service** y extraer:
   - Métodos exportados y qué modelos Prisma consulta.
   - Si hay transacciones o llamadas a servicios externos (Firebase).

4. **Leer el schema** (si existe) y listar los campos Zod.

5. **Buscar página existente**:

   ```
   type = page AND space = "{ESPACIO}" AND title = "Módulo API: {Recurso}"
   ```

6. **Rellenar** `template-module.md` y publicar con `createConfluencePage` o
   `updateConfluencePage`.

7. Si se pasó **clave Jira**, añadir un comentario al ticket con el link a la
   página creada (`addCommentToJiraIssue`).

## Ejemplo

> "Documenta el módulo `users` en Confluence, ticket CURSO-6"

Extrae de:
- `src/modules/users/users.routes.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`

Publica página "Módulo API: Users" con los endpoints:
- `GET /api/users` (auth)
- `GET /api/users/me` (auth)
- `PATCH /api/users/me` (auth)
- `PATCH /api/users/me/password` (auth)
- `GET /api/users/:id` (auth)

Cada uno con su descripción, body/params esperados, respuestas y notas de seguridad.
