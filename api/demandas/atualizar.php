<?php

// api/demandas/atualizar.php
// Edita o CONTEUDO de uma demanda (titulo, status de edicao, questionario, triagem, GUT).
// Gestor e Admin. Responsavel/projeto/prazo tem endpoints proprios (definir-*).
// O status "concluida" nunca e definido aqui (vem da acao chave).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
$titulo = trim($body["titulo"] ?? "");
$status = trim($body["status"] ?? "");

$campos = [
    "problema" => trim($body["problema"] ?? ""),
    "impacto_operacional" => trim($body["impacto_operacional"] ?? ""),
    "risco" => trim($body["risco"] ?? ""),
    "afeta_outros" => trim($body["afeta_outros"] ?? ""),
    "workaround" => trim($body["workaround"] ?? ""),
    "sugestao_solucao" => trim($body["sugestao_solucao"] ?? "")
];

$mensagens_campos = [
    "problema" => "Informe qual problema sera resolvido.",
    "impacto_operacional" => "Informe o impacto operacional.",
    "risco" => "Informe se existe algum risco (e qual).",
    "afeta_outros" => "Informe se afeta outro sistema ou area (e qual).",
    "workaround" => "Informe se existe workaround (e qual).",
    "sugestao_solucao" => "Informe a sugestao de solucao."
];

$triagem = [
    "origem" => trim($body["origem"] ?? ""),
    "momento_etapa" => trim($body["momento_etapa"] ?? ""),
    "intencao" => trim($body["intencao"] ?? ""),
    "pilar" => trim($body["pilar"] ?? ""),
    "objetivo" => trim($body["objetivo"] ?? "")
];

$gut = [
    "gut_gravidade" => isset($body["gut_gravidade"]) ? (int) $body["gut_gravidade"] : 0,
    "gut_urgencia" => isset($body["gut_urgencia"]) ? (int) $body["gut_urgencia"] : 0,
    "gut_tendencia" => isset($body["gut_tendencia"]) ? (int) $body["gut_tendencia"] : 0
];

$intencoes = ["melhoria", "defeito", "nova_solucao"];
$pilares = ["processo", "financeiro", "pessoas", "cliente"];
$objetivos = ["reducao_custo", "relevancia_marca", "organizacao_trabalho"];

$erros = [];
if ($id <= 0) {
    json_erro("Demanda nao informada.", 400);
}
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
if (!valor_em_lista($status, status_demanda_edicao())) {
    $erros["status"] = "Status invalido.";
}
foreach ($mensagens_campos as $campo => $mensagem) {
    if (!validar_tamanho($campos[$campo], 2, 2000)) {
        $erros[$campo] = $mensagem;
    }
}
foreach (["gut_gravidade", "gut_urgencia", "gut_tendencia"] as $g) {
    if ($gut[$g] < 1 || $gut[$g] > 5) {
        $erros[$g] = "Selecione um valor de 1 a 5.";
    }
}
if (!validar_tamanho($triagem["origem"], 2, 200)) {
    $erros["origem"] = "Informe onde (sistema, processo ou area).";
}
if (!validar_tamanho($triagem["momento_etapa"], 2, 200)) {
    $erros["momento_etapa"] = "Informe o momento ou etapa.";
}
if (!valor_em_lista($triagem["intencao"], $intencoes)) {
    $erros["intencao"] = "Selecione a intencao.";
}
if (!valor_em_lista($triagem["pilar"], $pilares)) {
    $erros["pilar"] = "Selecione o pilar impactado.";
}
if (!valor_em_lista($triagem["objetivo"], $objetivos)) {
    $erros["objetivo"] = "Selecione o objetivo principal.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

$campos = array_merge($campos, $triagem, $gut);

if (!atualizar_demanda($id, $titulo, $status, $campos)) {
    json_erro("Nao foi possivel salvar a demanda.", 500);
}

registrar_log("demanda_atualizada", "demanda_id=" . $id);

json_sucesso(null, "Demanda salva.");
