<?php

// setores.php
// Acesso a dados dos setores (D21). responsavel_id = responsavel principal do setor.
// Lista fixa (seed). Procedural, mysqli, prepared statements.

// Lista os setores com o nome do responsavel principal (se houver).
function listar_setores()
{
    return executar_select(
        "SELECT s.id, s.nome, s.responsavel_id, u.nome AS responsavel_nome
         FROM setores s
         LEFT JOIN usuarios u ON u.id = s.responsavel_id
         ORDER BY s.nome ASC",
        "",
        []
    );
}

// Busca um setor pelo id.
function buscar_setor($id)
{
    $linhas = executar_select(
        "SELECT id, nome, responsavel_id FROM setores WHERE id = ? LIMIT 1",
        "i",
        [$id]
    );
    return empty($linhas) ? null : $linhas[0];
}

// Define (ou limpa, com null) o responsavel principal de um setor.
function definir_responsavel_setor($setor_id, $responsavel_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE setores SET responsavel_id = ? WHERE id = ?");
    // responsavel_id pode ser null: o mysqli envia NULL quando a variavel ligada e null.
    mysqli_stmt_bind_param($stmt, "ii", $responsavel_id, $setor_id);
    return mysqli_stmt_execute($stmt);
}
