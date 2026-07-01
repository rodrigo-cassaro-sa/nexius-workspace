# Dockerfile - Workspace S&A (Grupo Nexius)
# Stack: PHP procedural + Apache + MySQL (banco externo, no droplet).
# Imagem oficial PHP com Apache.
FROM php:8.2-apache

# Extensao do MySQL (mysqli) usada pelo backend.
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Cron para as tarefas agendadas + timezone America/Sao_Paulo (horarios em Brasilia).
# O cron usa /etc/localtime para decidir a hora de execucao; tzdata fornece o fuso.
# default-mysql-client fornece o mysqldump usado no backup diario do banco.
RUN apt-get update \
    && apt-get install -y --no-install-recommends cron tzdata default-mysql-client \
    && ln -snf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && echo "America/Sao_Paulo" > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=America/Sao_Paulo

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
      echo "date.timezone=America/Sao_Paulo"; \
    } > /usr/local/etc/php/conf.d/zz-app.ini

# Copia a aplicacao para a imagem.
WORKDIR /var/www/html
COPY . /var/www/html

# Tarefas agendadas (cron). Arquivo no formato /etc/cron.d (precisa de 0644 e dono root).
COPY docker/app-cron /etc/cron.d/app-cron
RUN chmod 0644 /etc/cron.d/app-cron

# Pastas de runtime gravaveis (logs, anexos das demandas e backups do banco).
RUN mkdir -p /var/www/html/logs /var/www/html/storage/anexos /var/www/html/storage/backups \
    && chown -R www-data:www-data /var/www/html/logs /var/www/html/storage

EXPOSE 80

# No start do container:
# 1) reaplica dono/escrita das pastas de runtime (logs e storage/anexos) - um volume
#    persistente montado em runtime e remontado como root e anula o chown do build;
# 2) copia as variaveis de ambiente do container para /etc/environment, para que o CRON
#    (que roda com ambiente minimo) enxergue DB_*, RESEND_*, etc. via PAM;
# 3) inicia o daemon do cron;
# 4) sobe o Apache em foreground (processo principal do container).
CMD ["sh", "-c", "mkdir -p /var/www/html/logs /var/www/html/storage/anexos /var/www/html/storage/backups && chown -R www-data:www-data /var/www/html/logs /var/www/html/storage; printenv > /etc/environment; cron; exec apache2-foreground"]
