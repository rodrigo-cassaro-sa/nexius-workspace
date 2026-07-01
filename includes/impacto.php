<?php

// impacto.php
// Sinalizacao de impacto de prioridade (D24). NAO altera prazos nem dados: so identifica
// tarefas "em risco de atraso" por concorrencia de prioridade. Fonte unica da heuristica,
// reaproveitada pelo Roadmap (via a lista), pelo detalhe da demanda e pelo Dashboard.
//
// Regra: uma acao esta "em risco" quando existe OUTRA acao do MESMO responsavel, com
// prioridade GUT (gravidade*urgencia*tendencia da demanda) estritamente MAIOR, cuja janela
// (criado_em -> prazo) se sobrepoe a dela. So considera acoes em aberto e com prazo.

// Ids das acoes em risco. $where_extra permite recortar (ex.: por responsavel ou demanda).
function acoes_em_risco_ids($where_extra = "", $tipos = "", $params = [])
{
    $sql = "SELECT DISTINCT a.id
            FROM acoes a
            JOIN demandas d ON d.id = a.demanda_id
            WHERE a.responsavel_id IS NOT NULL
              AND a.prazo IS NOT NULL
              AND a.status NOT IN ('concluida', 'cancelada')
              AND EXISTS (
                  SELECT 1 FROM acoes h
                  JOIN demandas dh ON dh.id = h.demanda_id
                  WHERE h.responsavel_id = a.responsavel_id
                    AND h.id <> a.id
                    AND h.prazo IS NOT NULL
                    AND h.status NOT IN ('concluida', 'cancelada')
                    AND COALESCE(dh.gut_gravidade * dh.gut_urgencia * dh.gut_tendencia, 0)
                        > COALESCE(d.gut_gravidade * d.gut_urgencia * d.gut_tendencia, 0)
                    AND DATE(h.criado_em) <= a.prazo
                    AND DATE(a.criado_em) <= h.prazo
              )" . $where_extra;

    $linhas = executar_select($sql, $tipos, $params);
    $ids = [];
    foreach ($linhas as $linha) {
        $ids[] = (int) $linha["id"];
    }
    return $ids;
}

// Quantas acoes em risco o usuario "enxerga" no Dashboard: Colaborador ve as suas
// (onde e o responsavel); Gestor/Admin veem o total da organizacao.
function contar_acoes_em_risco($usuario_id, $perfil)
{
    if ($perfil === "colaborador") {
        return count(acoes_em_risco_ids(" AND a.responsavel_id = ?", "i", [(int) $usuario_id]));
    }
    return count(acoes_em_risco_ids());
}

// Quantas acoes de uma demanda estao em risco (para o aviso no detalhe da demanda).
function contar_acoes_em_risco_da_demanda($demanda_id)
{
    return count(acoes_em_risco_ids(" AND a.demanda_id = ?", "i", [(int) $demanda_id]));
}
