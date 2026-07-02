<?php

// seguranca.php
// Anti forca-bruta no login: apos algumas falhas do MESMO IP, exige um captcha simples
// (pergunta aritmetica gerada no servidor, guardada na sessao). O captcha nao trava a conta
// (evita bloquear o escritorio inteiro atras de um IP), mas para automacao: bot nao resolve.

// Quantas falhas de login desse IP nos ultimos $minutos (reaproveita a tabela logs).
function login_falhas_recentes_ip($ip, $minutos = 15)
{
    if ($ip === "" || $ip === null) {
        return 0;
    }
    $linhas = executar_select(
        "SELECT COUNT(*) AS total FROM logs
         WHERE acao = 'login_falha' AND ip = ? AND criado_em > (NOW() - INTERVAL ? MINUTE)",
        "si",
        [$ip, (int) $minutos]
    );
    return (int) $linhas[0]["total"];
}

// A partir de 3 falhas recentes do IP, exige captcha.
function login_exige_captcha($ip)
{
    return login_falhas_recentes_ip($ip) >= 3;
}

// Gera um captcha aritmetico simples e guarda a resposta na sessao. Retorna a pergunta.
function captcha_gerar()
{
    $a = random_int(1, 9);
    $b = random_int(1, 9);
    $_SESSION["captcha_resp"] = $a + $b;
    return "Quanto e " . $a . " + " . $b . "?";
}

// Confere a resposta do captcha contra a sessao.
function captcha_valido($resposta)
{
    if (!isset($_SESSION["captcha_resp"])) {
        return false;
    }
    return (string) $_SESSION["captcha_resp"] === trim((string) $resposta);
}

// Limpa o captcha da sessao (apos sucesso).
function captcha_limpar()
{
    unset($_SESSION["captcha_resp"]);
}
