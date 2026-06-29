-- 013_add_acao_decisoes.sql
-- Decisoes/regras tomadas numa reuniao (D19 - item 4 do plano de evolucoes).
-- Texto preenchido ao CONCLUIR uma acao do tipo "reuniao" (junto da ata, que e o anexo).
-- Exibido consolidado no detalhe da demanda ("Decisoes das reunioes").

ALTER TABLE acoes
  ADD COLUMN decisoes TEXT NULL AFTER motivo_recusa;
