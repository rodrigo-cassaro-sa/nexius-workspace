-- 018_add_projetos.sql
-- Melhoria #3: Projeto agrupa varias demandas.
-- Status espelha o ciclo da demanda; responsavel e setor sao opcionais.
-- demandas.projeto_id e opcional; ON DELETE SET NULL (apagar projeto nao apaga demanda).

CREATE TABLE IF NOT EXISTS projetos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto',
  responsavel_id INT NULL,
  setor_id INT NULL,
  criador_id INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_projetos_status (status),
  KEY idx_projetos_responsavel (responsavel_id),
  KEY idx_projetos_setor (setor_id),
  KEY idx_projetos_criador (criador_id),
  CONSTRAINT fk_projetos_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
  CONSTRAINT fk_projetos_setor FOREIGN KEY (setor_id) REFERENCES setores(id),
  CONSTRAINT fk_projetos_criador FOREIGN KEY (criador_id) REFERENCES usuarios(id),
  CONSTRAINT chk_projetos_status CHECK (status IN ('aberto','em_andamento','concluido','arquivado','cancelado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE demandas
  ADD COLUMN projeto_id INT NULL AFTER setor_id,
  ADD KEY idx_demandas_projeto (projeto_id),
  ADD CONSTRAINT fk_demandas_projeto FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL;
