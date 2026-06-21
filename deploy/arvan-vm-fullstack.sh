#!/usr/bin/env bash
# ============================================================
# Neura — استقرار فول‌استک روی سرور آروان (بدون Docker)
# Frontend (Nginx static) + Backend (Node/Express + systemd) + PostgreSQL
#
# پیش‌نیاز: پروکسی شل روشن باشد →  proxy-on
# اجرا:
#   git -C /opt/neura-ui pull && bash /opt/neura-ui/deploy/arvan-vm-fullstack.sh
#
# تنظیم اختیاری حساب سوپر‌ادمین (فقط بار اول):
#   SUPERADMIN_USERNAME=admin SUPERADMIN_PASSWORD='YourStrongPass' bash ...
# ============================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/neura-ui}"
WEB_ROOT="$APP_DIR/dist"
SITE="neura"
API_PORT="${API_PORT:-4000}"
DOMAIN="${DOMAIN:-}"            # مثلاً: nr.servein.ir
LE_EMAIL="${LE_EMAIL:-admin@${DOMAIN:-example.com}}"

log() { echo -e "\n\033[1;35m==> $*\033[0m"; }
SUDO=""; SUDOE=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; SUDOE="sudo -E"; fi

log "وضعیت پروکسی شل: http_proxy=${http_proxy:-<خالی>}"
[ -z "${http_proxy:-}" ] && echo "  ⚠️  اگر دانلودها timeout خورد، اول 'proxy-on' را بزن."

# --- 1) Node.js 22 ---
if ! command -v node >/dev/null 2>&1; then
  log "نصب Node.js 22 ..."
  $SUDO apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDOE bash -
  $SUDO apt-get install -y nodejs
else
  log "Node.js: $(node -v)"
fi
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
command -v pnpm >/dev/null 2>&1 || $SUDO corepack enable || $SUDO npm i -g pnpm

# --- 2) PostgreSQL ---
if ! command -v psql >/dev/null 2>&1; then
  log "نصب PostgreSQL ..."
  $SUDO apt-get install -y postgresql
fi
$SUDO systemctl enable --now postgresql
$SUDO pg_ctlcluster "$(ls /etc/postgresql)" main start 2>/dev/null || true

# --- 3) .env بک‌اند (فقط بار اول ساخته می‌شود) ---
if [ ! -f "$APP_DIR/server/.env" ]; then
  log "ساخت فایل پیکربندی بک‌اند (server/.env) ..."
  DB_PASS="$(openssl rand -hex 16)"
  JWT="$(openssl rand -hex 32)"
  $SUDO tee "$APP_DIR/server/.env" >/dev/null <<EOF
PORT=$API_PORT
NODE_ENV=production
DATABASE_URL=postgres://neura:${DB_PASS}@localhost:5432/neura
JWT_SECRET=${JWT}
JWT_EXPIRES=7d
SUPERADMIN_USERNAME=${SUPERADMIN_USERNAME:-superadmin}
SUPERADMIN_PASSWORD=${SUPERADMIN_PASSWORD:-Admin@12345}
SUPERADMIN_EMAIL=${SUPERADMIN_EMAIL:-admin@neura.app}
EOF
else
  log "server/.env از قبل وجود دارد — حفظ شد."
fi

# مقادیر را بخوان
set -a; . "$APP_DIR/server/.env"; set +a
DB_PASS="$(echo "$DATABASE_URL" | sed -n 's#.*://neura:\([^@]*\)@.*#\1#p')"

# --- 4) ساخت نقش و دیتابیس (idempotent) ---
log "آماده‌سازی نقش و دیتابیس PostgreSQL ..."
PG_SQL="
DO \$do\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='neura') THEN
    CREATE ROLE neura LOGIN PASSWORD '${DB_PASS}';
  END IF;
END \$do\$;
ALTER ROLE neura WITH LOGIN PASSWORD '${DB_PASS}';
SELECT 'CREATE DATABASE neura OWNER neura'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='neura')\gexec
"
# اجرای SQL به‌عنوان کاربر postgres (سازگار با root و non-root)
if [ "$(id -u)" -eq 0 ]; then
  printf '%s' "$PG_SQL" | su postgres -c "psql -v ON_ERROR_STOP=1"
else
  printf '%s' "$PG_SQL" | sudo -u postgres psql -v ON_ERROR_STOP=1
fi

# --- 5) نصب وابستگی‌های بک‌اند، مهاجرت و seed ---
log "نصب وابستگی‌های بک‌اند ..."
cd "$APP_DIR/server"
npm install --no-audit --no-fund
log "اجرای مهاجرت‌ها ..."
node src/migrate.js
log "بارگذاری داده اولیه (seed) ..."
node src/seed.js

# --- 6) سرویس systemd برای API ---
log "نصب سرویس systemd (neura-api) ..."
# گپ (هوش مصنوعی) از پروکسی شل (proxy-on) می‌رود؛ ippanel ایرانی است و مستقیم (NO_PROXY).
# این همان تنظیمی است که هر دو با هم کار می‌کردند.
PROXY="${AI_PROXY:-${https_proxy:-${http_proxy:-${HTTPS_PROXY:-${HTTP_PROXY:-}}}}}"
PROXY_ENV=""
if [ -n "$PROXY" ]; then
  echo "  پروکسی برای گپ/AI: $PROXY  (ippanel مستقیم)"
  PROXY_ENV="Environment=\"HTTP_PROXY=$PROXY\"
Environment=\"HTTPS_PROXY=$PROXY\"
Environment=\"NO_PROXY=localhost,127.0.0.1,::1,api2.ippanel.com,api.ippanel.com,ippanel.com,rest.ippanel.com\""
else
  echo "  ⚠️  پروکسی شل یافت نشد! برای کارکردِ هوش مصنوعی اول 'proxy-on' را بزن و دوباره اجرا کن."
fi
$SUDO tee /etc/systemd/system/neura-api.service >/dev/null <<EOF
[Unit]
Description=Neura API
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=$APP_DIR/server
EnvironmentFile=$APP_DIR/server/.env
$PROXY_ENV
ExecStart=$(command -v node) src/server.js
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
EOF
$SUDO systemctl daemon-reload
$SUDO systemctl enable neura-api
$SUDO systemctl restart neura-api

# --- 7) Build فرانت اصلی ---
log "ساخت فرانت‌اند اصلی ..."
cd "$APP_DIR"
pnpm install --frozen-lockfile
pnpm run build

# --- 7ب) Build پنل سوپر‌ادمین (/admin) ---
log "ساخت پنل سوپر‌ادمین (/admin) ..."
cd "$APP_DIR/admin"
npm install --no-audit --no-fund
npx vite build

# --- 8) Nginx: استاتیک + پراکسی /api ---
if ! command -v nginx >/dev/null 2>&1; then
  log "نصب Nginx ..."; $SUDO apt-get install -y nginx
fi
log "نوشتن کانفیگ Nginx ..."
$SUDO tee /etc/nginx/sites-available/$SITE >/dev/null <<NGINX
server {
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name  ${DOMAIN:-_};
    root         ${WEB_ROOT};
    index        index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;
    gzip_min_length 1024;

    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    # پنل سوپر‌ادمین (اپ مستقل) زیر مسیر /admin/
    location = /admin { return 301 /admin/; }
    location /admin/ {
        alias ${APP_DIR}/admin/dist/;
        try_files \$uri \$uri/ /admin/index.html;
    }

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

# --- 8ب) HTTPS با Let's Encrypt (در صورت تعیین DOMAIN) ---
if [ -n "$DOMAIN" ]; then
  log "دریافت گواهی HTTPS برای $DOMAIN ..."
  command -v certbot >/dev/null 2>&1 || $SUDO apt-get install -y certbot python3-certbot-nginx
  # certbot کانفیگ Nginx را برای 443 و ریدایرکت خودکار اصلاح می‌کند
  $SUDO certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$LE_EMAIL" --redirect || \
    echo "  ⚠️  دریافت گواهی ناموفق بود؛ مطمئن شو DNS دامنه به این سرور اشاره می‌کند و پورت ۸۰/۴۴۳ باز است."
fi

# --- 9) خلاصه ---
sleep 1
SITE_URL="${DOMAIN:+https://$DOMAIN/}"; SITE_URL="${SITE_URL:-http://<IP-سرور>/}"
log "تمام شد ✅"
echo "سایت:            ${SITE_URL}"
echo "سلامت API:        curl ${SITE_URL}api/health"
echo "ورود سوپر‌ادمین:  کاربری=${SUPERADMIN_USERNAME:-superadmin}  رمز=(همان مقدار .env)"
echo "وضعیت API:        systemctl status neura-api --no-pager"
echo "لاگ API:          journalctl -u neura-api -f"
echo "به‌روزرسانی بعدی:  git -C $APP_DIR pull && bash $APP_DIR/deploy/arvan-vm-fullstack.sh"
