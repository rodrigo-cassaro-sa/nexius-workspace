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
function criar_demanda($titulo, $responsavel_id, $criador_id, $campos, $setor_id = null, $projeto_id = null)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO demandas
                (titulo, status, criador_id, responsavel_id, setor_id, projeto_id,
                 problema, impacto_operacional, risco, afeta_outros, workaround, sugestao_solucao,
                 origem, momento_etapa, intencao, pilar, objetivo,
                 gut_gravidade, gut_urgencia, gut_tendencia)
            VALUES (?, 'aberta', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // titulo(s) + criador/responsavel/setor/projeto(iiii) + 6 perguntas(ssssss) + 5 triagem(sssss) + 3 gut(iii)
    $tipos = "s" . "iiii" . "ssssss" . "sssss" . "iii";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param(
        $stmt,
        $tipos,
        $titulo,
        $criador_id,
        $responsavel_id,
        $setor_id,
        $projeto_id,
        $campos["problema"],
        $campos["impacto_operacional"],
        $campos["risco"],
        $campos["afeta_outros"],
        $campos["workaround"],
        $campos["sugestao_solucao"],
        $campos["origem"],
        $campos["momento_etapa"],
        $campos["intencao"],
        $campos["pilar"],
        $campos["objetivo"],
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

    // Escopo do colaborador: responsavel de alguma acao da demanda OU autor de comentario nela
    // OU key user (responsavel principal) do setor da demanda (ve todo o setor - D21).
    if ($perfil === "colaborador") {
        $where .= " AND (
            EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.responsavel_id = ?)
            OR EXISTS (SELECT 1 FROM comentarios c
                       JOIN acoes a2 ON a2.id = c.acao_id
                       WHERE a2.demanda_id = d.id AND c.autor_id = ?)
            OR EXISTS (SELECT 1 FROM setores ks WHERE ks.id = d.setor_id AND ks.responsavel_id = ?)
        )";
        $tipos .= "iii";
        $params[] = $usuario_id;
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

    // Solicitante (criador da demanda).
    if (($filtros["solicitante"] ?? 0) > 0) {
        $where .= " AND d.criador_id = ?";
        $tipos .= "i";
        $params[] = $filtros["solicitante"];
    }

    // Setor da demanda.
    if (($filtros["setor"] ?? 0) > 0) {
        $where .= " AND d.setor_id = ?";
        $tipos .= "i";
        $params[] = $filtros["setor"];
    }

    // Projeto da demanda (usado na tela de detalhe do projeto).
    if (($filtros["projeto"] ?? 0) > 0) {
        $where .= " AND d.projeto_id = ?";
        $tipos .= "i";
        $params[] = $filtros["projeto"];
    }

    // Busca por titulo.
    if ($filtros["busca"] !== "") {
        $where .= " AND d.titulo LIKE ?";
        $tipos .= "s";
        $params[] = "%" . $filtros["busca"] . "%";
    }

    // Filtros de triagem (intencao, pilar, objetivo).
    if (($filtros["intencao"] ?? "") !== "") {
        $where .= " AND d.intencao = ?";
        $tipos .= "s";
        $params[] = $filtros["intencao"];
    }
    if (($filtros["pilar"] ?? "") !== "") {
        $where .= " AND d.pilar = ?";
        $tipos .= "s";
        $params[] = $filtros["pilar"];
    }
    if (($filtros["objetivo"] ?? "") !== "") {
        $where .= " AND d.objetivo = ?";
        $tipos .= "s";
        $params[] = $filtros["objetivo"];
    }

    // Filtro de SLA de resposta (3 dias). Sem parametros: usa data do banco.
    $sla = $filtros["sla"] ?? "";
    if ($sla === "aguardando") {
        $where .= " AND d.respondida_em IS NULL AND NOW() <= DATE_ADD(d.criado_em, INTERVAL 3 DAY)";
    } elseif ($sla === "vencido") {
        $where .= " AND d.respondida_em IS NULL AND NOW() > DATE_ADD(d.criado_em, INTERVAL 3 DAY)";
    } elseif ($sla === "respondida_prazo") {
        $where .= " AND d.respondida_em IS NOT NULL AND d.respondida_em <= DATE_ADD(d.criado_em, INTERVAL 3 DAY)";
    } elseif ($sla === "respondida_fora") {
        $where .= " AND d.respondida_em IS NOT NULL AND d.respondida_em > DATE_ADD(d.criado_em, INTERVAL 3 DAY)";
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
    $sql = "SELECT d.id, d.titulo, d.status, d.criador_id,
                   uc.nome AS solicitante_nome, d.criado_em, d.respondida_em,
                   d.gut_gravidade, d.gut_urgencia, d.gut_tendencia,
                   COALESCE(d.gut_gravidade * d.gut_urgencia * d.gut_tendencia, 0) AS prioridade,
                   (SELECT COUNT(*) FROM acoes a WHERE a.demanda_id = d.id AND a.status <> 'cancelada') AS total_acoes,
                   (SELECT COUNT(*) FROM acoes a WHERE a.demanda_id = d.id AND a.status = 'concluida') AS acoes_concluidas,
                   (SELECT a.prazo FROM acoes a WHERE a.demanda_id = d.id AND a.chave = 1 LIMIT 1) AS prazo_chave
            FROM demandas d
            LEFT JOIN usuarios uc ON uc.id = d.criador_id"
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
                d.origem, d.momento_etapa, d.intencao, d.pilar, d.objetivo,
                d.gut_gravidade, d.gut_urgencia, d.gut_tendencia,
                ur.nome AS responsavel_nome, uc.nome AS criador_nome,
                d.setor_id, s.nome AS setor_nome, s.responsavel_id AS setor_responsavel_id,
                d.projeto_id, p.nome AS projeto_nome, d.prazo AS prazo_alvo,
                d.concluida_em, d.respondida_em, d.criado_em, d.atualizado_em
         FROM demandas d
         LEFT JOIN usuarios ur ON ur.id = d.responsavel_id
         LEFT JOIN usuarios uc ON uc.id = d.criador_id
         LEFT JOIN setores s ON s.id = d.setor_id
         LEFT JOIN projetos p ON p.id = d.projeto_id
         WHERE d.id = ? LIMIT 1",
        "i",
        [$id]
    );

    return empty($linhas) ? null : $linhas[0];
}

// Pode o usuario ver esta demanda? Admin/Gestor veem tudo; Colaborador so se envolvido.
// Reaproveitado por endpoints que dependem do escopo (ex.: anexos).
function usuario_pode_ver_demanda($demanda_id, $usuario_id, $perfil)
{
    if ($perfil !== "colaborador") {
        return true;
    }
    return colaborador_envolvido_na_demanda($demanda_id, $usuario_id);
}

// O usuario e o key user (responsavel principal) do setor desta demanda? (melhoria #5)
// Usado para permitir que o key user conclua/gerencie tarefas do seu setor.
function usuario_eh_keyuser_da_demanda($demanda_id, $usuario_id)
{
    $linhas = executar_select(
        "SELECT 1 FROM demandas d
         JOIN setores s ON s.id = d.setor_id
         WHERE d.id = ? AND s.responsavel_id = ? LIMIT 1",
        "ii",
        [$demanda_id, $usuario_id]
    );
    return !empty($linhas);
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
            OR EXISTS (SELECT 1 FROM acao_participantes ap
                       JOIN acoes a3 ON a3.id = ap.acao_id
                       WHERE a3.demanda_id = d.id AND ap.usuario_id = ?)
            OR EXISTS (SELECT 1 FROM setores ks WHERE ks.id = d.setor_id AND ks.responsavel_id = ?)
         ) LIMIT 1",
        "iiiii",
        [$demanda_id, $usuario_id, $usuario_id, $usuario_id, $usuario_id]
    );

    return !empty($linhas);
}

// Atualiza dados da demanda (titulo, questionario, responsavel, status de edicao).
// $campos = [problema, impacto_operacional, risco, afeta_outros, workaround, sugestao_solucao]
function atualizar_demanda($id, $titulo, $responsavel_id, $status, $campos, $projeto_id = null)
{
    $conn = conectar_banco();
    $sql = "UPDATE demandas SET titulo = ?, responsavel_id = ?, status = ?,
                problema = ?, impacto_operacional = ?, risco = ?,
                afeta_outros = ?, workaround = ?, sugestao_solucao = ?, projeto_id = ?
            WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    // projeto_id pode ser null (mysqli envia NULL quando a variavel e null).
    mysqli_stmt_bind_param(
        $stmt,
        "sisssssssii",
        $titulo,
        $responsavel_id,
        $status,
        $campos["problema"],
        $campos["impacto_operacional"],
        $campos["risco"],
        $campos["afeta_outros"],
        $campos["workaround"],
        $campos["sugestao_solucao"],
        $projeto_id,
        $id
    );

    return mysqli_stmt_execute($stmt);
}

// Define (ou limpa, com null) o responsavel (dono) da demanda - prestacao de contas.
function definir_responsavel_demanda($demanda_id, $responsavel_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET responsavel_id = ? WHERE id = ?");
    // responsavel_id pode ser null (mysqli envia NULL quando a variavel e null).
    mysqli_stmt_bind_param($stmt, "ii", $responsavel_id, $demanda_id);
    return mysqli_stmt_execute($stmt);
}

// Define (ou limpa, com null) o prazo alvo da demanda (controle de prazo no nivel da demanda).
function definir_prazo_demanda($demanda_id, $prazo)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET prazo = ? WHERE id = ?");
    // prazo pode ser null (mysqli envia NULL quando a variavel e null).
    mysqli_stmt_bind_param($stmt, "si", $prazo, $demanda_id);
    return mysqli_stmt_execute($stmt);
}

// Define (ou limpa, com null) o projeto ao qual a demanda pertence (melhoria #3).
function definir_projeto_demanda($demanda_id, $projeto_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET projeto_id = ? WHERE id = ?");
    // projeto_id pode ser null (mysqli envia NULL quando a variavel e null).
    mysqli_stmt_bind_param($stmt, "ii", $projeto_id, $demanda_id);
    return mysqli_stmt_execute($stmt);
}

// Coloca a demanda "em andamento" se ainda estiver "aberta" (progresso comecou).
// Disparado ao concluir uma acao nao-chave. Nao mexe em demanda concluida/arquivada.
function marcar_demanda_em_andamento($demanda_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET status = 'em_andamento' WHERE id = ? AND status = 'aberta'");
    mysqli_stmt_bind_param($stmt, "i", $demanda_id);
    mysqli_stmt_execute($stmt);

    return mysqli_stmt_affected_rows($stmt) > 0;
}

// Marca a demanda como respondida (lastro do SLA), apenas na primeira vez.
// "Responder" = criar a primeira acao (plano de acao) da demanda.
function marcar_demanda_respondida($demanda_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET respondida_em = NOW() WHERE id = ? AND respondida_em IS NULL");
    mysqli_stmt_bind_param($stmt, "i", $demanda_id);
    mysqli_stmt_execute($stmt);

    return mysqli_stmt_affected_rows($stmt) > 0;
}

// Reabre uma demanda concluida: volta a 'em_andamento' (desfaz a conclusao). So se estava concluida.
function reabrir_demanda($id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE demandas SET status = 'em_andamento', concluida_em = NULL WHERE id = ? AND status = 'concluida'");
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    return mysqli_stmt_affected_rows($stmt) > 0;
}

// Reabre a acao chave concluida da demanda (volta a 'pendente'), para retomar o fluxo.
function reabrir_acao_chave_da_demanda($demanda_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE acoes SET status = 'pendente', concluida_em = NULL WHERE demanda_id = ? AND chave = 1 AND status = 'concluida'");
    mysqli_stmt_bind_param($stmt, "i", $demanda_id);
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
