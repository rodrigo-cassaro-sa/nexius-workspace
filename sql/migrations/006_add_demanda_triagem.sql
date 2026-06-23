-- 006_add_demanda_triagem.sql
-- Campos de triagem da demanda (ajudam a classificar e a montar o plano de acao):
--  origem        : onde (sistema, processo, area)
--  momento_etapa : em qual momento ou etapa
--  intencao      : melhoria | defeito | nova_solucao
--  pilar         : processo | financeiro | pessoas | cliente
--  objetivo      : reducao_custo | relevancia_marca | organizacao_trabalho
-- Colunas NULL para nao quebrar demandas antigas; a criacao valida no backend.

ALTER TABLE demandas
  ADD COLUMN origem VARCHAR(200) NULL AFTER sugestao_solucao,
  ADD COLUMN momento_etapa VARCHAR(200) NULL AFTER origem,
  ADD COLUMN intencao VARCHAR(40) NULL AFTER momento_etapa,
  ADD COLUMN pilar VARCHAR(40) NULL AFTER intencao,
  ADD COLUMN objetivo VARCHAR(80) NULL AFTER pilar;
