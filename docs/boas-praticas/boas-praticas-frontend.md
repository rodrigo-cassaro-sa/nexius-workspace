# Boas Práticas de Frontend

Este documento define boas práticas para construção de frontend em projetos criados ou alterados por IA de coding.

O objetivo é orientar a criação de telas, componentes visuais, arquivos HTML, CSS e JavaScript de forma simples, organizada e fiel ao mockup aprovado.

---

## 1. Escopo deste documento

Este documento cuida apenas de frontend.

Ele não define:

* Regras de negócio
* Schema do banco
* Endpoints finais
* Permissões finais
* Automações
* Lógica interna do backend
* Funcionalidades não solicitadas

As telas devem ser derivadas do mockup aprovado.

As funcionalidades devem vir da descrição do produto, requisitos ou tarefa solicitada.

A IA não deve inventar telas, componentes ou fluxos sem evidência.

---

## 2. Regra de criação mínima

A IA deve criar apenas o necessário para a tarefa atual.

Não criar:

* Telas extras
* Componentes não usados
* Arquivos CSS sem uso
* Arquivos JavaScript sem uso
* Estados visuais não solicitados
* Fluxos não existentes no mockup
* Bibliotecas externas sem aprovação
* Estrutura visual futura sem necessidade

O frontend deve acompanhar o escopo real do projeto.

---

## 3. Stack oficial do frontend

O frontend deve usar:

```txt
HTML
CSS
JavaScript puro
```

Não usar:

```txt
React
Vue
Angular
Next.js
TypeScript
Tailwind
Bootstrap
jQuery
Frameworks de UI
Build obrigatório
```

Dependências externas só devem ser sugeridas se forem realmente necessárias e aprovadas.

---

## 4. Origem das telas

As telas devem vir do mockup visual aprovado.

Cada tela identificada pode gerar:

* Um arquivo HTML
* Um arquivo JavaScript específico, se necessário
* Estilos reaproveitados nos arquivos CSS existentes

A IA não deve criar tela que não aparece no mockup, na descrição do produto ou na tarefa.

---

## 5. Origem dos componentes

Componentes visuais devem vir do mockup ou de necessidade real da interface.

Exemplos comuns:

```txt
botao
card
modal
tabela
formulario
menu
sidebar
navbar
alerta
badge
lista
avatar
campo
```

Não criar biblioteca de componentes completa sem necessidade.

Criar apenas os componentes usados nas telas reais.

---

## 6. Estrutura base de referência

A estrutura abaixo é apenas uma referência.

A IA deve usar apenas os arquivos necessários para o projeto atual.

```txt
public/
  index.html

  css/
    reset.css
    theme.css
    components.css
    pages.css

  js/
    api.js
    auth.js
    app.js

  assets/
    imagens/
    icones/
```

Não criar todos os arquivos automaticamente se o projeto não precisar.

---

## 7. Responsabilidade do HTML

HTML deve cuidar da estrutura da tela.

HTML pode conter:

* Estrutura semântica
* Textos da interface
* Formulários
* Botões
* Listas
* Tabelas
* Containers
* Referências para CSS e JS

HTML não deve conter:

* Regra de negócio
* Segredos
* Tokens
* Permissão real
* SQL
* Lógica sensível
* CSS inline sem necessidade
* JavaScript inline sem necessidade

---

## 8. Responsabilidade do CSS

CSS deve cuidar da aparência.

CSS pode conter:

* Cores
* Tipografia
* Espaçamentos
* Layout
* Responsividade
* Estados visuais
* Componentes visuais
* Variáveis visuais
* Animações simples
* Microinterações visuais

CSS não deve conter:

* Regra de negócio
* Controle real de permissão
* Dependência de dados sensíveis
* Soluções visuais que escondem problema de lógica
* Estilos não usados

---

## 9. Responsabilidade do JavaScript

JavaScript deve cuidar da interação da tela e comunicação com API.

JavaScript pode conter:

* Eventos de clique
* Envio de formulários
* Manipulação da interface
* Chamada de API
* Exibição de dados
* Estados de carregamento
* Mensagens de erro e sucesso
* Validações básicas de experiência
* Controle de classes para animações
* Abertura e fechamento de elementos interativos

JavaScript não deve conter:

* Regra de permissão real
* Segredos
* Senhas
* SQL
* Acesso direto ao banco
* Lógica crítica que deveria estar no backend

---

## 10. Separação entre HTML, CSS e JS

Manter responsabilidades separadas.

Preferir:

```txt
HTML → estrutura
CSS → aparência
JS → interação
```

Evitar:

```html
<button onclick="salvar()" style="background: red;">
  Salvar
</button>
```

Preferir:

```html
<button id="botao-salvar" class="botao botao-primario">
  Salvar
</button>
```

```js
document
  .querySelector("#botao-salvar")
  .addEventListener("click", salvar);
```

---

## 11. Padrão de páginas

Cada página deve representar uma tela real do projeto.

Exemplos genéricos:

```txt
login.html
dashboard.html
perfil.html
lista.html
detalhe.html
formulario.html
```

Regras:

* Usar nomes claros.
* Usar letras minúsculas.
* Não usar acentos.
* Não usar espaços.
* Não criar página sem relação com o mockup.
* Não duplicar páginas com diferença pequena.
* Reaproveitar componentes visuais quando possível.

---

## 12. Padrão de CSS

Arquivos CSS devem ser organizados por finalidade.

Estrutura de referência:

```txt
css/
  reset.css
  theme.css
  components.css
  pages.css
```

### reset.css

Usado para ajustes base do navegador.

### theme.css

Usado para tokens visuais:

* Cores
* Fontes
* Espaçamentos
* Bordas
* Sombras
* Breakpoints
* Duração de animações
* Curvas de transição

### components.css

Usado para componentes reutilizáveis:

* Botões
* Cards
* Inputs
* Modais
* Tabelas
* Alertas
* Badges
* Estados visuais
* Microinterações reutilizáveis

### pages.css

Usado para estilos específicos de páginas.

Criar esses arquivos apenas se fizer sentido para o tamanho do projeto.

---

## 13. Tokens visuais

Sempre que possível, usar variáveis CSS.

Exemplo:

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

  --raio-pequeno: 8px;
  --raio-medio: 12px;
  --raio-grande: 16px;

  --transicao-rapida: 0.15s ease;
  --transicao-padrao: 0.2s ease;
  --transicao-lenta: 0.3s ease;
}
```

Regras:

* Não espalhar cores fixas sem necessidade.
* Não repetir valores visuais em muitos lugares.
* Usar tokens para manter consistência.
* Tokens devem vir do mockup ou identidade visual do projeto.
* Usar tokens para transições quando houver animações recorrentes.

---

## 14. Padrão de classes CSS

Classes devem ser claras, reutilizáveis e previsíveis.

Exemplos bons:

```txt
botao
botao-primario
botao-secundario
card
card-titulo
formulario
campo
campo-label
campo-input
tabela
alerta
alerta-sucesso
alerta-erro
modal
modal-ativo
carregando
```

Evitar:

```txt
div1
box2
coisa
teste
azulzao
ajuste-final
novo-card-2
```

Regras:

* Usar português sem acentos.
* Usar nomes descritivos.
* Evitar nomes genéricos demais.
* Evitar classe com nome baseado só na cor.
* Evitar excesso de `!important`.

---

## 15. Padrão de JavaScript

Arquivos JavaScript devem ter responsabilidade clara.

Estrutura de referência:

```txt
js/
  api.js
  auth.js
  app.js
  pagina-especifica.js
```

### api.js

Funções reutilizáveis para chamadas de API.

### auth.js

Funções de autenticação e verificação de sessão no frontend.

### app.js

Funções gerais da aplicação.

### pagina-especifica.js

Código específico de uma tela.

Criar apenas os arquivos necessários.

---

## 16. Padrão de funções JavaScript

Funções devem ter nomes claros e responsabilidade única.

Exemplos:

```txt
carregarDados
salvarFormulario
validarFormulario
mostrarErro
mostrarSucesso
limparFormulario
preencherTabela
formatarData
abrirModal
fecharModal
ativarMenu
desativarMenu
mostrarCarregando
ocultarCarregando
```

Regras:

* Usar verbo no início.
* Evitar função gigante.
* Evitar função que faz muitas coisas.
* Evitar duplicação de lógica.
* Tratar erros de API.
* Remover `console.log` antes de finalizar.
* Usar JavaScript para controlar estado visual, não para substituir regras do backend.

---

## 17. Comunicação com API

Toda comunicação com backend deve usar funções padronizadas.

Exemplo:

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

Regras:

* Centralizar chamadas repetidas.
* Não espalhar `fetch` duplicado sem necessidade.
* Tratar sucesso e erro.
* Não chamar banco direto.
* Não montar endpoint dinâmico perigoso.
* Não expor segredos no frontend.

---

## 18. Estados de tela

Toda tela que busca dados deve prever estados básicos.

Estados recomendados:

```txt
carregando
vazio
erro
sucesso
sem_permissao
sem_conexao
```

Criar apenas estados necessários para a tela.

Não criar estados visuais que não serão usados.

---

## 19. Formulários

Formulários devem ser claros e consistentes.

Boas práticas:

* Todo campo deve ter label.
* Campos obrigatórios devem ser identificados.
* Usar tipo correto de input.
* Validar no frontend para melhorar experiência.
* Validar novamente no backend.
* Exibir mensagem clara de erro.
* Exibir mensagem clara de sucesso.
* Evitar formulários longos sem organização.

Tipos recomendados:

```html
<input type="text">
<input type="email">
<input type="password">
<input type="number">
<input type="date">
<input type="time">
<textarea></textarea>
<select></select>
```

---

## 20. Tabelas e listas

Tabelas e listas devem ser usadas conforme o tipo de dado.

Usar tabela quando:

* Dados forem comparáveis por colunas.
* Houver várias linhas semelhantes.
* A leitura tabular for melhor.

Usar lista ou card quando:

* O conteúdo for mais visual.
* Cada item tiver informações diferentes.
* A tela for mobile-first.

Boas práticas:

* Prever estado vazio.
* Prever carregamento.
* Evitar carregar dados demais de uma vez.
* Usar paginação quando necessário.
* Manter ações claras por item.

---

## 21. Modais

Modais devem ser usados apenas quando fizer sentido.

Usar modal para:

* Confirmação
* Ação rápida
* Detalhe curto
* Formulário simples

Evitar modal para:

* Fluxo longo
* Tela complexa
* Cadastro com muitos campos
* Conteúdo essencial da página

Regras:

* Modal deve ter botão de fechar.
* Modal deve ter título claro.
* Modal deve ter ação principal clara.
* Modal deve permitir cancelar quando aplicável.
* Modal pode usar animação simples de entrada e saída.

---

## 22. Responsividade

O frontend deve funcionar em diferentes tamanhos de tela quando o projeto exigir.

Boas práticas:

* Pensar em mobile e desktop.
* Evitar largura fixa sem necessidade.
* Usar unidades flexíveis.
* Usar media queries quando necessário.
* Testar que botões e textos não quebrem.
* Não criar responsividade para telas que não fazem parte do escopo.

---

## 23. Acessibilidade básica

Aplicar acessibilidade básica sempre que possível.

Boas práticas:

* Usar HTML semântico.
* Usar `label` em campos.
* Usar texto claro em botões.
* Não depender apenas de cor para indicar estado.
* Manter contraste adequado.
* Usar `alt` em imagens relevantes.
* Garantir foco visível em elementos interativos.
* Evitar elementos clicáveis sem função semântica.
* Evitar animações que prejudiquem leitura ou navegação.

---

## 24. Assets

Assets devem ser organizados e nomeados com clareza.

Estrutura de referência:

```txt
assets/
  imagens/
  icones/
  logos/
```

Regras:

* Usar nomes sem acentos.
* Usar nomes sem espaços.
* Otimizar imagens quando possível.
* Não adicionar assets não usados.
* Não manter arquivos duplicados.
* Não usar imagens do mockup como se fossem assets finais sem autorização.
* Assets finais devem vir do projeto ou serem aprovados.

---

## 25. Fidelidade ao mockup

O frontend deve seguir o mockup aprovado.

A IA deve observar:

* Hierarquia visual
* Espaçamentos
* Cores
* Tipografia
* Tamanho dos elementos
* Ordem dos blocos
* Componentes visuais
* Estados visuais representados
* Responsividade indicada
* Animações indicadas

Não inventar visual diferente sem solicitação.

Se algum detalhe não estiver claro, usar solução simples e consistente.

---

## 26. Conteúdo da interface

Textos da interface devem ser claros e objetivos.

Boas práticas:

* Usar português simples.
* Evitar termos técnicos para usuário final.
* Usar mensagens curtas.
* Usar ações claras nos botões.
* Não inventar textos comerciais sem necessidade.
* Não criar conteúdo que não esteja no mockup ou requisitos.

Exemplos:

```txt
Salvar
Cancelar
Entrar
Sair
Editar
Excluir
Ver detalhes
Tentar novamente
```

---

## 27. Performance frontend

O frontend deve ser leve.

Boas práticas:

* Não carregar biblioteca sem necessidade.
* Não carregar imagem pesada sem otimização.
* Evitar JavaScript desnecessário.
* Evitar CSS duplicado.
* Evitar arquivos não usados.
* Evitar renderizar listas enormes de uma vez.
* Buscar apenas dados necessários.
* Reutilizar componentes visuais.
* Preferir animações leves.
* Evitar animações que travem a interface.

---

## 28. Animações e microinterações

Animações devem melhorar a experiência do usuário sem deixar a interface pesada, confusa ou exagerada.

### Boas práticas

* Usar animações apenas quando tiverem função clara.
* Preferir animações simples, rápidas e leves.
* Preferir CSS para transições e animações visuais.
* Usar JavaScript apenas para controlar estados, classes e interações.
* Animar preferencialmente `opacity` e `transform`.
* Evitar animar `width`, `height`, `top`, `left` e propriedades que forcem muito recálculo de layout.
* Manter animações consistentes com o mockup aprovado.
* Não criar animações que não aparecem no mockup ou não foram solicitadas.
* Não usar biblioteca externa de animação sem aprovação.
* Não exagerar em efeitos visuais.
* Não prejudicar leitura, navegação ou acessibilidade.
* Respeitar estados como carregando, sucesso, erro, abertura, fechamento e transição de elementos.

### Usar CSS para animações simples

Exemplo:

```css
.botao {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.botao:hover {
  transform: translateY(-2px);
}
```

### Usar JavaScript apenas para controlar estado

Exemplo:

```js
function abrirModal() {
  const modal = document.querySelector("#modal");

  modal.classList.add("ativo");
}
```

```css
.modal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.modal.ativo {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

### Tipos de animações permitidas quando fizerem sentido

* Hover em botões.
* Feedback visual em clique.
* Abertura e fechamento de modal.
* Menu lateral abrindo e fechando.
* Accordion.
* Mensagem de sucesso ou erro aparecendo.
* Loading simples.
* Skeleton loading.
* Transição de cards.
* Animação leve ao carregar uma seção.
* Microinterações em inputs e formulários.

### Evitar

* Animações longas demais.
* Animações em excesso.
* Efeitos que distraem o usuário.
* Movimento exagerado em telas administrativas.
* Bibliotecas externas sem necessidade.
* Animações que escondem lentidão real da API.
* Animações que impedem o usuário de agir rapidamente.

### Regra principal

Animação deve servir à usabilidade.

Se a animação não ajuda o usuário a entender, navegar ou receber feedback, ela não deve ser criada.

---

## 29. O que a IA não deve fazer

A IA não deve:

* Criar telas extras.
* Criar componentes extras sem uso.
* Criar CSS gigante sem necessidade.
* Criar JavaScript genérico demais.
* Usar framework frontend.
* Usar biblioteca externa sem aprovação.
* Colocar regra sensível no frontend.
* Colocar segredo no frontend.
* Misturar HTML, CSS e JS sem necessidade.
* Fugir do mockup aprovado.
* Criar design diferente do solicitado.
* Criar assets fictícios como se fossem finais.
* Criar fluxo que não está no requisito.
* Criar animações exageradas sem necessidade.
* Adicionar biblioteca de animação sem aprovação.

---

## 30. Ordem recomendada para criar frontend com IA

Ao criar frontend a partir de mockup e requisitos, seguir esta ordem:

1. Ler os documentos de boas práticas.
2. Ler a descrição do produto.
3. Analisar o mockup.
4. Listar somente as telas identificadas.
5. Listar componentes visuais reais.
6. Criar estrutura mínima de arquivos.
7. Criar tokens visuais básicos.
8. Criar componentes reutilizáveis necessários.
9. Criar tela por tela.
10. Conectar interações necessárias.
11. Conectar APIs somente quando existirem.
12. Adicionar animações apenas quando fizerem sentido.
13. Revisar fidelidade ao mockup.
14. Remover código e estilos não usados.

---

## 31. Checklist de frontend

Antes de finalizar qualquer alteração, revisar:

* [ ] A tela foi derivada do mockup ou requisito?
* [ ] Nenhuma tela extra foi criada?
* [ ] Nenhum componente sem uso foi criado?
* [ ] HTML, CSS e JS estão separados?
* [ ] HTML usa estrutura clara?
* [ ] CSS está organizado?
* [ ] JavaScript tem funções claras?
* [ ] Não há framework frontend?
* [ ] Não há dependência externa sem aprovação?
* [ ] Não há segredo no frontend?
* [ ] O frontend chama apenas API?
* [ ] Não há regra de permissão real no frontend?
* [ ] As mensagens são claras?
* [ ] Os estados principais foram tratados?
* [ ] As animações são leves e necessárias?
* [ ] As animações usam CSS sempre que possível?
* [ ] JavaScript controla apenas o estado da animação?
* [ ] Não foi adicionada biblioteca externa de animação sem aprovação?
* [ ] Não há `console.log` de debug?
* [ ] Não há CSS ou JS morto?
* [ ] O visual respeita o mockup?
* [ ] O código continua simples e fácil de manter?
