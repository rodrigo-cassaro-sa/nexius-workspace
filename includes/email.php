<?php

// email.php
// Enfileira e-mails na tabela fila_email para envio posterior.
// O ENVIO real (SMTP + cron) e da fase de e-mail; aqui so registramos na fila.
// Assim, quem chama nao trava esperando o envio.

function enfileirar_email($usuario_id, $email_destino, $assunto, $mensagem)
{
    $conn = conectar_banco();
    $sql = "INSERT INTO fila_email (usuario_id, email_destino, assunto, mensagem, status)
            VALUES (?, ?, ?, ?, 'pendente')";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "isss", $usuario_id, $email_destino, $assunto, $mensagem);

    return mysqli_stmt_execute($stmt);
}
