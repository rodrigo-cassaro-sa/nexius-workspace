-- install.sql
-- Arquivo unico para importar no phpMyAdmin: cria o banco e todas as tabelas do MVP.
-- Banco: nexius_workspace (Workspace S&A / Grupo Nexius).
--
-- IMPORTANTE: este arquivo e uma copia de conveniencia do schema canonico
-- sql/migrations/001_create_base_schema.sql. Se o schema mudar, regenere este arquivo.
-- Engine InnoDB, utf8mb4. Sem exclusao fisica (status/ativo). Senha apenas como hash (no backend).

CREATE DATABASE IF NOT EXISTS nexius_workspace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexius_workspace;

-- ---------------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  senha_hash VARCHAR(255) NULL,
  perfil VARCHAR(20) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  onboarding_concluido TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_perfil (perfil),
  KEY idx_usuarios_ativo (ativo),
  CONSTRAINT chk_usuarios_perfil CHECK (perfil IN ('administrador','gestor','colaborador'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- convites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS convites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL,
  perfil VARCHAR(20) NOT NULL,
  token CHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  expira_em DATETIME NOT NULL,
  criado_por INT NOT NULL,
  usuario_id INT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_convites_token (token),
  KEY idx_convites_email (email),
  KEY idx_convites_status (status),
  KEY idx_convites_criado_por (criado_por),
  KEY idx_convites_usuario (usuario_id),
  CONSTRAINT fk_convites_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios(id),
  CONSTRAINT fk_convites_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT chk_convites_perfil CHECK (perfil IN ('administrador','gestor','colaborador')),
  CONSTRAINT chk_convites_status CHECK (status IN ('pendente','aceito','cancelado','expirado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- tokens_recuperacao
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tokens_recuperacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token CHAR(64) NOT NULL,
  expira_em DATETIME NOT NULL,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tokens_recuperacao_token (token),
  KEY idx_tokens_recuperacao_usuario (usuario_id),
  KEY idx_tokens_recuperacao_expira (expira_em),
  CONSTRAINT fk_tokens_recuperacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- demandas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demandas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  problema TEXT NULL,
  impacto_operacional TEXT NULL,
  risco TEXT NULL,
  afeta_outros TEXT NULL,
  workaround TEXT NULL,
  sugestao_solucao TEXT NULL,
  gut_gravidade TINYINT NULL,
  gut_urgencia TINYINT NULL,
  gut_tendencia TINYINT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aberta',
  criador_id INT NOT NULL,
  responsavel_id INT NULL,
  concluida_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_demandas_status (status),
  KEY idx_demandas_criador (criador_id),
  KEY idx_demandas_responsavel (responsavel_id),
  KEY idx_demandas_criado_em (criado_em),
  CONSTRAINT fk_demandas_criador FOREIGN KEY (criador_id) REFERENCES usuarios(id),
  CONSTRAINT fk_demandas_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
  CONSTRAINT chk_demandas_status CHECK (status IN ('aberta','em_andamento','concluida','arquivada','cancelada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- acoes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demanda_id INT NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  responsavel_id INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  prazo DATE NULL,
  chave TINYINT(1) NOT NULL DEFAULT 0,
  concluida_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_acoes_demanda (demanda_id),
  KEY idx_acoes_responsavel (responsavel_id),
  KEY idx_acoes_status (status),
  KEY idx_acoes_prazo (prazo),
  CONSTRAINT fk_acoes_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id),
  CONSTRAINT fk_acoes_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
  CONSTRAINT chk_acoes_status CHECK (status IN ('pendente','bloqueada','concluida','cancelada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- acao_prerequisitos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acao_prerequisitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  prerequisito_acao_id INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_acao_prerequisito (acao_id, prerequisito_acao_id),
  KEY idx_prereq_acao (acao_id),
  KEY idx_prereq_prerequisito (prerequisito_acao_id),
  CONSTRAINT fk_prereq_acao FOREIGN KEY (acao_id) REFERENCES acoes(id),
  CONSTRAINT fk_prereq_prerequisito FOREIGN KEY (prerequisito_acao_id) REFERENCES acoes(id),
  CONSTRAINT chk_prereq_diferente CHECK (acao_id <> prerequisito_acao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- comentarios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  autor_id INT NOT NULL,
  texto TEXT NOT NULL,
  editado_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comentarios_acao (acao_id),
  KEY idx_comentarios_autor (autor_id),
  KEY idx_comentarios_criado_em (criado_em),
  CONSTRAINT fk_comentarios_acao FOREIGN KEY (acao_id) REFERENCES acoes(id),
  CONSTRAINT fk_comentarios_autor FOREIGN KEY (autor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- demanda_visitas (lastro: quem abriu a demanda e quando)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- acao_visualizacoes (lastro: quem viu o detalhe de cada tarefa)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acao_visualizacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  visualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_acao_visualizacao (acao_id, usuario_id),
  KEY idx_av_acao (acao_id),
  KEY idx_av_usuario (usuario_id),
  CONSTRAINT fk_av_acao FOREIGN KEY (acao_id) REFERENCES acoes(id),
  CONSTRAINT fk_av_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- notificacoes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  mensagem VARCHAR(255) NOT NULL,
  link VARCHAR(255) NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  lida_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notificacoes_usuario_lida (usuario_id, lida),
  KEY idx_notificacoes_criado_em (criado_em),
  CONSTRAINT fk_notificacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- fila_email
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fila_email (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  email_destino VARCHAR(180) NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  tentativas INT NOT NULL DEFAULT 0,
  erro VARCHAR(255) NULL,
  enviado_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_fila_email_status (status),
  KEY idx_fila_email_criado_em (criado_em),
  CONSTRAINT fk_fila_email_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT chk_fila_email_status CHECK (status IN ('pendente','processando','enviado','erro','cancelado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  acao VARCHAR(80) NOT NULL,
  entidade VARCHAR(40) NULL,
  entidade_id INT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  detalhes TEXT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_logs_usuario (usuario_id),
  KEY idx_logs_acao (acao),
  KEY idx_logs_entidade (entidade, entidade_id),
  KEY idx_logs_criado_em (criado_em),
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Usuario dedicado da aplicacao (RECOMENDADO - executar manualmente, com cuidado)
-- ---------------------------------------------------------------------------
-- Nao usar root na aplicacao. Como o PHP roda em droplet SEPARADO, restrinja o host do
-- usuario ao IP do droplet da aplicacao (de preferencia o IP PRIVADO da VPC da DigitalOcean).
-- Troque IP_DO_APP e a senha forte antes de rodar. Mantenha esta senha fora do repositorio.
--
-- CREATE USER 'nexius_app'@'IP_DO_APP' IDENTIFIED BY 'TROQUE_POR_SENHA_FORTE';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nexius_workspace.* TO 'nexius_app'@'IP_DO_APP';
-- FLUSH PRIVILEGES;
--
-- Observacao: DELETE e concedido porque o MySQL exige para algumas operacoes, mas a
-- aplicacao NAO faz exclusao fisica de demandas/acoes (usa status/ativo). Avalie remover
-- DELETE se quiser reforcar ainda mais.
