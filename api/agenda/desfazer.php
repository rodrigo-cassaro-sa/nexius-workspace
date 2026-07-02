<?php

// api/agenda/desfazer.php
// Desfaz o ultimo recalculo de agenda: restaura os prazos anteriores. Gestor/Admin.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/agenda.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$restauradas = desfazer_recalculo();

if ($restauradas === 0) {
    json_erro("Nao ha recalculo para desfazer.", 409);
}

registrar_log("agenda_recalculo_desfeito", "restauradas=" . $restauradas);

json_sucesso(["restauradas" => $restauradas], $restauradas . " prazo(s) restaurado(s).");
