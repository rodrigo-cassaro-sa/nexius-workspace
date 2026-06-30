<?php

// api/setores/listar.php
// Lista os setores (id, nome, responsavel principal). Requer login (qualquer perfil:
// usado em selects e exibicao). Nao retorna dado sensivel.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/setores.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

json_sucesso(["setores" => listar_setores()]);
