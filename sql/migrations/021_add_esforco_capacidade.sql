-- 021_add_esforco_capacidade.sql
-- Base para o recalculo de agenda por prioridade (B1):
-- acoes.esforco_dias  = esforco estimado da tarefa, em dias (NULL = tratar como 1).
-- usuarios.capacidade_semana = capacidade da pessoa em dias de esforco por semana (NULL = 5).
-- Ambos opcionais; sem impacto no que ja existe.

ALTER TABLE acoes
  ADD COLUMN esforco_dias INT NULL AFTER prazo;

ALTER TABLE usuarios
  ADD COLUMN capacidade_semana INT NULL AFTER setor_id;
