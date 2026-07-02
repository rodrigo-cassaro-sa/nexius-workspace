<?php

// api/agenda/recalcular.php
// Recalcula os prazos das tarefas pendentes por prioridade + capacidade (B1).
// Acao sob demanda: REESCREVE prazos. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/agenda.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$atualizadas = recalcular_agenda();

registrar_log("agenda_recalculada", "atualizadas=" . $atualizadas);

json_sucesso(["atualizadas" => $atualizadas], $atualizadas . " tarefa(s) reagendada(s) por prioridade.");
