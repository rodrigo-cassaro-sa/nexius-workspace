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

if (!isset($_FILES["arquivos"]) || !is_array($_FILES["arquivos"]["name"])) {
    json_erro("Nenhum arquivo enviado.", 400);
}

$total = count($_FILES["arquivos"]["name"]);
if ($total > ANEXOS_MAX_POR_ENVIO) {
    json_erro("Envie no maximo " . ANEXOS_MAX_POR_ENVIO . " arquivos por vez.", 400);
}

if (!anexos_garantir_pasta()) {
    // Detalhe tecnico fica no log; usuario recebe mensagem generica.
    registrar_log("anexo_erro_pasta", "demanda_id=" . $demanda_id);
    json_erro("Nao foi possivel armazenar os anexos.", 500);
}

$usuario_id = obter_usuario_logado_id();
$salvos = [];
$rejeitados = [];

for ($i = 0; $i < $total; $i++) {
    $arquivo = [
        "name" => $_FILES["arquivos"]["name"][$i],
        "type" => $_FILES["arquivos"]["type"][$i],
        "tmp_name" => $_FILES["arquivos"]["tmp_name"][$i],
        "error" => $_FILES["arquivos"]["error"][$i],
        "size" => $_FILES["arquivos"]["size"][$i]
    ];

    // Campo de arquivo vazio (nenhum selecionado naquele slot): ignora em silencio.
    if ($arquivo["error"] === UPLOAD_ERR_NO_FILE) {
        continue;
    }

    $erro = anexo_validar($arquivo);
    if ($erro !== "") {
        $rejeitados[] = ["nome" => (string) $arquivo["name"], "erro" => $erro];
        continue;
    }

    $nome_armazenado = anexo_nome_armazenado($arquivo["name"]);
    $destino = rtrim(ANEXOS_DIR, "/\\") . DIRECTORY_SEPARATOR . $nome_armazenado;

    if (!move_uploaded_file($arquivo["tmp_name"], $destino)) {
        $rejeitados[] = ["nome" => (string) $arquivo["name"], "erro" => "Falha ao salvar."];
        continue;
    }

    // MIME real (conferido na validacao); guarda para servir o download com seguranca.
    $mime = "application/octet-stream";
    if (function_exists("finfo_open")) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectado = finfo_file($finfo, $destino);
        finfo_close($finfo);
        if ($detectado) {
            $mime = $detectado;
        }
    }

    $nome_original = mb_substr((string) $arquivo["name"], 0, 255);
    $id = inserir_anexo($demanda_id, $nome_original, $nome_armazenado, $mime, (int) $arquivo["size"], $usuario_id);

    if (!$id) {
        @unlink($destino); // nao deixa arquivo orfao se o registro falhar
        $rejeitados[] = ["nome" => $nome_original, "erro" => "Falha ao registrar."];
        continue;
    }

    registrar_log("anexo_enviado", "demanda_id=" . $demanda_id . " anexo_id=" . $id);
    $salvos[] = ["id" => $id, "nome" => $nome_original];
}

json_sucesso(["salvos" => $salvos, "rejeitados" => $rejeitados], "Anexos processados.");
