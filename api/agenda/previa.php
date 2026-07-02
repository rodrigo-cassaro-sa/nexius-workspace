<?php

// api/agenda/previa.php
// Previa do recalculo de agenda: lista as mudancas propostas SEM gravar. Gestor/Admin.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/agenda.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

json_sucesso([
    "mudancas" => calcular_agenda(),
    "tem_desfazer" => tem_recalculo_desfazivel()
]);
