#!/usr/bin/env bash
# ------------------------------------------------------------------
# Hook: beforeShellExecution (failClosed = true)
# Protege comandos peligrosos o de producción pidiendo confirmación.
# En el backend los comandos más delicados son los de Prisma (migrate reset,
# db push --force-reset) y los que afectan a producción o al registro npm.
# ------------------------------------------------------------------

input=$(cat)

command=$(echo "$input" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

reason=""
decision="allow"

case "$command" in
  *"rm -rf"*|*"git push --force"*)
    decision="ask"
    reason="Comando destructivo: puede eliminar archivos o historia irrecuperablemente."
    ;;
  *"prisma migrate reset"*|*"prisma db push --force-reset"*)
    decision="ask"
    reason="Operación que BORRA todos los datos de la base de datos. Confirmar entorno antes de continuar."
    ;;
  *"npm publish"*)
    decision="ask"
    reason="Publicación al registro npm: operación irreversible, confirma versión y entorno."
    ;;
  *"docker-compose"*"prod"*)
    decision="ask"
    reason="Operación sobre el docker-compose de producción: verifica que es el entorno correcto."
    ;;
esac

if [[ "$decision" == "ask" ]]; then
  printf '{"permission":"ask","userMessage":"%s"}\n' "$reason"
else
  echo '{"permission":"allow"}'
fi
exit 0
