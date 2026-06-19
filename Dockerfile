# Dockerfile - Workspace S&A (Grupo Nexius)
# Stack: PHP procedural + Apache + MySQL (banco externo, no droplet).
# Imagem oficial PHP com Apache.
FROM php:8.2-apache

# Extensao do MySQL (mysqli) usada pelo backend.
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Modulos do Apache (headers para seguranca; rewrite para uso futuro).
RUN a2enmod rewrite headers

# Configuracao do Apache:
# DocumentRoot = public/ (apenas o frontend), Alias /api para os endpoints.
# includes/, sql/, cron/ e logs/ ficam FORA do DocumentRoot e nao sao servidos pela web.
COPY docker/apache-app.conf /etc/apache2/sites-available/000-default.conf

# Hardening de PHP para producao: nao exibir erro tecnico ao usuario; registrar em log.
RUN { \
      echo "display_errors=Off"; \
      echo "log_errors=On"; \
      echo "expose_php=Off"; \
    } > /usr/local/etc/php/conf.d/zz-app.ini

# Copia a aplicacao para a imagem.
WORKDIR /var/www/html
COPY . /var/www/html

# A pasta de logs precisa ser gravavel pelo Apache (www-data).
RUN mkdir -p /var/www/html/logs \
    && chown -R www-data:www-data /var/www/html/logs

EXPOSE 80
