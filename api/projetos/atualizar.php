<?php

// api/projetos/atualizar.php
// Edita um projeto (nome, descricao, status de edicao, responsavel, setor). Gestor e Admin.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/setores.php";
require_once __DIR__ . "/../../includes/projetos.php";

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
$nome = trim($body["nome"] ?? "");
$descricao = trim($body["descricao"] ?? "");
$status = trim($body["status"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;
$setor_id = isset($body["setor_id"]) && $body["setor_id"] !== "" ? (int) $body["setor_id"] : null;

if ($id <= 0) {
    json_erro("Projeto nao informado.", 400);
}

$erros = [];
if (!validar_tamanho($nome, 2, 160)) {
    $erros["nome"] = "Informe um nome (2 a 160 caracteres).";
}
if ($descricao !== "" && !validar_tamanho($descricao, 0, 5000)) {
    $erros["descricao"] = "Descricao muito longa.";
}
if (!valor_em_lista($status, status_projeto_edicao())) {
    $erros["status"] = "Status invalido.";
}
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if ($setor_id !== null && !buscar_setor($setor_id)) {
    $erros["setor_id"] = "Setor invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$projeto = buscar_projeto($id);
if (!$projeto) {
    json_erro("Projeto nao encontrado.", 404);
}

if (!atualizar_projeto($id, $nome, $descricao, $status, $responsavel_id, $setor_id)) {
    json_erro("Nao foi possivel salvar o projeto.", 500);
}

registrar_log("projeto_atualizado", "projeto_id=" . $id);

json_sucesso(null, "Projeto salvo.");
