---
name: jira-manager
description: >-
  Gestiona tickets de Jira (proyecto CURSO) desde Cursor sin abrir el navegador:
  listar, buscar, crear, editar, transicionar y comentar issues usando el MCP de
  Atlassian Rovo. Úsala cuando el usuario mencione "ticket", "issue", "Jira",
  "backlog", "sprint", "bug", "story" o pida "pásalo a Done", "crea una tarea", etc.
---

# Skill — Gestor de Jira

Misma skill que en el frontend; sirve tanto al backend Node como al frontend Angular,
que comparten el proyecto `CURSO`.

## Herramientas MCP

| Acción | Herramienta |
|---|---|
| Leer ticket | `getJiraIssue` |
| Buscar JQL | `searchJiraIssuesUsingJql` |
| Crear ticket | `createJiraIssue` |
| Editar | `editJiraIssue` |
| Listar transiciones | `getTransitionsForJiraIssue` |
| Cambiar estado | `transitionJiraIssue` |
| Comentar | `addCommentToJiraIssue` |

## Workflows

### Consultar ticket

> "Muéstrame CURSO-5"

`getJiraIssue({ issueIdOrKey: "CURSO-5" })` → mostrar clave, tipo, estado, resumen,
descripción, etiquetas.

### Buscar

> "Dame mis bugs abiertos del backend"

Construir JQL (ver `examples.md`) y llamar `searchJiraIssuesUsingJql`. Mostrar tabla.

### Crear

> "Crea un bug: /api/users devuelve 500 cuando el email es null"

Pedir si falta: proyecto (por defecto `CURSO`), tipo (`Bug`/`Story`/`Task`), resumen,
descripción (markdown), etiquetas (`backend`, `api`…), módulo afectado
(ej. `src/modules/users/`).

```json
createJiraIssue({
  projectKey: "CURSO",
  issueTypeName: "Bug",
  summary: "/api/users devuelve 500 cuando email es null",
  description: "...",
  contentFormat: "markdown",
  labels: ["backend", "api", "bug"]
})
```

### Transicionar

> "Pasa CURSO-5 a Done"

1. `getTransitionsForJiraIssue` para ver IDs disponibles.
2. `transitionJiraIssue({ issueIdOrKey, transitionId })`.

### Comentar

`addCommentToJiraIssue({ issueIdOrKey, body, contentFormat: "markdown" })`.

## Plantilla para bugs de backend

```markdown
## Resumen
{una frase}

## Endpoint afectado
`METHOD /api/...`

## Pasos para reproducir
1. ...
2. ...

## Comportamiento esperado
...

## Comportamiento actual
...

## Stack / log relevante
```

## Archivo / módulo
- `src/modules/.../xxx.service.ts` (línea XX)
```

## Buenas prácticas

- Consulta transiciones antes de transicionar.
- Usa `contentFormat: "markdown"` en descripciones/comentarios.
- Antes de crear, busca similares con `searchJiraIssuesUsingJql` para evitar duplicados.
- Al trabajar un ticket: "In Progress" al empezar, "Done" + comentario al terminar.
