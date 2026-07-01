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
STAMP="$(date +%Y%m%d_%H%M%S)"

# Arquivos temporarios (credenciais + dump cru). Limpos ao sair (mesmo em erro).
CNF="$(mktemp)"
TMP="$(mktemp)"
trap 'rm -f "$CNF" "$TMP"' EXIT

# Credenciais fora da linha de comando (nao aparecem em `ps`).
# ssl-verify-server-cert=0: o servidor usa certificado self-signed na VPC privada;
# mantem a conexao, sem exigir cadeia de certificado valida.
cat > "$CNF" <<EOF
[client]
host=${DB_HOST}
user=${DB_USUARIO}
password=${DB_SENHA}
ssl-verify-server-cert=0
EOF

# Dump para arquivo (SEM pipe de proposito): assim uma falha do mysqldump aborta o
# script (set -e) e nao gera um .gz vazio "de sucesso". --single-transaction = consistente.
# --no-tablespaces: dispensa o privilegio global PROCESS. Sem --routines/--triggers/--events
# porque o schema e so tabelas (evita exigir privilegios EVENT/rotinas do usuario do app).
mysqldump --defaults-extra-file="$CNF" --single-transaction --quick --no-tablespaces "$DB_NOME" > "$TMP"

ARQ="$DIR/${DB_NOME}_${STAMP}.sql.gz"
gzip -c "$TMP" > "$ARQ"

# Rotacao: remove backups com mais de 12 meses.
find "$DIR" -name "${DB_NOME}_*.sql.gz" -type f -mtime +"$RETENCAO_DIAS" -delete

echo "$(date '+%F %T') backup-banco: gerado $ARQ ($(du -h "$ARQ" | cut -f1))"
