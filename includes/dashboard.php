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

// Minhas pendencias (retencao): acoes pendentes do usuario, com a demanda e o prazo.
// Ordena pelo prazo (mais cedo primeiro; sem prazo por ultimo). Exclui demanda arquivada/cancelada.
function listar_minhas_pendencias($usuario_id, $limite)
{
    $limite = (int) $limite;
    return executar_select(
        "SELECT a.id AS acao_id, a.titulo AS acao_titulo, a.prazo,
                d.id AS demanda_id, d.titulo AS demanda_titulo,
                (SELECT COUNT(*) FROM acao_prerequisitos ap
                 JOIN acoes p ON p.id = ap.prerequisito_acao_id
                 WHERE ap.acao_id = a.id AND p.status <> 'concluida') AS prereq_pendentes
         FROM acoes a
         JOIN demandas d ON d.id = a.demanda_id
         WHERE a.responsavel_id = ? AND a.status = 'pendente'
           AND d.status NOT IN ('arquivada', 'cancelada')
         ORDER BY (a.prazo IS NULL), a.prazo ASC, a.id ASC
         LIMIT " . $limite,
        "i",
        [$usuario_id]
    );
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

// Total de acoes recusadas (status 'recusada'). Escopo: Colaborador so as suas.
function contar_acoes_recusadas($usuario_id, $perfil)
{
    $sql = "SELECT COUNT(*) AS total FROM acoes WHERE status = 'recusada'";
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

// Contagem de acoes por tipo (exclui canceladas). Escopo: Colaborador so as suas.
// Sempre retorna todos os tipos (0 quando nao houver).
function contar_acoes_por_tipo($usuario_id, $perfil)
{
    $sql = "SELECT tipo, COUNT(*) AS total FROM acoes WHERE status <> 'cancelada'";
    $tipos = "";
    $params = [];

    if ($perfil === "colaborador") {
        $sql .= " AND responsavel_id = ?";
        $tipos = "i";
        $params = [$usuario_id];
    }

    $sql .= " GROUP BY tipo";

    $linhas = executar_select($sql, $tipos, $params);

    $resultado = ["analise" => 0, "desenvolvimento" => 0, "entrega" => 0, "incidente" => 0, "reuniao" => 0];
    foreach ($linhas as $linha) {
        if (isset($resultado[$linha["tipo"]])) {
            $resultado[$linha["tipo"]] = (int) $linha["total"];
        }
    }
    return $resultado;
}
