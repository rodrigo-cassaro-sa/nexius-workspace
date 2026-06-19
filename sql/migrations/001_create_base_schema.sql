-- 001_create_base_schema.sql
-- Schema base do MVP do Workspace S&A (marca Grupo Nexius).
-- Stack: MySQL (InnoDB, utf8mb4). Todas as entidades vem de docs/produto/01-descricao-produto.md (secao 19).
-- Regras aplicadas:
--   - Sem exclusao fisica: demandas/acoes usam status; usuarios usam o flag "ativo". Por isso nao ha deleted_at.
--   - Senha nunca em texto puro: apenas senha_hash (hash gerado no backend com password_hash).
--   - Nomes em portugues, sem acento, snake_case (boas-praticas-banco-dados).
--   - CHECK reforca a lista fechada de status (MySQL 8.0.16+); o backend tambem valida.
--   - Perfil e um campo (administrador|gestor|colaborador), nao uma tabela de permissoes (sem evidencia nos docs).

-- ---------------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  senha_hash VARCHAR(255) NULL,                       -- NULL ate o usuario aceitar o convite e definir a senha
  perfil VARCHAR(20) NOT NULL,                        -- administrador | gestor | colaborador
  ativo TINYINT(1) NOT NULL DEFAULT 1,                -- inativacao em vez de exclusao
  onboarding_concluido TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_perfil (perfil),
  KEY idx_usuarios_ativo (ativo),
  CONSTRAINT chk_usuarios_perfil CHECK (perfil IN ('administrador','gestor','colaborador'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- convites  (acesso somente por convite; validade 7 dias, uso unico)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS convites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL,
  perfil VARCHAR(20) NOT NULL,                        -- perfil ja definido no convite
  token CHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',     -- pendente | aceito | cancelado | expirado
  expira_em DATETIME NOT NULL,
  criado_por INT NOT NULL,
  usuario_id INT NULL,                                -- preenchido quando o convite e aceito
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
-- tokens_recuperacao  (recuperacao de senha; validade 30 min, uso unico)
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
  status VARCHAR(20) NOT NULL DEFAULT 'aberta',       -- aberta | em_andamento | concluida | arquivada | cancelada
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
-- acoes  (itens do plano de acao; "chave" conclui a demanda; status "bloqueada" quando ha pre-requisito pendente)
-- Regra "uma unica acao chave por demanda" e validada no backend.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demanda_id INT NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  responsavel_id INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',     -- pendente | bloqueada | concluida | cancelada
  prazo DATE NULL,                                    -- data prevista de conclusao (base da metrica de % no prazo)
  chave TINYINT(1) NOT NULL DEFAULT 0,                -- 1 = acao chave
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
-- acao_prerequisitos  (uma acao pode depender de varias acoes da mesma demanda)
-- Sem dependencia circular e mesma demanda: validado no backend.
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
-- comentarios  (discussao por acao; autor edita o proprio; ninguem exclui)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acao_id INT NOT NULL,
  autor_id INT NOT NULL,
  texto TEXT NOT NULL,
  editado_em DATETIME NULL,                           -- NULL = nunca editado
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comentarios_acao (acao_id),
  KEY idx_comentarios_autor (autor_id),
  KEY idx_comentarios_criado_em (criado_em),
  CONSTRAINT fk_comentarios_acao FOREIGN KEY (acao_id) REFERENCES acoes(id),
  CONSTRAINT fk_comentarios_autor FOREIGN KEY (autor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- notificacoes  (avisos internos do sistema; o e-mail fica na fila_email)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,                            -- destinatario
  tipo VARCHAR(40) NOT NULL,                          -- atribuicao | comentario | status | conclusao
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
-- fila_email  (envio operacional por SMTP, processado por cron, com reprocessamento)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fila_email (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,                                -- destinatario, quando aplicavel
  email_destino VARCHAR(180) NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',     -- pendente | processando | enviado | erro | cancelado
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
-- logs  (auditoria de acoes criticas; nunca registrar senha/token/segredo)
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
