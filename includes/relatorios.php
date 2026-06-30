<?php

// relatorios.php
// Consultas agregadas para a tela de Relatorios (gestao). Somente leitura.
// Visao global (Gestor/Admin); o recorte por setor do key user fica para uma fase futura.
// Procedural, mysqli, prepared statements.

// Demandas por status (ciclo ativo + finalizadas; nao filtra periodo).
function relatorio_demandas_por_status()
{
    return executar_select(
        "SELECT status, COUNT(*) AS total FROM demandas GROUP BY status ORDER BY total DESC",
        "",
        []
    );
}

// Demandas por setor (inclui '(sem setor)').
function relatorio_demandas_por_setor()
{
    return executar_select(
        "SELECT COALESCE(s.nome, '(sem setor)') AS setor, COUNT(*) AS total
         FROM demandas d
         LEFT JOIN setores s ON s.id = d.setor_id
         GROUP BY d.setor_id, s.nome
         ORDER BY total DESC",
        "",
        []
    );
}

// % de acoes concluidas no prazo, entre as concluidas no periodo [inicio, fim].
function relatorio_acoes_prazo($inicio, $fim)
{
    $base = "FROM acoes
             WHERE status = 'concluida' AND concluida_em IS NOT NULL
               AND DATE(concluida_em) BETWEEN ? AND ?";

    $total = (int) executar_select("SELECT COUNT(*) AS total " . $base, "ss", [$inicio, $fim])[0]["total"];
    $no_prazo = (int) executar_select(
        "SELECT COUNT(*) AS total " . $base . " AND prazo IS NOT NULL AND DATE(concluida_em) <= prazo",
        "ss",
        [$inicio, $fim]
    )[0]["total"];

    return [
        "total" => $total,
        "no_prazo" => $no_prazo,
        "percentual" => $total > 0 ? (int) round(($no_prazo / $total) * 100) : null
    ];
}

// Produtividade por responsavel: acoes concluidas e quantas no prazo, no periodo.
function relatorio_produtividade($inicio, $fim)
{
    return executar_select(
        "SELECT u.nome AS responsavel,
                COUNT(*) AS concluidas,
                SUM(CASE WHEN a.prazo IS NOT NULL AND DATE(a.concluida_em) <= a.prazo THEN 1 ELSE 0 END) AS no_prazo
         FROM acoes a
         JOIN usuarios u ON u.id = a.responsavel_id
         WHERE a.status = 'concluida' AND a.concluida_em IS NOT NULL
           AND DATE(a.concluida_em) BETWEEN ? AND ?
         GROUP BY u.id, u.nome
         ORDER BY concluidas DESC, u.nome ASC",
        "ss",
        [$inicio, $fim]
    );
}
