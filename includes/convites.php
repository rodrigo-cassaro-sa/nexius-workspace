<?php

// convites.php
// Acesso a dados da tabela convites (procedural, mysqli, prepared statements).

// Cria um convite pendente. Retorna o id ou false.
function criar_convite($email, $perfil, $token, $expira_em, $criado_por)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO convites (email, perfil, token, status, expira_em, criado_por)
            VALUES (?, ?, ?, 'pendente', ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssi", $email, $perfil, $token, $expira_em, $criado_por);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

// Cancela convites ainda pendentes de um e-mail (usado ao reenviar: invalida o anterior).
function cancelar_convites_pendentes_por_email($email)
{
    $conn = conectar_banco();
    $sql = "UPDATE convites SET status = 'cancelado' WHERE email = ? AND status = 'pendente'";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
}

// Busca um convite pendente pelo token.
function buscar_convite_pendente_por_token($token)
{
    $conn = conectar_banco();
    $sql = "SELECT id, email, perfil, status, expira_em
            FROM convites WHERE token = ? AND status = 'pendente' LIMIT 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    return mysqli_fetch_assoc($resultado) ?: null;
}

// Marca um convite como aceito e vincula ao usuario criado.
function marcar_convite_aceito($id, $usuario_id)
{
    $conn = conectar_banco();
    $sql = "UPDATE convites SET status = 'aceito', usuario_id = ? WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $usuario_id, $id);

    return mysqli_stmt_execute($stmt);
}

// Lista os convites mais recentes (para a tela de administracao).
function listar_convites()
{
    $conn = conectar_banco();
    $sql = "SELECT id, email, perfil, status, token, expira_em, criado_em
            FROM convites ORDER BY criado_em DESC LIMIT 100";

    $resultado = mysqli_query($conn, $sql);
    $linhas = [];
    while ($linha = mysqli_fetch_assoc($resultado)) {
        $linhas[] = $linha;
    }

    return $linhas;
}

// Cancela um convite pendente especifico (gestao de usuarios).
function cancelar_convite($id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE convites SET status = 'cancelado' WHERE id = ? AND status = 'pendente'");
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);

    return mysqli_stmt_affected_rows($stmt) > 0;
}
