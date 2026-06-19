# Guia Visual e Design System

Este documento define a identidade visual e o design system do Workspace S&A, o sistema da marca **Grupo Nexius**. Ele orienta a construção das telas em HTML, CSS e JavaScript puro.

Regras de uso deste documento:

- Os valores visuais (cores, espaçamentos, raios, transições) devem virar variáveis CSS em `theme.css`.
- Use `[ANEXAR LOGO]`, `[ANEXAR PALETA]` e `[ANEXAR REFERÊNCIAS]` onde for preciso anexar material.
- Use `[DECISÃO PENDENTE]` para escolhas em aberto.
- O visual é aplicado em SaaS web responsivo, com versão desktop e versão mobile pelo mesmo layout responsivo.
- Não usar Tailwind, Bootstrap, jQuery ou frameworks de UI. Apenas CSS puro.

---

## 1. Personalidade da marca

Profissional, organizada e confiável, alinhada à marca **Grupo Nexius**: tom institucional, sóbrio e elegante. O Workspace S&A passa a sensação de um ambiente de trabalho sério, onde demandas e responsabilidades ficam claras.

## 2. Emoção que a interface deve despertar

Confiança, seriedade e clareza. O usuário deve sentir controle sobre as demandas, sem ruído visual.

## 3. Estilo visual desejado

Corporativo sóbrio. Interface enxuta, com hierarquia clara, contraste comedido e poucos elementos decorativos. Cantos levemente arredondados, sem cores chamativas em excesso.

## 4. Referências visuais

Estética de ferramentas corporativas de gestão de tarefas/demandas, com layout de dashboard limpo.

O mockup de referência das telas fica em `mockups/mockup-telas.png` (ver `mockups/README.md`).

[ANEXAR REFERÊNCIAS]

## 5. Logo

A marca é **Grupo Nexius**. A logo definitiva será anexada depois. Por enquanto, reservar um espaço no topo (placeholder) com o texto "GRUPO NEXIUS" em estilo minimalista e institucional, na cor cinza da marca (`#606062`).

[ANEXAR LOGO]

- Versão principal: [PREENCHER]
- Versão para fundo escuro: [PREENCHER]
- Placeholder provisório: texto "GRUPO NEXIUS" com a fonte principal, discreto, em cinza `#606062`.

## 6. Paleta de cores

Paleta institucional do Grupo Nexius: marrom institucional (cor principal), cinza da marca (cor de apoio) e cinza claro quente (fundo). As cores funcionais (sucesso, erro, aviso, info) são suavizadas para combinar com o tom corporativo.

| Papel | Variável CSS | Valor |
|---|---|---|
| Cor primária (marrom institucional) | `--cor-primaria` | `#4E392F` |
| Primária (hover/escura) | `--cor-primaria-escura` | `#3A2A22` |
| Secundária (cinza da marca) | `--cor-secundaria` | `#606062` |
| Fundo (cinza claro quente) | `--cor-fundo` | `#F2F1EE` |
| Superfície / card | `--cor-superficie` | `#FFFFFF` |
| Borda | `--cor-borda` | `#E2E0DB` |
| Texto principal | `--cor-texto` | `#232830` |
| Texto secundário | `--cor-texto-secundario` | `#606062` |
| Sucesso | `--cor-sucesso` | `#2E7D52` |
| Erro | `--cor-erro` | `#B23B3B` |
| Aviso | `--cor-aviso` | `#B5852A` |
| Informação | `--cor-info` | `#2B5C8A` |

> Garantir contraste adequado de texto sobre fundo. Texto claro (`#FFFFFF`) sobre a cor primária (marrom); texto escuro (`--cor-texto`) sobre o fundo claro.

## 7. Tipografia

Fonte principal: **Inter** (sem serifa, alta legibilidade em telas).

- Fonte principal: Inter
- Fallback: `Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
- Tamanho base do texto: 16px
- Hierarquia sugerida:
  - Título de página (h1): 24px, peso 700
  - Subtítulo (h2): 20px, peso 600
  - Seção (h3): 18px, peso 600
  - Corpo: 16px, peso 400
  - Legenda/auxiliar: 14px, peso 400

## 8. Grid, layout e espaçamento

- Largura máxima do conteúdo: 1200px
- Escala de espaçamento (variáveis CSS):

```css
:root {
  --espaco-1: 4px;
  --espaco-2: 8px;
  --espaco-3: 12px;
  --espaco-4: 16px;
  --espaco-5: 24px;
  --espaco-6: 32px;

  --raio-pequeno: 6px;
  --raio-medio: 10px;
  --raio-grande: 14px;

  --transicao-rapida: 0.15s ease;
  --transicao-padrao: 0.2s ease;
}
```

## 9. Layout responsivo

- Abordagem: layout responsivo único (sem app nativo).
- Breakpoints sugeridos:
  - Mobile: até 640px
  - Tablet: 641px a 1024px
  - Desktop: acima de 1024px
- Navegação no desktop: barra superior (topbar) com identificação do usuário + menu lateral fixo (sidebar) com as áreas (Dashboard, Demandas, Notificações, Administração).
- Navegação no mobile: topbar com botão de menu (hambúrguer) que abre a sidebar como painel deslizante.
- Tabelas no mobile: a lista de ações vira cartões empilhados (um card por ação), em vez de tabela com rolagem horizontal.

## 10. Componentes principais

Criar apenas os componentes usados nas telas reais:

- Topbar e Sidebar (navegação)
- Card (demanda, ação, blocos do dashboard)
- Lista de ações (tabela no desktop, cards no mobile)
- Badge de status (demanda e ação)
- Botões (primário, secundário, perigo discreto)
- Formulário e campos
- Comentários (thread dentro da ação)
- Modal de confirmação
- Alerta/feedback (sucesso, erro, aviso, info)
- Estado vazio
- Loading / skeleton

## 11. Botões

- Tipos: primário (fundo marrom institucional `#4E392F`, texto branco), secundário (contorno/cinza), e ação destrutiva discreta (texto/contorno em `--cor-erro`, sem preenchimento forte).
- Estados: normal, hover, foco visível, desabilitado, carregando.
- Hover usa transição leve em `transform`/`box-shadow`, conforme boas práticas de animação.

## 12. Formulários

- Todo campo tem label visível.
- Campos obrigatórios identificados.
- Mensagens de erro abaixo do campo, em `--cor-erro`, curtas e claras.
- Tipos de input conforme o dado (text, email, password, date para prazo, select para status/responsável, textarea para descrição/comentário).

## 13. Cards

- Card de demanda: título, status (badge), responsável, progresso das ações (ex.: "3/5 concluídas") e prazo da ação chave quando houver.
- Card de ação (no mobile): título da ação, responsável, status, prazo e indicador de pré-requisito/bloqueio.
- Fundo `--cor-superficie`, borda `--cor-borda`, raio `--raio-medio`, espaçamento interno `--espaco-4`.

## 14. Tabelas

- A lista de ações de uma demanda é exibida como tabela no desktop (colunas: ação, responsável, prazo, status, chave/pré-requisito).
- Prever estado vazio e carregamento.
- No mobile, a tabela vira lista de cards (ver seção 9).
- Usar paginação quando a lista for grande.

## 15. Menus e navegação

- Áreas no menu: Dashboard, Demandas, Notificações, Administração (apenas Administrador), Perfil/Configurações.
- Item ativo destacado com a cor primária.
- O acesso real a cada área é validado no backend; esconder item de menu é apenas experiência, não segurança.

## 16. Modais

- Usar modal para confirmação de ações sensíveis (ex.: arquivar/cancelar demanda ou ação) e formulários curtos.
- Modal tem título claro, ação principal e botão de fechar/cancelar.
- Animação simples de entrada/saída com `opacity` e `transform`.

## 17. Alertas e feedbacks

- Tipos: sucesso, erro, aviso, informação.
- Componente reutilizável, com ícone + texto (não depender só de cor).
- Mensagens curtas. Não exibir erro técnico ao usuário.
- Exemplos: "Ação concluída.", "Não foi possível salvar.", "Conclua o pré-requisito antes de concluir esta ação."

## 18. Estados vazios

- Mostrar quando não houver demandas, ações, comentários ou notificações.
- Texto orientador + ação sugerida. Exemplos:
  - Demandas: "Nenhuma demanda ainda. Crie a primeira demanda."
  - Ações: "Esta demanda ainda não tem ações. Adicione a primeira ação."
  - Notificações: "Você está em dia. Nenhuma notificação."

## 19. Loading e skeleton

- Indicador leve de carregamento ao buscar dados.
- Skeleton nos cards/listas do dashboard e na lista de ações quando fizer sentido.
- Não usar a animação para esconder lentidão real da API.

## 20. Ícones

- Conjunto: **Lucide** (ícones outline, leves e sóbrios), carregado via **CDN** (dependência externa aprovada).
- Garantir alternativa acessível (texto/aria) caso o CDN falhe; não usar ícone como única informação.

## 21. Ilustrações

- Uso mínimo. Apenas em estados vazios e onboarding, se necessário, em tom sóbrio e alinhado à paleta.

## 22. Mascote

Não haverá mascote no MVP.

## 23. Animações e microinterações

- Preferir CSS; animar `opacity` e `transform`.
- Microinterações discretas: hover de botões, abertura de modal, abertura da sidebar no mobile, aparição de mensagens de feedback.
- Evitar movimento exagerado — coerente com o tom corporativo.

## 24. Acessibilidade visual

- Contraste adequado em texto e botões.
- Foco visível em elementos interativos.
- Não depender apenas de cor para status (usar texto/ícone no badge).
- No mobile, alvos de toque confortáveis.
- HTML semântico e `label` em todos os campos.

## 25. Modo claro e modo escuro

O MVP inclui **modo claro e modo escuro**. As cores viram variáveis CSS e o tema escuro sobrescreve essas variáveis (ex.: via atributo `data-tema="escuro"` na raiz). A preferência de tema é uma configuração visual simples e pode ser guardada em `localStorage` (não é dado sensível).

Tokens sugeridos para o tema escuro (ajustar na implementação para garantir contraste):

| Papel | Variável CSS | Claro | Escuro |
|---|---|---|---|
| Primária | `--cor-primaria` | `#4E392F` | `#A8836E` |
| Fundo | `--cor-fundo` | `#F2F1EE` | `#1C1A18` |
| Superfície / card | `--cor-superficie` | `#FFFFFF` | `#26231F` |
| Borda | `--cor-borda` | `#E2E0DB` | `#3A352F` |
| Texto principal | `--cor-texto` | `#232830` | `#ECEAE6` |
| Texto secundário | `--cor-texto-secundario` | `#606062` | `#A6A29B` |

As cores funcionais (sucesso, erro, aviso, info) podem ser mantidas, ajustando o brilho para manter contraste no fundo escuro.

## 26. Restrições visuais

- Sem Tailwind, Bootstrap, jQuery ou framework de UI.
- Sem biblioteca externa de animação sem aprovação.
- Não usar cores fora da paleta definida sem necessidade.
- Evitar excesso de `!important` e CSS inline desnecessário.
- Manter o tom sóbrio: evitar cores muito saturadas ou efeitos chamativos.

## 27. Decisões pendentes

- [ANEXAR LOGO] logo definitiva (placeholder em texto por enquanto).

Resolvidas: modo escuro entra no MVP (seção 25); ícones **Lucide** via CDN (seção 20).

---

## Checklist de validação

- [x] Este documento foi preenchido?
- [x] Está coerente com o MVP?
- [x] Está coerente com a stack?
- [x] Está coerente com as boas práticas?
- [x] Existem decisões pendentes? (apenas a logo definitiva e o CDN de ícones — itens de implementação)
