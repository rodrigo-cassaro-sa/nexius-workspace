-- 019_ensure_logs.sql
-- Garante que a tabela `logs` exista (ela ja consta no install.sql, mas bancos antigos
-- podem nao te-la). A partir de agora registrar_log() persiste no banco (fonte oficial),
-- com retencao de 1 ano feita por cron/limpar-logs.php. IF NOT EXISTS: seguro reexecutar.

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  acao VARCHAR(80) NOT NULL,
  entidade VARCHAR(40) NULL,
  entidade_id INT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  detalhes TEXT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_logs_usuario (usuario_id),
  KEY idx_logs_acao (acao),
  KEY idx_logs_entidade (entidade, entidade_id),
  KEY idx_logs_criado_em (criado_em),
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
