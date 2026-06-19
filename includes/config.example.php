<?php

// config.example.php
// REFERENCIA das variaveis de ambiente usadas por includes/config.php.
// Os segredos NAO ficam em arquivo no repositorio: sao definidos como variaveis de ambiente
// no painel do EasyPanel (ou exportados no ambiente, em desenvolvimento local).
//
// Variaveis esperadas (defina no EasyPanel):
//
//   DB_HOST            IP privado da VPC do droplet do MySQL (ex.: 10.x.x.x)
//   DB_NOME            nexius_workspace
//   DB_USUARIO         nexius_app  (usuario dedicado, nunca root)
//   DB_SENHA           senha forte do usuario dedicado
//   DB_CHARSET         utf8mb4  (opcional; padrao utf8mb4)
//
//   APP_NOME           Workspace S&A  (opcional)
//   APP_AMBIENTE       producao | desenvolvimento  (opcional; padrao producao)
//   APP_URL            https://seu-dominio  (base para links de e-mail)
//
//   COOKIE_SECURE      true em producao com HTTPS; false se testar sem HTTPS
//   COOKIE_SAMESITE    Strict  (opcional)
//
//   SMTP_HOST          (fase de e-mail)
//   SMTP_PORTA         587
//   SMTP_USUARIO       (fase de e-mail)
//   SMTP_SENHA         (fase de e-mail)
//   SMTP_REMETENTE     nao-responder@seu-dominio
//   SMTP_REMETENTE_NOME Workspace S&A
//
//   EMAIL_SUPORTE      e-mail de suporte exibido na tela de Ajuda
//
// Em desenvolvimento local sem EasyPanel, voce pode exportar essas variaveis no ambiente
// antes de subir o PHP. Nao e necessario copiar este arquivo: includes/config.php ja le tudo do ambiente.
