<?php

// permissions.php
// Verificacao de perfil e escopo de visibilidade (validada SEMPRE no backend).
// Perfis do MVP: administrador, gestor, colaborador (ver 01-descricao-produto.md secao 9).
// Este arquivo traz apenas a base de verificacao de perfil.
// O escopo detalhado (quem ve qual demanda) sera implementado na fase de permissoes,
// consumindo as regras ja definidas na descricao do produto. Nao implementar aqui ainda.

define("PERFIL_ADMIN", "administrador");
define("PERFIL_GESTOR", "gestor");
define("PERFIL_COLABORADOR", "colaborador");

// Interrompe o endpoint se o perfil do usuario logado nao estiver na lista permitida.
function exigir_perfil($perfis_permitidos)
{
    $perfil = obter_usuario_logado_perfil();

    if (!in_array($perfil, $perfis_permitidos, true)) {
        json_response([
            "ok" => false,
            "error" => "Sem permissao."
        ], 403);
    }
}

// Atalho: exige perfil administrador.
function exigir_admin()
{
    exigir_perfil([PERFIL_ADMIN]);
}

// TODO (fase de permissoes): escopo de visibilidade.
// - Administrador e Gestor veem todas as demandas.
// - Colaborador ve a demanda se for responsavel de alguma acao dela OU se ja comentou nela.
// Implementar como funcoes (ex.: usuario_pode_ver_demanda) consumindo o banco, na fase certa.
