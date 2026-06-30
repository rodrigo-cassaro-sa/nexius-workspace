<?php

// api/projetos/detalhe.php
// Retorna o detalhe de um projeto, respeitando o escopo de visibilidade.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/projetos.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;
if ($id <= 0) {
    json_erro("Projeto nao informado.", 400);
}

$projeto = buscar_projeto($id);
if (!$projeto) {
    json_erro("Projeto nao encontrado.", 404);
}

if (!usuario_pode_ver_projeto($id, obter_usuario_logado_id(), obter_usuario_logado_perfil())) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

json_sucesso(["projeto" => $projeto]);
