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
    $sql = "SELECT id, nome, email, perfil, setor_id, ativo, onboarding_concluido, digest_ativo
            FROM usuarios WHERE id = ? LIMIT 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    return mysqli_fetch_assoc($resultado) ?: null;
}

// Liga/desliga a preferencia de resumo periodico por e-mail (digest) do usuario.
function definir_digest_usuario($id, $ativo)
{
    $conn = conectar_banco();
    $ativo = $ativo ? 1 : 0;
    $stmt = mysqli_prepare($conn, "UPDATE usuarios SET digest_ativo = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ii", $ativo, $id);
    return mysqli_stmt_execute($stmt);
}

// Cria o administrador inicial (bootstrap). Recebe a senha ja em hash.
// Retorna o id criado ou false em caso de falha.
function criar_usuario_admin_inicial($nome, $email, $senha_hash)
{
    return criar_usuario($nome, $email, $senha_hash, "administrador");
}

// Atualiza a senha (hash) do usuario. Usado na redefinicao de senha.
function atualizar_senha($id, $senha_hash)
{
    $conn = conectar_banco();
    $sql = "UPDATE usuarios SET senha_hash = ? WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "si", $senha_hash, $id);

    return mysqli_stmt_execute($stmt);
}

// Atualiza o nome do proprio usuario (tela de perfil). E-mail e perfil nao mudam aqui.
function atualizar_nome($id, $nome)
{
    $conn = conectar_banco();
    $sql = "UPDATE usuarios SET nome = ? WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "si", $nome, $id);

    return mysqli_stmt_execute($stmt);
}

// Retorna o hash de senha do usuario (para conferir a senha atual antes de trocar).
function buscar_hash_senha($id)
{
    $linhas = executar_select(
        "SELECT senha_hash FROM usuarios WHERE id = ? LIMIT 1",
        "i",
        [$id]
    );
    return empty($linhas) ? null : $linhas[0]["senha_hash"];
}

// Lista usuarios ativos (id, nome, perfil) para selects de responsavel e filtros.
function listar_usuarios_ativos()
{
    return executar_select(
        "SELECT id, nome, perfil FROM usuarios WHERE ativo = 1 ORDER BY nome ASC"
    );
}

// Lista TODOS os usuarios (gestao de usuarios - admin). Sem dado sensivel.
function listar_usuarios()
{
    return executar_select(
        "SELECT u.id, u.nome, u.email, u.perfil, u.ativo, u.criado_em,
                u.setor_id, s.nome AS setor_nome
         FROM usuarios u
         LEFT JOIN setores s ON s.id = u.setor_id
         ORDER BY u.nome ASC"
    );
}

// Define (ou limpa, com null) o setor de um usuario.
function definir_setor_usuario($id, $setor_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE usuarios SET setor_id = ? WHERE id = ?");
    // setor_id pode ser null: o mysqli envia NULL quando a variavel ligada e null.
    mysqli_stmt_bind_param($stmt, "ii", $setor_id, $id);
    return mysqli_stmt_execute($stmt);
}

// Atualiza o perfil de um usuario (gestao de usuarios).
function atualizar_perfil_usuario($id, $perfil)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE usuarios SET perfil = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $perfil, $id);

    return mysqli_stmt_execute($stmt);
}

// Ativa/inativa um usuario (inativo nao consegue logar).
function definir_ativo_usuario($id, $ativo)
{
    $ativo = $ativo ? 1 : 0;
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE usuarios SET ativo = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ii", $ativo, $id);

    return mysqli_stmt_execute($stmt);
}

// Verifica se um usuario existe e esta ativo (validar responsavel informado).
function usuario_ativo_existe($id)
{
    $linhas = executar_select(
        "SELECT id FROM usuarios WHERE id = ? AND ativo = 1 LIMIT 1",
        "i",
        [$id]
    );
    return !empty($linhas);
}

// Marca o onboarding do usuario como concluido.
function marcar_onboarding_concluido($id)
{
    $conn = conectar_banco();
    $sql = "UPDATE usuarios SET onboarding_concluido = 1 WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);

    return mysqli_stmt_execute($stmt);
}

// Cria um usuario com perfil informado (usado no aceite de convite). Senha ja em hash.
// Retorna o id criado ou false em caso de falha.
function criar_usuario($nome, $email, $senha_hash, $perfil, $setor_id = null)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO usuarios (nome, email, senha_hash, perfil, setor_id, ativo, onboarding_concluido)
            VALUES (?, ?, ?, ?, ?, 1, 0)";

    $stmt = mysqli_prepare($conn, $sql);
    // setor_id pode ser null: o mysqli envia NULL quando a variavel ligada e null.
    mysqli_stmt_bind_param($stmt, "ssssi", $nome, $email, $senha_hash, $perfil, $setor_id);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}
