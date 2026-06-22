<?php

// dashboard.php
// Consultas de resumo para o painel. Respeitam o escopo do usuario:
// Admin/Gestor veem numeros globais; Colaborador ve apenas o que lhe diz respeito.
// Acoes ainda nao existem na fase atual: as metricas de acao retornam 0/null ate la.

// Contagem de demandas por status (apenas ciclo ativo: aberta, em_andamento, concluida).
function contar_demandas_por_status($usuario_id, $perfil)
{
    $sql = "SELECT status, COUNT(*) AS total FROM demandas d
            WHERE status IN ('aberta', 'em_andamento', 'concluida')";
    $tipos = "";
    $params = [];

    if ($perfil === "colaborador") {
        $sql .= " AND (
            EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.responsavel_id = ?)
            OR EXISTS (SELECT 1 FROM comentarios c JOIN acoes a2 ON a2.id = c.acao_id
                       WHERE a2.demanda_id = d.id AND c.autor_id = ?)
        )";
        $tipos = "ii";
        $params = [$usuario_id, $usuario_id];
    }

    $sql .= " GROUP BY status";

    $linhas = executar_select($sql, $tipos, $params);

    $resultado = ["aberta" => 0, "em_andamento" => 0, "concluida" => 0];
    foreach ($linhas as $linha) {
        $resultado[$linha["status"]] = (int) $linha["total"];
    }
    return $resultado;
}

// Minhas acoes pendentes (do usuario logado).
function contar_minhas_acoes_pendentes($usuario_id)
{
    $linhas = executar_select(
        "SELECT COUNT(*) AS total FROM acoes WHERE responsavel_id = ? AND status = 'pendente'",
        "i",
        [$usuario_id]
    );
    return (int) $linhas[0]["total"];
}

// Acoes atrasadas (prazo vencido e nao concluida/cancelada).
function contar_acoes_atrasadas($usuario_id, $perfil)
{
    $sql = "SELECT COUNT(*) AS total FROM acoes
            WHERE prazo IS NOT NULL AND prazo < CURDATE()
              AND status NOT IN ('concluida', 'cancelada')";
    $tipos = "";
    $params = [];

    if ($perfil === "colaborador") {
        $sql .= " AND responsavel_id = ?";
        $tipos = "i";
        $params = [$usuario_id];
    }

    $linhas = executar_select($sql, $tipos, $params);
    return (int) $linhas[0]["total"];
}

// Percentual de acoes concluidas dentro do prazo. Retorna null se nao houver base.
function percentual_acoes_no_prazo($usuario_id, $perfil)
{
    $base = "FROM acoes WHERE status = 'concluida' AND prazo IS NOT NULL AND concluida_em IS NOT NULL";
    $tipos = "";
    $params = [];

    if ($perfil === "colaborador") {
        $base .= " AND responsavel_id = ?";
        $tipos = "i";
        $params = [$usuario_id];
    }

    $total = (int) executar_select("SELECT COUNT(*) AS total " . $base, $tipos, $params)[0]["total"];
    if ($total === 0) {
        return null;
    }

    $no_prazo = (int) executar_select(
        "SELECT COUNT(*) AS total " . $base . " AND DATE(concluida_em) <= prazo",
        $tipos,
        $params
    )[0]["total"];

    return (int) round(($no_prazo / $total) * 100);
}
