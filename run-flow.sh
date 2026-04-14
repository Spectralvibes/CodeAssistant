#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_DIR="$SCRIPT_DIR/.github/prompts"

if [[ ! -d "$PROMPT_DIR" ]]; then
  echo "ERROR: Prompt directory not found: $PROMPT_DIR" >&2
  exit 1
fi

COMMAND=${1:-help}
shift || true

function usage() {
  cat <<EOF
Usage: $0 <action> [command] [args]

Actions:
  list                  List available agent commands
  info <command>        Show prompt metadata for a command
  open <command>        Open the prompt file in VS Code (if available) or print its path
  run <command> [args]  Show the command stub and target prompt file
  help                  Show this help message

Commands:
  new-project
  new-milestone
  plan-phase
  execute-phase
  verify-work
  progress
  map-codebase
  research-phase
  help

Examples:
  $0 list
  $0 info plan-phase
  $0 open new-project
  $0 run execute-phase 1
EOF
}

function resolve_prompt_file() {
  local cmd="$1"
  local prompt_file="$PROMPT_DIR/${cmd}.prompt.md"
  if [[ ! -f "$prompt_file" ]]; then
    echo ""  # return empty if not found
    return 1
  fi
  printf '%s' "$prompt_file"
}

function list_commands() {
  find "$PROMPT_DIR" -maxdepth 1 -name '*.prompt.md' -type f | sort | while read -r file; do
    basename "$file" .prompt.md
  done | column
}

function show_info() {
  local cmd="$1"
  local file
  file=$(resolve_prompt_file "$cmd") || {
    echo "Command '$cmd' not found." >&2
    exit 1
  }

  echo "Prompt file: $file"
  echo "---"
  awk 'BEGIN { FS=":" } /^name:/ { print "name: " substr($0, index($0,$2)) } /^description:/ { print "description: " substr($0, index($0,$2)) }' "$file"

  echo
  echo "Excerpt from prompt file:"
  echo "---"
  sed -n '1,40p' "$file"
}

function open_prompt() {
  local cmd="$1"
  local file
  file=$(resolve_prompt_file "$cmd") || {
    echo "Command '$cmd' not found." >&2
    exit 1
  }

  if command -v code >/dev/null 2>&1; then
    code "$file"
  else
    echo "VS Code CLI 'code' not found. Prompt file path: $file"
  fi
}

function run_command() {
  local cmd="$1"
  shift || true
  local extra="${*:-}"
  local file
  file=$(resolve_prompt_file "$cmd") || {
    echo "Command '$cmd' not found." >&2
    exit 1
  }

  echo "Command: /${cmd}.md ${extra}" | sed 's/  / /g'
  echo
  echo "Prompt file: $file"
  echo
  echo "Note: This repository currently provides prompt definitions and workflow scaffolding.
To execute the command you can open the prompt file in your agent environment or copy the command text into your Copilot-like runner."
}

case "$COMMAND" in
  list)
    list_commands
    ;;
  info)
    if [[ $# -lt 1 ]]; then
      echo "Missing command name." >&2
      usage
      exit 1
    fi
    show_info "$1"
    ;;
  open)
    if [[ $# -lt 1 ]]; then
      echo "Missing command name." >&2
      usage
      exit 1
    fi
    open_prompt "$1"
    ;;
  run)
    if [[ $# -lt 1 ]]; then
      echo "Missing command name." >&2
      usage
      exit 1
    fi
    run_command "$@"
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    echo "Unknown action: $COMMAND" >&2
    usage
    exit 1
    ;;
esac
