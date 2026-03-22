FROM php:8.2-fpm

WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx curl zip unzip git \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# PHP error logging to stdout (visible in Railway logs)
RUN echo "log_errors=On" >> /usr/local/etc/php/php.ini \
    && echo "error_log=/proc/1/fd/2" >> /usr/local/etc/php/php.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application source
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions for Laravel writable directories
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copy nginx config and startup script
COPY ./nginx.conf /etc/nginx/sites-enabled/default
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# Railway will map $PORT dynamically — no hardcoded EXPOSE needed
# but we document 8080 as the internal default fallback
EXPOSE 8080

CMD ["/start.sh"]
