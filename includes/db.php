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

    $conexao = mysqli_connect(DB_HOST, DB_USUARIO, DB_SENHA, DB_NOME);

    if (!$conexao) {
        // Nao expor detalhe tecnico ao usuario final.
        json_response([
            "ok" => false,
            "error" => "Nao foi possivel processar a solicitacao."
        ], 500);
    }

    mysqli_set_charset($conexao, DB_CHARSET);

    return $conexao;
}
