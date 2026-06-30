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
