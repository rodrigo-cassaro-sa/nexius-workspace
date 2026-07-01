-- 020_add_prazo_projeto_demanda.sql
-- Controle de prazo no nivel de PROJETO e de DEMANDA (alem do prazo da acao chave).
-- projetos.prazo: meta de entrega do projeto (nao existia).
-- demandas.prazo: prazo alvo da demanda - permite ter prazo mesmo antes de haver plano de acao.
-- Ambos opcionais (NULL). Sem impacto no que ja existe.

ALTER TABLE projetos
  ADD COLUMN prazo DATE NULL AFTER status,
  ADD KEY idx_projetos_prazo (prazo);

ALTER TABLE demandas
  ADD COLUMN prazo DATE NULL AFTER status,
  ADD KEY idx_demandas_prazo (prazo);
