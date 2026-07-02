<?php

// agenda.php
// Recalculo de agenda por prioridade + capacidade (B1). NAO roda automatico a cada edicao:
// e uma acao sob demanda (Gestor/Admin), que REESCREVE os prazos das tarefas pendentes.
//
// Modelo: para cada responsavel, ordena as tarefas PENDENTES por prioridade (GUT) e enfileira
// consumindo o esforco (dias) de cada uma, respeitando a capacidade da pessoa (dias/semana).
// O prazo de cada tarefa = hoje + ceil(esforco_acumulado / capacidade * 7) dias corridos.
// Assim as de maior prioridade terminam antes e as de menor sao "empurradas" para depois.

function recalcular_agenda()
{
    $conn = conectar_banco();

    $linhas = executar_select(
        "SELECT a.id, a.responsavel_id, a.prazo, a.esforco_dias,
                COALESCE(u.capacidade_semana, 5) AS cap,
                COALESCE(d.gut_gravidade * d.gut_urgencia * d.gut_tendencia, 0) AS prioridade
         FROM acoes a
         JOIN demandas d ON d.id = a.demanda_id
         JOIN usuarios u ON u.id = a.responsavel_id
         WHERE a.status = 'pendente' AND a.responsavel_id IS NOT NULL
           AND d.status NOT IN ('arquivada', 'cancelada')
         ORDER BY a.responsavel_id ASC, prioridade DESC, (a.prazo IS NULL), a.prazo ASC, a.id ASC",
        "",
        []
    );

    $hoje = date("Y-m-d");
    $resp_atual = null;
    $esforco_acumulado = 0;
    $atualizadas = 0;

    $stmt = mysqli_prepare($conn, "UPDATE acoes SET prazo = ? WHERE id = ?");

    foreach ($linhas as $l) {
        if ($l["responsavel_id"] !== $resp_atual) {
            $resp_atual = $l["responsavel_id"];
            $esforco_acumulado = 0;
        }

        $esforco = (int) $l["esforco_dias"];
        if ($esforco < 1) {
            $esforco = 1; // sem esforco definido: conta como 1 dia
        }
        $cap = (int) $l["cap"];
        if ($cap < 1) {
            $cap = 5;
        }

        $esforco_acumulado += $esforco;
        $dias_corridos = (int) ceil($esforco_acumulado / $cap * 7);
        $novo_prazo = date("Y-m-d", strtotime($hoje . " +" . $dias_corridos . " days"));

        if ($l["prazo"] !== $novo_prazo) {
            $id = (int) $l["id"];
            mysqli_stmt_bind_param($stmt, "si", $novo_prazo, $id);
            mysqli_stmt_execute($stmt);
            $atualizadas++;
        }
    }

    return $atualizadas;
}

// Define (ou limpa, com null) o esforco estimado (dias) de uma acao.
function definir_esforco_acao($id, $esforco)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE acoes SET esforco_dias = ? WHERE id = ?");
    // esforco pode ser null (mysqli envia NULL quando a variavel e null).
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
