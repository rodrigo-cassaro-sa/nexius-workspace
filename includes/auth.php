<?php

// auth.php
// Sessao e autenticacao (infraestrutura). As regras de login ficam nos endpoints de api/auth.
// Aqui ficam apenas funcoes reutilizaveis de sessao. Sem regra de negocio.

// Inicia a sessao com cookie seguro. Chamar no bootstrap, antes de usar a sessao.
function iniciar_sessao_segura()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "secure" => COOKIE_SECURE,
        "httponly" => true,
        "samesite" => COOKIE_SAMESITE
    ]);

    session_start();
}

// Retorna true se houver usuario autenticado na sessao.
function usuario_esta_logado()
{
    return isset($_SESSION["usuario_id"]);
}

// Retorna o id do usuario logado, ou null.
function obter_usuario_logado_id()
{
    return $_SESSION["usuario_id"] ?? null;
}

// Retorna o perfil do usuario logado, ou null.
function obter_usuario_logado_perfil()
{
    return $_SESSION["usuario_perfil"] ?? null;
}

// Interrompe o endpoint se o usuario nao estiver autenticado.
function exigir_login()
{
    if (!usuario_esta_logado()) {
        json_response([
            "ok" => false,
            "error" => "Usuario nao autenticado."
        ], 401);
    }
}
