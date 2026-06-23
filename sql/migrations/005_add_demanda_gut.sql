-- 005_add_demanda_gut.sql
-- Matriz de priorizacao GUT: Gravidade, Urgencia e Tendencia (1 a 5 cada).
-- A prioridade e calculada como G * U * T (1 a 125) na consulta; nao e armazenada.
-- Colunas NULL para nao quebrar demandas antigas; a criacao valida 1 a 5 no backend.

ALTER TABLE demandas
  ADD COLUMN gut_gravidade TINYINT NULL AFTER sugestao_solucao,
  ADD COLUMN gut_urgencia TINYINT NULL AFTER gut_gravidade,
  ADD COLUMN gut_tendencia TINYINT NULL AFTER gut_urgencia;
