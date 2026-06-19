<?php

// usuarios.php
// Acesso a dados da tabela usuarios (procedural, mysqli, prepared statements).
// Sem regra de negocio de tela; apenas leitura/escrita de dados do usuario.

// Conta quantos usuarios existem (usado no bootstrap do primeiro admin).
function contar_usuarios()
{
    $conn = conectar_banco();
    $resultado = mysqli_query($conn, "SELECT COUNT(*) AS total FROM usuarios");
    $linha = mysqli_fetch_assoc($resultado);
    return (int) $linha["total"];
}

// Busca um usuario pelo e-mail (inclui senha_hash, usado no login).
function buscar_usuario_por_email($email)
{
    $conn = conectar_banco();
    $sql = "SELECT id, nome, email, senha_hash, perfil, ativo, onboarding_concluido
            FROM usuarios WHERE email = ? LIMIT 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    return mysqli_fetch_assoc($resultado) ?: null;
}

// Busca um usuario pelo id (sem senha_hash, usado para /me).
function buscar_usuario_por_id($id)
{
    $conn = conectar_banco();
    $sql = "SELECT id, nome, email, perfil, ativo, onboarding_concluido
            FROM usuarios WHERE id = ? LIMIT 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    return mysqli_fetch_assoc($resultado) ?: null;
}

// Cria o administrador inicial (bootstrap). Recebe a senha ja em hash.
// Retorna o id criado ou false em caso de falha.
function criar_usuario_admin_inicial($nome, $email, $senha_hash)
{
    return criar_usuario($nome, $email, $senha_hash, "administrador");
}

// Cria um usuario com perfil informado (usado no aceite de convite). Senha ja em hash.
// Retorna o id criado ou false em caso de falha.
function criar_usuario($nome, $email, $senha_hash, $perfil)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo, onboarding_concluido)
            VALUES (?, ?, ?, ?, 1, 0)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssss", $nome, $email, $senha_hash, $perfil);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}
