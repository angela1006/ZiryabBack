# Módulo API: {Recurso}

> Generado automáticamente desde `src/modules/{recurso}/`.

## Descripción

{descripción funcional del recurso y su papel en el dominio}

## Prefijo

`/api/{recursos}` (registrado en `src/app.ts`).

## Endpoints

### `METHOD /api/{recursos}/{path}`

- **Descripción**: ...
- **Middlewares**: `auth`, `authorize(['ADMIN'])`, `validate(createSchema)` …
- **Body esperado** (si aplica):

  ```json
  {
    "campo": "valor"
  }
  ```

- **Respuestas**:
  - `200` — `{ message, data }`
  - `400` — validación fallida
  - `401` — no autorizado
  - `404` — no encontrado

{repetir bloque por cada endpoint}

## Controller

Fichero: `src/modules/{recurso}/{recurso}.controller.ts`

| Handler | Descripción | Llama a |
|---------|-------------|---------|
|         |             |         |

## Service

Fichero: `src/modules/{recurso}/{recurso}.service.ts`

| Método | Descripción | Modelo Prisma | Notas |
|--------|-------------|---------------|-------|
|        |             |               |       |

## Schema de validación (Zod)

Fichero: `src/modules/{recurso}/{recurso}.schema.ts` (si existe)

- `create{Recurso}Schema`: ...
- `update{Recurso}Schema`: ...

## Modelo Prisma relacionado

```prisma
model {Modelo} {
  // ...
}
```

## Seguridad y roles

- Endpoints públicos: ...
- Endpoints solo autenticados: ...
- Endpoints restringidos por rol: ...

## Ticket Jira asociado

[{CURSO-XX}](https://{workspace}.atlassian.net/browse/{CURSO-XX})
