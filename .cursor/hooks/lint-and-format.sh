#!/usr/bin/env bash
# ------------------------------------------------------------------
# Hook: afterFileEdit
# Formatea automáticamente los ficheros que edita el agente.
# Fail open: si prettier/tsc no están disponibles, no rompe el flujo.
# En Windows, ejecutar bajo Git Bash (viene con Git for Windows).
# ------------------------------------------------------------------

input=$(cat)

file=$(echo "$input" | grep -oE '"path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -n1 | sed -E 's/.*"path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')

if [[ -z "$file" || ! -f "$file" ]]; then
  echo '{}'
  exit 0
fire

case "$file" in
  *.ts)
    # Formateo
    npx --no-install prettier --write "$file" >/dev/null 2>&1
    # Chequeo de tipos rápido (no detiene la edición en caso de error).
    # Se deja comentado porque tsc -p . sobre un único archivo no es óptimo;
    # confiamos en el chequeo durante `npm run build`.
    # npx --no-install tsc --noEmit >/dev/null 2>&1
    ;;
  *.json|*.md|*.yml|*.yaml)
    npx --no-install prettier --write "$file" >/dev/null 2>&1
    ;;
  *schema.prisma)
    # Prisma trae su propio formateador.
    npx --no-install prisma format >/dev/null 2>&1
    ;;
esac

echo '{}'
exit 0