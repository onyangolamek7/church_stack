FROM php:8.2-fpm

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    nginx curl zip unzip git libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY . .

RUN composer install --no-dev --optimize-autoloader

COPY ./nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 8080
CMD php artisan config:cache && php artisan route:cache && php artisan migrate --force && php-fpm -D && nginx -g "daemon off;"
