<?php

// api/anexos/enviar-acao.php
// Recebe anexos (multipart/form-data) e os vincula a uma ACAO (evidencia).
// Usado principalmente como evidencia para concluir tarefas de analise.
// Permissao: o responsavel pela acao ou Administrador/Gestor. Mesma pasta privada e
// mesma validacao dos demais anexos (ver includes/anexos.php). O demanda_id e derivado
// da acao e gravado para manter o escopo de visibilidade/download uniforme.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/anexos.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$acao_id = isset($_POST["acao_id"]) ? (int) $_POST["acao_id"] : 0;
if ($acao_id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$acao = buscar_acao($acao_id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

// O responsavel pela acao, o key user do setor da demanda (melhoria #5) ou Admin/Gestor
// podem anexar evidencia (assim o key user consegue concluir analise/reuniao do seu setor).
$perfil = obter_usuario_logado_perfil();
$eh_responsavel = (int) $acao["responsavel_id"] === obter_usuario_logado_id();
$eh_keyuser = usuario_eh_keyuser_da_demanda($acao["demanda_id"], obter_usuario_logado_id());
if (!$eh_responsavel && !$eh_keyuser && $perfil !== "administrador" && $perfil !== "gestor") {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

$resultado = processar_anexos_upload(
    $_FILES["arquivos"] ?? [],
    (int) $acao["demanda_id"],
    null, // sem comentario
    $acao_id,
    obter_usuario_logado_id()
);

if (!$resultado["ok"]) {
    json_erro($resultado["erro"], $resultado["status"]);
}

json_sucesso(
    ["salvos" => $resultado["salvos"], "rejeitados" => $resultado["rejeitados"]],
    "Anexos processados."
);
