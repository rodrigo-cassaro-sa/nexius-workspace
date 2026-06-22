<?php

// email.php
// Registra e-mails na fila_email e, quando ha provedor configurado (Resend ou SMTP),
// envia imediatamente (sem depender de cron). A fila serve de registro e fallback.

require_once __DIR__ . "/mailer.php";

// Ha provedor de e-mail configurado?
function email_configurado()
{
    return (defined("RESEND_API_KEY") && RESEND_API_KEY !== "")
        || (defined("SMTP_HOST") && SMTP_HOST !== "");
}

function enfileirar_email($usuario_id, $email_destino, $assunto, $mensagem)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO fila_email (usuario_id, email_destino, assunto, mensagem, status)
            VALUES (?, ?, ?, ?, 'pendente')";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "isss", $usuario_id, $email_destino, $assunto, $mensagem);
    if (!mysqli_stmt_execute($stmt)) {
        return false;
    }
    $id = mysqli_insert_id($conn);

    // Envio imediato quando ha provedor (Resend/SMTP). Em falha, fica pendente para retry.
    if (email_configurado()) {
        $resultado = enviar_email($email_destino, $assunto, $mensagem);
        if ($resultado["ok"]) {
            marcar_email_enviado($id);
        } else {
            marcar_email_erro($id, $resultado["erro"], 1);
        }
    }

    return true;
}

// Limite de tentativas antes de marcar o e-mail como "erro" definitivo.
function email_max_tentativas()
{
    return 5;
}

// Busca e-mails pendentes para o cron processar.
function buscar_emails_pendentes($limite)
{
    $limite = (int) $limite;
    return executar_select(
        "SELECT id, usuario_id, email_destino, assunto, mensagem, tentativas
         FROM fila_email
         WHERE status = 'pendente' AND tentativas < " . email_max_tentativas() . "
         ORDER BY criado_em ASC LIMIT " . $limite
    );
}

function marcar_email_enviado($id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE fila_email SET status = 'enviado', enviado_em = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    return mysqli_stmt_execute($stmt);
}

// Registra a falha; se atingir o limite de tentativas, marca como 'erro' (para de tentar).
function marcar_email_erro($id, $erro, $tentativas)
{
    $status = $tentativas >= email_max_tentativas() ? "erro" : "pendente";
    $erro = substr($erro, 0, 255);

    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE fila_email SET status = ?, tentativas = ?, erro = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "sisi", $status, $tentativas, $erro, $id);
    return mysqli_stmt_execute($stmt);
}
