-- 008_add_anexos.sql
-- Anexos de demandas (uploads). Trazido ao escopo por decisao de produto (D17).
-- O arquivo fica em pasta privada FORA da raiz publica; aqui guardamos apenas os metadados.
-- nome_original: nome exibido ao usuario; nome_armazenado: nome aleatorio em disco (nunca o original).

CREATE TABLE IF NOT EXISTS anexos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demanda_id INT NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  nome_armazenado VARCHAR(120) NOT NULL,
  mime VARCHAR(120) NOT NULL,
  tamanho INT NOT NULL,
  criado_por INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_anexos_armazenado (nome_armazenado),
  KEY idx_anexos_demanda (demanda_id),
  KEY idx_anexos_criado_por (criado_por),
  CONSTRAINT fk_anexos_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id),
  CONSTRAINT fk_anexos_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
