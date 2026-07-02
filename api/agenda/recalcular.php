<?php

// api/agenda/recalcular.php
// Aplica o recalculo de agenda por prioridade (REESCREVE prazos). Gestor/Admin.
// Guarda o estado anterior (para desfazer) e notifica os responsaveis afetados (interno + e-mail).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/agenda.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/notificacoes.php";
require_once __DIR__ . "/../../includes/email.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$resultado = aplicar_agenda();
$atualizadas = $resultado["atualizadas"];
$responsaveis = $resultado["responsaveis"];

registrar_log("agenda_recalculada", "atualizadas=" . $atualizadas);

// Notifica cada responsavel afetado (uma vez, nao por tarefa). Interno + e-mail.
$ator = obter_usuario_logado_id();
if ($atualizadas > 0 && !empty($responsaveis)) {
    notificar_varios(
        $responsaveis,
        $ator,
        "status",
        "Sua agenda foi recalculada",
        "Tarefas suas tiveram o prazo reagendado por prioridade. Veja no Roadmap.",
        "roadmap.html"
    );

    if (email_configurado()) {
        foreach ($responsaveis as $uid) {
            if ((int) $uid === (int) $ator) {
                continue;
            }
            $u = buscar_usuario_por_id((int) $uid);
            if ($u && !empty($u["email"])) {
                enfileirar_email(
                    (int) $uid,
                    $u["email"],
                    "Sua agenda foi recalculada",
                    "Olá, " . $u["nome"] . ".\n\nAlgumas das suas tarefas tiveram o prazo reagendado por prioridade no Workspace S&A. "
                    . "Confira a sua fila atualizada no Roadmap."
                );
            }
        }
    }
}

json_sucesso(["atualizadas" => $atualizadas], $atualizadas . " tarefa(s) reagendada(s) por prioridade.");
