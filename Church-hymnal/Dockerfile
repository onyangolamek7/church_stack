FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache nginx git unzip curl \
    && docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy project
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose Laravel's built-in server port
EXPOSE 8000

RUN printf '#!/bin/sh'\n\
    php artisan config:clear\n\
    php artisan config:cache\n\
    php artisan route:cache\n\
    php artisan migrate --force\n\
    php artisan serve --host=0.0.0.0 --port=8000\n' > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
