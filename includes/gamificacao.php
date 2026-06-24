<?php

// gamificacao.php
// Gamificacao v1 (pessoal, sem ranking). Tudo DERIVADO dos dados reais das acoes
// (sem tabela nova). O backend calcula; o frontend so exibe. Origem rastreavel:
// uma acao so pontua para o seu responsavel quando esta concluida.
//
// Pontos por acao concluida do usuario (responsavel):
//   +10 no prazo | +3 em atraso | +10 extra se for a acao chave.

// Numeros do usuario (acoes concluidas das quais ele e responsavel).
// $apenas_mes = true limita ao mes corrente (placar mensal, que renova todo mes).
function gamificacao_numeros($usuario_id, $apenas_mes)
{
    $filtro_mes = $apenas_mes
        ? " AND YEAR(concluida_em) = YEAR(CURDATE()) AND MONTH(concluida_em) = MONTH(CURDATE())"
        : "";

    $linhas = executar_select(
        "SELECT
            COUNT(*) AS total_concluidas,
            SUM(CASE WHEN prazo IS NULL OR DATE(concluida_em) <= prazo THEN 1 ELSE 0 END) AS no_prazo,
            SUM(CASE WHEN prazo IS NOT NULL AND DATE(concluida_em) > prazo THEN 1 ELSE 0 END) AS atrasadas,
            SUM(CASE WHEN chave = 1 THEN 1 ELSE 0 END) AS chave_concluidas
         FROM acoes
         WHERE responsavel_id = ? AND status = 'concluida'" . $filtro_mes,
        "i",
        [$usuario_id]
    );

    $n = $linhas[0];
    return [
        "total_concluidas" => (int) $n["total_concluidas"],
        "no_prazo" => (int) $n["no_prazo"],
        "atrasadas" => (int) $n["atrasadas"],
        "chave_concluidas" => (int) $n["chave_concluidas"]
    ];
}

// Pontuacao total a partir dos numeros (regra clara e rastreavel).
function gamificacao_pontos($numeros)
{
    return $numeros["no_prazo"] * 10
        + $numeros["atrasadas"] * 3
        + $numeros["chave_concluidas"] * 10;
}

// Nivel por faixa de pontos. Sem ranking; apenas leitura pessoal de progresso.
function nivel_por_pontos($pontos)
{
    // Faixas calibradas para o placar MENSAL (pontos renovam todo mes).
    $faixas = [
        ["nome" => "Bronze", "min" => 0],
        ["nome" => "Prata", "min" => 50],
        ["nome" => "Ouro", "min" => 150],
        ["nome" => "Platina", "min" => 300]
    ];

    $atual = $faixas[0];
    $proximo = null;
    for ($i = 0; $i < count($faixas); $i++) {
        if ($pontos >= $faixas[$i]["min"]) {
            $atual = $faixas[$i];
            $proximo = isset($faixas[$i + 1]) ? $faixas[$i + 1] : null;
        }
    }

    if ($proximo === null) {
        return [
            "nome" => $atual["nome"],
            "proximo_nome" => null,
            "faltam" => 0,
            "progresso_pct" => 100
        ];
    }

    $faixa = $proximo["min"] - $atual["min"];
    $dentro = $pontos - $atual["min"];
    $pct = $faixa > 0 ? (int) round(($dentro / $faixa) * 100) : 0;

    return [
        "nome" => $atual["nome"],
        "proximo_nome" => $proximo["nome"],
        "faltam" => $proximo["min"] - $pontos,
        "progresso_pct" => $pct
    ];
}

function conquista($chave, $titulo, $descricao, $desbloqueada, $progresso)
{
    return [
        "chave" => $chave,
        "titulo" => $titulo,
        "descricao" => $descricao,
        "desbloqueada" => $desbloqueada ? 1 : 0,
        "progresso" => $progresso
    ];
}

// Conquistas do MES (renovam todo mes, junto com o placar). Derivadas dos numeros do mes.
function gamificacao_conquistas($numeros)
{
    $t = $numeros["total_concluidas"];
    $np = $numeros["no_prazo"];
    $ch = $numeros["chave_concluidas"];
    $at = $numeros["atrasadas"];

    return [
        conquista("primeira", "Primeira do mês", "Conclua uma ação neste mês.", $t >= 1, min($t, 1) . "/1"),
        conquista("dez_prazo", "Dez no prazo", "Conclua 10 ações no prazo neste mês.", $np >= 10, min($np, 10) . "/10"),
        conquista("entrega_chave", "Entrega chave", "Conclua uma ação chave neste mês.", $ch >= 1, min($ch, 1) . "/1"),
        conquista("maratona", "Maratonista", "Conclua 20 ações neste mês.", $t >= 20, min($t, 20) . "/20"),
        conquista("sem_atrasos", "Sem atrasos", "5+ conclusões e nenhuma atrasada neste mês.", ($t >= 5 && $at === 0), (($at === 0 ? min($t, 5) : 0)) . "/5")
    ];
}

// Resumo completo de gamificacao do usuario.
// TUDO MENSAL (renova todo mes -> justo para novatos e veteranos): pontos, nivel,
// numeros e conquistas contam apenas o mes corrente. O total acumulado fica so como
// referencia (nao influencia nivel nem conquistas).
function resumo_gamificacao($usuario_id)
{
    $mes = gamificacao_numeros($usuario_id, true);
    $total = gamificacao_numeros($usuario_id, false);

    $pontos = gamificacao_pontos($mes);
    $mes["pct_no_prazo"] = $mes["total_concluidas"] > 0
        ? (int) round(($mes["no_prazo"] / $mes["total_concluidas"]) * 100)
        : 0;

    $meses = [
        1 => "Janeiro", 2 => "Fevereiro", 3 => "Março", 4 => "Abril",
        5 => "Maio", 6 => "Junho", 7 => "Julho", 8 => "Agosto",
        9 => "Setembro", 10 => "Outubro", 11 => "Novembro", 12 => "Dezembro"
    ];

    return [
        "periodo" => $meses[(int) date("n")] . " de " . date("Y"),
        "pontos" => $pontos,
        "nivel" => nivel_por_pontos($pontos),
        "numeros" => $mes,
        "pontos_total" => gamificacao_pontos($total),
        "total_concluidas_geral" => $total["total_concluidas"],
        "conquistas" => gamificacao_conquistas($mes)
    ];
}
