<?php

// gamificacao.php
// Gamificacao v1 (pessoal, sem ranking). Tudo DERIVADO dos dados reais das acoes
// (sem tabela nova). O backend calcula; o frontend so exibe. Origem rastreavel:
// uma acao so pontua para o seu responsavel quando esta concluida.
//
// Pontos por acao concluida do usuario (responsavel):
//   +10 no prazo | +3 em atraso | +10 extra se for a acao chave.

// Numeros do usuario, agregados das acoes concluidas das quais ele e responsavel.
function gamificacao_numeros($usuario_id)
{
    $linhas = executar_select(
        "SELECT
            COUNT(*) AS total_concluidas,
            SUM(CASE WHEN prazo IS NULL OR DATE(concluida_em) <= prazo THEN 1 ELSE 0 END) AS no_prazo,
            SUM(CASE WHEN prazo IS NOT NULL AND DATE(concluida_em) > prazo THEN 1 ELSE 0 END) AS atrasadas,
            SUM(CASE WHEN chave = 1 THEN 1 ELSE 0 END) AS chave_concluidas
         FROM acoes
         WHERE responsavel_id = ? AND status = 'concluida'",
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
    $faixas = [
        ["nome" => "Bronze", "min" => 0],
        ["nome" => "Prata", "min" => 100],
        ["nome" => "Ouro", "min" => 300],
        ["nome" => "Platina", "min" => 700]
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

// Conquistas (poucas e verificaveis), derivadas dos numeros.
function gamificacao_conquistas($numeros)
{
    $t = $numeros["total_concluidas"];
    $np = $numeros["no_prazo"];
    $ch = $numeros["chave_concluidas"];
    $at = $numeros["atrasadas"];

    return [
        conquista("primeira", "Primeira conclusão", "Conclua sua primeira ação.", $t >= 1, min($t, 1) . "/1"),
        conquista("dez_prazo", "Dez no prazo", "Conclua 10 ações dentro do prazo.", $np >= 10, min($np, 10) . "/10"),
        conquista("entrega_chave", "Entrega chave", "Conclua uma ação chave.", $ch >= 1, min($ch, 1) . "/1"),
        conquista("maratona", "Maratonista", "Conclua 50 ações.", $t >= 50, min($t, 50) . "/50"),
        conquista("sem_atrasos", "Sem atrasos", "5+ conclusões e nenhuma atrasada.", ($t >= 5 && $at === 0), (($at === 0 ? min($t, 5) : 0)) . "/5")
    ];
}

// Resumo completo de gamificacao do usuario.
function resumo_gamificacao($usuario_id)
{
    $numeros = gamificacao_numeros($usuario_id);
    $pontos = gamificacao_pontos($numeros);

    $numeros["pct_no_prazo"] = $numeros["total_concluidas"] > 0
        ? (int) round(($numeros["no_prazo"] / $numeros["total_concluidas"]) * 100)
        : 0;

    return [
        "pontos" => $pontos,
        "nivel" => nivel_por_pontos($pontos),
        "numeros" => $numeros,
        "conquistas" => gamificacao_conquistas($numeros)
    ];
}
