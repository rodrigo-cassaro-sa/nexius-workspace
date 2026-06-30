<?php

// projetos.php
// Acesso a dados e escopo dos projetos (melhoria #3). Projeto agrupa varias demandas.
// Status espelha a demanda; responsavel e setor sao opcionais.
// Procedural, mysqli, prepared statements.

// Status manuais permitidos na edicao (concluido e manual: projeto nao tem acao chave).
function status_projeto_edicao()
{
    return ["aberto", "em_andamento", "concluido"];
}

// Status de arquivamento/cancelamento.
function status_projeto_arquivamento()
{
    return ["arquivado", "cancelado"];
}

// Escopo de visibilidade do colaborador sobre projetos (D22, "por envolvimento"):
// ve o projeto se for o responsavel dele, key user do setor do projeto, ou se houver
// pelo menos uma demanda do projeto em que esteja envolvido (mesma regra das demandas).
// Retorna [where, tipos, params] (where comeca com " WHERE ...").
function montar_where_projetos($usuario_id, $perfil, $filtros)
{
    $where = " WHERE 1 = 1";
    $tipos = "";
    $params = [];

    if ($perfil === "colaborador") {
        $where .= " AND (
            p.responsavel_id = ?
            OR EXISTS (SELECT 1 FROM setores ks WHERE ks.id = p.setor_id AND ks.responsavel_id = ?)
            OR EXISTS (
                SELECT 1 FROM demandas d WHERE d.projeto_id = p.id AND (
                    EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.responsavel_id = ?)
                    OR EXISTS (SELECT 1 FROM comentarios c
                               JOIN acoes a2 ON a2.id = c.acao_id
                               WHERE a2.demanda_id = d.id AND c.autor_id = ?)
                    OR EXISTS (SELECT 1 FROM acao_participantes ap
                               JOIN acoes a3 ON a3.id = ap.acao_id
                               WHERE a3.demanda_id = d.id AND ap.usuario_id = ?)
                    OR EXISTS (SELECT 1 FROM setores ks2 WHERE ks2.id = d.setor_id AND ks2.responsavel_id = ?)
                )
            )
        )";
        $tipos .= "iiiiii";
        for ($i = 0; $i < 6; $i++) {
            $params[] = $usuario_id;
        }
    }

    // Status. Sem filtro, esconde arquivado/cancelado.
    if (($filtros["status"] ?? "") !== "") {
        $where .= " AND p.status = ?";
        $tipos .= "s";
        $params[] = $filtros["status"];
    } else {
        $where .= " AND p.status NOT IN ('arquivado', 'cancelado')";
    }

    // Setor do projeto.
    if (($filtros["setor"] ?? 0) > 0) {
        $where .= " AND p.setor_id = ?";
        $tipos .= "i";
        $params[] = (int) $filtros["setor"];
    }

    // Busca por nome.
    if (($filtros["busca"] ?? "") !== "") {
        $where .= " AND p.nome LIKE ?";
        $tipos .= "s";
        $params[] = "%" . $filtros["busca"] . "%";
    }

    return [$where, $tipos, $params];
}

// Lista projetos (com escopo, filtros e contagem de demandas).
function listar_projetos($usuario_id, $perfil, $filtros)
{
    list($where, $tipos, $params) = montar_where_projetos($usuario_id, $perfil, $filtros);

    $sql = "SELECT p.id, p.nome, p.status, p.responsavel_id, p.setor_id, p.criado_em,
                   ur.nome AS responsavel_nome, s.nome AS setor_nome,
                   (SELECT COUNT(*) FROM demandas d WHERE d.projeto_id = p.id AND d.status <> 'cancelada') AS total_demandas,
                   (SELECT COUNT(*) FROM demandas d WHERE d.projeto_id = p.id AND d.status = 'concluida') AS demandas_concluidas
            FROM projetos p
            LEFT JOIN usuarios ur ON ur.id = p.responsavel_id
            LEFT JOIN setores s ON s.id = p.setor_id"
            . $where . " ORDER BY p.criado_em DESC";

    return executar_select($sql, $tipos, $params);
}

// Busca um projeto pelo id (com nomes de responsavel, setor e criador, e contagem de demandas).
function buscar_projeto($id)
{
    $linhas = executar_select(
        "SELECT p.id, p.nome, p.descricao, p.status, p.responsavel_id, p.setor_id, p.criador_id,
                ur.nome AS responsavel_nome, s.nome AS setor_nome, uc.nome AS criador_nome,
                p.criado_em, p.atualizado_em,
                (SELECT COUNT(*) FROM demandas d WHERE d.projeto_id = p.id AND d.status <> 'cancelada') AS total_demandas,
                (SELECT COUNT(*) FROM demandas d WHERE d.projeto_id = p.id AND d.status = 'concluida') AS demandas_concluidas
         FROM projetos p
         LEFT JOIN usuarios ur ON ur.id = p.responsavel_id
         LEFT JOIN setores s ON s.id = p.setor_id
         LEFT JOIN usuarios uc ON uc.id = p.criador_id
         WHERE p.id = ? LIMIT 1",
        "i",
        [$id]
    );

    return empty($linhas) ? null : $linhas[0];
}

// Pode o usuario ver este projeto? Admin/Gestor veem tudo; Colaborador so por envolvimento
// (independente do status do projeto, por isso usa o WHERE de pertencimento, sem filtro de status).
function usuario_pode_ver_projeto($projeto_id, $usuario_id, $perfil)
{
    if ($perfil !== "colaborador") {
        return true;
    }

    $linhas = executar_select(
        "SELECT 1 FROM projetos p" . montar_where_pertencimento_projeto($usuario_id) . " AND p.id = ? LIMIT 1",
        "iiiiiii",
        [$usuario_id, $usuario_id, $usuario_id, $usuario_id, $usuario_id, $usuario_id, $projeto_id]
    );

    return !empty($linhas);
}

// WHERE de pertencimento (sem filtro de status), usado na checagem de acesso a um projeto.
function montar_where_pertencimento_projeto($usuario_id)
{
    return " WHERE (
        p.responsavel_id = ?
        OR EXISTS (SELECT 1 FROM setores ks WHERE ks.id = p.setor_id AND ks.responsavel_id = ?)
        OR EXISTS (
            SELECT 1 FROM demandas d WHERE d.projeto_id = p.id AND (
                EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.responsavel_id = ?)
                OR EXISTS (SELECT 1 FROM comentarios c
                           JOIN acoes a2 ON a2.id = c.acao_id
                           WHERE a2.demanda_id = d.id AND c.autor_id = ?)
                OR EXISTS (SELECT 1 FROM acao_participantes ap
                           JOIN acoes a3 ON a3.id = ap.acao_id
                           WHERE a3.demanda_id = d.id AND ap.usuario_id = ?)
                OR EXISTS (SELECT 1 FROM setores ks2 WHERE ks2.id = d.setor_id AND ks2.responsavel_id = ?)
            )
        )
    )";
}

// Cria um projeto. Retorna o id ou false.
function criar_projeto($nome, $descricao, $status, $responsavel_id, $setor_id, $criador_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO projetos (nome, descricao, status, responsavel_id, setor_id, criador_id)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    // responsavel_id e setor_id podem ser null (mysqli envia NULL quando a variavel e null).
    mysqli_stmt_bind_param($stmt, "sssiii", $nome, $descricao, $status, $responsavel_id, $setor_id, $criador_id);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

// Atualiza os dados do projeto (status de edicao apenas; arquivamento e por funcao propria).
function atualizar_projeto($id, $nome, $descricao, $status, $responsavel_id, $setor_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare(
        $conn,
        "UPDATE projetos SET nome = ?, descricao = ?, status = ?, responsavel_id = ?, setor_id = ?
         WHERE id = ?"
    );
    mysqli_stmt_bind_param($stmt, "sssiii", $nome, $descricao, $status, $responsavel_id, $setor_id, $id);

    return mysqli_stmt_execute($stmt);
}

// Arquiva ou cancela o projeto.
function arquivar_projeto($id, $status)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE projetos SET status = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $status, $id);

    return mysqli_stmt_execute($stmt);
}
