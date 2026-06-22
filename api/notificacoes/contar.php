<?php

// api/notificacoes/contar.php
// Contagem leve de notificacoes nao lidas (para o badge da sidebar).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

json_sucesso(["nao_lidas" => contar_notificacoes_nao_lidas(obter_usuario_logado_id())]);
