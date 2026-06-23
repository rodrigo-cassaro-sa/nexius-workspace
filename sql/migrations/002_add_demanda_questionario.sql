-- 002_add_demanda_questionario.sql
-- Adiciona o questionario obrigatorio da demanda (6 campos de texto livre).
-- As colunas ficam NULL no banco para nao quebrar linhas antigas;
-- a obrigatoriedade na CRIACAO e validada no backend (api/demandas/criar.php).

ALTER TABLE demandas
  ADD COLUMN problema TEXT NULL AFTER descricao,
  ADD COLUMN impacto_operacional TEXT NULL AFTER problema,
  ADD COLUMN risco TEXT NULL AFTER impacto_operacional,
  ADD COLUMN afeta_outros TEXT NULL AFTER risco,
  ADD COLUMN workaround TEXT NULL AFTER afeta_outros,
  ADD COLUMN sugestao_solucao TEXT NULL AFTER workaround;
