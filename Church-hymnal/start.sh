#!/bin/sh
set -e

export PORT=${PORT:-8000}
echo ">>> Starting on port: $PORT"

# Replace port in nginx template
sed "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo ">>> Laravel optimization..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ">>> Running migrations..."
php artisan migrate --force || echo "Migration skipped"

echo ">>> Fixing permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo ">>> Starting PHP-FPM..."
php-fpm -D

echo ">>> Starting Nginx..."
exec nginx -g "daemon off;"
