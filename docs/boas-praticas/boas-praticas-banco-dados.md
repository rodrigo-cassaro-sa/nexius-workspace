# Boas Práticas de Banco de Dados

Este documento define boas práticas para construção, organização e manutenção do banco de dados em projetos criados ou alterados por IA de coding.

O objetivo é orientar a IA na criação de tabelas, campos, relacionamentos, índices, constraints e scripts SQL de forma simples, segura e compatível com a necessidade real do projeto.

---

## 1. Escopo deste documento

Este documento cuida apenas de banco de dados.

Ele não define:

* Quais tabelas o projeto deve ter
* Quais campos finais o projeto deve usar
* Regras de negócio específicas
* Telas do sistema
* Fluxos do produto
* Permissões finais do sistema

As tabelas, campos e relacionamentos devem ser derivados da descrição do produto, requisitos, mockup, regras de negócio ou tarefa solicitada.

A IA não deve inventar tabelas, campos ou relacionamentos sem evidência.

---

## 2. Regra de criação mínima

A IA deve criar apenas o que for necessário para o projeto atual.

Não criar:

* Tabelas preventivas
* Campos sem uso claro
* Relacionamentos desnecessários
* Índices sem motivo
* Triggers sem necessidade
* Views sem necessidade
* Procedures sem necessidade
* Tabelas genéricas sem função real
* Campos duplicados sem justificativa
* Estrutura complexa antes de validar o escopo

A estrutura do banco deve acompanhar a necessidade real do sistema.

---

## 3. Banco oficial

O banco padrão do projeto é:

```txt
MySQL
```

Boas práticas recomendadas:

* Usar engine `InnoDB`.
* Usar charset `utf8mb4`.
* Usar collation compatível com português.
* Usar chaves primárias.
* Usar chaves estrangeiras quando fizer sentido.
* Usar índices em campos consultados com frequência.
* Usar transações em operações com múltiplas tabelas.
* Evitar complexidade desnecessária.

---

## 4. Princípios gerais

* O banco deve refletir as entidades reais do projeto.
* Cada tabela deve ter uma finalidade clara.
* Cada campo deve ter uma finalidade clara.
* Cada relacionamento deve representar uma necessidade real.
* Evitar duplicação de dados.
* Evitar campos genéricos demais.
* Evitar tabelas grandes com responsabilidades misturadas.
* Evitar nomes confusos.
* Evitar abreviações difíceis de entender.
* Preferir clareza em vez de excesso de normalização.
* Não criar estrutura que a aplicação ainda não usa.

---

## 5. Nome de tabelas

### Regras obrigatórias

* Usar letras minúsculas.
* Não usar acentos.
* Não usar espaços.
* Usar underline `_` em nomes compostos.
* Usar nomes em português.
* Usar nomes claros e descritivos.
* Manter padrão consistente entre singular ou plural.
* Não misturar português e inglês.
* Não usar nomes genéricos demais.

### Exemplos corretos

```txt
usuarios
perfis
clientes
pedidos
itens_pedido
pagamentos
logs_sistema
```

### Exemplos ruins

```txt
User
tbl_users
Tabela1
dados
coisas
cadastro_geral
usuários
itens pedido
```

---

## 6. Nome de campos

### Regras obrigatórias

* Usar letras minúsculas.
* Não usar acentos.
* Não usar espaços.
* Usar underline `_` em nomes compostos.
* Usar nomes claros.
* Não usar abreviações confusas.
* Não usar nomes genéricos sem contexto.
* Manter padrão único no projeto.

### Exemplos corretos

```txt
id
nome
email
telefone
status
criado_em
atualizado_em
usuario_id
perfil_id
valor_total
data_vencimento
```

### Exemplos ruins

```txt
Nome
E-mail
tel1
vlr
dt
x
campo1
info
dataCadastro
```

---

## 7. Chave primária

Toda tabela principal deve ter chave primária.

Padrão recomendado:

```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

Regras:

* Usar `id` como chave primária padrão.
* Não usar campo de texto como chave primária.
* Não usar e-mail, CPF, telefone ou código externo como chave primária.
* IDs externos podem existir, mas devem ser campos separados.
* Tabelas de relacionamento podem ter `id` próprio ou chave composta, conforme necessidade.

---

## 8. Chaves estrangeiras

Chaves estrangeiras devem ser usadas quando houver relacionamento real entre tabelas.

### Padrão de nome

```txt
nome_da_tabela_no_singular_id
```

Exemplos:

```txt
usuario_id
cliente_id
pedido_id
produto_id
pagamento_id
```

### Regras

* Criar chave estrangeira apenas quando o relacionamento for necessário.
* Não criar relacionamento sem uso real.
* Não criar chave estrangeira para campos que não representam vínculo.
* Definir comportamento de exclusão com cuidado.
* Evitar `ON DELETE CASCADE` em dados sensíveis sem necessidade clara.
* Preferir manter histórico quando houver valor operacional.

---

## 9. Campos de controle

Campos de controle devem ser usados quando fizerem sentido.

### Campos comuns

```txt
criado_em
atualizado_em
excluido_em
status
criado_por
atualizado_por
```

### Regras

* Usar `criado_em` em tabelas importantes.
* Usar `atualizado_em` em tabelas que sofrem alteração.
* Usar `excluido_em` quando houver exclusão lógica.
* Usar `status` quando o registro tiver ciclo de vida.
* Não adicionar todos os campos em todas as tabelas sem necessidade.
* Campos de auditoria devem ser adicionados quando houver rastreabilidade real.

---

## 10. Datas e horários

### Regras obrigatórias

* Usar tipos próprios do MySQL.
* Usar `DATE` para data.
* Usar `TIME` para hora.
* Usar `DATETIME` para data e hora.
* Não salvar data como texto.
* Não salvar data em formato visual.
* A formatação visual deve ser feita no frontend.
* Manter padrão único para nomes de campos de data.

### Exemplos corretos

```txt
data_nascimento DATE
horario_inicio TIME
criado_em DATETIME
data_vencimento DATE
```

### Exemplos ruins

```txt
data_nascimento VARCHAR(20)
criado_em VARCHAR(50)
data_vencimento = '10/05/2026'
```

---

## 11. Valores monetários

### Regras obrigatórias

* Usar `DECIMAL`.
* Não usar `FLOAT` para dinheiro.
* Não salvar valor monetário como texto.
* Não salvar símbolo de moeda no banco.
* A formatação com `R$` deve ser feita na tela.
* Definir precisão de acordo com a necessidade do projeto.

### Padrão recomendado

```sql
valor DECIMAL(10,2) NOT NULL DEFAULT 0.00
```

### Correto

```txt
120.00
```

### Errado

```txt
R$ 120,00
120 reais
```

---

## 12. Status

Status devem ser previsíveis e documentados.

### Regras

* Usar letras minúsculas.
* Não usar acentos.
* Não usar espaços.
* Usar underline quando necessário.
* Criar lista de valores permitidos.
* Não criar status novo sem necessidade.
* Não misturar status com textos livres.
* Não usar status para guardar observações.

### Exemplos

```txt
ativo
inativo
pendente
cancelado
concluido
em_aberto
em_analise
```

---

## 13. Campos booleanos

Campos booleanos devem ser claros.

### Regras

* Usar `TINYINT(1)` no MySQL.
* Usar `0` para falso.
* Usar `1` para verdadeiro.
* Nome do campo deve indicar claramente o significado.
* Não usar texto como `sim`, `nao`, `true` ou `false` no banco.

### Exemplos

```sql
ativo TINYINT(1) NOT NULL DEFAULT 1
visivel TINYINT(1) NOT NULL DEFAULT 1
confirmado TINYINT(1) NOT NULL DEFAULT 0
```

---

## 14. Campos de texto

### Regras

* Usar `VARCHAR` para textos curtos.
* Usar `TEXT` para textos longos.
* Definir tamanho do `VARCHAR` conforme necessidade.
* Não usar `TEXT` para tudo.
* Não usar `VARCHAR(255)` automaticamente em todos os campos.
* Não salvar JSON em campo de texto quando a estrutura deveria ser relacional.
* Usar `JSON` apenas quando fizer sentido real.

### Exemplos

```sql
nome VARCHAR(120) NOT NULL
email VARCHAR(180) NOT NULL
observacao TEXT NULL
```

---

## 15. Campos únicos

Usar `UNIQUE` quando o valor não puder se repetir.

### Exemplos comuns

```txt
email
documento
codigo_externo
slug
```

### Regras

* Criar `UNIQUE` apenas quando a regra exigir valor único.
* Não colocar `UNIQUE` em campo que pode se repetir.
* Avaliar se a unicidade é global ou por contexto.

Exemplo:

```txt
email único no sistema inteiro
nome único apenas dentro de uma turma
codigo único apenas por empresa
```

---

## 16. Índices

Índices devem ser criados para melhorar consultas reais.

### Criar índice em campos usados para:

* Busca frequente
* Filtro frequente
* Ordenação frequente
* Relacionamento
* Chave estrangeira
* Login
* Consulta por status
* Consulta por data

### Regras

* Não criar índice em todos os campos.
* Não criar índice sem motivo.
* Não criar índices duplicados.
* Índices melhoram leitura, mas podem prejudicar escrita se usados em excesso.
* Criar índices conforme consultas reais do projeto.

### Exemplos

```sql
INDEX idx_status (status)
INDEX idx_criado_em (criado_em)
INDEX idx_usuario_id (usuario_id)
```

---

## 17. Relacionamentos

Relacionamentos devem representar a realidade do projeto.

### Tipos comuns

```txt
1 para 1
1 para muitos
muitos para muitos
```

### Regras

* Usar chave estrangeira em relacionamento direto.
* Usar tabela intermediária em relacionamento muitos para muitos.
* Não duplicar dados que deveriam vir de relacionamento.
* Não criar relacionamento apenas por suposição.
* Não criar tabela intermediária sem necessidade real.

### Exemplo genérico de muitos para muitos

```txt
usuarios
grupos
usuarios_grupos
```

---

## 18. Exclusão de dados

Escolher entre exclusão física e exclusão lógica conforme necessidade.

### Exclusão física

Remove o registro do banco.

Usar quando:

* O dado não precisa de histórico.
* O dado é temporário.
* O dado foi criado por engano.
* Não há impacto em relatórios.

### Exclusão lógica

Mantém o registro e marca como excluído.

Campos comuns:

```txt
excluido_em
excluido_por
status
```

Usar quando:

* Precisa manter histórico.
* Precisa auditar alteração.
* Há impacto financeiro.
* Há impacto em relatórios.
* Há vínculo com outros registros.

---

## 19. Logs e auditoria

Logs devem registrar ações importantes.

### Boas práticas

* Criar logs apenas quando houver necessidade real.
* Registrar ações críticas.
* Registrar alterações sensíveis.
* Registrar falhas relevantes.
* Não registrar senha.
* Não registrar token secreto.
* Não registrar dados sensíveis desnecessários.

### Campos comuns

```txt
id
usuario_id
acao
entidade
entidade_id
ip
user_agent
detalhes
criado_em
```

---

## 20. Tabelas de fila

Filas devem ser usadas quando houver processamento assíncrono ou automação.

Criar tabela de fila apenas se o projeto precisar.

### Campos comuns

```txt
id
tipo
payload
status
tentativas
erro
criado_em
processado_em
```

### Status comuns

```txt
pendente
processando
processado
erro
cancelado
```

---

## 21. Tabelas de webhook

Criar tabela de webhook apenas se o projeto receber integrações externas.

### Campos comuns

```txt
id
origem
evento
payload
status
erro
recebido_em
processado_em
```

### Boas práticas

* Registrar recebimento.
* Registrar erro de processamento.
* Evitar processar o mesmo evento duas vezes.
* Guardar identificador externo quando existir.
* Usar idempotência quando necessário.

---

## 22. Arquivos SQL

Arquivos SQL devem ficar organizados.

### Estrutura recomendada

```txt
sql/
  schema.sql
  seed.sql
  migrations/
```

Criar apenas os arquivos necessários.

### Regras

* `schema.sql` deve conter estrutura inicial.
* `seed.sql` deve conter dados iniciais não sensíveis.
* `migrations/` deve conter alterações futuras.
* Não colocar dados reais sensíveis em seed.
* Não colocar senhas reais em arquivos SQL.
* Não versionar dump real de produção.

---

## 23. Migrações

Migrações devem registrar mudanças no banco ao longo do tempo.

Criar migrations apenas se o projeto precisar controlar evolução do banco.

### Boas práticas

* Uma mudança por arquivo quando possível.
* Nome do arquivo deve indicar a alteração.
* Usar data ou numeração no nome.
* Não alterar migration antiga já aplicada.
* Criar nova migration para novo ajuste.
* Documentar mudanças importantes.

### Exemplo de nome

```txt
2026-06-18-criar-tabela-usuarios.sql
2026-06-18-adicionar-status-em-pedidos.sql
```

---

## 24. Dados iniciais

Seeds devem conter apenas dados necessários para iniciar o projeto.

### Pode conter

* Perfis base
* Status padrão
* Configurações iniciais
* Categorias iniciais
* Dados de demonstração não sensíveis

### Não deve conter

* Senhas reais
* Dados pessoais reais
* Tokens
* Chaves secretas
* Dados de produção
* Informações privadas

---

## 25. Performance básica

O banco deve ser pensado para consultas simples e previsíveis.

### Boas práticas

* Criar índices em campos de busca real.
* Evitar consultas que retornam dados demais.
* Usar paginação em listas grandes.
* Evitar `SELECT *` em endpoints finais.
* Buscar apenas os campos necessários.
* Evitar joins desnecessários.
* Evitar tabelas com responsabilidades misturadas.
* Evitar campos calculados que podem ficar inconsistentes.

---

## 26. Integridade dos dados

O banco deve evitar dados quebrados.

### Boas práticas

* Usar `NOT NULL` quando o campo for obrigatório.
* Usar `DEFAULT` quando houver valor padrão claro.
* Usar chave estrangeira quando o vínculo for obrigatório.
* Validar status com lista controlada na aplicação.
* Evitar aceitar dados incompletos.
* Evitar registros órfãos.
* Usar transações em alterações relacionadas.

---

## 27. Segurança do banco

Regras detalhadas de segurança ficam em:

```txt
boas-praticas-seguranca.md
```

Regras básicas deste documento:

* Não salvar senha pura.
* Não salvar token secreto em texto exposto.
* Não usar usuário root na aplicação.
* Não versionar dados sensíveis.
* Não expor arquivos SQL reais publicamente.
* Não expor backups publicamente.
* Não concatenar input do usuário em SQL.
* Usar prepared statements na aplicação.

---

## 28. Regra para IA de coding

Antes de criar ou alterar banco de dados, a IA deve:

* Ler a descrição do produto.
* Ler os requisitos.
* Verificar o mockup quando houver impacto em dados.
* Criar apenas tabelas necessárias.
* Criar apenas campos necessários.
* Criar apenas relacionamentos necessários.
* Não inventar campos comuns sem evidência.
* Não criar estrutura futura sem solicitação.
* Manter nomes claros.
* Manter banco simples.
* Aplicar boas práticas deste documento.
* Respeitar os documentos de segurança, sintaxe e arquitetura.

---

## 29. Ordem recomendada para modelagem

Ao modelar o banco, seguir esta ordem:

1. Identificar entidades reais do projeto.
2. Identificar dados necessários para cada entidade.
3. Identificar relacionamentos reais.
4. Definir campos obrigatórios.
5. Definir status necessários.
6. Definir campos de controle necessários.
7. Definir índices necessários.
8. Definir tabelas auxiliares somente se necessário.
9. Criar SQL mínimo.
10. Revisar se não há excesso de estrutura.

---

## 30. Checklist antes de finalizar banco

Antes de finalizar qualquer alteração no banco, revisar:

* [ ] As tabelas foram derivadas do projeto real?
* [ ] Nenhuma tabela foi inventada sem necessidade?
* [ ] Nenhum campo foi criado sem uso claro?
* [ ] Os nomes estão em português, sem acentos e sem espaços?
* [ ] Todas as tabelas importantes possuem chave primária?
* [ ] Os relacionamentos necessários foram definidos?
* [ ] Não existem relacionamentos desnecessários?
* [ ] Campos obrigatórios usam `NOT NULL`?
* [ ] Valores padrão usam `DEFAULT` quando faz sentido?
* [ ] Status possuem valores previsíveis?
* [ ] Campos monetários usam `DECIMAL`?
* [ ] Datas usam tipos de data do MySQL?
* [ ] Índices foram criados apenas quando necessários?
* [ ] Não há dados sensíveis em seed ou SQL versionado?
* [ ] Não há senha pura no banco?
* [ ] A estrutura está simples e fácil de entender?
