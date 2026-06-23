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
