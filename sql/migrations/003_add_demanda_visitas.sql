-- 003_add_demanda_visitas.sql
-- Lastro de visitas: registra quem abriu cada demanda, a primeira e a ultima visita
-- e o total de aberturas. Uma linha por (demanda, usuario), atualizada a cada visita.

CREATE TABLE IF NOT EXISTS demanda_visitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demanda_id INT NOT NULL,
  usuario_id INT NOT NULL,
  primeira_visita DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_visita DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_visitas INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_demanda_visita (demanda_id, usuario_id),
  KEY idx_dv_demanda (demanda_id),
  KEY idx_dv_usuario (usuario_id),
  CONSTRAINT fk_dv_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id),
  CONSTRAINT fk_dv_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
