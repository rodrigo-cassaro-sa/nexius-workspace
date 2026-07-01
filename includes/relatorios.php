<?php

// relatorios.php
// Consultas agregadas para a tela de Relatorios (gestao). Somente leitura.
// Visao global (Gestor/Admin), com filtro opcional por setor ($setor_id > 0).
// Procedural, mysqli, prepared statements.

// Demandas por status (nao filtra periodo). Filtro opcional por setor.
function relatorio_demandas_por_status($setor_id = 0)
{
    $where = $setor_id > 0 ? " WHERE setor_id = ?" : "";
    $tipos = $setor_id > 0 ? "i" : "";
    $params = $setor_id > 0 ? [(int) $setor_id] : [];
    return executar_select(
        "SELECT status, COUNT(*) AS total FROM demandas" . $where . " GROUP BY status ORDER BY total DESC",
        $tipos,
        $params
    );
}

// Demandas por setor (inclui '(sem setor)'). Filtro opcional por setor.
function relatorio_demandas_por_setor($setor_id = 0)
{
    $where = $setor_id > 0 ? " WHERE d.setor_id = ?" : "";
    $tipos = $setor_id > 0 ? "i" : "";
    $params = $setor_id > 0 ? [(int) $setor_id] : [];
    return executar_select(
        "SELECT COALESCE(s.nome, '(sem setor)') AS setor, COUNT(*) AS total
         FROM demandas d
         LEFT JOIN setores s ON s.id = d.setor_id"
         . $where . "
         GROUP BY d.setor_id, s.nome
         ORDER BY total DESC",
        $tipos,
        $params
    );
}

// % de acoes concluidas no prazo, entre as concluidas no periodo. Filtro opcional por setor.
function relatorio_acoes_prazo($inicio, $fim, $setor_id = 0)
{
    $filtro_setor = $setor_id > 0 ? " AND d.setor_id = ?" : "";
    $base = "FROM acoes a
             JOIN demandas d ON d.id = a.demanda_id
             WHERE a.status = 'concluida' AND a.concluida_em IS NOT NULL
               AND DATE(a.concluida_em) BETWEEN ? AND ?" . $filtro_setor;

    $tipos = $setor_id > 0 ? "ssi" : "ss";
    $params = $setor_id > 0 ? [$inicio, $fim, (int) $setor_id] : [$inicio, $fim];

    $total = (int) executar_select("SELECT COUNT(*) AS total " . $base, $tipos, $params)[0]["total"];
    $no_prazo = (int) executar_select(
        "SELECT COUNT(*) AS total " . $base . " AND a.prazo IS NOT NULL AND DATE(a.concluida_em) <= a.prazo",
        $tipos,
        $params
    )[0]["total"];

    return [
        "total" => $total,
        "no_prazo" => $no_prazo,
        "percentual" => $total > 0 ? (int) round(($no_prazo / $total) * 100) : null
    ];
}

// Padrao de falha - ATRASOS por responsavel: acoes concluidas FORA do prazo no periodo.
function relatorio_atrasos_por_responsavel($inicio, $fim, $setor_id = 0)
{
    $filtro_setor = $setor_id > 0 ? " AND d.setor_id = ?" : "";
    $tipos = $setor_id > 0 ? "ssi" : "ss";
    $params = $setor_id > 0 ? [$inicio, $fim, (int) $setor_id] : [$inicio, $fim];

    return executar_select(
        "SELECT u.nome AS responsavel, COUNT(*) AS atrasadas
         FROM acoes a
         JOIN usuarios u ON u.id = a.responsavel_id
         JOIN demandas d ON d.id = a.demanda_id
         WHERE a.status = 'concluida' AND a.concluida_em IS NOT NULL
           AND DATE(a.concluida_em) BETWEEN ? AND ?
           AND a.prazo IS NOT NULL AND DATE(a.concluida_em) > a.prazo" . $filtro_setor . "
         GROUP BY u.id, u.nome
         ORDER BY atrasadas DESC, u.nome ASC",
        $tipos,
        $params
    );
}

// Padrao de falha - RECUSAS por setor: entregas atualmente recusadas, por setor da demanda.
function relatorio_recusas_por_setor($setor_id = 0)
{
    $filtro_setor = $setor_id > 0 ? " AND d.setor_id = ?" : "";
    $tipos = $setor_id > 0 ? "i" : "";
    $params = $setor_id > 0 ? [(int) $setor_id] : [];

    return executar_select(
        "SELECT COALESCE(s.nome, '(sem setor)') AS setor, COUNT(*) AS recusadas
         FROM acoes a
         JOIN demandas d ON d.id = a.demanda_id
         LEFT JOIN setores s ON s.id = d.setor_id
         WHERE a.status = 'recusada'" . $filtro_setor . "
         GROUP BY d.setor_id, s.nome
         ORDER BY recusadas DESC",
        $tipos,
        $params
    );
}

// Produtividade por responsavel: acoes concluidas e quantas no prazo, no periodo. Filtro opcional por setor.
function relatorio_produtividade($inicio, $fim, $setor_id = 0)
{
    $filtro_setor = $setor_id > 0 ? " AND d.setor_id = ?" : "";
    $tipos = $setor_id > 0 ? "ssi" : "ss";
    $params = $setor_id > 0 ? [$inicio, $fim, (int) $setor_id] : [$inicio, $fim];

    return executar_select(
        "SELECT u.nome AS responsavel,
                COUNT(*) AS concluidas,
                SUM(CASE WHEN a.prazo IS NOT NULL AND DATE(a.concluida_em) <= a.prazo THEN 1 ELSE 0 END) AS no_prazo
         FROM acoes a
         JOIN usuarios u ON u.id = a.responsavel_id
         JOIN demandas d ON d.id = a.demanda_id
         WHERE a.status = 'concluida' AND a.concluida_em IS NOT NULL
           AND DATE(a.concluida_em) BETWEEN ? AND ?" . $filtro_setor . "
         GROUP BY u.id, u.nome
         ORDER BY concluidas DESC, u.nome ASC",
        $tipos,
        $params
    );
}
