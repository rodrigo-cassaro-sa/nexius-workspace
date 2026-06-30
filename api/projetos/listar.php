<?php

// api/projetos/listar.php
// Lista projetos com escopo de visibilidade (por envolvimento, D22) e filtros.
// Qualquer usuario logado; o conteudo respeita o escopo.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/projetos.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$filtros = [
    "status" => trim($_GET["status"] ?? ""),
    "setor" => isset($_GET["setor"]) ? (int) $_GET["setor"] : 0,
    "busca" => trim($_GET["busca"] ?? "")
];

$projetos = listar_projetos(obter_usuario_logado_id(), obter_usuario_logado_perfil(), $filtros);

json_sucesso(["projetos" => $projetos]);
