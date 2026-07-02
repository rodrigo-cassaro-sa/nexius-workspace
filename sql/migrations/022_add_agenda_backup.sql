-- 022_add_agenda_backup.sql
-- Suporte a "desfazer o ultimo recalculo de agenda": guarda o prazo anterior das tarefas
-- que o ultimo recalculo alterou. So o ultimo lote e mantido (o apply limpa antes de gravar).

CREATE TABLE IF NOT EXISTS agenda_prazo_backup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  prazo_anterior DATE NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_agenda_backup_acao (acao_id),
  CONSTRAINT fk_agenda_backup_acao FOREIGN KEY (acao_id) REFERENCES acoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
