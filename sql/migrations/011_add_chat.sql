-- 011_add_chat.sql
-- Chat 1:1 entre usuarios (decisao de produto D20 - Fase 1).
-- conversas: um par de usuarios (par canonico: usuario_a_id < usuario_b_id, unico).
-- mensagens: texto, data de envio (criado_em) e data de leitura (lida_em, marcada quando
--            o outro participante abre a conversa). demanda_id: referencia opcional a uma demanda.
-- Anexos de mensagem, busca e exportacao ficam para fases seguintes (ver D20).

CREATE TABLE IF NOT EXISTS conversas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_a_id INT NOT NULL,
  usuario_b_id INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conversa_par (usuario_a_id, usuario_b_id),
  KEY idx_conversa_a (usuario_a_id),
  KEY idx_conversa_b (usuario_b_id),
  CONSTRAINT fk_conversa_a FOREIGN KEY (usuario_a_id) REFERENCES usuarios(id),
  CONSTRAINT fk_conversa_b FOREIGN KEY (usuario_b_id) REFERENCES usuarios(id),
  CONSTRAINT chk_conversa_par CHECK (usuario_a_id < usuario_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversa_id INT NOT NULL,
  autor_id INT NOT NULL,
  texto TEXT NOT NULL,
  demanda_id INT NULL,
  lida_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_mensagens_conversa (conversa_id, id),
  KEY idx_mensagens_autor (autor_id),
  KEY idx_mensagens_nao_lida (conversa_id, autor_id, lida_em),
  CONSTRAINT fk_mensagens_conversa FOREIGN KEY (conversa_id) REFERENCES conversas(id),
  CONSTRAINT fk_mensagens_autor FOREIGN KEY (autor_id) REFERENCES usuarios(id),
  CONSTRAINT fk_mensagens_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
