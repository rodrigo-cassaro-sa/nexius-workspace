<?php

// config.php
// Le a configuracao de VARIAVEIS DE AMBIENTE (injetadas pelo EasyPanel/Docker).
// Assim nao ha segredo no repositorio. Este arquivo pode ser versionado com seguranca.
// Defina as variaveis no painel do EasyPanel (DB_HOST, DB_USUARIO, DB_SENHA, etc.).

function env_str($chave, $padrao = "")
{
    $valor = getenv($chave);
    return $valor === false ? $padrao : $valor;
}

function env_bool($chave, $padrao = false)
{
    $valor = getenv($chave);
    if ($valor === false) {
        return $padrao;
    }
    return in_array(strtolower($valor), ["1", "true", "yes", "on"], true);
}

// Banco de dados (MySQL no droplet; use o IP privado da VPC em DB_HOST)
define("DB_HOST", env_str("DB_HOST", "localhost"));
define("DB_NOME", env_str("DB_NOME", "nexius_workspace"));
define("DB_USUARIO", env_str("DB_USUARIO", ""));
define("DB_SENHA", env_str("DB_SENHA", ""));
define("DB_CHARSET", env_str("DB_CHARSET", "utf8mb4"));

// Aplicacao
define("APP_NOME", env_str("APP_NOME", "Workspace S&A"));
define("APP_AMBIENTE", env_str("APP_AMBIENTE", "producao")); // desenvolvimento | producao
define("APP_URL", env_str("APP_URL", ""));                   // base usada em links de e-mail

// Sessao / cookie seguro (COOKIE_SECURE = true exige HTTPS)
define("COOKIE_SECURE", env_bool("COOKIE_SECURE", true));
define("COOKIE_SAMESITE", env_str("COOKIE_SAMESITE", "Strict"));

// Resend (API HTTP de e-mail). Se RESEND_API_KEY estiver definido, e usado no lugar do SMTP.
define("RESEND_API_KEY", env_str("RESEND_API_KEY", ""));

// SMTP (alternativa ao Resend; preencher na fase de e-mail)
define("SMTP_HOST", env_str("SMTP_HOST", ""));
define("SMTP_PORTA", (int) env_str("SMTP_PORTA", "587"));
define("SMTP_USUARIO", env_str("SMTP_USUARIO", ""));
define("SMTP_SENHA", env_str("SMTP_SENHA", ""));
define("SMTP_REMETENTE", env_str("SMTP_REMETENTE", "nao-responder@exemplo.com"));
define("SMTP_REMETENTE_NOME", env_str("SMTP_REMETENTE_NOME", "Workspace S&A"));

// Suporte (exibido na tela de Ajuda) - definir endereco oficial depois
define("EMAIL_SUPORTE", env_str("EMAIL_SUPORTE", "suporte@exemplo.com"));

// Diagnostico temporario: quando HEALTH_DEBUG=1, o erro real de conexao com o banco
// aparece na resposta (campo "debug"). Use so para diagnosticar e DESLIGUE depois.
define("HEALTH_DEBUG", env_bool("HEALTH_DEBUG", false));
