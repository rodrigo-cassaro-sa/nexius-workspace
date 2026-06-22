<?php

// db.php
// Conexao com o MySQL usando mysqli (procedural).
// Todo SQL do projeto deve usar prepared statements (ver boas-praticas-seguranca).
// Este arquivo cuida apenas da conexao; nao contem regra de negocio.

function conectar_banco()
{
    static $conexao = null;

    if ($conexao !== null) {
        return $conexao;
    }

    // No PHP 8+ o mysqli lanca excecao por padrao. Desligamos para tratar o erro
    // de forma controlada (retornar JSON limpo em vez de um 500 sem corpo).
    mysqli_report(MYSQLI_REPORT_OFF);

    $conexao = @mysqli_connect(DB_HOST, DB_USUARIO, DB_SENHA, DB_NOME);

    if (!$conexao) {
        $detalhe = mysqli_connect_error();

        if (function_exists("registrar_log")) {
            registrar_log("db_falha_conexao", $detalhe);
        }

        // Resposta generica ao usuario. So mostra o detalhe se HEALTH_DEBUG estiver ligado
        // (use temporariamente para diagnostico e desligue em seguida).
        $resposta = [
            "ok" => false,
            "error" => "Nao foi possivel processar a solicitacao."
        ];

        if (defined("HEALTH_DEBUG") && HEALTH_DEBUG) {
            $resposta["debug"] = $detalhe;
        }

        json_response($resposta, 500);
    }

    mysqli_set_charset($conexao, DB_CHARSET);

    return $conexao;
}

// Executa um SELECT com prepared statement e retorna as linhas (array).
// $tipos e $params permitem binds dinamicos (ex.: filtros opcionais).
function executar_select($sql, $tipos = "", $params = [])
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt === false) {
        json_erro("Nao foi possivel processar a solicitacao.", 500);
    }

    if ($tipos !== "") {
        mysqli_stmt_bind_param($stmt, $tipos, ...$params);
    }

    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    $linhas = [];
    while ($linha = mysqli_fetch_assoc($resultado)) {
        $linhas[] = $linha;
    }

    return $linhas;
}
