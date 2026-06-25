<?php

// chat.php
// Chat 1:1 entre usuarios (D20 - Fase 1). Procedural, mysqli, prepared statements.
// Regras:
// - Conversa e sempre entre 2 usuarios (par canonico: menor id em usuario_a_id).
// - So participantes leem/escrevem na conversa.
// - lida_em e marcada quando o OUTRO participante abre a conversa (recibo de leitura).

// Retorna o id da conversa entre dois usuarios, criando-a se ainda nao existir.
function obter_ou_criar_conversa($u1, $u2)
{
    $a = min((int) $u1, (int) $u2);
    $b = max((int) $u1, (int) $u2);

    $existe = executar_select(
        "SELECT id FROM conversas WHERE usuario_a_id = ? AND usuario_b_id = ? LIMIT 1",
        "ii",
        [$a, $b]
    );
    if (!empty($existe)) {
        return (int) $existe[0]["id"];
    }

    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "INSERT INTO conversas (usuario_a_id, usuario_b_id) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "ii", $a, $b);
    return mysqli_stmt_execute($stmt) ? mysqli_insert_id($conn) : false;
}

// Busca uma conversa (par de usuarios) pelo id.
function buscar_conversa($id)
{
    $linhas = executar_select(
        "SELECT id, usuario_a_id, usuario_b_id FROM conversas WHERE id = ? LIMIT 1",
        "i",
        [$id]
    );
    return empty($linhas) ? null : $linhas[0];
}

// O usuario participa desta conversa?
function usuario_participa_da_conversa($conversa_id, $usuario_id)
{
    $linhas = executar_select(
        "SELECT id FROM conversas WHERE id = ? AND (usuario_a_id = ? OR usuario_b_id = ?) LIMIT 1",
        "iii",
        [$conversa_id, $usuario_id, $usuario_id]
    );
    return !empty($linhas);
}

// Lista as conversas do usuario: o outro participante, ultima mensagem e nao lidas.
function listar_conversas($usuario_id)
{
    return executar_select(
        "SELECT c.id,
                IF(c.usuario_a_id = ?, c.usuario_b_id, c.usuario_a_id) AS outro_id,
                IF(c.usuario_a_id = ?, ub.nome, ua.nome) AS outro_nome,
                (SELECT m.texto FROM mensagens m WHERE m.conversa_id = c.id ORDER BY m.id DESC LIMIT 1) AS ultima_texto,
                (SELECT m.criado_em FROM mensagens m WHERE m.conversa_id = c.id ORDER BY m.id DESC LIMIT 1) AS ultima_em,
                (SELECT COUNT(*) FROM mensagens m WHERE m.conversa_id = c.id AND m.autor_id <> ? AND m.lida_em IS NULL) AS nao_lidas
         FROM conversas c
         JOIN usuarios ua ON ua.id = c.usuario_a_id
         JOIN usuarios ub ON ub.id = c.usuario_b_id
         WHERE c.usuario_a_id = ? OR c.usuario_b_id = ?
         ORDER BY (ultima_em IS NULL), ultima_em DESC, c.id DESC",
        "iiiii",
        [$usuario_id, $usuario_id, $usuario_id, $usuario_id, $usuario_id]
    );
}

// Lista as mensagens de uma conversa (ordem cronologica), com autor e demanda referenciada.
function listar_mensagens_da_conversa($conversa_id)
{
    return executar_select(
        "SELECT m.id, m.autor_id, ua.nome AS autor_nome, m.texto,
                m.demanda_id, d.titulo AS demanda_titulo, m.lida_em, m.criado_em
         FROM mensagens m
         JOIN usuarios ua ON ua.id = m.autor_id
         LEFT JOIN demandas d ON d.id = m.demanda_id
         WHERE m.conversa_id = ?
         ORDER BY m.id ASC",
        "i",
        [$conversa_id]
    );
}

// Cria uma mensagem. $demanda_id e null quando nao ha referencia. Retorna o id ou false.
function criar_mensagem($conversa_id, $autor_id, $texto, $demanda_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO mensagens (conversa_id, autor_id, texto, demanda_id) VALUES (?, ?, ?, ?)"
    );
    // demanda_id pode ser null: o mysqli envia NULL quando a variavel ligada e null.
    mysqli_stmt_bind_param($stmt, "iisi", $conversa_id, $autor_id, $texto, $demanda_id);
    return mysqli_stmt_execute($stmt) ? mysqli_insert_id($conn) : false;
}

// Marca como lidas as mensagens enviadas pelo OUTRO participante (recibo de leitura).
function marcar_conversa_lida($conversa_id, $leitor_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare(
        $conn,
        "UPDATE mensagens SET lida_em = NOW()
         WHERE conversa_id = ? AND autor_id <> ? AND lida_em IS NULL"
    );
    mysqli_stmt_bind_param($stmt, "ii", $conversa_id, $leitor_id);
    return mysqli_stmt_execute($stmt);
}

// Total de mensagens nao lidas do usuario (todas as conversas) - para o contador do menu.
function contar_mensagens_nao_lidas($usuario_id)
{
    $linhas = executar_select(
        "SELECT COUNT(*) AS total
         FROM mensagens m
         JOIN conversas c ON c.id = m.conversa_id
         WHERE (c.usuario_a_id = ? OR c.usuario_b_id = ?) AND m.autor_id <> ? AND m.lida_em IS NULL",
        "iii",
        [$usuario_id, $usuario_id, $usuario_id]
    );
    return (int) $linhas[0]["total"];
}
