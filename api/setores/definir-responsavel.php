<?php

// api/setores/definir-responsavel.php
// Define o responsavel principal de um setor. Apenas Administrador.
// responsavel_id vazio/0 limpa o responsavel (setor sem responsavel principal).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/setores.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$setor_id = isset($body["setor_id"]) ? (int) $body["setor_id"] : 0;
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;

if ($setor_id <= 0 || !buscar_setor($setor_id)) {
    json_erro("Setor nao encontrado.", 404);
}
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    json_erro("Responsavel invalido.", 400);
}

if (!definir_responsavel_setor($setor_id, $responsavel_id)) {
    json_erro("Nao foi possivel salvar o responsavel do setor.", 500);
}

registrar_log("setor_responsavel_definido", "setor_id=" . $setor_id . " responsavel_id=" . (int) $responsavel_id);

json_sucesso(null, "Responsavel do setor atualizado.");
