<?php

// api/gamificacao/progresso.php
// Progresso de gamificacao do usuario LOGADO (pontos, nivel, numeros, conquistas).
// Pessoal: cada um ve apenas o proprio progresso. Backend calcula (derivado das acoes).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/gamificacao.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

json_sucesso(resumo_gamificacao(obter_usuario_logado_id()));
