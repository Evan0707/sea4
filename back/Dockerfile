# On part d'une base PHP avec Apache
FROM php:8.4-apache

# 1. On installe les dépendances système, PostgreSQL, Git et les librairies pour Zip et Intl
RUN apt-get update && apt-get install -y libpq-dev unzip \
    git \
    unzip \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo pdo_pgsql intl zip

# 2. On configure Apache pour qu'il lise le dossier /public de Symfony
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN a2enmod rewrite

# 3. On copie tout votre code dans le serveur
COPY . /var/www/html/

# 4. On installe Composer et on télécharge vos dépendances Symfony
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
# Ajout de --no-interaction pour éviter les blocages
RUN composer install --no-dev --optimize-autoloader --no-interaction

# 5. On vide le cache et on donne les droits à Apache
RUN php bin/console cache:clear --env=prod \
    && chown -R www-data:www-data /var/www/html/var

# 6. On ouvre le port 80
EXPOSE 80