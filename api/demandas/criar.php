<?php

// api/demandas/criar.php
// Cria uma demanda. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$titulo = trim($body["titulo"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;

// Questionario obrigatorio da demanda (6 perguntas).
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

// Matriz GUT (1 a 5). Prioridade = G * U * T.
$gut = [
    "gut_gravidade" => isset($body["gut_gravidade"]) ? (int) $body["gut_gravidade"] : 0,
    "gut_urgencia" => isset($body["gut_urgencia"]) ? (int) $body["gut_urgencia"] : 0,
    "gut_tendencia" => isset($body["gut_tendencia"]) ? (int) $body["gut_tendencia"] : 0
];

// Triagem (ajuda a classificar e montar o plano de acao).
$triagem = [
    "origem" => trim($body["origem"] ?? ""),
    "momento_etapa" => trim($body["momento_etapa"] ?? ""),
    "intencao" => trim($body["intencao"] ?? ""),
    "pilar" => trim($body["pilar"] ?? ""),
    "objetivo" => trim($body["objetivo"] ?? "")
];

$intencoes = ["melhoria", "defeito", "nova_solucao"];
$pilares = ["processo", "financeiro", "pessoas", "cliente"];
$objetivos = ["reducao_custo", "relevancia_marca", "organizacao_trabalho"];

$erros = [];
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
foreach ($mensagens_campos as $campo => $mensagem) {
    if (!validar_tamanho($campos[$campo], 2, 2000)) {
        $erros[$campo] = $mensagem;
    }
}
foreach (["gut_gravidade", "gut_urgencia", "gut_tendencia"] as $campo_gut) {
    if ($gut[$campo_gut] < 1 || $gut[$campo_gut] > 5) {
        $erros[$campo_gut] = "Selecione um valor de 1 a 5.";
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
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$campos = array_merge($campos, $triagem, $gut);

$id = criar_demanda($titulo, $responsavel_id, obter_usuario_logado_id(), $campos);
if (!$id) {
    json_erro("Nao foi possivel criar a demanda.", 500);
}

registrar_log("demanda_criada", "demanda_id=" . $id);

// Notifica o responsavel atribuido (se nao for o proprio criador).
if ($responsavel_id !== null) {
    notificar_varios(
        [$responsavel_id],
        obter_usuario_logado_id(),
        "atribuicao",
        "Você foi atribuído a uma demanda",
        $titulo,
        "demanda.html?id=" . $id
    );
}

json_sucesso(["id" => $id], "Demanda criada.");
