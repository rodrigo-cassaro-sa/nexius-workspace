<?php

// api/demandas/criar.php
// Cria uma demanda. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
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

$titulo = trim($body["titulo"] ?? "");
$descricao = trim($body["descricao"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;

$erros = [];
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$id = criar_demanda($titulo, $descricao !== "" ? $descricao : null, $responsavel_id, obter_usuario_logado_id());
if (!$id) {
    json_erro("Nao foi possivel criar a demanda.", 500);
}

registrar_log("demanda_criada", "demanda_id=" . $id);

json_sucesso(["id" => $id], "Demanda criada.");
