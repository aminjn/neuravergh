#!/usr/bin/env bash
# ============================================================
# Neura UI — استقرار یک‌مرحله‌ای روی سرور خالی آروان (Docker)
# روی یک سرور Ubuntu/Debian تازه اجرا کنید (با کاربر root یا sudo):
#
#   curl -fsSL https://raw.githubusercontent.com/aminjn/Neurauidesign/claude/wizardly-mccarthy-pfcq08/deploy/arvan-vm-docker.sh | bash
#
# یا دستی:
#   wget <همین آدرس> -O deploy.sh && bash deploy.sh
# ============================================================
set -euo pipefail

# --- پیکربندی (در صورت نیاز تغییر دهید) ---
REPO_URL="${REPO_URL:-https://github.com/aminjn/Neurauidesign.git}"
BRANCH="${BRANCH:-claude/wizardly-mccarthy-pfcq08}"
APP_DIR="${APP_DIR:-/opt/neura-ui}"
IMAGE="${IMAGE:-neura-ui}"
CONTAINER="${CONTAINER:-neura-ui}"
PORT="${PORT:-80}"

log() { echo -e "\n\033[1;35m==> $*\033[0m"; }

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi

# --- 1) نصب Docker در صورت نبود ---
if ! command -v docker >/dev/null 2>&1; then
  log "نصب Docker ..."
  curl -fsSL https://get.docker.com | $SUDO sh
  $SUDO systemctl enable --now docker
else
  log "Docker از قبل نصب است."
fi

# --- 2) نصب git در صورت نبود ---
if ! command -v git >/dev/null 2>&1; then
  log "نصب git ..."
  if command -v apt-get >/dev/null 2>&1; then
    $SUDO apt-get update -y && $SUDO apt-get install -y git
  elif command -v dnf >/dev/null 2>&1; then
    $SUDO dnf install -y git
  elif command -v yum >/dev/null 2>&1; then
    $SUDO yum install -y git
  fi
fi

# --- 3) دریافت/به‌روزرسانی کد ---
if [ -d "$APP_DIR/.git" ]; then
  log "به‌روزرسانی مخزن موجود ..."
  $SUDO git -C "$APP_DIR" fetch origin "$BRANCH"
  $SUDO git -C "$APP_DIR" checkout "$BRANCH"
  $SUDO git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  log "کلون مخزن ..."
  $SUDO git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

# --- 4) build ایمیج ---
log "ساخت ایمیج Docker (ممکن است چند دقیقه طول بکشد) ..."
$SUDO docker build -t "$IMAGE" "$APP_DIR"

# --- 5) اجرای کانتینر ---
log "راه‌اندازی کانتینر روی پورت $PORT ..."
$SUDO docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
$SUDO docker run -d --name "$CONTAINER" --restart=always -p "${PORT}:80" "$IMAGE"

# --- 6) خلاصه ---
IP="$(curl -fsSL https://api.ipify.org 2>/dev/null || echo 'SERVER_IP')"
log "تمام شد ✅"
echo "اپ در دسترس است:  http://${IP}:${PORT}/"
echo "وضعیت کانتینر:    $SUDO docker ps --filter name=$CONTAINER"
echo "لاگ‌ها:           $SUDO docker logs -f $CONTAINER"
echo "به‌روزرسانی بعدی:  دوباره همین اسکریپت را اجرا کنید."
