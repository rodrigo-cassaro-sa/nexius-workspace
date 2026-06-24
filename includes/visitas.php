<?php

// visitas.php
// Lastro de visitas a demanda: quem abriu, primeira/ultima visita e total.
// Uma linha por (demanda, usuario), atualizada a cada abertura.

function registrar_visita_demanda($demanda_id, $usuario_id)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO demanda_visitas (demanda_id, usuario_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE ultima_visita = NOW(), total_visitas = total_visitas + 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $demanda_id, $usuario_id);

    return mysqli_stmt_execute($stmt);
}

function listar_visitas_demanda($demanda_id)
{
    return executar_select(
        "SELECT v.usuario_id, u.nome AS usuario_nome, u.perfil,
                v.primeira_visita, v.ultima_visita, v.total_visitas
         FROM demanda_visitas v
         JOIN usuarios u ON u.id = v.usuario_id
         WHERE v.demanda_id = ?
         ORDER BY v.ultima_visita DESC",
        "i",
        [$demanda_id]
    );
}

// Ultima demanda que o usuario abriu (retencao: "continue de onde parou").
// Exclui arquivada/cancelada (nao faz sentido retomar).
function ultima_demanda_visitada($usuario_id)
{
    $linhas = executar_select(
        "SELECT d.id, d.titulo
         FROM demanda_visitas v
         JOIN demandas d ON d.id = v.demanda_id
         WHERE v.usuario_id = ? AND d.status NOT IN ('arquivada', 'cancelada')
         ORDER BY v.ultima_visita DESC LIMIT 1",
        "i",
        [$usuario_id]
    );
    return empty($linhas) ? null : $linhas[0];
}

// Marca que o usuario viu o detalhe de uma acao (guarda a 1a visualizacao).
function marcar_acao_visualizada($acao_id, $usuario_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "INSERT IGNORE INTO acao_visualizacoes (acao_id, usuario_id) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "ii", $acao_id, $usuario_id);

    return mysqli_stmt_execute($stmt);
}

function listar_visualizacoes_acao($acao_id)
{
    return executar_select(
        "SELECT av.usuario_id, u.nome AS usuario_nome, av.visualizado_em
         FROM acao_visualizacoes av
         JOIN usuarios u ON u.id = av.usuario_id
         WHERE av.acao_id = ?
         ORDER BY av.visualizado_em ASC",
        "i",
        [$acao_id]
    );
}
