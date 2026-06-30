<?php

// api/demandas/atualizar.php
// Edita uma demanda (titulo, descricao, responsavel, status de edicao). Gestor e Admin.
// O status "concluida" nunca e definido aqui (vem da acao chave).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/projetos.php";
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

$id = isset($body["id"]) ? (int) $body["id"] : 0;
$titulo = trim($body["titulo"] ?? "");
$status = trim($body["status"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;
$projeto_id = isset($body["projeto_id"]) && $body["projeto_id"] !== "" ? (int) $body["projeto_id"] : null;

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
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if ($projeto_id !== null && !buscar_projeto($projeto_id)) {
    $erros["projeto_id"] = "Projeto invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

if (!atualizar_demanda($id, $titulo, $responsavel_id, $status, $campos, $projeto_id)) {
    json_erro("Nao foi possivel salvar a demanda.", 500);
}

registrar_log("demanda_atualizada", "demanda_id=" . $id);

$ator = obter_usuario_logado_id();

// Atribuicao: responsavel mudou.
if ($responsavel_id !== null && (int) $demanda["responsavel_id"] !== $responsavel_id) {
    notificar_varios([$responsavel_id], $ator, "atribuicao", "Você foi atribuído a uma demanda", $titulo, "demanda.html?id=" . $id);
}

// Mudanca de status: avisa o responsavel atual (se houver e nao for o ator).
if ($demanda["status"] !== $status && $responsavel_id !== null) {
    notificar_varios([$responsavel_id], $ator, "status", "Status da demanda alterado", $titulo, "demanda.html?id=" . $id);
}

json_sucesso(null, "Demanda salva.");
