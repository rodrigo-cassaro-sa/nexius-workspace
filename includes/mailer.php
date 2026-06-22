<?php

// mailer.php
// Cliente SMTP minimo em PHP puro (sem dependencia externa).
// Suporta STARTTLS (porta 587) e SSL implicito (porta 465), com AUTH LOGIN.
// Usado pelo cron que processa a fila_email. Credenciais vem do config (SMTP_*).

// Le uma resposta SMTP (pode ter varias linhas: "250-..." ate "250 ...").
function smtp_ler($fp)
{
    $resposta = "";
    while (($linha = fgets($fp, 515)) !== false) {
        $resposta .= $linha;
        // A ultima linha tem espaco na 4a posicao (ex.: "250 OK"); as intermediarias tem "-".
        if (isset($linha[3]) && $linha[3] === " ") {
            break;
        }
    }
    return $resposta;
}

// Envia um comando e confere se a resposta comeca com o codigo esperado.
function smtp_comando($fp, $comando, $codigo_esperado)
{
    if ($comando !== null) {
        fwrite($fp, $comando . "\r\n");
    }
    $resposta = smtp_ler($fp);
    $codigo = substr($resposta, 0, 3);
    if ($codigo !== (string) $codigo_esperado) {
        return ["ok" => false, "erro" => "SMTP " . $codigo . ": " . trim($resposta)];
    }
    return ["ok" => true, "resposta" => $resposta];
}

// Envia um e-mail de texto simples. Retorna ["ok" => bool, "erro" => string].
function enviar_email_smtp($para, $assunto, $corpo)
{
    $host = SMTP_HOST;
    $porta = (int) SMTP_PORTA;
    $remetente = SMTP_REMETENTE;
    $remetente_nome = SMTP_REMETENTE_NOME;

    $transporte = ($porta === 465) ? "ssl://" : "";
    $contexto = stream_context_create();
    $fp = @stream_socket_client(
        $transporte . $host . ":" . $porta,
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT,
        $contexto
    );

    if (!$fp) {
        return ["ok" => false, "erro" => "Conexao SMTP falhou: " . $errstr];
    }

    stream_set_timeout($fp, 15);

    $dominio = $remetente ? substr(strrchr($remetente, "@"), 1) : "localhost";

    $passos = [];
    $passos[] = smtp_comando($fp, null, 220);
    $passos[] = smtp_comando($fp, "EHLO " . $dominio, 250);

    if ($porta !== 465) {
        $r = smtp_comando($fp, "STARTTLS", 220);
        $passos[] = $r;
        if ($r["ok"]) {
            stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $passos[] = smtp_comando($fp, "EHLO " . $dominio, 250);
        }
    }

    $passos[] = smtp_comando($fp, "AUTH LOGIN", 334);
    $passos[] = smtp_comando($fp, base64_encode(SMTP_USUARIO), 334);
    $passos[] = smtp_comando($fp, base64_encode(SMTP_SENHA), 235);

    $passos[] = smtp_comando($fp, "MAIL FROM:<" . $remetente . ">", 250);
    $passos[] = smtp_comando($fp, "RCPT TO:<" . $para . ">", 250);
    $passos[] = smtp_comando($fp, "DATA", 354);

    // Cabecalhos + corpo (assunto e corpo em base64 UTF-8 para acentos).
    $cabecalho = "From: " . $remetente_nome . " <" . $remetente . ">\r\n"
        . "To: <" . $para . ">\r\n"
        . "Subject: =?UTF-8?B?" . base64_encode($assunto) . "?=\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($corpo));

    fwrite($fp, $cabecalho . "\r\n.\r\n");
    $passos[] = smtp_comando($fp, null, 250);

    smtp_comando($fp, "QUIT", 221);
    fclose($fp);

    // Se algum passo falhou, retorna o primeiro erro.
    foreach ($passos as $passo) {
        if (!$passo["ok"]) {
            return ["ok" => false, "erro" => $passo["erro"]];
        }
    }

    return ["ok" => true, "erro" => ""];
}
