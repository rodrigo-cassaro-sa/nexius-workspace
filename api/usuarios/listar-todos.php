<?php

// api/usuarios/listar-todos.php
// Lista TODOS os usuarios (gestao de usuarios). Apenas Admin.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

json_sucesso(["usuarios" => listar_usuarios()]);
