<?php

// api/demandas/registrar-visita.php
// Registra a visita do usuario logado a uma demanda (lastro) e devolve a lista de visitas.
// Mesmo escopo do detalhe: Colaborador so se estiver envolvido.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/visitas.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
$demanda_id = isset($body["demanda_id"]) ? (int) $body["demanda_id"] : 0;
if ($demanda_id <= 0) {
    json_erro("Demanda nao informada.", 400);
}

$demanda = buscar_demanda($demanda_id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

// Escopo: Admin e Gestor veem tudo; Colaborador so se estiver envolvido.
if (obter_usuario_logado_perfil() === "colaborador") {
    if (!colaborador_envolvido_na_demanda($demanda_id, obter_usuario_logado_id())) {
        json_response(["ok" => false, "error" => "Sem permissao."], 403);
    }
}

registrar_visita_demanda($demanda_id, obter_usuario_logado_id());

json_sucesso(["visitas" => listar_visitas_demanda($demanda_id)]);
