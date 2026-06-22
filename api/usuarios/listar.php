<?php

// api/usuarios/listar.php
// Lista usuarios ativos (id, nome, perfil) para selects de responsavel e filtros.
// Requer login (qualquer perfil pode precisar para filtrar). Nao retorna dado sensivel.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

json_sucesso(["usuarios" => listar_usuarios_ativos()]);
