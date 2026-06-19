# Hooks de Cursor — Backend Node

Registrados en `.cursor/hooks.json`, se disparan en los siguientes eventos:

| Evento | Script | Propósito |
|---|---|---|
| `afterFileEdit` | `lint-and-format.sh` | Formatea `.ts`, `.json`, `.md` con Prettier y `schema.prisma` con `prisma format`. |
| `beforeShellExecution` | `guard-commands.sh` | Pide confirmación en comandos peligrosos: `rm -rf`, `git push --force`, `prisma migrate reset`, `prisma db push --force-reset`, `npm publish`, docker-compose de producción. |
| `beforeShellExecution` | `validate-commit.sh` | Bloquea commits que no sigan `tipo(CURSO-XX): …`. |
| `afterMCPExecution` | `audit-mcp.sh` | Guarda cada llamada MCP en `mcp-audit.log`. |

## Ejecutar en Windows

Cursor ejecuta los hooks con `bash`, por lo que necesitas tener **Git Bash**
disponible (viene incluido con Git for Windows). No hace falta nada más.

Para marcar los scripts como ejecutables (solo necesario en WSL/Linux/Mac):

```bash
chmod +x .cursor/hooks/*.sh
```

## Fail open / fail closed

- `lint-and-format.sh` es **fail open**: si faltan herramientas, no rompe la edición.
- `guard-commands.sh` y `validate-commit.sh` usan `failClosed: true` en el JSON,
  por lo que si el script falla el comando NO se ejecuta (más seguro).

## Log de auditoría

`.cursor/hooks/mcp-audit.log` registra todas las llamadas al MCP de Atlassian Rovo.
Se ignora por git. Formato:

```
[2026-04-22 10:30:15] createJiraIssue - {"arguments":{"projectKey":"CURSO",...}}
[2026-04-22 10:31:02] searchJiraIssuesUsingJql - {"arguments":{"jql":"project=CURSO"}}
```
