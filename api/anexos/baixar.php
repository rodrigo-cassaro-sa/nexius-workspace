<?php

// api/anexos/baixar.php
// Entrega um anexo ao usuario com permissao. Forca download (nunca executa/inline),
// servindo o arquivo da pasta privada. Erros sao JSON; sucesso e o proprio arquivo.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/anexos.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;
if ($id <= 0) {
    json_erro("Anexo nao informado.", 400);
}

$anexo = buscar_anexo($id);
if (!$anexo) {
    json_erro("Anexo nao encontrado.", 404);
}

// Escopo: so quem pode ver a demanda pode baixar o anexo dela.
if (!usuario_pode_ver_demanda((int) $anexo["demanda_id"], obter_usuario_logado_id(), obter_usuario_logado_perfil())) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

// basename impede travessia de diretorio; o nome no banco e sempre aleatorio gerado por nos.
$nome_disco = basename($anexo["nome_armazenado"]);
$caminho = rtrim(ANEXOS_DIR, "/\\") . DIRECTORY_SEPARATOR . $nome_disco;

// Confirma que o caminho resolvido fica realmente dentro da pasta de anexos.
$base_real = realpath(ANEXOS_DIR);
$arquivo_real = realpath($caminho);
if ($base_real === false || $arquivo_real === false || strpos($arquivo_real, $base_real) !== 0 || !is_file($arquivo_real)) {
    json_erro("Anexo indisponivel.", 404);
}

registrar_log("anexo_baixado", "anexo_id=" . $id . " demanda_id=" . $anexo["demanda_id"]);

// Nome exibido no download (sem quebras de linha; versao ASCII + versao UTF-8).
$nome_exibicao = preg_replace('/[\r\n"]+/', " ", (string) $anexo["nome_original"]);
$nome_ascii = preg_replace('/[^\x20-\x7E]/', "_", $nome_exibicao);

header("Content-Type: application/octet-stream");
header("X-Content-Type-Options: nosniff");
header("Content-Disposition: attachment; filename=\"" . $nome_ascii . "\"; filename*=UTF-8''" . rawurlencode($nome_exibicao));
header("Content-Length: " . filesize($arquivo_real));
header("Cache-Control: private, no-store");

readfile($arquivo_real);
exit;
