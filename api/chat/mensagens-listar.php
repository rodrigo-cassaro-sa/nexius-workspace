<?php

// api/chat/mensagens-listar.php
// Lista as mensagens de uma conversa e marca como lidas as recebidas (recibo de leitura).
// So participantes da conversa acessam.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/chat.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$conversa_id = isset($_GET["conversa_id"]) ? (int) $_GET["conversa_id"] : 0;
if ($conversa_id <= 0) {
    json_erro("Conversa nao informada.", 400);
}

$eu = obter_usuario_logado_id();
if (!usuario_participa_da_conversa($conversa_id, $eu)) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

// Abrir a conversa marca as mensagens recebidas como lidas.
marcar_conversa_lida($conversa_id, $eu);

json_sucesso(["mensagens" => listar_mensagens_da_conversa($conversa_id)]);
