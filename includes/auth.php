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

    // Atras do proxy do EasyPanel, o PHP recebe a requisicao em HTTP mesmo quando o
    // navegador esta em HTTPS. Para o cookie nao ser descartado, decidimos o "secure"
    // pelo esquema real informado pelo proxy. Sem proxy, cai no valor de COOKIE_SECURE.
    $secure = COOKIE_SECURE;

    if (isset($_SERVER["HTTP_X_FORWARDED_PROTO"])) {
        $secure = strtolower($_SERVER["HTTP_X_FORWARDED_PROTO"]) === "https";
    } elseif (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") {
        $secure = true;
    }

    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "secure" => $secure,
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

// Registra o usuario na sessao apos validar a senha (chamado pelo login).
// Recebe o array do usuario (precisa de id e perfil).
function fazer_login($usuario)
{
    session_regenerate_id(true);
    $_SESSION["usuario_id"] = (int) $usuario["id"];
    $_SESSION["usuario_perfil"] = $usuario["perfil"];
}

// Encerra a sessao do usuario (logout).
function fazer_logout()
{
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $p = session_get_cookie_params();
        setcookie(session_name(), "", time() - 42000, $p["path"], $p["domain"], $p["secure"], $p["httponly"]);
    }

    session_destroy();
}
