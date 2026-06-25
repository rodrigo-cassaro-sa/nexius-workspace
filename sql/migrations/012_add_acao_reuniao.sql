-- 012_add_acao_reuniao.sql
-- Novo tipo de tarefa "reuniao" (decisao de produto, extensao da D19).
-- - Conclusao exige anexar a ATA (mesmo mecanismo de evidencia do tipo "analise": anexos.acao_id).
-- - Pode ter VARIAS pessoas envolvidas -> tabela nova acao_participantes (relacao acao x usuarios).
--   Participantes contam como "envolvidos" na demanda (escopo de visibilidade) e sao notificados.

-- Amplia o enum de tipos (recria a constraint nomeada).
ALTER TABLE acoes DROP CHECK chk_acoes_tipo;
ALTER TABLE acoes
  ADD CONSTRAINT chk_acoes_tipo CHECK (tipo IN ('analise','desenvolvimento','entrega','incidente','reuniao'));

-- Participantes de uma acao (usado por reuniao; uma linha por pessoa envolvida).
CREATE TABLE IF NOT EXISTS acao_participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_acao_participante (acao_id, usuario_id),
  KEY idx_ap_acao (acao_id),
  KEY idx_ap_usuario (usuario_id),
  CONSTRAINT fk_ap_acao FOREIGN KEY (acao_id) REFERENCES acoes(id),
  CONSTRAINT fk_ap_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
