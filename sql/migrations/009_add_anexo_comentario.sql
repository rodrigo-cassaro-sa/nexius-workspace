-- 009_add_anexo_comentario.sql
-- Anexos tambem em comentarios de acao (decisao de produto). Reaproveita a mesma tabela
-- e a mesma pasta privada dos anexos de demanda; muda so o vinculo.
-- comentario_id NULL  -> anexo da demanda (como antes).
-- comentario_id != NULL -> anexo de um comentario (demanda_id continua preenchido para o escopo).

ALTER TABLE anexos
  ADD COLUMN comentario_id INT NULL AFTER demanda_id,
  ADD KEY idx_anexos_comentario (comentario_id),
  ADD CONSTRAINT fk_anexos_comentario FOREIGN KEY (comentario_id) REFERENCES comentarios(id);
