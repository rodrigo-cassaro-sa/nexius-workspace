<?php

// higiene.php
// "Painel de controle/higiene": lista o que esta FORA de controle (pontos cegos) - o cerne
// anti-fragil, pois o risco mora no que ninguem olha. Somente leitura. Visao gerencial
// (Gestor/Admin). Reaproveita as tabelas existentes; sem tabela nova.

// Demandas ativas SEM nenhuma acao (plano de acao inexistente) - somem do roadmap/prazos.
function higiene_demandas_sem_acao()
{
    return executar_select(
        "SELECT d.id, d.titulo, d.criado_em, s.nome AS setor_nome, uc.nome AS criador_nome
         FROM demandas d
         LEFT JOIN setores s ON s.id = d.setor_id
         LEFT JOIN usuarios uc ON uc.id = d.criador_id
         WHERE d.status IN ('aberta', 'em_andamento')
           AND NOT EXISTS (SELECT 1 FROM acoes a WHERE a.demanda_id = d.id AND a.status <> 'cancelada')
         ORDER BY d.criado_em ASC",
        "",
        []
    );
}

// Demandas ativas SEM responsavel (dono) - ninguem presta contas por elas.
function higiene_demandas_sem_responsavel()
{
    return executar_select(
        "SELECT d.id, d.titulo, d.criado_em, s.nome AS setor_nome
         FROM demandas d
         LEFT JOIN setores s ON s.id = d.setor_id
         WHERE d.status IN ('aberta', 'em_andamento') AND d.responsavel_id IS NULL
         ORDER BY d.criado_em ASC",
        "",
        []
    );
}

// Acoes pendentes SEM prazo - invisiveis ao controle de prazo (nao aparecem no roadmap).
function higiene_acoes_sem_prazo()
{
    return executar_select(
        "SELECT a.id, a.titulo, a.demanda_id, d.titulo AS demanda_titulo,
                a.responsavel_id, ur.nome AS responsavel_nome
         FROM acoes a
         JOIN demandas d ON d.id = a.demanda_id
         LEFT JOIN usuarios ur ON ur.id = a.responsavel_id
         WHERE a.status = 'pendente' AND a.prazo IS NULL
           AND d.status NOT IN ('arquivada', 'cancelada')
         ORDER BY a.id DESC",
        "",
        []
    );
}

// Acoes em aberto cujo responsavel esta INATIVO (orfas) - risco de bus factor.
function higiene_acoes_responsavel_inativo()
{
    return executar_select(
        "SELECT a.id, a.titulo, a.demanda_id, d.titulo AS demanda_titulo,
                a.responsavel_id, ur.nome AS responsavel_nome
         FROM acoes a
         JOIN demandas d ON d.id = a.demanda_id
         JOIN usuarios ur ON ur.id = a.responsavel_id
         WHERE a.status NOT IN ('concluida', 'cancelada')
           AND ur.ativo = 0
           AND d.status NOT IN ('arquivada', 'cancelada')
         ORDER BY a.id DESC",
        "",
        []
    );
}

// Demandas ativas PARADAS ha mais de N dias (sem acao concluida nem comentario recente).
function higiene_demandas_paradas($dias = 14)
{
    return executar_select(
        "SELECT d.id, d.titulo, s.nome AS setor_nome,
                GREATEST(
                    d.criado_em,
                    COALESCE((SELECT MAX(a.concluida_em) FROM acoes a WHERE a.demanda_id = d.id AND a.concluida_em IS NOT NULL), d.criado_em),
                    COALESCE((SELECT MAX(c.criado_em) FROM comentarios c JOIN acoes a2 ON a2.id = c.acao_id WHERE a2.demanda_id = d.id), d.criado_em)
                ) AS ultimo_movimento
         FROM demandas d
         LEFT JOIN setores s ON s.id = d.setor_id
         WHERE d.status IN ('aberta', 'em_andamento')
         HAVING ultimo_movimento < (NOW() - INTERVAL ? DAY)
         ORDER BY ultimo_movimento ASC",
        "i",
        [(int) $dias]
    );
}
