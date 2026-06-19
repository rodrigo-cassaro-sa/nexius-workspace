# Boas Práticas de Segurança

Este documento define as regras obrigatórias de segurança para desenvolvimento do projeto.

Este arquivo deve ser lido antes de qualquer alteração de código.

### Stack oficial

* HTML
* CSS
* JavaScript puro
* PHP procedural
* MySQL

### Objetivo

Garantir que todo código gerado seja seguro, simples, procedural e compatível com a arquitetura definida.

---

## 1. Regras obrigatórias para IA de código

Estas regras devem ser seguidas por qualquer IA ou desenvolvedor que alterar o projeto.

### Regras gerais

* Não usar orientação a objeto.
* Não criar classes.
* Não usar framework.
* Não usar Laravel, Symfony, React, Next.js, Node.js, Supabase ou Firebase.
* Não usar n8n.
* Usar apenas HTML, CSS, JavaScript puro, PHP procedural e MySQL.
* Não criar dependências externas sem necessidade.
* Não alterar a arquitetura do projeto sem autorização.
* Não colocar senha, token, chave secreta ou credencial no frontend.
* Não colocar dados sensíveis em comentários de código.
* Não criar código “temporário” inseguro.
* Não deixar `TODO` de segurança sem resolver.

---

## 2. Regras obrigatórias para endpoints PHP

Todo arquivo PHP dentro de `/api/` deve seguir estas regras.

### Regras obrigatórias

* Validar o método HTTP permitido.
* Retornar resposta em JSON.
* Validar dados obrigatórios.
* Validar tipo dos dados.
* Validar tamanho dos dados.
* Validar usuário logado quando o endpoint for privado.
* Validar permissão quando o endpoint alterar, listar ou excluir dados privados.
* Nunca confiar em dados vindos do navegador.
* Nunca retornar erro técnico para o usuário final.
* Registrar log em operações críticas.
* Usar transaction quando alterar mais de uma tabela.

### Exemplo de resposta segura

```json
{
  "ok": false,
  "error": "Não foi possível processar a solicitação."
}
```

### Exemplo proibido

```json
{
  "ok": false,
  "error": "Erro SQL na linha 42 em /var/www/app/includes/database.php"
}
```

---

## 3. Regras obrigatórias para SQL

Todo SQL deve ser escrito com segurança.

### Regras obrigatórias

* Todo SQL deve usar prepared statement.
* Nunca concatenar input do usuário diretamente no SQL.
* Usar `mysqli_prepare`.
* Usar `mysqli_stmt_bind_param`.
* Usar `mysqli_stmt_execute`.
* Validar dados antes de executar a query.
* Usar transaction em operações com múltiplas tabelas.
* Não usar usuário root do banco na aplicação.
* Não salvar senha pura no banco.
* Salvar apenas `senha_hash`.

### SQL seguro

```php
$sql = "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ? LIMIT 1";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$usuario = mysqli_fetch_assoc($result);
```

### SQL proibido

```php
$sql = "SELECT * FROM usuarios WHERE email = '$email'";
```

---

## 4. Regras obrigatórias para login e sessão

O sistema deve usar sessão segura com cookie.

### Regras obrigatórias

* Não salvar senha pura.
* Usar `password_hash` para salvar senha.
* Usar `password_verify` para validar senha.
* Não salvar token sensível em `localStorage`.
* Não salvar senha em `localStorage`, `sessionStorage` ou `IndexedDB`.
* Usar sessão PHP com cookie seguro.
* Regenerar sessão após login.
* Destruir sessão no logout.
* Endpoint privado deve verificar sessão ativa.

### Sessão segura

```php
session_set_cookie_params([
    "lifetime" => 0,
    "path" => "/",
    "secure" => true,
    "httponly" => true,
    "samesite" => "Strict"
]);

session_start();
```

### Senha segura

```php
$senha_hash = password_hash($senha, PASSWORD_DEFAULT);
```

```php
if (password_verify($senha_digitada, $usuario["senha_hash"])) {
    session_regenerate_id(true);
    $_SESSION["usuario_id"] = $usuario["id"];
}
```

---

## 5. Regras obrigatórias para permissões

A permissão deve ser validada no PHP, nunca apenas no frontend.

### Regras obrigatórias

* O frontend não decide permissão.
* CSS não deve ser usado como segurança.
* JavaScript não deve ser usado como segurança.
* Todo endpoint privado deve verificar o perfil do usuário.
* Aluno só pode acessar os próprios dados.
* Professor só pode acessar dados das turmas vinculadas a ele.
* Admin pode acessar recursos administrativos.
* Toda alteração sensível deve registrar log.

### Proibido

```js
if (usuario.perfil === "admin") {
  mostrarBotaoExcluir();
}
```

Isso pode ser usado apenas para interface, nunca como segurança real.

### Correto

A API PHP deve validar a permissão antes de executar a ação.

---

## 6. Regras obrigatórias para JavaScript

JavaScript deve cuidar da experiência do usuário e chamar a API PHP.

### Regras obrigatórias

* Não guardar segredo no JavaScript.
* Não salvar token sensível em `localStorage`.
* Não definir permissão no JavaScript.
* Não confiar em dados manipuláveis pelo navegador.
* Sempre chamar endpoint PHP.
* Usar `credentials: "include"` quando usar sessão por cookie.
* Evitar `innerHTML` com dados vindos do usuário.
* Preferir `textContent` para exibir texto dinâmico.

### Evitar

```js
elemento.innerHTML = resposta.nome;
```

### Preferir

```js
elemento.textContent = resposta.nome;
```

### Chamada padrão para API

```js
async function postApi(url, body) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(body)
  });

  return await resposta.json();
}
```

---

## 7. Regras obrigatórias para HTML e CSS

HTML e CSS não devem conter lógica sensível.

### Regras obrigatórias para HTML

* Não colocar senha em campo `hidden`.
* Não colocar token em campo `hidden`.
* Não colocar perfil de usuário em campo `hidden`.
* Não colocar comentários com informações internas.
* Formulários sensíveis devem enviar dados para endpoints PHP.
* Campo de senha deve usar `type="password"`.

### Regras obrigatórias para CSS

* Não esconder botões sensíveis apenas com CSS.
* Não usar CSS como barreira de segurança.
* Não importar arquivos externos sem aprovação.
* Não colocar informações internas em comentários.
* CSS controla aparência, não permissão.

### Proibido

```html
<input type="hidden" name="perfil" value="admin">
```

```css
.botao-admin {
  display: none;
}
```

---

## 8. Regras obrigatórias para webhooks

Todo webhook deve validar origem e registrar o recebimento.

### Regras obrigatórias

* Aceitar apenas método `POST`.
* Validar chave secreta no header.
* Validar campos obrigatórios.
* Validar tipo dos campos.
* Registrar log do webhook recebido.
* Não processar webhook sem autenticação.
* Usar transaction quando alterar múltiplas tabelas.
* Retornar JSON.
* Não expor erro técnico na resposta.

### Header recomendado

```txt
x-webhook-secret
```

### Resposta de sucesso

```json
{
  "ok": true,
  "message": "Webhook processado com sucesso."
}
```

---

## 9. Regras obrigatórias para uploads

Uploads são área de alto risco e devem ser tratados com cuidado.

### Regras obrigatórias

* Validar tamanho máximo do arquivo.
* Validar extensão permitida.
* Validar MIME type.
* Renomear o arquivo antes de salvar.
* Nunca confiar no nome original do arquivo.
* Não permitir upload de `.php`, `.js`, `.html`, `.exe`, `.sh` ou arquivos executáveis.
* Salvar uploads fora da pasta pública quando forem privados.
* Não executar arquivos enviados pelo usuário.
* Registrar log de upload.

---

## 10. Regras obrigatórias para logs

Operações críticas devem gerar log.

### Ações que devem gerar log

* Login
* Logout
* Tentativa de login inválida
* Criação de usuário
* Alteração de permissão
* Exclusão de registro
* Alteração de pagamento
* Recebimento de webhook
* Erro em webhook
* Upload de arquivo
* Alteração de dados sensíveis

### Campos recomendados

* `usuario_id`
* `acao`
* `entidade`
* `entidade_id`
* `ip`
* `user_agent`
* `detalhes`
* `criado_em`

---

## 11. Checklist de revisão de código

Antes de finalizar qualquer tarefa, revisar:

* [ ] O código manteve PHP procedural?
* [ ] Nenhuma classe foi criada?
* [ ] Nenhum framework foi adicionado?
* [ ] Nenhum segredo foi colocado no frontend?
* [ ] O endpoint valida método HTTP?
* [ ] O endpoint privado valida login?
* [ ] O endpoint privado valida permissão?
* [ ] O SQL usa prepared statement?
* [ ] Nenhum input do usuário foi concatenado em SQL?
* [ ] Senhas usam `password_hash`?
* [ ] Login usa `password_verify`?
* [ ] JavaScript usa `textContent` para dados do usuário?
* [ ] Webhook valida chave secreta?
* [ ] Upload valida tipo e tamanho?
* [ ] Operação crítica gera log?
* [ ] Operação com múltiplas tabelas usa transaction?
* [ ] A resposta da API é JSON?
* [ ] Erros técnicos não aparecem para o usuário?

---

## 12. Checklist de publicação

Estas regras são importantes, mas dependem do servidor e não apenas do código.

Antes de publicar em produção, verificar:

* [ ] HTTPS está ativo.
* [ ] PHP está atualizado.
* [ ] MySQL está atualizado.
* [ ] Exibição de erros está desativada em produção.
* [ ] Backup automático está ativo.
* [ ] Restauração do backup foi testada.
* [ ] Logs não estão acessíveis pela web.
* [ ] Backups não estão acessíveis pela web.
* [ ] `config.php` real não está no repositório público.
* [ ] Dump real do banco não está no repositório.
* [ ] Usuário do banco não é root.
* [ ] Usuário do banco tem permissão limitada.
* [ ] Painel administrativo está protegido.
* [ ] Tentativas de login são monitoradas.
* [ ] Webhooks usam chave secreta forte.

---

## Instrução final para IA de código

Antes de alterar qualquer arquivo, siga estas instruções:

* Leia este documento.
* Não quebre nenhuma regra de segurança.
* Não mude a stack definida.
* Não use orientação a objeto.
* Não crie classes.
* Não adicione framework.
* Não adicione dependência sem necessidade.
* Não coloque segredo no frontend.
* Não crie SQL inseguro.
* Não crie endpoint privado sem login.
* Não crie endpoint privado sem permissão.
* Não salve senha pura.
* Não use `localStorage` para token sensível.
* Sempre use PHP procedural.
* Sempre use prepared statements.
* Sempre responda JSON em APIs.
* Sempre registre log em ações críticas.

Se uma tarefa pedir algo contra estas regras, explique o risco antes de implementar.
