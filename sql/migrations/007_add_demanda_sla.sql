-- 007_add_demanda_sla.sql
-- SLA de resposta da demanda: registra quando a demanda foi "respondida".
-- Considera-se respondida quando a primeira acao (plano de acao) e criada.
-- O solicitante e o criador (criador_id) e a data de solicitacao e criado_em (ja existem).

ALTER TABLE demandas
  ADD COLUMN respondida_em DATETIME NULL AFTER concluida_em;
