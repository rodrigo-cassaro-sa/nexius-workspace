<?php

// api/chat/abrir.php
// Abre (ou cria) a conversa 1:1 entre o usuario logado e outro usuario ativo.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/chat.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$eu = obter_usuario_logado_id();
$outro_id = isset($body["usuario_id"]) ? (int) $body["usuario_id"] : 0;

if ($outro_id <= 0 || $outro_id === $eu) {
    json_erro("Selecione um usuario valido.", 400);
}
if (!usuario_ativo_existe($outro_id)) {
    json_erro("Usuario nao encontrado.", 404);
}

$conversa_id = obter_ou_criar_conversa($eu, $outro_id);
if (!$conversa_id) {
    json_erro("Nao foi possivel abrir a conversa.", 500);
}

$outro = buscar_usuario_por_id($outro_id);

json_sucesso([
    "conversa_id" => (int) $conversa_id,
    "outro_id" => $outro_id,
    "outro_nome" => $outro ? $outro["nome"] : "Usuario"
]);
