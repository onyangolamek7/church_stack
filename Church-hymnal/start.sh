#!/bin/sh

php artisan config:clear
php artisan cache:clear
php artisan migrate --force || echo "Migration failed, continuing anyway"

# Start php-fpm in background
php-fpm -D

# Start nginx in foreground (keeps container alive)
nginx -g "daemon off;"
