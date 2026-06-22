<?php

// comentarios.php
// Acesso a dados dos comentarios (por acao). Autor edita o proprio; ninguem exclui.

function criar_comentario($acao_id, $autor_id, $texto)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO comentarios (acao_id, autor_id, texto) VALUES (?, ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iis", $acao_id, $autor_id, $texto);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

function listar_comentarios_da_acao($acao_id)
{
    return executar_select(
        "SELECT c.id, c.texto, c.autor_id, u.nome AS autor_nome, c.criado_em, c.editado_em
         FROM comentarios c
         JOIN usuarios u ON u.id = c.autor_id
         WHERE c.acao_id = ?
         ORDER BY c.criado_em ASC",
        "i",
        [$acao_id]
    );
}

// Stream de comentarios de toda a demanda (de todas as acoes), mais recentes primeiro.
function listar_comentarios_da_demanda($demanda_id)
{
    return executar_select(
        "SELECT c.id, c.texto, c.autor_id, u.nome AS autor_nome, c.criado_em, c.editado_em,
                a.id AS acao_id, a.titulo AS acao_titulo
         FROM comentarios c
         JOIN acoes a ON a.id = c.acao_id
         JOIN usuarios u ON u.id = c.autor_id
         WHERE a.demanda_id = ?
         ORDER BY c.criado_em DESC",
        "i",
        [$demanda_id]
    );
}

function buscar_comentario($id)
{
    $linhas = executar_select(
        "SELECT id, acao_id, autor_id FROM comentarios WHERE id = ? LIMIT 1",
        "i",
        [$id]
    );
    return empty($linhas) ? null : $linhas[0];
}

function editar_comentario($id, $texto)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE comentarios SET texto = ?, editado_em = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $texto, $id);
    return mysqli_stmt_execute($stmt);
}
