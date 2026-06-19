<?php

// validate.php
// Helpers genericos de validacao de entrada (usados pelos endpoints).
// Validacao de regra de negocio fica no proprio endpoint/area. Aqui so utilidades.

// Verifica se um campo obrigatorio existe e nao esta vazio.
function campo_obrigatorio($dados, $campo)
{
    return isset($dados[$campo]) && trim((string) $dados[$campo]) !== "";
}

// Valida formato de e-mail.
function validar_email($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Valida tamanho de texto (min/max em numero de caracteres).
function validar_tamanho($valor, $min, $max)
{
    $tamanho = mb_strlen(trim((string) $valor));
    return $tamanho >= $min && $tamanho <= $max;
}

// Verifica se um valor pertence a uma lista permitida (ex.: status).
function valor_em_lista($valor, $lista)
{
    return in_array($valor, $lista, true);
}

// Le e decodifica o corpo JSON da requisicao. Retorna array ou null.
function ler_json_entrada()
{
    $bruto = file_get_contents("php://input");
    $dados = json_decode($bruto, true);

    return is_array($dados) ? $dados : null;
}
