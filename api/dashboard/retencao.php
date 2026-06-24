<?php

// api/dashboard/retencao.php
// Retencao do usuario logado: minhas pendencias (proxima acao) e "continue de onde parou".
// Pessoal: cada um ve apenas o que e seu. Backend monta; frontend exibe.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/dashboard.php";
require_once __DIR__ . "/../../includes/visitas.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$usuario_id = obter_usuario_logado_id();

json_sucesso([
    "pendencias" => listar_minhas_pendencias($usuario_id, 8),
    "ultima_demanda" => ultima_demanda_visitada($usuario_id)
]);
