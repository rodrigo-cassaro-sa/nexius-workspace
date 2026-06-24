<?php

// anexos.php
// Acesso a dados e validacao de anexos de demandas (uploads). Procedural, mysqli, prepared statements.
// Seguranca (boas-praticas-seguranca secao 9 / backend secao 21):
// - valida tamanho, extensao (allowlist) e MIME real (finfo);
// - renomeia o arquivo (nunca confia no nome original);
// - salva em pasta privada FORA da raiz publica (servida so via API com permissao);
// - nunca permite .php/.js/.html e nao executa o arquivo enviado.

// Extensoes permitidas (allowlist). Tudo fora disto e rejeitado.
function anexos_extensoes_permitidas()
{
    return ["pdf", "png", "jpg", "jpeg", "gif", "webp", "doc", "docx",
            "xls", "xlsx", "ppt", "pptx", "txt", "csv", "zip"];
}

// MIME types aceitos (conferidos com finfo no conteudo real do arquivo).
function anexos_mimes_permitidos()
{
    return [
        "application/pdf",
        "image/png", "image/jpeg", "image/gif", "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain", "text/csv",
        "application/zip", "application/x-zip-compressed",
        // alguns navegadores enviam csv/zip/office como octet-stream:
        "application/octet-stream"
    ];
}

// Extensao em minusculas a partir do nome (sem confiar no resto do nome).
function anexo_extensao($nome)
{
    return strtolower(pathinfo($nome, PATHINFO_EXTENSION));
}

// Garante que a pasta de anexos exista. Retorna true/false.
function anexos_garantir_pasta()
{
    if (!is_dir(ANEXOS_DIR)) {
        @mkdir(ANEXOS_DIR, 0775, true);
    }
    return is_dir(ANEXOS_DIR) && is_writable(ANEXOS_DIR);
}

// Valida um item de $_FILES. Retorna "" se ok, ou a mensagem de erro (amigavel).
function anexo_validar($arquivo)
{
    if (!is_array($arquivo) || !isset($arquivo["error"])) {
        return "Arquivo invalido.";
    }
    if ($arquivo["error"] === UPLOAD_ERR_NO_FILE) {
        return "Nenhum arquivo enviado.";
    }
    if ($arquivo["error"] === UPLOAD_ERR_INI_SIZE || $arquivo["error"] === UPLOAD_ERR_FORM_SIZE) {
        return "Arquivo maior que o limite permitido.";
    }
    if ($arquivo["error"] !== UPLOAD_ERR_OK) {
        return "Falha no envio do arquivo.";
    }
    if (!is_uploaded_file($arquivo["tmp_name"])) {
        return "Arquivo invalido.";
    }
    if ($arquivo["size"] <= 0) {
        return "Arquivo vazio.";
    }
    if ($arquivo["size"] > ANEXO_TAMANHO_MAX) {
        return "Arquivo maior que " . floor(ANEXO_TAMANHO_MAX / 1048576) . " MB.";
    }

    $ext = anexo_extensao($arquivo["name"]);
    if (!in_array($ext, anexos_extensoes_permitidas(), true)) {
        return "Tipo de arquivo nao permitido (." . $ext . ").";
    }

    // MIME real do conteudo (nao confia no informado pelo navegador).
    $mime = "";
    if (function_exists("finfo_open")) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $arquivo["tmp_name"]);
        finfo_close($finfo);
    }
    if ($mime !== "" && !in_array($mime, anexos_mimes_permitidos(), true)) {
        return "Conteudo do arquivo nao permitido.";
    }

    return "";
}

// Gera um nome de armazenamento aleatorio (nunca o nome original), preservando a extensao.
function anexo_nome_armazenado($nome_original)
{
    $ext = anexo_extensao($nome_original);
    $base = bin2hex(random_bytes(16));
    return $ext !== "" ? ($base . "." . $ext) : $base;
}

// Insere o registro do anexo. Retorna o id ou false.
function inserir_anexo($demanda_id, $nome_original, $nome_armazenado, $mime, $tamanho, $criado_por)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO anexos (demanda_id, nome_original, nome_armazenado, mime, tamanho, criado_por)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    mysqli_stmt_bind_param($stmt, "isssii", $demanda_id, $nome_original, $nome_armazenado, $mime, $tamanho, $criado_por);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

// Lista os anexos de uma demanda (metadados + nome de quem enviou).
function listar_anexos_da_demanda($demanda_id)
{
    return executar_select(
        "SELECT a.id, a.nome_original, a.mime, a.tamanho, a.criado_em,
                u.nome AS criado_por_nome
         FROM anexos a
         LEFT JOIN usuarios u ON u.id = a.criado_por
         WHERE a.demanda_id = ?
         ORDER BY a.criado_em ASC, a.id ASC",
        "i",
        [$demanda_id]
    );
}

// Busca um anexo pelo id (inclui demanda_id e nome_armazenado para download seguro).
function buscar_anexo($id)
{
    $linhas = executar_select(
        "SELECT id, demanda_id, nome_original, nome_armazenado, mime, tamanho
         FROM anexos WHERE id = ? LIMIT 1",
        "i",
        [$id]
    );
    return empty($linhas) ? null : $linhas[0];
}
