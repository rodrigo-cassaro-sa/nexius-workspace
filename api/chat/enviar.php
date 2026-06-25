<?php

// api/chat/enviar.php
// Envia uma mensagem numa conversa. So participantes. Referencia opcional a uma demanda
// que o REMETENTE possa ver (evita vazar demanda fora do escopo).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/chat.php";
require_once __DIR__ . "/../../includes/demandas.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$conversa_id = isset($body["conversa_id"]) ? (int) $body["conversa_id"] : 0;
$texto = trim($body["texto"] ?? "");
$demanda_id = isset($body["demanda_id"]) && $body["demanda_id"] !== "" ? (int) $body["demanda_id"] : null;

if ($conversa_id <= 0) {
    json_erro("Conversa nao informada.", 400);
}
if (!validar_tamanho($texto, 1, 2000)) {
    json_response(["ok" => false, "error" => "Escreva uma mensagem.", "errors" => ["texto" => "Mensagem vazia ou muito longa."]], 400);
}

$eu = obter_usuario_logado_id();
if (!usuario_participa_da_conversa($conversa_id, $eu)) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

// Referencia opcional: a demanda deve existir e ser visivel para o remetente.
if ($demanda_id !== null) {
    $demanda = buscar_demanda($demanda_id);
    if (!$demanda || !usuario_pode_ver_demanda($demanda_id, $eu, obter_usuario_logado_perfil())) {
        json_erro("Demanda referenciada invalida.", 400);
    }
}

$id = criar_mensagem($conversa_id, $eu, $texto, $demanda_id);
if (!$id) {
    json_erro("Nao foi possivel enviar a mensagem.", 500);
}

registrar_log("mensagem_enviada", "conversa_id=" . $conversa_id . " mensagem_id=" . $id);

json_sucesso(["id" => (int) $id], "Mensagem enviada.");
