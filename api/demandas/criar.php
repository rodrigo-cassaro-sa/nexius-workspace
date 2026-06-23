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

$erros = [];
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
foreach ($mensagens_campos as $campo => $mensagem) {
    if (!validar_tamanho($campos[$campo], 2, 2000)) {
        $erros[$campo] = $mensagem;
    }
}
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

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
