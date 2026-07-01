<?php

// log.php
// Registro de acoes (ver boas-praticas-seguranca). Nunca registrar senha, token ou segredo.
// Fonte duravel: tabela `logs` no banco. Em paralelo, grava tambem em arquivo (logs/app.log)
// como copia best-effort (no container o arquivo pode ser efemero; o banco e a fonte oficial).
// O log NUNCA pode quebrar a operacao principal: falhas aqui sao silenciosas.

function registrar_log($acao, $detalhes = "")
{
    // Guarda de reentrancia: conectar_banco() pode chamar registrar_log() em falha de
    // conexao; evita recursao infinita (a chamada aninhada nao tenta o banco de novo).
    static $dentro_do_banco = false;

    $usuario_id = function_exists("obter_usuario_logado_id") ? obter_usuario_logado_id() : null;
    $ip = $_SERVER["REMOTE_ADDR"] ?? null;
    $user_agent = isset($_SERVER["HTTP_USER_AGENT"]) ? substr($_SERVER["HTTP_USER_AGENT"], 0, 255) : null;
    $acao = substr((string) $acao, 0, 80);

    // 1) Persiste no banco (fonte oficial). Best-effort: qualquer falha e ignorada.
    if (!$dentro_do_banco && function_exists("conectar_banco")) {
        $dentro_do_banco = true;
        $conn = conectar_banco();
        if ($conn) {
            $stmt = mysqli_prepare(
                $conn,
                "INSERT INTO logs (usuario_id, acao, ip, user_agent, detalhes) VALUES (?, ?, ?, ?, ?)"
            );
            if ($stmt) {
                // usuario_id pode ser null (mysqli envia NULL quando a variavel e null).
                mysqli_stmt_bind_param($stmt, "issss", $usuario_id, $acao, $ip, $user_agent, $detalhes);
                @mysqli_stmt_execute($stmt);
            }
        }
        $dentro_do_banco = false;
    }

    // 2) Copia em arquivo (best-effort; pode falhar/ser efemera no container).
    $linha = json_encode([
        "data" => date("Y-m-d H:i:s"),
        "usuario_id" => $usuario_id,
        "acao" => $acao,
        "ip" => $ip,
        "user_agent" => $user_agent,
        "detalhes" => $detalhes
    ], JSON_UNESCAPED_UNICODE);

    @file_put_contents(__DIR__ . "/../logs/app.log", $linha . PHP_EOL, FILE_APPEND);
}

// Retencao de logs: remove registros com mais de 1 ano (chamado por cron/limpar-logs.php).
// Retorna a quantidade de linhas removidas. SQL fixo (sem entrada do usuario).
function limpar_logs_antigos()
{
    $conn = conectar_banco();
    $ok = mysqli_query($conn, "DELETE FROM logs WHERE criado_em < (NOW() - INTERVAL 1 YEAR)");
    return $ok ? mysqli_affected_rows($conn) : 0;
}

// Lista os logs (auditoria) com filtros e paginacao. So leitura. Usado pela tela de Auditoria (Admin).
// $filtros: usuario_id (int), acao (string), inicio/fim (YYYY-MM-DD), busca (string).
function listar_logs($filtros, $pagina, $por_pagina)
{
    $where = " WHERE 1 = 1";
    $tipos = "";
    $params = [];

    if (($filtros["usuario_id"] ?? 0) > 0) {
        $where .= " AND l.usuario_id = ?";
        $tipos .= "i";
        $params[] = (int) $filtros["usuario_id"];
    }
    if (($filtros["acao"] ?? "") !== "") {
        $where .= " AND l.acao = ?";
        $tipos .= "s";
        $params[] = $filtros["acao"];
    }
    if (($filtros["inicio"] ?? "") !== "") {
        $where .= " AND l.criado_em >= ?";
        $tipos .= "s";
        $params[] = $filtros["inicio"] . " 00:00:00";
    }
    if (($filtros["fim"] ?? "") !== "") {
        $where .= " AND l.criado_em <= ?";
        $tipos .= "s";
        $params[] = $filtros["fim"] . " 23:59:59";
    }
    if (($filtros["busca"] ?? "") !== "") {
        $where .= " AND (l.acao LIKE ? OR l.detalhes LIKE ?)";
        $tipos .= "ss";
        $params[] = "%" . $filtros["busca"] . "%";
        $params[] = "%" . $filtros["busca"] . "%";
    }

    $total = (int) executar_select("SELECT COUNT(*) AS total FROM logs l" . $where, $tipos, $params)[0]["total"];

    $offset = ($pagina - 1) * $por_pagina;
    $sql = "SELECT l.id, l.criado_em, l.usuario_id, u.nome AS usuario_nome,
                   l.acao, l.ip, l.detalhes
            FROM logs l
            LEFT JOIN usuarios u ON u.id = l.usuario_id"
            . $where . " ORDER BY l.id DESC LIMIT ? OFFSET ?";

    $logs = executar_select($sql, $tipos . "ii", array_merge($params, [$por_pagina, $offset]));

    return ["logs" => $logs, "total" => $total];
}

// Lista distinta de acoes registradas (para o filtro da tela de Auditoria).
function logs_acoes_distintas()
{
    $linhas = executar_select("SELECT DISTINCT acao FROM logs ORDER BY acao ASC", "", []);
    $acoes = [];
    foreach ($linhas as $l) {
        $acoes[] = $l["acao"];
    }
    return $acoes;
}
