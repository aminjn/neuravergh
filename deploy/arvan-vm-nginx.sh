#!/usr/bin/env bash
# ============================================================
# Neura UI — استقرار روی سرور آروان بدون Docker (Node + Nginx)
# مناسب وقتی Docker Hub بلاک است. همه چیز در شل اجرا می‌شود،
# پس از همان پروکسی فعالِ شل (proxy-on) استفاده می‌کند.
#
# پیش‌نیاز: قبل از اجرا، پروکسی شل را روشن کن:  proxy-on
# اجرا:
#   git -C /opt/neura-ui pull && bash /opt/neura-ui/deploy/arvan-vm-nginx.sh
# ============================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/neura-ui}"
WEB_ROOT="${WEB_ROOT:-$APP_DIR/dist}"
SITE="${SITE:-neura}"
SERVER_NAME="${SERVER_NAME:-_}"

log() { echo -e "\n\033[1;35m==> $*\033[0m"; }
SUDO=""; SUDOE=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; SUDOE="sudo -E"; fi

log "وضعیت پروکسی شل:"
echo "  http_proxy=${http_proxy:-<خالی>}   https_proxy=${https_proxy:-<خالی>}"
if [ -z "${http_proxy:-}" ]; then
  echo "  ⚠️  پروکسی خالی است. اگر دانلودها timeout خورد، اول 'proxy-on' را بزن و دوباره اجرا کن."
fi

# --- 1) Node.js 22 ---
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ] 2>/dev/null; then
  log "نصب Node.js 22 (NodeSource) ..."
  $SUDO apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDOE bash -
  $SUDO apt-get install -y nodejs
else
  log "Node.js از قبل نصب است: $(node -v)"
fi

# --- 2) pnpm ---
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
if ! command -v pnpm >/dev/null 2>&1; then
  log "فعال‌سازی pnpm ..."
  $SUDO corepack enable || $SUDO npm i -g pnpm
fi

# --- 3) نصب وابستگی‌ها و build ---
log "نصب وابستگی‌ها (pnpm install) ..."
cd "$APP_DIR"
pnpm install --frozen-lockfile

log "ساخت خروجی (pnpm build) ..."
pnpm run build

# --- 4) Nginx ---
if ! command -v nginx >/dev/null 2>&1; then
  log "نصب Nginx ..."
  $SUDO apt-get install -y nginx
fi

log "نوشتن کانفیگ Nginx ..."
$SUDO tee /etc/nginx/sites-available/$SITE >/dev/null <<NGINX
server {
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name  ${SERVER_NAME};
    root         ${WEB_ROOT};
    index        index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;
    gzip_min_length 1024;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

$SUDO ln -sf /etc/nginx/sites-available/$SITE /etc/nginx/sites-enabled/$SITE
$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO nginx -t
$SUDO systemctl enable nginx
$SUDO systemctl restart nginx

IP="$(curl -fsSL https://api.ipify.org 2>/dev/null || echo SERVER_IP)"
log "تمام شد ✅"
echo "اپ در دسترس است:  http://${IP}/"
echo "به‌روزرسانی بعدی:  git -C $APP_DIR pull && bash $APP_DIR/deploy/arvan-vm-nginx.sh"
