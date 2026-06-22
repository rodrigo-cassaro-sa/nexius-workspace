# Review de Telas (design, identidade e utilidade)

Comparação das telas implementadas com o mockup (`mockup.png`) e o guia visual (`02-guia-visual.md`).
Dois padrões visuais do mockup:

- **Auth-layout** — faixa marrom com a marca + card branco. Telas sem login.
- **App shell** — sidebar marrom (Dashboard / Demandas / Usuários) + topbar + conteúdo. Telas internas.

## Telas reconhecidas no mockup

| # | Tela | Padrão | Status antes do review |
|---|---|---|---|
| 1 | Login | Auth-layout | ✅ ok |
| 2 | Setup do 1º admin | Auth-layout | ⚠️ padrão antigo (centralizado) |
| 3 | Aceite de convite (cadastro) | Auth-layout | ⚠️ padrão antigo (centralizado) |
| 4 | Recuperar senha | Auth-layout | ✅ ok |
| 5 | Redefinir senha | Auth-layout | ✅ ok |
| 6 | Onboarding | Auth-layout | ✅ ok |
| 7 | Dashboard | App shell | ✅ ok |
| 8 | Lista de demandas | App shell | ✅ ok |
| 9 | Detalhe da demanda / plano de ação | App shell | ✅ ok |
| 10 | Usuários (administração) | App shell | ⚠️ topbar antiga (sem sidebar) |
| 11 | Perfil | App shell | ⚠️ esqueleto sem shell |
| 12 | Notificações | App shell | ❌ não construída (depende da função de notificações) |

## Ajustes aplicados neste review

- **Setup** e **Cadastro (aceite)** migrados para o **auth-layout** (marca + card), com botão de mostrar/ocultar senha.
- **Usuários (administração)** migrada para o **app shell** (sidebar com "Usuários" ativo).
- **Perfil** migrada para o **app shell**, mostrando nome, e-mail e perfil, com alternância de tema e sair.
- **Acesso ao perfil** pela topbar: o nome do usuário vira link para a tela de Perfil em todas as telas internas.

## Identidade visual (já aplicada)

- Paleta Grupo Nexius (marrom `#4E392F`, cinza `#606062`, fundo `#F2F1EE`), tipografia Inter, tokens em `theme.css`.
- Componentes consistentes: cards, badges de status, botões, inputs, modais, skeleton, empty state.

## Pendências de design (próximas)

- **Notificações** (tela 12): construir quando a função de notificações entrar.
- **Perfil — edição**: alterar nome e senha exigem endpoints próprios (`usuarios/atualizar-perfil`, `usuarios/alterar-senha`), ainda não criados. Hoje a tela é de leitura + tema + sair.
- **Logo**: ainda é placeholder em texto "GRUPO NEXIUS" (aguardando o arquivo da logo).
- **Ícones**: Lucide via CDN previsto, mas ainda não incluído (ícones pontuais como o olho da senha são SVG inline).
