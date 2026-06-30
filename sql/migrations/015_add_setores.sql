-- 015_add_setores.sql
-- Setores (decisao de produto D21). Cada usuario pertence a um setor; a demanda herda o
-- setor do criador; ao criar uma acao, o responsavel vem pre-preenchido com o
-- "responsavel principal" do setor (editavel). Setor da acao = o da demanda (sem coluna nova).
-- Lista fixa de 7 setores (seed). responsavel_id = responsavel principal do setor.

CREATE TABLE IF NOT EXISTS setores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL,
  responsavel_id INT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_setores_nome (nome),
  KEY idx_setores_responsavel (responsavel_id),
  CONSTRAINT fk_setores_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO setores (nome) VALUES
  ('Comercial'),
  ('Relacionamento'),
  ('Logística'),
  ('Roteirização'),
  ('Equipe Externa'),
  ('Fechamento'),
  ('Financeiro');

ALTER TABLE usuarios
  ADD COLUMN setor_id INT NULL AFTER perfil,
  ADD KEY idx_usuarios_setor (setor_id),
  ADD CONSTRAINT fk_usuarios_setor FOREIGN KEY (setor_id) REFERENCES setores(id);

ALTER TABLE demandas
  ADD COLUMN setor_id INT NULL AFTER responsavel_id,
  ADD KEY idx_demandas_setor (setor_id),
  ADD CONSTRAINT fk_demandas_setor FOREIGN KEY (setor_id) REFERENCES setores(id);
