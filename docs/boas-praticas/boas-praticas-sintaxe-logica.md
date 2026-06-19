# Boas Práticas de Sintaxe e Lógica

Este documento define as regras obrigatórias de sintaxe, lógica e organização de código do projeto.

Este arquivo deve ser lido antes de qualquer alteração de código.

### Stack oficial

* HTML
* CSS
* JavaScript puro
* PHP procedural
* MySQL

### Objetivo

Garantir que o código seja simples, legível, previsível, fácil de manter e compatível com a arquitetura definida.

Este documento não substitui o arquivo de segurança.
As regras de segurança ficam no arquivo:

```txt
boas-praticas-seguranca.md
```

---

## 1. Regras gerais do projeto

### Regras obrigatórias

* Usar código simples e direto.
* Usar nomes claros e descritivos.
* Não usar orientação a objeto.
* Não criar classes.
* Não usar framework.
* Não criar abstrações desnecessárias.
* Não misturar HTML, CSS, JavaScript e PHP sem necessidade.
* Separar responsabilidade dos arquivos.
* Não criar código difícil de entender só para parecer avançado.
* Preferir clareza em vez de código curto demais.
* Não duplicar lógica quando puder criar uma função simples.
* Não alterar padrão existente sem motivo claro.
* Não criar arquivos grandes demais.
* Não criar funções grandes demais.
* Não deixar código morto no projeto.
* Não deixar comentários inúteis.
* Não deixar `console.log`, `var_dump`, `print_r` ou `echo` de debug em produção.

---

## 2. Padrão de idioma

O projeto deve usar nomes em português, sem acentos, em arquivos, funções, variáveis, tabelas e campos.

### Correto

```txt
usuario
aluno
turma
matricula
presenca
avaliacao
pagamento
data_criacao
status_pagamento
```

### Evitar

```txt
user
student
class
paymentStatus
dataCriação
usuário
```

### Regra

* Conteúdo exibido para o usuário pode ter acentos.
* Código, nomes de arquivos, nomes de funções, nomes de variáveis e nomes de tabelas devem ficar sem acentos.
* Usar português simples.
* Não misturar português e inglês no mesmo padrão de nome.

---

## 3. Nome de arquivos

### Regras obrigatórias

* Usar letras minúsculas.
* Não usar espaços.
* Não usar acentos.
* Não usar caracteres especiais.
* Usar hífen `-` em arquivos públicos quando melhorar leitura.
* Usar underline `_` em nomes internos quando fizer sentido.
* Nome do arquivo deve explicar sua função.
* Evitar nomes genéricos como `teste.php`, `novo.php`, `arquivo.php` ou `script.js`.

### Exemplos corretos

```txt
login.html
area-aluno.html
lista-provas.html
resultado-exame.html
perfil.html
api.js
auth.js
aluno.js
criar.php
listar.php
atualizar.php
processar-fila.php
gerar-mensalidades.php
```

### Exemplos proibidos

```txt
Página Login.html
área do aluno.html
teste.php
novo.php
script_final_2.js
arrumar.php
```

---

## 4. Padrão de indentação

### Regras obrigatórias

* Usar 2 espaços para HTML, CSS e JavaScript.
* Usar 4 espaços para PHP.
* Não misturar tabs e espaços.
* Manter blocos bem alinhados.
* Não escrever várias instruções na mesma linha.
* Quebrar linhas longas para melhorar leitura.

### HTML

```html
<form id="form-login">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>

  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" required>

  <button type="submit">Entrar</button>
</form>
```

### JavaScript

```js
async function carregarAluno() {
  const resposta = await getApi("/api/alunos/detalhe.php");

  if (!resposta.ok) {
    mostrarErro(resposta.error);
    return;
  }

  preencherAluno(resposta.aluno);
}
```

### PHP

```php
<?php

require_once __DIR__ . "/../../includes/database.php";
require_once __DIR__ . "/../../includes/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response([
        "ok" => false,
        "error" => "Método não permitido."
    ], 405);
}
```

---

## 5. Padrão de HTML

HTML deve cuidar apenas da estrutura da tela.

### Regras obrigatórias

* Usar HTML semântico quando possível.
* Usar `header`, `main`, `section`, `article`, `nav` e `footer` quando fizer sentido.
* Todo campo de formulário deve ter `label`.
* Todo botão deve ter texto claro.
* Não colocar regra de negócio no HTML.
* Não colocar JavaScript inline.
* Não colocar CSS inline sem necessidade.
* Não repetir blocos grandes de HTML sem motivo.
* Não deixar elementos sem `id` ou `class` quando forem manipulados pelo JS.

### Correto

```html
<section class="card-login">
  <h1>Entrar</h1>

  <form id="form-login">
    <label for="email">E-mail</label>
    <input id="email" name="email" type="email" required>

    <label for="senha">Senha</label>
    <input id="senha" name="senha" type="password" required>

    <button type="submit">Entrar</button>
  </form>
</section>
```

### Evitar

```html
<div onclick="fazerLogin()" style="color: red;">
  Entrar
</div>
```

---

## 6. Padrão de CSS

CSS deve cuidar apenas da aparência.

### Regras obrigatórias

* Usar classes claras e reutilizáveis.
* Evitar seletor muito longo.
* Evitar excesso de `!important`.
* Não misturar regra visual com regra de negócio.
* Não criar classes com nomes confusos.
* Manter consistência nos nomes.
* Agrupar estilos por componente ou área.
* Evitar repetição desnecessária.
* Usar variáveis CSS para cores, espaçamentos e tamanhos principais.

### Exemplo de variáveis

```css
:root {
  --cor-primaria: #1f4fff;
  --cor-fundo: #f7f8fa;
  --cor-texto: #1f2937;
  --cor-texto-secundario: #6b7280;

  --espaco-1: 4px;
  --espaco-2: 8px;
  --espaco-3: 12px;
  --espaco-4: 16px;

  --raio-card: 16px;
}
```

### Exemplo correto

```css
.card {
  background: #ffffff;
  border-radius: var(--raio-card);
  padding: var(--espaco-4);
}

.card-titulo {
  font-size: 18px;
  font-weight: 700;
}
```

### Evitar

```css
.div1 {
  color: red !important;
}

.coisa {
  margin-left: 17px;
}
```

---

## 7. Padrão de JavaScript

JavaScript deve cuidar da interação, estado da tela e comunicação com a API.

### Regras obrigatórias

* Usar JavaScript puro.
* Não usar React, Vue, Angular ou framework.
* Não criar lógica duplicada.
* Não misturar muitas responsabilidades na mesma função.
* Cada função deve fazer uma coisa principal.
* Nome de função deve começar com verbo.
* Usar `const` por padrão.
* Usar `let` apenas quando o valor precisar mudar.
* Evitar `var`.
* Evitar funções gigantes.
* Tratar erros de API.
* Não deixar `console.log` de debug no código final.

### Padrão de nomes

```txt
carregarAluno
listarTurmas
salvarPerfil
validarFormulario
mostrarErro
mostrarSucesso
limparFormulario
preencherTabela
formatarData
```

### Exemplo correto

```js
async function salvarPerfil() {
  const dados = obterDadosPerfil();

  if (!validarPerfil(dados)) {
    mostrarErro("Preencha os campos obrigatórios.");
    return;
  }

  const resposta = await postApi("/api/alunos/atualizar.php", dados);

  if (!resposta.ok) {
    mostrarErro(resposta.error);
    return;
  }

  mostrarSucesso("Perfil atualizado com sucesso.");
}
```

### Exemplo ruim

```js
async function x() {
  // faz tudo misturado
}
```

---

## 8. Padrão de PHP procedural

PHP deve ser escrito de forma procedural, simples e organizada.

### Regras obrigatórias

* Não criar classes.
* Não usar orientação a objeto.
* Não usar framework.
* Usar funções simples.
* Cada função deve ter uma responsabilidade clara.
* Não criar funções grandes demais.
* Não misturar HTML com PHP em endpoints de API.
* Endpoints de API devem retornar JSON.
* Arquivos de include devem conter funções reutilizáveis.
* Arquivos de endpoint devem coordenar a ação.
* Evitar lógica duplicada.
* Evitar nomes genéricos.

### Padrão de funções

Funções devem usar nomes claros, em português, sem acentos.

### Exemplos corretos

```php
function validar_email($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function limpar_texto($valor)
{
    return trim($valor);
}

function usuario_esta_logado()
{
    return isset($_SESSION["usuario_id"]);
}
```

### Exemplos ruins

```php
function faz()
{
}

function teste()
{
}

function arruma()
{
}
```

---

## 9. Padrão de endpoints PHP

Cada endpoint deve ter uma finalidade clara.

### Regras obrigatórias

* Um endpoint deve executar uma ação principal.
* O nome do arquivo deve representar a ação.
* Todo endpoint deve validar método HTTP.
* Todo endpoint deve validar entrada.
* Todo endpoint deve retornar JSON.
* Endpoint de listagem deve usar `GET`.
* Endpoint de criação deve usar `POST`.
* Endpoint de atualização deve usar `POST` ou `PUT`, conforme padrão escolhido.
* Endpoint de exclusão deve usar `POST` ou `DELETE`, conforme padrão escolhido.
* Não criar endpoint que faz muitas coisas diferentes.

### Exemplo de endpoints

```txt
/api/alunos/criar.php
/api/alunos/listar.php
/api/alunos/detalhe.php
/api/alunos/atualizar.php
/api/turmas/listar.php
/api/presencas/criar.php
/api/webhooks/pagamento-confirmado.php
```

### Estrutura recomendada de endpoint

```php
<?php

require_once __DIR__ . "/../../includes/database.php";
require_once __DIR__ . "/../../includes/response.php";
require_once __DIR__ . "/../../includes/auth.php";
require_once __DIR__ . "/../../includes/validate.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response([
        "ok" => false,
        "error" => "Método não permitido."
    ], 405);
}

$body = json_decode(file_get_contents("php://input"), true);

if (!$body) {
    json_response([
        "ok" => false,
        "error" => "Dados inválidos."
    ], 400);
}

// validar dados
// executar ação
// responder JSON
```

---

## 10. Padrão de respostas JSON

Todas as APIs devem responder no mesmo formato.

### Sucesso simples

```json
{
  "ok": true,
  "message": "Operação realizada com sucesso."
}
```

### Sucesso com dados

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "nome": "Maria"
  }
}
```

### Erro

```json
{
  "ok": false,
  "error": "Não foi possível processar a solicitação."
}
```

### Lista

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "nome": "Turma de Vanera"
    }
  ]
}
```

### Regras obrigatórias

* Sempre retornar `ok`.
* Em caso de sucesso, retornar `data`, `message` ou ambos.
* Em caso de erro, retornar `error`.
* Não misturar formatos diferentes.
* Não retornar texto solto.
* Não retornar HTML em endpoint de API.

---

## 11. Padrão de validação

Toda entrada deve ser validada antes de ser usada.

### Regras obrigatórias

* Validar campos obrigatórios.
* Validar tipo dos campos.
* Validar tamanho mínimo e máximo.
* Validar formato de e-mail.
* Validar número quando o campo deve ser número.
* Validar data quando o campo deve ser data.
* Validar status com lista de valores permitidos.
* Não aceitar campos desnecessários quando não forem usados.

### Exemplo de validação simples

```php
function campo_obrigatorio($dados, $campo)
{
    return isset($dados[$campo]) && trim($dados[$campo]) !== "";
}
```

```php
if (!campo_obrigatorio($body, "nome")) {
    json_response([
        "ok" => false,
        "error" => "Nome é obrigatório."
    ], 400);
}
```

### Exemplo de lista permitida

```php
$status_permitidos = ["ativo", "inativo", "pendente"];

if (!in_array($status, $status_permitidos, true)) {
    json_response([
        "ok" => false,
        "error" => "Status inválido."
    ], 400);
}
```

---

## 12. Padrão de lógica

A lógica deve ser simples, previsível e fácil de testar.

### Regras obrigatórias

* Evitar funções com muitas responsabilidades.
* Evitar muitos `if` aninhados.
* Usar retorno antecipado quando melhorar clareza.
* Tratar erro antes do fluxo principal.
* Separar validação, processamento e resposta.
* Não esconder regra importante em nomes confusos.
* Não criar fluxo mágico.
* Não duplicar regra de negócio.
* Preferir funções pequenas e reutilizáveis.

### Exemplo com retorno antecipado

```php
if (!$usuario_logado) {
    json_response([
        "ok" => false,
        "error" => "Usuário não autenticado."
    ], 401);
}

if (!$tem_permissao) {
    json_response([
        "ok" => false,
        "error" => "Sem permissão."
    ], 403);
}

// fluxo principal aqui
```

### Evitar

```php
if ($usuario_logado) {
    if ($tem_permissao) {
        if ($dados_validos) {
            // fluxo principal muito escondido
        }
    }
}
```

---

## 13. Padrão de comentários

Comentários devem explicar intenção, não repetir o óbvio.

### Regras obrigatórias

* Comentar apenas quando ajudar a entender a regra.
* Não comentar código óbvio.
* Não deixar comentário antigo que não representa mais o código.
* Não colocar senha, token ou informação interna em comentário.
* Preferir nomes claros a comentários excessivos.

### Bom comentário

```php
// Mantém histórico do aluno em vez de excluir o registro definitivamente.
$status = "inativo";
```

### Comentário desnecessário

```php
// Soma 1 na variável contador.
$contador = $contador + 1;
```

---

## 14. Padrão de erros

Erros devem ser tratados de forma previsível.

### Regras obrigatórias

* Tratar erro de API no JavaScript.
* Tratar erro de banco no PHP.
* Não quebrar a tela sem mensagem.
* Não exibir erro técnico para usuário final.
* Não ignorar erro silenciosamente.
* Retornar mensagens simples e claras.
* Registrar detalhes técnicos em log quando necessário.

### JavaScript

```js
if (!resposta.ok) {
  mostrarErro(resposta.error || "Não foi possível concluir a ação.");
  return;
}
```

### PHP

```php
if (!$stmt) {
    json_response([
        "ok" => false,
        "error" => "Não foi possível processar a solicitação."
    ], 500);
}
```

---

## 15. Padrão de datas e valores

Datas, horários e valores devem seguir padrão único.

### Regras obrigatórias

* No banco, usar formato próprio de data do MySQL.
* Em JSON, usar formato `YYYY-MM-DD` para datas.
* Em JSON, usar formato `YYYY-MM-DD HH:MM:SS` para data e hora quando necessário.
* No frontend, formatar a data apenas para exibição.
* Não salvar valor monetário como texto formatado.
* Não salvar `R$ 120,00` no banco.
* Salvar valor monetário como número decimal.

### Correto no banco

```txt
120.00
```

### Correto na tela

```txt
R$ 120,00
```

---

## 16. Padrão de status

Status devem usar valores fixos e previsíveis.

### Regras obrigatórias

* Usar letras minúsculas.
* Não usar acentos.
* Não usar espaços.
* Usar underline quando necessário.
* Validar status antes de salvar.
* Não criar status novo sem atualizar a documentação.

### Exemplos

```txt
ativo
inativo
pendente
cancelado
pago
atrasado
em_aberto
em_analise
concluido
```

### Evitar

```txt
Ativo
EM ABERTO
pendênte
em aberto
```

---

## 17. Padrão para booleanos

Campos booleanos devem ser claros.

### Regras obrigatórias

* Nome de booleano deve parecer pergunta.
* Usar `0` e `1` no MySQL quando for `TINYINT`.
* No JavaScript, usar `true` e `false`.
* Não usar texto como `sim` e `nao` para booleano no banco.

### Exemplos

```txt
ativo
pago
visivel
confirmado
admin
excluido
```

### Exemplo no banco

```sql
ativo TINYINT(1) NOT NULL DEFAULT 1
```

---

## 18. Checklist antes de finalizar código

Antes de finalizar qualquer tarefa, revisar:

* [ ] O código está em português sem acentos nos nomes técnicos?
* [ ] O código segue PHP procedural?
* [ ] Nenhuma classe foi criada?
* [ ] Nenhum framework foi adicionado?
* [ ] Os nomes de arquivos estão claros?
* [ ] As funções têm responsabilidade única?
* [ ] Não existe função grande demais?
* [ ] Não existe endpoint fazendo ações demais?
* [ ] As respostas da API seguem o padrão JSON?
* [ ] Os erros são tratados?
* [ ] Não existe `console.log` de debug?
* [ ] Não existe `var_dump`, `print_r` ou `echo` de debug?
* [ ] Não existe código morto?
* [ ] Não existem comentários desatualizados?
* [ ] Datas e valores seguem o padrão?
* [ ] Status usam valores fixos?
* [ ] O código está legível para outro desenvolvedor entender?

---

## 19. Instrução final para IA de código

Antes de alterar qualquer arquivo, siga estas instruções:

* Leia este documento.
* Mantenha o código simples.
* Não use orientação a objeto.
* Não crie classes.
* Não adicione framework.
* Não adicione dependência sem necessidade.
* Não misture responsabilidades.
* Não crie código difícil de manter.
* Não altere padrão existente sem motivo.
* Não crie função genérica demais.
* Não crie endpoint que faz muitas ações diferentes.
* Use nomes claros em português, sem acentos.
* Use PHP procedural.
* Use JavaScript puro.
* Use HTML semântico.
* Use CSS organizado.
* Responda JSON em APIs.
* Trate erros de forma previsível.
* Siga o padrão já existente no projeto.

Se uma tarefa pedir algo contra estas regras, explique o problema antes de implementar.
