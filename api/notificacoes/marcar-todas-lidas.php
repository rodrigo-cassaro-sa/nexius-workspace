<?php

// api/notificacoes/marcar-todas-lidas.php
// Marca todas as notificacoes nao lidas do usuario como lidas.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

marcar_todas_notificacoes_lidas(obter_usuario_logado_id());

json_sucesso(null, "Todas as notificacoes foram marcadas como lidas.");
