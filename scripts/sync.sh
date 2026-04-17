#!/usr/bin/env bash
# =============================================================
# sync.sh — Sincronización bidireccional con GitHub
# Tienda Virtual CR
#
# Uso:
#   ./scripts/sync.sh                   # pull --rebase + push
#   ./scripts/sync.sh --dry-run         # muestra qué haría sin tocar nada
#   ./scripts/sync.sh --tags            # también sincroniza tags
#   ./scripts/sync.sh --all-branches    # push de todas las ramas locales
#
# Requisitos: git >= 2.30, conexión a GitHub configurada (HTTPS o SSH)
# =============================================================
set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "[ERROR] No estás dentro de un repo git." >&2
  exit 1
}
cd "$REPO_ROOT"

LOG_DIR="$REPO_ROOT/.git/sync-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/sync-$(date +%Y%m%d-%H%M%S).log"

# --- Flags ---
DRY_RUN=0
PUSH_TAGS=0
PUSH_ALL=0
for arg in "$@"; do
  case "$arg" in
    --dry-run)       DRY_RUN=1 ;;
    --tags)          PUSH_TAGS=1 ;;
    --all-branches)  PUSH_ALL=1 ;;
    -h|--help)
      sed -n '2,15p' "$0"; exit 0 ;;
    *)
      echo "[WARN] argumento desconocido: $arg" ;;
  esac
done

# --- Helpers ---
log() {
  local msg="[$(date +%H:%M:%S)] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

run() {
  log "+ $*"
  if [[ $DRY_RUN -eq 1 ]]; then
    log "  (dry-run, no ejecuto)"
    return 0
  fi
  if ! "$@" >>"$LOG_FILE" 2>&1; then
    log "[ERROR] Falló: $*"
    log "  Revisa el log completo: $LOG_FILE"
    return 1
  fi
}

# --- Validaciones previas ---
log "===== Sincronización iniciada ====="
log "Repo:    $REPO_ROOT"
log "Branch:  $(git rev-parse --abbrev-ref HEAD)"

if ! git remote get-url origin >/dev/null 2>&1; then
  log "[ERROR] No hay 'origin' configurado. Configúralo con:"
  log "        git remote add origin https://github.com/USUARIO/REPO.git"
  exit 2
fi
log "Origin:  $(git remote get-url origin)"

# Verificar conectividad con GitHub
if ! git ls-remote --exit-code origin >/dev/null 2>&1; then
  log "[ERROR] No hay conexión con el remote (red o autenticación)."
  log "        Prueba 'git ls-remote origin' para ver el detalle."
  exit 3
fi

# Aviso de cambios locales sin commitear
if [[ -n "$(git status --porcelain)" ]]; then
  log "[WARN] Tienes cambios sin commitear. Sólo se sincronizarán commits ya creados."
  log "       Estado actual:"
  git status --short | sed 's/^/         /' | tee -a "$LOG_FILE"
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# --- 1. Fetch + prune ---
log "----- Paso 1/5: Fetch + prune -----"
run git fetch --all --prune --tags || exit 4

# --- 2. Submódulos ---
if [[ -f .gitmodules ]]; then
  log "----- Paso 2/5: Submódulos -----"
  run git submodule sync --recursive
  run git submodule update --init --recursive
else
  log "----- Paso 2/5: Sin submódulos (omitido) -----"
fi

# --- 3. Integrar cambios remotos (rebase) ---
log "----- Paso 3/5: Integrar cambios del remote -----"
if git rev-parse --verify --quiet "origin/$CURRENT_BRANCH" >/dev/null; then
  LOCAL_HEAD=$(git rev-parse HEAD)
  REMOTE_HEAD=$(git rev-parse "origin/$CURRENT_BRANCH")
  BASE=$(git merge-base HEAD "origin/$CURRENT_BRANCH")

  if [[ "$LOCAL_HEAD" == "$REMOTE_HEAD" ]]; then
    log "  Local y remote ya están alineados ($LOCAL_HEAD)."
  elif [[ "$LOCAL_HEAD" == "$BASE" ]]; then
    log "  Fast-forward del remote."
    run git merge --ff-only "origin/$CURRENT_BRANCH" || exit 5
  elif [[ "$REMOTE_HEAD" == "$BASE" ]]; then
    log "  Local adelantado, no requiere merge."
  else
    log "  Ramas divergidas. Intentando rebase..."
    if ! run git rebase "origin/$CURRENT_BRANCH"; then
      log "[ERROR] Conflictos durante rebase. Resuélvelos manualmente y luego:"
      log "        git rebase --continue   (o git rebase --abort para cancelar)"
      exit 6
    fi
  fi
else
  log "  La rama '$CURRENT_BRANCH' no existe en el remote todavía."
fi

# --- 4. Push ---
log "----- Paso 4/5: Push al remote -----"
if [[ $PUSH_ALL -eq 1 ]]; then
  run git push origin --all || exit 7
else
  run git push -u origin "$CURRENT_BRANCH" || exit 7
fi

if [[ $PUSH_TAGS -eq 1 ]]; then
  run git push origin --tags || exit 8
fi

# --- 5. Verificación final de integridad ---
log "----- Paso 5/5: Verificación de integridad -----"
git fetch origin --quiet 2>>"$LOG_FILE"
LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse "origin/$CURRENT_BRANCH" 2>/dev/null || echo "N/A")
LOCAL_COMMITS=$(git rev-list --count HEAD)
REMOTE_COMMITS=$(git rev-list --count "origin/$CURRENT_BRANCH" 2>/dev/null || echo "?")
LOCAL_TAGS=$(git tag | wc -l)
REMOTE_TAGS=$(git ls-remote --tags origin 2>/dev/null | grep -v '\^{}' | wc -l)

log "  HEAD local:    $LOCAL_HEAD"
log "  HEAD remote:   $REMOTE_HEAD"
log "  Commits local/remote:  $LOCAL_COMMITS / $REMOTE_COMMITS"
log "  Tags local/remote:     $LOCAL_TAGS / $REMOTE_TAGS"

if [[ "$LOCAL_HEAD" == "$REMOTE_HEAD" ]]; then
  log "[OK] Local y remote están sincronizados."
  log "===== Sincronización completada ====="
  exit 0
else
  log "[WARN] HEAD local y remote no coinciden. Revisa el log."
  exit 9
fi
