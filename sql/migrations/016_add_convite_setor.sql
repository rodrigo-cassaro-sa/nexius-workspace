-- 016_add_convite_setor.sql
-- Setor no convite (D21): permite ja convidar a pessoa para um setor; ao aceitar o
-- convite, o usuario criado entra com esse setor (api/convites/aceitar.php).

ALTER TABLE convites
  ADD COLUMN setor_id INT NULL AFTER perfil,
  ADD KEY idx_convites_setor (setor_id),
  ADD CONSTRAINT fk_convites_setor FOREIGN KEY (setor_id) REFERENCES setores(id);
