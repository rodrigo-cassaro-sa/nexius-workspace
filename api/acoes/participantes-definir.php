<?php

// api/acoes/participantes-definir.php
// Atualiza os participantes (pessoas envolvidas) de uma acao do tipo "reuniao".
// Permite incluir/remover pessoas depois da criacao. Substitui a lista inteira.
// Permissao: Administrador, Gestor ou o responsavel da acao.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$acao_id = isset($body["acao_id"]) ? (int) $body["acao_id"] : 0;
$participantes = isset($body["participantes"]) && is_array($body["participantes"]) ? $body["participantes"] : [];

if ($acao_id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$acao = buscar_acao($acao_id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}
if ($acao["tipo"] !== "reuniao") {
    json_erro("So reunioes tem participantes.", 409);
}

// Permissao: Admin/Gestor ou o responsavel da acao.
$perfil = obter_usuario_logado_perfil();
$eu = obter_usuario_logado_id();
$eh_responsavel = (int) $acao["responsavel_id"] === $eu;
if ($perfil !== "administrador" && $perfil !== "gestor" && !$eh_responsavel) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

$antes = participantes_ids_da_acao($acao_id);
definir_participantes_acao($acao_id, $participantes);
$depois = participantes_ids_da_acao($acao_id);

registrar_log("acao_participantes_atualizados", "acao_id=" . $acao_id);

// Notifica apenas os participantes recem-incluidos (exceto o proprio).
$novos = array_diff($depois, $antes);
$alvos = [];
foreach ($novos as $uid) {
    if ((int) $uid !== $eu) {
        $alvos[] = (int) $uid;
    }
}
if (!empty($alvos)) {
    notificar_varios(
        $alvos,
        $eu,
        "atribuicao",
        "Você foi incluído em uma reunião",
        $acao["titulo"],
        "demanda.html?id=" . $acao["demanda_id"]
    );
}

json_sucesso(null, "Participantes atualizados.");
