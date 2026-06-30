-- 014_add_digest_usuario.sql
-- Preferencia de resumo periodico por e-mail (digest) - D15, item 1 do plano de evolucoes.
-- digest_ativo: opt-out (vem ligado por padrao). digest_enviado_em: ultimo envio
-- (idempotencia/anti-spam: o cron nao reenvia dentro do intervalo).

ALTER TABLE usuarios
  ADD COLUMN digest_ativo TINYINT(1) NOT NULL DEFAULT 1 AFTER onboarding_concluido,
  ADD COLUMN digest_enviado_em DATETIME NULL AFTER digest_ativo;
