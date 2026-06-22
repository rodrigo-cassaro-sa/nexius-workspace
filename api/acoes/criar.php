<?php

// api/acoes/criar.php
// Cria uma acao em uma demanda. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/acoes.php";

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
$descricao = trim($body["descricao"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;
$prazo = trim($body["prazo"] ?? "");
$chave = !empty($body["chave"]) ? 1 : 0;
$prerequisitos = isset($body["prerequisitos"]) && is_array($body["prerequisitos"]) ? $body["prerequisitos"] : [];

$erros = [];
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
if ($prazo !== "" && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $prazo)) {
    $erros["prazo"] = "Data invalida.";
}
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$demanda = buscar_demanda($demanda_id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

$id = criar_acao(
    $demanda_id,
    $titulo,
    $descricao !== "" ? $descricao : null,
    $responsavel_id,
    $prazo !== "" ? $prazo : null,
    $chave
);

if (!$id) {
    json_erro("Nao foi possivel criar a acao.", 500);
}

if (!empty($prerequisitos)) {
    definir_prerequisitos($id, $demanda_id, $prerequisitos);
}

registrar_log("acao_criada", "acao_id=" . $id . " demanda_id=" . $demanda_id);

json_sucesso(["id" => $id], "Acao criada.");
