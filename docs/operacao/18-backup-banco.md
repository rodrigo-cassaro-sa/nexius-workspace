# Backup do banco de dados (MySQL)

O MySQL é **externo** (roda no droplet, separado do container do app no EasyPanel). O backup deve ficar **no servidor do banco** (isolado do app) e, de preferência, ter uma **cópia fora do servidor** (offsite). Perder o banco é o pior cenário — este procedimento é a rede de segurança.

> Regra de ouro: um backup só vale se você **já testou restaurar** dele.

---

## 1. Recomendado — cron no servidor do MySQL (droplet)

### 1.1. Usuário de backup (somente leitura)
Crie um usuário do MySQL só para o backup (não use root):

```sql
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'TROQUE_POR_UMA_SENHA_FORTE';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER, PROCESS, REPLICATION CLIENT ON *.* TO 'backup_user'@'localhost';
FLUSH PRIVILEGES;
```

### 1.2. Credenciais fora da linha de comando (`~/.my.cnf`)
Nunca passe a senha no comando (fica no histórico/`ps`). Crie `~/.my.cnf` do usuário que roda o cron:

```ini
[client]
user=backup_user
password=TROQUE_POR_UMA_SENHA_FORTE
host=127.0.0.1
```

```sh
chmod 600 ~/.my.cnf
```

### 1.3. Script de backup
Salve como `/usr/local/bin/backup-nexius.sh` e dê permissão (`chmod +x`):

```sh
#!/usr/bin/env bash
# Backup diario do banco do Workspace S&A. Rotaciona por N dias.
set -euo pipefail

DB_NOME="nexius_workspace"
DIR="/var/backups/nexius"      # de preferencia um disco/volume separado
RETENCAO_DIAS=14

mkdir -p "$DIR"; chmod 700 "$DIR"
ARQ="$DIR/${DB_NOME}_$(date +%Y%m%d_%H%M%S).sql.gz"

# Credenciais vem do ~/.my.cnf. --single-transaction = dump consistente sem travar o app.
mysqldump --single-transaction --quick --routines --triggers --events "$DB_NOME" \
  | gzip > "$ARQ"
chmod 600 "$ARQ"

# Rotacao: remove backups com mais de N dias.
find "$DIR" -name "${DB_NOME}_*.sql.gz" -type f -mtime +"$RETENCAO_DIAS" -delete

echo "$(date '+%F %T') Backup OK: $ARQ ($(du -h "$ARQ" | cut -f1))"
```

### 1.4. Agendar (cron do droplet)
`crontab -e` e adicione (02:30, antes da limpeza de logs às 03:00):

```
30 2 * * * /usr/local/bin/backup-nexius.sh >> /var/log/nexius-backup.log 2>&1
```

### 1.5. Cópia offsite (fortemente recomendado)
Backup no mesmo servidor não protege contra perda do servidor. Envie para fora:

- **DigitalOcean Spaces / S3** (com `rclone` ou `s3cmd`), ex. no fim do script:
  `rclone copy "$ARQ" spaces:nexius-backups/`
- ou `scp`/`rsync` para outra máquina.

---

## 2. Restauração (teste periodicamente!)

Restaurar **sobrescreve** os dados. Faça em um banco vazio/de teste primeiro.

```sh
# Recria o banco (CUIDADO: apaga o atual) e restaura:
mysql -e "DROP DATABASE IF EXISTS nexius_workspace; CREATE DATABASE nexius_workspace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
gunzip < /var/backups/nexius/nexius_workspace_AAAAMMDD_HHMMSS.sql.gz | mysql nexius_workspace
```

> Teste a restauração num banco separado (ex.: `nexius_workspace_teste`) a cada tanto — é o que garante que o backup presta.

---

## 3. Alternativa — cron no container do app (EasyPanel)

Se preferir manter junto com os outros crons (Dockerfile), dá para rodar o `mysqldump` do container, que já acessa o banco (`DB_HOST`). Requer:

1. Instalar o cliente no `Dockerfile`: `apt-get install -y default-mysql-client`.
2. Um script que use as envs (`DB_HOST`, `DB_USUARIO`, `DB_SENHA`, `DB_NOME`) e grave em **volume persistente** (senão o dump some no redeploy).
3. Entrada no `docker/app-cron`.

**Ressalva:** o dump fica no **mesmo host do app** — não é offsite. Se o app/host cair, o backup vai junto. Por isso a opção 1 (no servidor do banco + cópia offsite) é a preferida. Posso implementar esta alternativa no Dockerfile se você quiser — me avise.

---

## 4. Segurança

- O dump contém **todos os dados** (senhas são só hash, mas há e-mails, tokens, conteúdo). Trate como sigiloso: dir `700`, arquivos `600`, nunca em pasta pública nem no repositório.
- Credenciais só em `~/.my.cnf` (perms `600`) — nunca no comando/cron.
- Se enviar offsite, use destino privado (bucket sem acesso público) e, idealmente, criptografia.
