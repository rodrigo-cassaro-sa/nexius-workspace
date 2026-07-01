#!/bin/sh
# backup-banco.sh
# Backup diario do banco (rodado pelo cron do container). Mantem ~12 meses.
# Grava em storage/backups (que DEVE estar num volume persistente do EasyPanel,
# senao o backup some no redeploy). Credenciais vem das variaveis de ambiente
# (DB_HOST, DB_USUARIO, DB_SENHA, DB_NOME), disponibilizadas ao cron via /etc/environment.
set -eu

DIR="/var/www/html/storage/backups"
RETENCAO_DIAS=365   # ~12 meses

mkdir -p "$DIR"
ARQ="$DIR/${DB_NOME}_$(date +%Y%m%d_%H%M%S).sql.gz"

# Arquivo temporario de credenciais: evita a senha na linha de comando (visivel em `ps`).
CNF="$(mktemp)"
trap 'rm -f "$CNF"' EXIT
cat > "$CNF" <<EOF
[client]
host=${DB_HOST}
user=${DB_USUARIO}
password=${DB_SENHA}
EOF

# --single-transaction: dump consistente sem travar as tabelas (InnoDB).
mysqldump --defaults-extra-file="$CNF" --single-transaction --quick \
  --routines --triggers --events "$DB_NOME" | gzip > "$ARQ"

# Rotacao: remove backups com mais de 12 meses.
find "$DIR" -name "${DB_NOME}_*.sql.gz" -type f -mtime +"$RETENCAO_DIAS" -delete

echo "$(date '+%F %T') backup-banco: gerado $ARQ ($(du -h "$ARQ" | cut -f1))"
