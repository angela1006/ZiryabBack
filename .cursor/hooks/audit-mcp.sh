#!/usr/bin/env bash
# ------------------------------------------------------------------
# Hook: afterMCPExecution
# Registra todas las llamadas MCP en .cursor/hooks/mcp-audit.log
# con fecha, nombre de la herramienta y resumen de parámetros.
# ------------------------------------------------------------------

input=$(cat)
log_file=".cursor/hooks/mcp-audit.log"

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

tool=$(echo "$input" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*"tool_name"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')
if [[ -z "$tool" ]]; then
  tool=$(echo "$input" | grep -oE '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*"toolName"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')
fi
[[ -z "$tool" ]] && tool="unknown"

params=$(echo "$input" | tr -d '\n' | grep -oE '"(arguments|params)"[[:space:]]*:[[:space:]]*\{[^}]*\}' | head -c 200)
mkdir -p "$(dirname "$log_file")"
echo "[$timestamp] $tool - ${params}" >> "$log_file"

echo '{}'
exit 0