<?php

// agenda.php
// Recalculo de agenda por prioridade + capacidade + PRE-REQUISITOS (B1, motor v2).
// NAO roda automatico: e sob demanda (Gestor/Admin), com PREVIA antes de aplicar e
// DESFAZER do ultimo recalculo. Nao "quebra em silencio".
//
// Modelo: agenda as tarefas PENDENTES em ordem topologica (respeitando pre-requisitos),
// escolhendo entre as "prontas" a de MAIOR prioridade (GUT). Cada tarefa consome o seu
// esforco respeitando a capacidade da pessoa; o prazo = hoje + fim (em dias corridos).
// Uma tarefa nunca e agendada antes de terminar seus pre-requisitos.

// Calcula as mudancas propostas SEM gravar. Retorna a lista de alteracoes.
function calcular_agenda()
{
    $tasks = executar_select(
        "SELECT a.id, a.responsavel_id, a.prazo, a.esforco_dias, a.titulo,
                a.demanda_id, ur.nome AS responsavel_nome,
                COALESCE(u.capacidade_semana, 5) AS cap,
                COALESCE(d.gut_gravidade * d.gut_urgencia * d.gut_tendencia, 0) AS prioridade
         FROM acoes a
         JOIN demandas d ON d.id = a.demanda_id
         JOIN usuarios u ON u.id = a.responsavel_id
         LEFT JOIN usuarios ur ON ur.id = a.responsavel_id
         WHERE a.status = 'pendente' AND a.responsavel_id IS NOT NULL
           AND d.status NOT IN ('arquivada', 'cancelada')",
        "",
        []
    );

    $por_id = [];
    foreach ($tasks as $t) {
        $por_id[(int) $t["id"]] = $t;
    }
    if (empty($por_id)) {
        return [];
    }

    // Pre-requisitos que ainda estao pendentes (concluidos = ja satisfeitos).
    $pre = [];        // acao_id  => [prereq_ids no conjunto]
    $dependentes = []; // prereq_id => [acao_ids que dependem]
    $indeg = [];
    foreach ($por_id as $id => $t) {
        $indeg[$id] = 0;
    }
    $rels = executar_select(
        "SELECT ap.acao_id, ap.prerequisito_acao_id
         FROM acao_prerequisitos ap
         JOIN acoes p ON p.id = ap.prerequisito_acao_id
         WHERE p.status = 'pendente'",
        "",
        []
    );
    foreach ($rels as $r) {
        $a = (int) $r["acao_id"];
        $p = (int) $r["prerequisito_acao_id"];
        if (isset($por_id[$a]) && isset($por_id[$p])) {
            $pre[$a][] = $p;
            $dependentes[$p][] = $a;
            $indeg[$a]++;
        }
    }

    $hoje = date("Y-m-d");
    $disponivel = []; // responsavel_id => fim (offset em dias)
    $fim_de = [];     // acao_id => fim (offset)
    $mudancas = [];
    $processados = 0;

    $prontas = [];
    foreach ($por_id as $id => $t) {
        if ($indeg[$id] === 0) {
            $prontas[] = $id;
        }
    }

    while (!empty($prontas)) {
        // Escolhe a de maior prioridade entre as prontas (empate: prazo atual, depois id).
        usort($prontas, function ($x, $y) use ($por_id) {
            $px = (int) $por_id[$x]["prioridade"];
            $py = (int) $por_id[$y]["prioridade"];
            if ($px !== $py) {
                return $py - $px;
            }
            $rx = $por_id[$x]["prazo"];
            $ry = $por_id[$y]["prazo"];
            if ($rx === null && $ry !== null) return 1;
            if ($ry === null && $rx !== null) return -1;
            if ($rx !== $ry) return $rx < $ry ? -1 : 1;
            return $x - $y;
        });
        $id = array_shift($prontas);
        $t = $por_id[$id];
        $resp = (int) $t["responsavel_id"];
        $eff = max(1, (int) $t["esforco_dias"]);
        $cap = max(1, (int) $t["cap"]);
        $span = (int) ceil($eff / $cap * 7);

        $inicio = isset($disponivel[$resp]) ? $disponivel[$resp] : 0;
        if (isset($pre[$id])) {
            foreach ($pre[$id] as $p) {
                if (isset($fim_de[$p])) {
                    $inicio = max($inicio, $fim_de[$p]);
                }
            }
        }
        $fim = $inicio + $span;
        $fim_de[$id] = $fim;
        $disponivel[$resp] = $fim;

        $novo = date("Y-m-d", strtotime($hoje . " +" . $fim . " days"));
        if ($t["prazo"] !== $novo) {
            $mudancas[] = [
                "acao_id" => (int) $id,
                "titulo" => $t["titulo"],
                "responsavel_id" => $resp,
                "responsavel_nome" => $t["responsavel_nome"],
                "demanda_id" => (int) $t["demanda_id"],
                "prazo_atual" => $t["prazo"],
                "prazo_novo" => $novo
            ];
        }
        $processados++;

        if (isset($dependentes[$id])) {
            foreach ($dependentes[$id] as $d) {
                $indeg[$d]--;
                if ($indeg[$d] === 0) {
                    $prontas[] = $d;
                }
            }
        }
    }

    // Salvaguarda contra ciclo (nao deveria ocorrer): agenda o resto so por capacidade.
    if ($processados < count($por_id)) {
        foreach ($por_id as $id => $t) {
            if (isset($fim_de[$id])) {
                continue;
            }
            $resp = (int) $t["responsavel_id"];
            $eff = max(1, (int) $t["esforco_dias"]);
            $cap = max(1, (int) $t["cap"]);
            $span = (int) ceil($eff / $cap * 7);
            $inicio = isset($disponivel[$resp]) ? $disponivel[$resp] : 0;
            $fim = $inicio + $span;
            $fim_de[$id] = $fim;
            $disponivel[$resp] = $fim;
            $novo = date("Y-m-d", strtotime($hoje . " +" . $fim . " days"));
            if ($t["prazo"] !== $novo) {
                $mudancas[] = [
                    "acao_id" => (int) $id, "titulo" => $t["titulo"],
                    "responsavel_id" => $resp, "responsavel_nome" => $t["responsavel_nome"],
                    "demanda_id" => (int) $t["demanda_id"],
                    "prazo_atual" => $t["prazo"], "prazo_novo" => $novo
                ];
            }
        }
    }

    return $mudancas;
}

// Aplica o recalculo: guarda o prazo anterior (para desfazer) e grava os novos prazos.
// Retorna ["atualizadas" => N, "responsaveis" => [ids afetados]].
function aplicar_agenda()
{
    $mudancas = calcular_agenda();
    if (empty($mudancas)) {
        return ["atualizadas" => 0, "responsaveis" => []];
    }

    $conn = conectar_banco();
    mysqli_query($conn, "DELETE FROM agenda_prazo_backup");

    $ins = mysqli_prepare($conn, "INSERT INTO agenda_prazo_backup (acao_id, prazo_anterior) VALUES (?, ?)");
    $upd = mysqli_prepare($conn, "UPDATE acoes SET prazo = ? WHERE id = ?");

    $responsaveis = [];
    foreach ($mudancas as $m) {
        mysqli_stmt_bind_param($ins, "is", $m["acao_id"], $m["prazo_atual"]);
        mysqli_stmt_execute($ins);
        mysqli_stmt_bind_param($upd, "si", $m["prazo_novo"], $m["acao_id"]);
        mysqli_stmt_execute($upd);
        $responsaveis[$m["responsavel_id"]] = true;
    }

    return ["atualizadas" => count($mudancas), "responsaveis" => array_keys($responsaveis)];
}

// Desfaz o ultimo recalculo: restaura os prazos anteriores. Retorna quantas restaurou.
function desfazer_recalculo()
{
    $conn = conectar_banco();
    $linhas = executar_select("SELECT acao_id, prazo_anterior FROM agenda_prazo_backup", "", []);
    if (empty($linhas)) {
        return 0;
    }

    $upd = mysqli_prepare($conn, "UPDATE acoes SET prazo = ? WHERE id = ?");
    foreach ($linhas as $l) {
        $prev = $l["prazo_anterior"];
        $id = (int) $l["acao_id"];
        mysqli_stmt_bind_param($upd, "si", $prev, $id);
        mysqli_stmt_execute($upd);
    }
    mysqli_query($conn, "DELETE FROM agenda_prazo_backup");

    return count($linhas);
}

// Ha um recalculo que pode ser desfeito?
function tem_recalculo_desfazivel()
{
    $r = executar_select("SELECT COUNT(*) AS total FROM agenda_prazo_backup", "", []);
    return (int) $r[0]["total"] > 0;
}

// Define (ou limpa, com null) o esforco estimado (dias) de uma acao.
function definir_esforco_acao($id, $esforco)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE acoes SET esforco_dias = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ii", $esforco, $id);
    return mysqli_stmt_execute($stmt);
}

// Define (ou limpa, com null) a capacidade semanal (dias) de um usuario.
function definir_capacidade_usuario($usuario_id, $capacidade)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE usuarios SET capacidade_semana = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ii", $capacidade, $usuario_id);
    return mysqli_stmt_execute($stmt);
}
