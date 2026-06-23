<?php

// acoes.php
// Acesso a dados e regras das acoes (plano de acao). Procedural, mysqli, prepared statements.
// Regras (01-descricao-produto.md secao 8):
// - So o responsavel conclui a propria acao.
// - Acao com pre-requisito pendente fica BLOQUEADA (status derivado).
// - Uma unica acao chave por demanda; concluir a chave conclui a demanda.

// Remove a marcacao de chave das acoes de uma demanda (garante 1 chave por demanda).
function limpar_chave_da_demanda($demanda_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE acoes SET chave = 0 WHERE demanda_id = ?");
    mysqli_stmt_bind_param($stmt, "i", $demanda_id);
    mysqli_stmt_execute($stmt);
}

// Cria uma acao. Retorna o id ou false.
function criar_acao($demanda_id, $titulo, $descricao, $responsavel_id, $prazo, $chave)
{
    $conn = conectar_banco();

    if ($chave) {
        limpar_chave_da_demanda($demanda_id);
    }

    $sql = "INSERT INTO acoes (demanda_id, titulo, descricao, responsavel_id, status, prazo, chave)
            VALUES (?, ?, ?, ?, 'pendente', ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "issisi", $demanda_id, $titulo, $descricao, $responsavel_id, $prazo, $chave);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

// Lista as acoes de uma demanda (com responsavel e contagem de pre-requisitos pendentes).
function listar_acoes_da_demanda($demanda_id)
{
    return executar_select(
        "SELECT a.id, a.titulo, a.descricao, a.responsavel_id, ur.nome AS responsavel_nome,
                a.status, a.prazo, a.chave, a.concluida_em,
                (SELECT COUNT(*) FROM acao_prerequisitos ap
                 JOIN acoes p ON p.id = ap.prerequisito_acao_id
                 WHERE ap.acao_id = a.id AND p.status <> 'concluida') AS prereq_pendentes,
                (SELECT COUNT(*) FROM acao_visualizacoes av WHERE av.acao_id = a.id) AS total_visualizacoes
         FROM acoes a
         LEFT JOIN usuarios ur ON ur.id = a.responsavel_id
         WHERE a.demanda_id = ? AND a.status <> 'cancelada'
         ORDER BY a.id ASC",
        "i",
        [$demanda_id]
    );
}

// Busca uma acao (inclui demanda_id e chave para as regras).
function buscar_acao($id)
{
    $linhas = executar_select(
        "SELECT id, demanda_id, titulo, responsavel_id, status, chave FROM acoes WHERE id = ? LIMIT 1",
        "i",
        [$id]
    );
    return empty($linhas) ? null : $linhas[0];
}

// Quantos pre-requisitos da acao ainda nao foram concluidos.
function acao_prereqs_pendentes($acao_id)
{
    $linhas = executar_select(
        "SELECT COUNT(*) AS total FROM acao_prerequisitos ap
         JOIN acoes p ON p.id = ap.prerequisito_acao_id
         WHERE ap.acao_id = ? AND p.status <> 'concluida'",
        "i",
        [$acao_id]
    );
    return (int) $linhas[0]["total"];
}

// Define os pre-requisitos de uma acao (substitui os anteriores).
// So aceita acoes da MESMA demanda e diferentes da propria acao (evita ciclo direto).
function definir_prerequisitos($acao_id, $demanda_id, $ids)
{
    $conn = conectar_banco();

    $stmt = mysqli_prepare($conn, "DELETE FROM acao_prerequisitos WHERE acao_id = ?");
    mysqli_stmt_bind_param($stmt, "i", $acao_id);
    mysqli_stmt_execute($stmt);

    foreach ($ids as $pid) {
        $pid = (int) $pid;
        if ($pid <= 0 || $pid === (int) $acao_id) {
            continue;
        }

        // Confirma que o pre-requisito pertence a mesma demanda.
        $valido = executar_select(
            "SELECT id FROM acoes WHERE id = ? AND demanda_id = ? LIMIT 1",
            "ii",
            [$pid, $demanda_id]
        );
        if (empty($valido)) {
            continue;
        }

        $ins = mysqli_prepare($conn, "INSERT IGNORE INTO acao_prerequisitos (acao_id, prerequisito_acao_id) VALUES (?, ?)");
        mysqli_stmt_bind_param($ins, "ii", $acao_id, $pid);
        mysqli_stmt_execute($ins);
    }
}

// Conclui uma acao.
function concluir_acao($id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE acoes SET status = 'concluida', concluida_em = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    return mysqli_stmt_execute($stmt);
}

// Conclui a demanda (usado quando a acao chave e concluida).
function concluir_demanda_por_acao_chave($demanda_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET status = 'concluida', concluida_em = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $demanda_id);
    return mysqli_stmt_execute($stmt);
}
