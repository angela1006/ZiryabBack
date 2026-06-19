# Configuración Cursor — Backend Node (TFG)

Este directorio contiene la configuración personalizada de Cursor para el
backend del TFG: API REST Node.js + Express + TypeScript + Prisma + PostgreSQL
+ Firebase Admin.

## Estructura

```
.cursor/
├── rules/          # Convenciones que el agente aplica automáticamente
│   ├── node-architecture.mdc        (alwaysApply)
│   ├── express-controllers.mdc      (globs: **/*.controller.ts)
│   ├── express-services.mdc         (globs: **/*.service.ts)
│   ├── express-routes.mdc           (globs: **/*.routes.ts)
│   ├── prisma-usage.mdc             (globs: prisma/**, **/*.service.ts)
│   └── jira-integration.mdc         (alwaysApply)
│
├── skills/         # Workflows invocables por nombre o en lenguaje natural
│   ├── node-module-generator/       # Crea un módulo routes/controller/service/schema
│   ├── jira-manager/                # CRUD de tickets Jira vía MCP
│   └── api-docs-confluence/         # Publica doc del módulo en Confluence
│
├── hooks.json      # Registro de hooks
└── hooks/          # Scripts bash
    ├── lint-and-format.sh
    ├── guard-commands.sh
    ├── validate-commit.sh
    ├── audit-mcp.sh
    └── mcp-audit.log                (generado en runtime, ignorado por git)
```

## MCP requerido

Las skills de Jira/Confluence dependen del MCP **Atlassian Rovo**. Instálalo
desde `Cursor Settings > MCP` y autentícate con tu cuenta Atlassian. El proyecto
Jira usado por defecto es `CURSO` (el mismo que el frontend Angular).

## Convención Jira

Todos los commits deben seguir `tipo(CURSO-XX): descripción` (ver
`rules/jira-integration.mdc`). El hook `validate-commit.sh` bloquea los que
no cumplan. Los TODOs y FIXMEs deben llevar `[CURSO-XX]` en corchetes.
