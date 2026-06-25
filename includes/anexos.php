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

// Insere o registro do anexo. $comentario_id e null para anexo de demanda.
// Retorna o id ou false.
function inserir_anexo($demanda_id, $comentario_id, $nome_original, $nome_armazenado, $mime, $tamanho, $criado_por)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO anexos (demanda_id, comentario_id, nome_original, nome_armazenado, mime, tamanho, criado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    // comentario_id pode ser null: o mysqli envia NULL quando a variavel ligada e null.
    mysqli_stmt_bind_param($stmt, "iisssii", $demanda_id, $comentario_id, $nome_original, $nome_armazenado, $mime, $tamanho, $criado_por);
    $ok = mysqli_stmt_execute($stmt);

    return $ok ? mysqli_insert_id($conn) : false;
}

// Processa o lote de arquivos enviados (mesma logica para demanda e comentario):
// confere limite, garante a pasta privada, e para cada arquivo valida, renomeia, move e registra.
// $files = $_FILES["arquivos"]; $comentario_id e null para anexo de demanda.
// Retorna ["ok"=>true, "status"=>200, "salvos"=>[], "rejeitados"=>[]] ou
//         ["ok"=>false, "status"=>4xx/5xx, "erro"=>"..."] quando nem da para comecar.
function processar_anexos_upload($files, $demanda_id, $comentario_id, $usuario_id)
{
    if (!isset($files["name"]) || !is_array($files["name"])) {
        return ["ok" => false, "status" => 400, "erro" => "Nenhum arquivo enviado."];
    }

    $total = count($files["name"]);
    if ($total > ANEXOS_MAX_POR_ENVIO) {
        return ["ok" => false, "status" => 400, "erro" => "Envie no maximo " . ANEXOS_MAX_POR_ENVIO . " arquivos por vez."];
    }

    if (!anexos_garantir_pasta()) {
        // Detalhe tecnico fica no log; usuario recebe mensagem generica.
        registrar_log("anexo_erro_pasta", "demanda_id=" . $demanda_id . ($comentario_id ? " comentario_id=" . $comentario_id : ""));
        return ["ok" => false, "status" => 500, "erro" => "Nao foi possivel armazenar os anexos."];
    }

    $salvos = [];
    $rejeitados = [];

    for ($i = 0; $i < $total; $i++) {
        $arquivo = [
            "name" => $files["name"][$i],
            "type" => $files["type"][$i],
            "tmp_name" => $files["tmp_name"][$i],
            "error" => $files["error"][$i],
            "size" => $files["size"][$i]
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
        $id = inserir_anexo($demanda_id, $comentario_id, $nome_original, $nome_armazenado, $mime, (int) $arquivo["size"], $usuario_id);

        if (!$id) {
            @unlink($destino); // nao deixa arquivo orfao se o registro falhar
            $rejeitados[] = ["nome" => $nome_original, "erro" => "Falha ao registrar."];
            continue;
        }

        registrar_log("anexo_enviado", "demanda_id=" . $demanda_id . ($comentario_id ? " comentario_id=" . $comentario_id : "") . " anexo_id=" . $id);
        $salvos[] = ["id" => $id, "nome" => $nome_original];
    }

    return ["ok" => true, "status" => 200, "salvos" => $salvos, "rejeitados" => $rejeitados];
}

// Lista os anexos de nivel da demanda (apenas comentario_id NULL; os de comentario
// aparecem junto do proprio comentario, ver listar_anexos_dos_comentarios_da_demanda).
function listar_anexos_da_demanda($demanda_id)
{
    return executar_select(
        "SELECT a.id, a.nome_original, a.mime, a.tamanho, a.criado_em,
                u.nome AS criado_por_nome
         FROM anexos a
         LEFT JOIN usuarios u ON u.id = a.criado_por
         WHERE a.demanda_id = ? AND a.comentario_id IS NULL
         ORDER BY a.criado_em ASC, a.id ASC",
        "i",
        [$demanda_id]
    );
}

// Lista os anexos de todos os comentarios de uma demanda (uma consulta so;
// o front agrupa por comentario_id). Escopo conferido pelo demanda_id no endpoint.
function listar_anexos_dos_comentarios_da_demanda($demanda_id)
{
    return executar_select(
        "SELECT a.id, a.comentario_id, a.nome_original, a.mime, a.tamanho, a.criado_em
         FROM anexos a
         WHERE a.demanda_id = ? AND a.comentario_id IS NOT NULL
         ORDER BY a.id ASC",
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
