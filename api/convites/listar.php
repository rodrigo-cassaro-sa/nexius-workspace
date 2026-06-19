<?php

// api/convites/listar.php
// Lista os convites (apenas Admin), para a tela de administracao.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/convites.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

json_sucesso(["convites" => listar_convites()]);
