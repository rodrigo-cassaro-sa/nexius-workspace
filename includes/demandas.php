<?php

// demandas.php
// Acesso a dados e escopo de visibilidade das demandas (procedural, mysqli, prepared statements).
// Regras de negocio reforcadas no backend (ver 01-descricao-produto.md secao 8 e 9).

// Status manuais permitidos (concluida NUNCA e manual: vem da acao chave).
function status_demanda_edicao()
{
    return ["aberta", "em_andamento"];
}

function status_demanda_arquivamento()
{
    return ["arquivada", "cancelada"];
}

// Cria uma demanda com o questionario (6 campos). Retorna o id ou false.
// $campos = [problema, impacto_operacional, risco, afeta_outros, workaround, sugestao_solucao]
function criar_demanda($titulo, $responsavel_id, $criador_id, $campos)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO demandas
                (titulo, status, criador_id, responsavel_id,
                 problema, impacto_operacional, risco, afeta_outros, workaround, sugestao_solucao,
                 gut_gravidade, gut_urgencia, gut_tendencia)
            VALUES (?, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param(
        $stmt,
        "siissssssiii",
        $titulo,
        $criador_id,
        $responsavel_id,
        $campos["problema"],
        $campos["impacto_operacional"],
        $campos["risco"],
        $campos["afeta_outros"],
        $campos["workaround"],
        $campos["sugestao_solucao"],
        $campos["gut_gravidade"],
        $campos["gut_urgencia"],
        $campos["gut_tendencia"]
    );
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

// Monta a clausula WHERE (com escopo e filtros) reaproveitada na contagem e na listagem.
function montar_where_demandas($usuario_id, $perfil, $filtros)
{
    $where = " WHERE 1 = 1";
    $tipos = "";
    $params = [];

    // Escopo do colaborador: responsavel de alguma acao da demanda OU autor de comentario nela.
    if ($perfil === "colaborador") {
        $where .= " AND (
            EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.responsavel_id = ?)
            OR EXISTS (SELECT 1 FROM comentarios c
                       JOIN acoes a2 ON a2.id = c.acao_id
                       WHERE a2.demanda_id = d.id AND c.autor_id = ?)
        )";
        $tipos .= "ii";
        $params[] = $usuario_id;
        $params[] = $usuario_id;
    }

    // Status. Sem filtro, esconde arquivada/cancelada.
    if ($filtros["status"] !== "") {
        $where .= " AND d.status = ?";
        $tipos .= "s";
        $params[] = $filtros["status"];
    } else {
        $where .= " AND d.status NOT IN ('arquivada', 'cancelada')";
    }

    // Responsavel.
    if ($filtros["responsavel"] > 0) {
        $where .= " AND d.responsavel_id = ?";
        $tipos .= "i";
        $params[] = $filtros["responsavel"];
    }

    // Busca por titulo.
    if ($filtros["busca"] !== "") {
        $where .= " AND d.titulo LIKE ?";
        $tipos .= "s";
        $params[] = "%" . $filtros["busca"] . "%";
    }

    return [$where, $tipos, $params];
}

// Lista demandas (com escopo, filtros, progresso, prazo da acao chave e paginacao).
// Admin e Gestor veem todas; Colaborador ve apenas as em que esta envolvido.
function listar_demandas($usuario_id, $perfil, $filtros, $pagina, $por_pagina)
{
    list($where, $tipos, $params) = montar_where_demandas($usuario_id, $perfil, $filtros);

    // Total para paginacao.
    $total = (int) executar_select("SELECT COUNT(*) AS total FROM demandas d" . $where, $tipos, $params)[0]["total"];

    $offset = ($pagina - 1) * $por_pagina;

    // Progresso = acoes concluidas / total de acoes (exceto canceladas).
    // Prazo = prazo da acao chave. (Acoes ainda nao existem nesta fase: vem 0/0 e null.)
    $sql = "SELECT d.id, d.titulo, d.status, d.responsavel_id,
                   u.nome AS responsavel_nome, d.criado_em,
                   d.gut_gravidade, d.gut_urgencia, d.gut_tendencia,
                   COALESCE(d.gut_gravidade * d.gut_urgencia * d.gut_tendencia, 0) AS prioridade,
                   (SELECT COUNT(*) FROM acoes a WHERE a.demanda_id = d.id AND a.status <> 'cancelada') AS total_acoes,
                   (SELECT COUNT(*) FROM acoes a WHERE a.demanda_id = d.id AND a.status = 'concluida') AS acoes_concluidas,
                   (SELECT a.prazo FROM acoes a WHERE a.demanda_id = d.id AND a.chave = 1 LIMIT 1) AS prazo_chave
            FROM demandas d
            LEFT JOIN usuarios u ON u.id = d.responsavel_id"
            . $where . " ORDER BY prioridade DESC, d.criado_em DESC LIMIT ? OFFSET ?";

    $tipos_lista = $tipos . "ii";
    $params_lista = array_merge($params, [$por_pagina, $offset]);

    $demandas = executar_select($sql, $tipos_lista, $params_lista);

    return ["demandas" => $demandas, "total" => $total];
}

// Busca uma demanda pelo id (com nomes de responsavel e criador).
function buscar_demanda($id)
{
    $linhas = executar_select(
        "SELECT d.id, d.titulo, d.descricao, d.status, d.responsavel_id, d.criador_id,
                d.problema, d.impacto_operacional, d.risco, d.afeta_outros, d.workaround, d.sugestao_solucao,
                d.gut_gravidade, d.gut_urgencia, d.gut_tendencia,
                ur.nome AS responsavel_nome, uc.nome AS criador_nome,
                d.concluida_em, d.criado_em, d.atualizado_em
         FROM demandas d
         LEFT JOIN usuarios ur ON ur.id = d.responsavel_id
         LEFT JOIN usuarios uc ON uc.id = d.criador_id
         WHERE d.id = ? LIMIT 1",
        "i",
        [$id]
    );

    return empty($linhas) ? null : $linhas[0];
}

// Escopo de visibilidade do colaborador sobre uma demanda especifica.
function colaborador_envolvido_na_demanda($demanda_id, $usuario_id)
{
    $linhas = executar_select(
        "SELECT 1 FROM demandas d WHERE d.id = ? AND (
            EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.responsavel_id = ?)
            OR EXISTS (SELECT 1 FROM comentarios c
                       JOIN acoes a2 ON a2.id = c.acao_id
                       WHERE a2.demanda_id = d.id AND c.autor_id = ?)
         ) LIMIT 1",
        "iii",
        [$demanda_id, $usuario_id, $usuario_id]
    );

    return !empty($linhas);
}

// Atualiza dados da demanda (titulo, questionario, responsavel, status de edicao).
// $campos = [problema, impacto_operacional, risco, afeta_outros, workaround, sugestao_solucao]
function atualizar_demanda($id, $titulo, $responsavel_id, $status, $campos)
{
    $conn = conectar_banco();
    $sql = "UPDATE demandas SET titulo = ?, responsavel_id = ?, status = ?,
                problema = ?, impacto_operacional = ?, risco = ?,
                afeta_outros = ?, workaround = ?, sugestao_solucao = ?
            WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param(
        $stmt,
        "sisssssssi",
        $titulo,
        $responsavel_id,
        $status,
        $campos["problema"],
        $campos["impacto_operacional"],
        $campos["risco"],
        $campos["afeta_outros"],
        $campos["workaround"],
        $campos["sugestao_solucao"],
        $id
    );

    return mysqli_stmt_execute($stmt);
}

// Arquiva ou cancela a demanda (status arquivada/cancelada).
function arquivar_demanda($id, $status)
{
    $conn = conectar_banco();
    $sql = "UPDATE demandas SET status = ? WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "si", $status, $id);

    return mysqli_stmt_execute($stmt);
}
