-- 004_add_acao_visualizacoes.sql
-- Lastro de visualizacao das tarefas (acoes): registra quem abriu o detalhe de cada
-- acao e quando viu pela primeira vez. Uma linha por (acao, usuario).

CREATE TABLE IF NOT EXISTS acao_visualizacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  visualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_acao_visualizacao (acao_id, usuario_id),
  KEY idx_av_acao (acao_id),
  KEY idx_av_usuario (usuario_id),
  CONSTRAINT fk_av_acao FOREIGN KEY (acao_id) REFERENCES acoes(id),
  CONSTRAINT fk_av_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
