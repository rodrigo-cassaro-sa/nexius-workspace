<?php

// notificacoes.php
// Notificacoes internas: criar, listar, contar nao lidas e marcar como lida.
// Eventos chamam notificar()/notificar_varios(). Conteudo curto, sem dado sensivel.

function notificar($usuario_id, $tipo, $titulo, $mensagem, $link)
{
    $usuario_id = (int) $usuario_id;
    if ($usuario_id <= 0) {
        return false;
    }

    $conn = conectar_banco();
    $sql = "INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, link)
            VALUES (?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "issss", $usuario_id, $tipo, $titulo, $mensagem, $link);

    return mysqli_stmt_execute($stmt);
}

// Notifica varios usuarios, deduplicando e ignorando um usuario (ex.: o autor do evento).
function notificar_varios($ids, $excluir_id, $tipo, $titulo, $mensagem, $link)
{
    $unicos = [];
    foreach ($ids as $id) {
        $id = (int) $id;
        if ($id > 0 && $id !== (int) $excluir_id) {
            $unicos[$id] = true;
        }
    }

    foreach (array_keys($unicos) as $id) {
        notificar($id, $tipo, $titulo, $mensagem, $link);
    }
}

// Observadores de uma acao: responsavel da acao + criador da demanda + autores de comentario.
function observadores_da_acao($acao_id)
{
    $ids = [];

    $linhas = executar_select(
        "SELECT a.responsavel_id, d.criador_id
         FROM acoes a JOIN demandas d ON d.id = a.demanda_id
         WHERE a.id = ? LIMIT 1",
        "i",
        [$acao_id]
    );
    if (!empty($linhas)) {
        $ids[] = $linhas[0]["responsavel_id"];
        $ids[] = $linhas[0]["criador_id"];
    }

    $autores = executar_select(
        "SELECT DISTINCT autor_id FROM comentarios WHERE acao_id = ?",
        "i",
        [$acao_id]
    );
    foreach ($autores as $a) {
        $ids[] = $a["autor_id"];
    }

    return $ids;
}

function listar_notificacoes($usuario_id)
{
    return executar_select(
        "SELECT id, tipo, titulo, mensagem, link, lida, criado_em
         FROM notificacoes WHERE usuario_id = ?
         ORDER BY criado_em DESC LIMIT 50",
        "i",
        [$usuario_id]
    );
}

function contar_notificacoes_nao_lidas($usuario_id)
{
    $linhas = executar_select(
        "SELECT COUNT(*) AS total FROM notificacoes WHERE usuario_id = ? AND lida = 0",
        "i",
        [$usuario_id]
    );
    return (int) $linhas[0]["total"];
}

// Marca uma notificacao como lida (apenas do proprio usuario).
function marcar_notificacao_lida($id, $usuario_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE notificacoes SET lida = 1, lida_em = NOW() WHERE id = ? AND usuario_id = ?");
    mysqli_stmt_bind_param($stmt, "ii", $id, $usuario_id);
    return mysqli_stmt_execute($stmt);
}

function marcar_todas_notificacoes_lidas($usuario_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE notificacoes SET lida = 1, lida_em = NOW() WHERE usuario_id = ? AND lida = 0");
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    return mysqli_stmt_execute($stmt);
}
