<?php

// api/acoes/criar.php
// Cria uma acao em uma demanda. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/acoes.php";
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

$demanda_id = isset($body["demanda_id"]) ? (int) $body["demanda_id"] : 0;
$titulo = trim($body["titulo"] ?? "");
$tipo = trim($body["tipo"] ?? "");
$descricao = trim($body["descricao"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;
$prazo = trim($body["prazo"] ?? "");
$esforco = isset($body["esforco_dias"]) && $body["esforco_dias"] !== "" ? (int) $body["esforco_dias"] : null;
$prerequisitos = isset($body["prerequisitos"]) && is_array($body["prerequisitos"]) ? $body["prerequisitos"] : [];
$participantes = isset($body["participantes"]) && is_array($body["participantes"]) ? $body["participantes"] : [];

$erros = [];
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
if (!valor_em_lista($tipo, acoes_tipos_validos())) {
    $erros["tipo"] = "Selecione o tipo da tarefa.";
}
if ($responsavel_id === null) {
    $erros["responsavel_id"] = "Selecione o responsavel pela acao.";
} elseif (!usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if ($prazo === "") {
    $erros["prazo"] = "Informe o prazo da acao.";
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $prazo)) {
    $erros["prazo"] = "Data invalida.";
}
if ($esforco !== null && ($esforco < 1 || $esforco > 365)) {
    $erros["esforco_dias"] = "Esforco de 1 a 365 dias.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$demanda = buscar_demanda($demanda_id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

// Toda demanda deve ter exatamente uma acao chave: a primeira acao nasce chave.
// As demais nascem normais (a chave pode ser trocada depois, com 1 clique).
$chave = demanda_tem_chave($demanda_id) ? 0 : 1;

$id = criar_acao(
    $demanda_id,
    $titulo,
    $tipo,
    $descricao !== "" ? $descricao : null,
    $responsavel_id,
    $prazo !== "" ? $prazo : null,
    $chave,
    $esforco
);

if (!$id) {
    json_erro("Nao foi possivel criar a acao.", 500);
}

if (!empty($prerequisitos)) {
    definir_prerequisitos($id, $demanda_id, $prerequisitos);
}

// Participantes (pessoas envolvidas) - usado pelo tipo "reuniao".
if (!empty($participantes)) {
    definir_participantes_acao($id, $participantes);
}

registrar_log("acao_criada", "acao_id=" . $id . " demanda_id=" . $demanda_id);

// SLA: a primeira acao criada "responde" a demanda (lastro do prazo de resposta).
if (marcar_demanda_respondida($demanda_id)) {
    registrar_log("demanda_respondida", "demanda_id=" . $demanda_id);
}

// Notifica o responsavel atribuido a acao (se nao for o proprio criador).
if ($responsavel_id !== null) {
    notificar_varios(
        [$responsavel_id],
        obter_usuario_logado_id(),
        "atribuicao",
        "Você foi atribuído a uma ação",
        $titulo,
        "demanda.html?id=" . $demanda_id
    );
}

// Notifica os participantes (reuniao) envolvidos, exceto o responsavel ja avisado.
$alvos_participantes = [];
foreach ($participantes as $pid) {
    $pid = (int) $pid;
    if ($pid > 0 && $pid !== (int) $responsavel_id) {
        $alvos_participantes[] = $pid;
    }
}
if (!empty($alvos_participantes)) {
    notificar_varios(
        $alvos_participantes,
        obter_usuario_logado_id(),
        "atribuicao",
        "Você foi incluído em uma reunião",
        $titulo,
        "demanda.html?id=" . $demanda_id
    );
}

json_sucesso(["id" => $id], "Acao criada.");
