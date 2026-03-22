#!/bin/sh
set -e

# ──────────────────────────────────────────────
# 1. Resolve PORT — Railway injects $PORT at runtime.
#    Fall back to 8080 if not set (local dev).
# ──────────────────────────────────────────────
export PORT=${PORT:-8080}
echo ">>> Starting on port: $PORT"

# ──────────────────────────────────────────────
# 2. Guard: fail fast if critical env vars are missing
# ──────────────────────────────────────────────
if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is not set. Run: php artisan key:generate --show"
  exit 1
fi

if [ -z "$DB_HOST" ]; then
  echo "ERROR: DB_HOST is not set. Check Railway MySQL variables."
  exit 1
fi

# ──────────────────────────────────────────────
# 3. Inject dynamic PORT into nginx config
#    (replaces the __PORT__ placeholder)
# ──────────────────────────────────────────────
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/sites-enabled/default

# ──────────────────────────────────────────────
# 4. Laravel bootstrap
# ──────────────────────────────────────────────
echo ">>> Clearing and caching Laravel config..."
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ">>> Running migrations..."
php artisan migrate --force || echo "WARNING: Migration failed — continuing anyway"

# ──────────────────────────────────────────────
# 5. Fix storage permissions (safety net)
# ──────────────────────────────────────────────
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# ──────────────────────────────────────────────
# 6. Start PHP-FPM in background, nginx in foreground
# ──────────────────────────────────────────────
echo ">>> Starting PHP-FPM..."
php-fpm -D

echo ">>> Starting nginx on port $PORT..."
exec nginx -g "daemon off;"
