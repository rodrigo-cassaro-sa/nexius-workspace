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

## 3. Backup no container do app (IMPLEMENTADO)

Além da opção 1, o **container do app já faz backup diário** (aproveitando a infra de cron do Dockerfile):

- **Quando:** todo dia **02:00** (horário de Brasília) — `docker/app-cron`.
- **Script:** `cron/backup-banco.sh` — `mysqldump` (usando `DB_HOST/DB_USUARIO/DB_SENHA/DB_NOME` do ambiente, via arquivo temporário de credenciais) → `gzip`.
- **Onde:** `storage/backups/nexius_workspace_AAAAMMDD_HHMMSS.sql.gz`.
- **Retenção:** **~12 meses** (remove arquivos com mais de 365 dias).
- Cliente MySQL (`default-mysql-client`, fornece `mysqldump`) instalado no `Dockerfile`.

### ⚠️ Dois pontos que você precisa garantir
1. **Volume persistente cobrindo `storage/backups`.** No EasyPanel, monte o volume persistente em `/var/www/html/storage` (cobre anexos **e** backups). Se o seu volume estiver montado só em `storage/anexos`, os backups **somem no redeploy** — ajuste o mount para `storage`.
2. **Autenticação do MySQL 8.** O `mysqldump` do Debian é o cliente MariaDB; se o usuário do banco usar `caching_sha2_password` (padrão do MySQL 8), pode dar **erro de autenticação**. Se acontecer (veja `logs/cron.log`), rode no MySQL:
   ```sql
   ALTER USER 'SEU_DB_USUARIO'@'%' IDENTIFIED WITH mysql_native_password BY 'A_SENHA_ATUAL';
   FLUSH PRIVILEGES;
   ```
   (ou crie um usuário de backup só-leitura com `mysql_native_password`).

### Testar manualmente (terminal do container)
```sh
sh /var/www/html/cron/backup-banco.sh
ls -lh /var/www/html/storage/backups/
```

**Ressalva importante:** este backup fica no **mesmo host do app** — **não é offsite**. Mantê-lo é ótimo, mas para segurança real continue considerando a **opção 1** (no servidor do banco) e/ou **enviar os `.sql.gz` para fora** (Spaces/rclone). Restauração: mesma da seção 2 (baixe o arquivo de `storage/backups`).

---

## 4. Segurança

- O dump contém **todos os dados** (senhas são só hash, mas há e-mails, tokens, conteúdo). Trate como sigiloso: dir `700`, arquivos `600`, nunca em pasta pública nem no repositório.
- Credenciais só em `~/.my.cnf` (perms `600`) — nunca no comando/cron.
- Se enviar offsite, use destino privado (bucket sem acesso público) e, idealmente, criptografia.
