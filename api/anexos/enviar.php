<?php

// api/anexos/enviar.php
// Recebe anexos (multipart/form-data) e os vincula a uma demanda. Apenas Gestor/Admin.
// Cada arquivo e validado (tamanho, extensao, MIME real), renomeado e salvo em pasta privada.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/anexos.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$demanda_id = isset($_POST["demanda_id"]) ? (int) $_POST["demanda_id"] : 0;
if ($demanda_id <= 0) {
    json_erro("Demanda nao informada.", 400);
}

$demanda = buscar_demanda($demanda_id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

$resultado = processar_anexos_upload(
    $_FILES["arquivos"] ?? [],
    $demanda_id,
    null, // anexo de demanda (sem comentario)
    obter_usuario_logado_id()
);

if (!$resultado["ok"]) {
    json_erro($resultado["erro"], $resultado["status"]);
}

json_sucesso(
    ["salvos" => $resultado["salvos"], "rejeitados" => $resultado["rejeitados"]],
    "Anexos processados."
);
