<?php

// digest.php
// Resumo periodico por e-mail (D15). Pessoal: usa os numeros do proprio usuario.
// Reaproveita as consultas do dashboard (escopo "colaborador" = so as acoes da pessoa).
// O envio efetivo e feito pela fila (cron/processar-fila-email.php); aqui so monta/enfileira.

// Monta o resumo de um usuario (pendentes, atrasadas, % no prazo e proximas pendencias).
function montar_resumo_usuario($usuario_id)
{
    return [
        "pendentes" => contar_minhas_acoes_pendentes($usuario_id),
        "atrasadas" => contar_acoes_atrasadas($usuario_id, "colaborador"),
        "no_prazo" => percentual_acoes_no_prazo($usuario_id, "colaborador"),
        "lista" => listar_minhas_pendencias($usuario_id, 5)
    ];
}

// Usuarios elegiveis ao digest no periodo: ativos, opt-in (digest_ativo=1) e ainda nao
// enviados nos ultimos $dias (idempotencia/anti-spam). $dias e inteiro (sem entrada externa).
function usuarios_para_digest($dias)
{
    $dias = (int) $dias;
    return executar_select(
        "SELECT id, nome, email FROM usuarios
         WHERE ativo = 1 AND digest_ativo = 1
           AND (digest_enviado_em IS NULL OR digest_enviado_em < DATE_SUB(NOW(), INTERVAL " . $dias . " DAY))",
        "",
        []
    );
}

// Marca o momento do ultimo envio do digest do usuario.
function marcar_digest_enviado($usuario_id)
{
    $conn = conectar_banco();
    $stmt = mysqli_prepare($conn, "UPDATE usuarios SET digest_enviado_em = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    return mysqli_stmt_execute($stmt);
}

// Monta o e-mail (texto simples). Retorna [assunto, mensagem].
function montar_email_digest($nome, $resumo)
{
    $base = (defined("APP_URL") && APP_URL !== "") ? rtrim(APP_URL, "/") : "";

    $l = [];
    $l[] = "Ola, " . $nome . "!";
    $l[] = "";
    $l[] = "Resumo das suas tarefas no Workspace S&A:";
    $l[] = "- Acoes pendentes: " . (int) $resumo["pendentes"];
    $l[] = "- Acoes atrasadas: " . (int) $resumo["atrasadas"];
    if ($resumo["no_prazo"] !== null) {
        $l[] = "- Concluidas no prazo: " . (int) $resumo["no_prazo"] . "%";
    }

    if (!empty($resumo["lista"])) {
        $l[] = "";
        $l[] = "Proximas pendencias:";
        foreach ($resumo["lista"] as $p) {
            $prazo = !empty($p["prazo"]) ? (" (prazo " . substr($p["prazo"], 0, 10) . ")") : "";
            $l[] = "- " . $p["acao_titulo"] . $prazo . " [" . $p["demanda_titulo"] . "]";
        }
    }

    $l[] = "";
    $l[] = "Acesse: " . $base . "/dashboard.html";
    $l[] = "";
    $l[] = "Para desativar este resumo, va em Perfil > Preferencias.";

    return ["Seu resumo - Workspace S&A", implode("\n", $l)];
}
