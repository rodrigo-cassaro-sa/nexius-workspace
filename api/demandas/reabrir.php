<?php

// api/demandas/reabrir.php
// Reabre uma demanda concluida (por engano): volta a 'em_andamento' e reabre a acao chave
// (volta a 'pendente'), desfazendo o gatilho de conclusao. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
if ($id <= 0) {
    json_erro("Demanda nao informada.", 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}
if ($demanda["status"] !== "concluida") {
    json_erro("Só demandas concluídas podem ser reabertas.", 409);
}

$conn = conectar_banco();
mysqli_begin_transaction($conn);

$ok = reabrir_demanda($id);
if ($ok) {
    reabrir_acao_chave_da_demanda($id);
}

if (!$ok) {
    mysqli_rollback($conn);
    json_erro("Nao foi possivel reabrir a demanda.", 500);
}

mysqli_commit($conn);
registrar_log("demanda_reaberta", "demanda_id=" . $id);

// Avisa o dono/criador da demanda que ela foi reaberta.
$ator = obter_usuario_logado_id();
$alvos = [$demanda["criador_id"], $demanda["responsavel_id"]];
notificar_varios($alvos, $ator, "status", "Demanda reaberta", $demanda["titulo"], "demanda.html?id=" . $id);

json_sucesso(null, "Demanda reaberta.");
