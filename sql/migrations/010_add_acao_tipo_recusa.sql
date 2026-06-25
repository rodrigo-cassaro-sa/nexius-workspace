-- 010_add_acao_tipo_recusa.sql
-- Tipos de tarefa na acao e recusa de entrega (decisao de produto D19).
-- tipo: analise | desenvolvimento | entrega | incidente.
--   - analise: so conclui com arquivo anexado (evidencia) -> reaproveita a tabela anexos (acao_id).
--   - desenvolvimento: conclui normal.
--   - entrega: conclui normal, mas pode ser recusada (status 'recusada' + motivo_recusa).
--   - incidente: registro/relato; conclui normal.
-- Sem tabela nova. CHECK reforca as listas fechadas (MySQL 8.0.16+); o backend tambem valida.

-- Status ganha o valor 'recusada' (recriando a constraint nomeada).
ALTER TABLE acoes DROP CHECK chk_acoes_status;
ALTER TABLE acoes
  ADD CONSTRAINT chk_acoes_status CHECK (status IN ('pendente','bloqueada','concluida','cancelada','recusada'));

-- Tipo da tarefa e motivo de recusa.
ALTER TABLE acoes
  ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'desenvolvimento' AFTER titulo,
  ADD COLUMN motivo_recusa TEXT NULL AFTER status,
  ADD CONSTRAINT chk_acoes_tipo CHECK (tipo IN ('analise','desenvolvimento','entrega','incidente'));

-- Evidencia da analise: anexo ligado a acao (mesma tabela/pasta dos demais anexos).
ALTER TABLE anexos
  ADD COLUMN acao_id INT NULL AFTER comentario_id,
  ADD KEY idx_anexos_acao (acao_id),
  ADD CONSTRAINT fk_anexos_acao FOREIGN KEY (acao_id) REFERENCES acoes(id);
