#!/usr/bin/env bash
# ------------------------------------------------------------------
# Hook: beforeShellExecution (matcher = "git commit")
# Valida que el mensaje de commit siga el formato:
#   tipo(CLAVE-XX): descripción
# donde tipo ∈ {feat,fix,refactor,docs,style,test,chore,perf,build,ci}
# y CLAVE-XX es una clave Jira (ej. CURSO-12).
# ------------------------------------------------------------------

input=$(cat)

command=$(echo "$input" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

if ! echo "$command" | grep -qE 'git[[:space:]]+commit'; then
  echo '{"permission":"allow"}'
  exit 0
fi

message=$(echo "$command" | sed -nE 's/.*-m[[:space:]]+"([^"]+)".*/\1/p')
if [[ -z "$message" ]]; then
  message=$(echo "$command" | sed -nE "s/.*-m[[:space:]]+'([^']+)'.*/\1/p")
fi

if [[ -z "$message" ]]; then
  # Sin -m inline: se abrirá el editor, se permite.
  echo '{"permission":"allow"}'
  exit 0
fi

regex='^(feat|fix|refactor|docs|style|test|chore|perf|build|ci)\([A-Z]+-[0-9]+\):[[:space:]]+.+'

if echo "$message" | grep -qE "$regex"; then
  echo '{"permission":"allow"}'
else
  reason="El mensaje de commit no cumple el formato requerido.\\nFormato esperado: tipo(CURSO-XX): descripción\\nEjemplos válidos:\\n  feat(CURSO-4): añadir endpoint GET /api/products\\n  fix(CURSO-12): corregir fuga de conexiones en Prisma\\nMensaje recibido: ${message}"
  printf '{"permission":"deny","userMessage":"%s"}\n' "$reason"
fi
exit 0
