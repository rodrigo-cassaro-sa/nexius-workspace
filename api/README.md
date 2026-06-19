# api/

Endpoints JSON do MVP (PHP procedural). Cada endpoint tem responsabilidade única e segue a ordem padrão (validar método → entrada → login → permissão → ação → log → JSON), incluindo `../includes/bootstrap.php` no topo.

As subpastas e arquivos são criados por fase de implementação (ver `docs/arquitetura/01-arquitetura-mvp.md`, seção 7), não antecipadamente:

- `auth/` — login, logout, recuperar-senha, redefinir-senha, sessao
- `convites/` — criar, aceitar, listar, reenviar, cancelar
- `usuarios/` — listar, atualizar-perfil, alterar-senha, alterar-permissao, inativar
- `demandas/` — criar, listar, detalhe, atualizar, arquivar
- `acoes/` — criar, atualizar, concluir, arquivar
- `comentarios/` — listar, criar, editar
- `notificacoes/` — listar, marcar-lida, marcar-todas-lidas
- `dashboard/` — resumo

Esta pasta é acessível pela web (ao contrário de includes/, sql/, cron/ e logs/).
