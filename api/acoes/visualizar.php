<?php

// api/acoes/visualizar.php
// Marca que o usuario logado viu o detalhe de uma acao (lastro) e devolve quem ja viu.
// Escopo: a acao pertence a uma demanda; Colaborador so se estiver envolvido nela.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/visitas.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
$acao_id = isset($body["acao_id"]) ? (int) $body["acao_id"] : 0;
if ($acao_id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$acao = buscar_acao($acao_id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

// Escopo: Admin e Gestor veem tudo; Colaborador so se estiver envolvido na demanda.
if (obter_usuario_logado_perfil() === "colaborador") {
    if (!colaborador_envolvido_na_demanda($acao["demanda_id"], obter_usuario_logado_id())) {
        json_response(["ok" => false, "error" => "Sem permissao."], 403);
    }
}

marcar_acao_visualizada($acao_id, obter_usuario_logado_id());

json_sucesso(["visualizacoes" => listar_visualizacoes_acao($acao_id)]);
