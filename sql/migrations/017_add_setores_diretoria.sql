-- 017_add_setores_diretoria.sql
-- Novos setores (D21): diretorias (CFO/CCO/COO/CEO), RH e Tecnologia.
-- INSERT IGNORE: o nome e unico, entao rodar de novo nao duplica.

INSERT IGNORE INTO setores (nome) VALUES
  ('Diretoria Financeira (CFO)'),
  ('Diretoria Comercial (CCO)'),
  ('Diretoria Operacional (COO)'),
  ('Diretoria Presidência (CEO)'),
  ('RH'),
  ('Tecnologia');
