<?php

// tokens.php
// Acesso a dados da tabela tokens_recuperacao (recuperacao de senha).
// Token aleatorio, validade curta (30 min) e uso unico.

function criar_token_recuperacao($usuario_id, $token, $expira_em)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO tokens_recuperacao (usuario_id, token, expira_em, usado)
            VALUES (?, ?, ?, 0)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iss", $usuario_id, $token, $expira_em);

    return mysqli_stmt_execute($stmt);
}

// Invalida tokens pendentes do usuario (so 1 token valido por vez).
function invalidar_tokens_recuperacao_do_usuario($usuario_id)
{
    $conn = conectar_banco();
    $sql = "UPDATE tokens_recuperacao SET usado = 1 WHERE usuario_id = ? AND usado = 0";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    mysqli_stmt_execute($stmt);
}

// Busca um token pelo valor (a validacao de expiracao/uso e feita no endpoint).
function buscar_token_recuperacao($token)
{
    $conn = conectar_banco();
    $sql = "SELECT id, usuario_id, expira_em, usado
            FROM tokens_recuperacao WHERE token = ? LIMIT 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    return mysqli_fetch_assoc($resultado) ?: null;
}

// Marca um token como usado.
function marcar_token_recuperacao_usado($id)
{
    $conn = conectar_banco();
    $sql = "UPDATE tokens_recuperacao SET usado = 1 WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);

    return mysqli_stmt_execute($stmt);
}
