// demanda.js
// Detalhe da demanda: cabecalho, abas (Plano de acao / Informacoes),
// acoes (criar, concluir) e edicao/arquivamento da demanda.

let demandaId = 0;
let perfilUsuario = "";
let usuarioId = 0;
let demandaAtual = null;
let acoesAtuais = [];
let comentariosAtuais = [];
let comentariosAnexos = [];
let acoesAnexos = [];
let acoesParticipantes = [];
let acaoParaAssinar = null;
let acaoRecusando = 0;
let acaoGerenciandoParticipantes = 0;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  perfilUsuario = usuario.perfil;
  usuarioId = usuario.id;
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  document.getElementById("botao-det-fechar").addEventListener("click", function () { fecharModal("modal-acao-detalhe"); });
  document.getElementById("assinar-confirma").addEventListener("change", function () {
    document.getElementById("botao-assinar-confirmar").disabled = !this.checked;
  });
  document.getElementById("botao-assinar-cancelar").addEventListener("click", function () { fecharModal("modal-assinar"); });
  document.getElementById("botao-assinar-confirmar").addEventListener("click", confirmarAssinatura);
  document.getElementById("botao-recusar-cancelar").addEventListener("click", function () { fecharModal("modal-recusar"); });
  document.getElementById("botao-recusar-confirmar").addEventListener("click", confirmarRecusa);
  document.getElementById("botao-part-cancelar").addEventListener("click", function () { fecharModal("modal-participantes"); });
  document.getElementById("botao-part-confirmar").addEventListener("click", confirmarParticipantes);
  if (perfilUsuario === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  const parametros = new URLSearchParams(window.location.search);
  demandaId = parseInt(parametros.get("id"), 10) || 0;
  if (demandaId <= 0) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Demanda nao informada.");
    return;
  }

  await carregarTudo();
});

// (Abas removidas: a demanda tem uma unica visao, somente leitura.)

async function carregarTudo() {
  try {
    const resposta = await getApi("/api/demandas/detalhe.php?id=" + demandaId);
    document.getElementById("carregando").hidden = true;

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Nao foi possivel carregar a demanda.");
      return;
    }

    demandaAtual = resposta.data.demanda;
    document.getElementById("conteudo").hidden = false;
    mostrarAvisoRisco(parseInt(resposta.data.acoes_em_risco, 10) || 0);
    preencherCabecalho(demandaAtual);
    prepararGestor();
    registrarVisita();
    carregarAnexos();
    await carregarAcoes();
  } catch (erro) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Nao foi possivel carregar a demanda.");
  }
}

// Aviso de impacto de prioridade (D24): a demanda tem tarefa em risco de atraso.
function mostrarAvisoRisco(qtd) {
  const el = document.getElementById("aviso-risco");
  if (qtd > 0) {
    el.textContent = "⚠ Esta demanda tem " + qtd + (qtd === 1 ? " tarefa" : " tarefas")
      + " em risco de atraso: outra de maior prioridade concorre no mesmo período (mesmo responsável). Veja no Roadmap.";
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function preencherCabecalho(d) {
  document.getElementById("d-titulo").textContent = d.titulo;
  const badge = document.getElementById("d-status");
  badge.className = classeBadgeStatus(d.status);
  badge.textContent = rotuloStatus(d.status);
  document.getElementById("d-solicitante").textContent = d.criador_nome || "—";
  document.getElementById("d-responsavel-view").textContent = d.responsavel_nome || "—";
  document.getElementById("d-setor").textContent = d.setor_nome || "—";
  renderProjetoStat(d);
  document.getElementById("d-prazo-alvo-view").textContent = formatarPrazoAlvo(d.prazo_alvo);
  document.getElementById("d-solicitado-em").textContent = formatarDataHora(d.criado_em);

  const sla = calcularSlaBadge(d.criado_em, d.respondida_em);
  const elSla = document.getElementById("d-sla");
  elSla.textContent = sla.texto;
  elSla.className = sla.classe;
  elSla.title = d.respondida_em ? ("Respondida em " + formatarDataHora(d.respondida_em)) : "";

  // Prioridade GUT (G*U*T) como badge colorido.
  const prio = (parseInt(d.gut_gravidade, 10) || 0) * (parseInt(d.gut_urgencia, 10) || 0) * (parseInt(d.gut_tendencia, 10) || 0);
  const elPrio = document.getElementById("d-prioridade");
  elPrio.textContent = prio > 0 ? (prio + " · " + rotuloGut(prio)) : "—";
  elPrio.className = prio > 0 ? classeGut(prio) : "badge";

  // Questionario da demanda (6 perguntas).
  document.getElementById("d-problema").textContent = d.problema || "—";
  document.getElementById("d-impacto").textContent = d.impacto_operacional || "—";
  document.getElementById("d-risco").textContent = d.risco || "—";
  document.getElementById("d-afeta").textContent = d.afeta_outros || "—";
  document.getElementById("d-workaround").textContent = d.workaround || "—";
  document.getElementById("d-sugestao").textContent = d.sugestao_solucao || "—";

  // Triagem.
  document.getElementById("d-origem").textContent = d.origem || "—";
  document.getElementById("d-momento").textContent = d.momento_etapa || "—";
  document.getElementById("d-intencao").textContent = rotuloTriagem("intencao", d.intencao);
  document.getElementById("d-pilar").textContent = rotuloTriagem("pilar", d.pilar);
  document.getElementById("d-objetivo").textContent = rotuloTriagem("objetivo", d.objetivo);
}

// SLA de resposta (3 dias a partir da solicitacao). Respondida = 1a acao criada.
// Retorna { texto, classe (badge) }.
function calcularSlaBadge(criadoEm, respondidaEm) {
  if (!criadoEm) return { texto: "—", classe: "badge" };
  const criado = new Date(String(criadoEm).replace(" ", "T"));
  const prazo = new Date(criado.getTime() + 3 * 24 * 60 * 60 * 1000);

  if (respondidaEm) {
    const resp = new Date(String(respondidaEm).replace(" ", "T"));
    return resp <= prazo
      ? { texto: "Respondida no prazo", classe: "badge badge-sucesso" }
      : { texto: "Respondida fora do prazo", classe: "badge badge-aviso" };
  }
  const agora = new Date();
  if (agora > prazo) return { texto: "SLA vencido", classe: "badge badge-erro" };
  const dias = Math.ceil((prazo - agora) / (24 * 60 * 60 * 1000));
  return { texto: "Aguardando · vence em " + dias + "d", classe: "badge badge-info" };
}

// Rotulo da prioridade GUT: Alta >= 75, Media 25-74, Baixa < 25.
function rotuloGut(p) {
  if (p >= 75) return "Alta";
  if (p >= 25) return "Média";
  return "Baixa";
}

// Classe (badge) da prioridade GUT.
function classeGut(p) {
  if (p >= 75) return "badge badge-erro";
  if (p >= 25) return "badge badge-aviso";
  return "badge";
}

// Mapeia os valores (slug) da triagem para rotulos legiveis.
const ROTULOS_TRIAGEM = {
  intencao: { melhoria: "Melhoria", defeito: "Corrigir defeito", nova_solucao: "Nova solução" },
  pilar: { processo: "Processo", financeiro: "Financeiro", pessoas: "Pessoas", cliente: "Cliente" },
  objetivo: {
    reducao_custo: "Redução de custo",
    relevancia_marca: "Aumento da relevância da marca",
    organizacao_trabalho: "Organização do trabalho"
  }
};

function rotuloTriagem(tipo, valor) {
  return (ROTULOS_TRIAGEM[tipo] && ROTULOS_TRIAGEM[tipo][valor]) || valor || "—";
}

function prepararGestor() {
  const podeEditar = perfilUsuario === "administrador" || perfilUsuario === "gestor";
  if (!podeEditar) return;

  document.getElementById("botao-nova-acao").hidden = false;
  document.getElementById("botao-nova-acao").addEventListener("click", abrirNovaAcao);
  document.getElementById("botao-acao-cancelar").addEventListener("click", function () { fecharModal("modal-acao"); });
  document.getElementById("form-acao").addEventListener("submit", salvarAcao);

  // Arquivamento da demanda (acao de ciclo de vida; nao edita o conteudo).
  document.getElementById("demanda-acoes").hidden = false;
  document.getElementById("botao-arquivar").addEventListener("click", function () { abrirModal("modal-arquivar"); });

  // Reabrir demanda concluida (por engano): volta a em_andamento + reabre a acao chave.
  if (demandaAtual && demandaAtual.status === "concluida") {
    const btnReabrir = document.getElementById("botao-reabrir");
    btnReabrir.hidden = false;
    btnReabrir.addEventListener("click", reabrirDemanda);
  }

  // Editar demanda (conteudo: titulo, status, questionario, triagem, GUT).
  document.getElementById("botao-editar-demanda").addEventListener("click", abrirEditarDemanda);
  document.getElementById("botao-editar-cancelar").addEventListener("click", function () { fecharModal("modal-editar"); });
  document.getElementById("form-editar").addEventListener("submit", salvarEditarDemanda);
  document.getElementById("botao-arquivar-cancelar").addEventListener("click", function () { fecharModal("modal-arquivar"); });
  document.getElementById("botao-arquivar-confirmar").addEventListener("click", arquivar);

  // Mover a demanda para um projeto (vincular/desvincular) - melhoria #3.
  document.getElementById("demanda-projeto-mover").hidden = false;
  carregarProjetosMover();
  document.getElementById("botao-salvar-projeto").addEventListener("click", salvarProjetoDemanda);
}

// Exibe o projeto da demanda no cabecalho (link para a tela do projeto, ou "—").
function renderProjetoStat(d) {
  const alvo = document.getElementById("d-projeto");
  alvo.innerHTML = "";
  if (d.projeto_id) {
    const a = document.createElement("a");
    a.href = "projeto.html?id=" + d.projeto_id;
    a.textContent = d.projeto_nome || ("#" + d.projeto_id);
    alvo.appendChild(a);
  } else {
    alvo.textContent = "—";
  }
}

// Popula o select de "mover para projeto" e pre-seleciona o projeto atual da demanda.
async function carregarProjetosMover() {
  const select = document.getElementById("d-projeto-select");
  try {
    const resposta = await getApi("/api/projetos/listar.php");
    if (resposta.ok) {
      resposta.data.projetos.forEach(function (p) {
        const o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.nome;
        select.appendChild(o);
      });
    }
  } catch (erro) {
    // Mantem "Sem projeto".
  }
  if (demandaAtual && demandaAtual.projeto_id) {
    select.value = demandaAtual.projeto_id;
  }
  document.getElementById("d-prazo-alvo").value =
    demandaAtual && demandaAtual.prazo_alvo ? String(demandaAtual.prazo_alvo).substring(0, 10) : "";

  // Responsavel (dono) da demanda: popula usuarios e pre-seleciona o atual.
  const selResp = document.getElementById("d-responsavel-select");
  try {
    const ru = await getApi("/api/usuarios/listar.php");
    if (ru.ok) {
      ru.data.usuarios.forEach(function (u) {
        const o = document.createElement("option");
        o.value = u.id;
        o.textContent = u.nome;
        selResp.appendChild(o);
      });
    }
  } catch (erro) {
    // Mantem "Sem responsável".
  }
  if (demandaAtual && demandaAtual.responsavel_id) {
    selResp.value = demandaAtual.responsavel_id;
  }
}

// Salva o projeto e/ou o prazo alvo da demanda (envia so o que mudou).
async function salvarProjetoDemanda() {
  const botao = document.getElementById("botao-salvar-projeto");
  const select = document.getElementById("d-projeto-select");
  const selResp = document.getElementById("d-responsavel-select");
  const valorProjeto = select.value;
  const valorPrazo = document.getElementById("d-prazo-alvo").value;
  const valorResp = selResp.value;

  const projetoAtual = demandaAtual.projeto_id ? String(demandaAtual.projeto_id) : "";
  const prazoAtual = demandaAtual.prazo_alvo ? String(demandaAtual.prazo_alvo).substring(0, 10) : "";
  const respAtual = demandaAtual.responsavel_id ? String(demandaAtual.responsavel_id) : "";

  definirCarregando(botao, true);
  try {
    if (valorResp !== respAtual) {
      const rr = await postApi("/api/demandas/definir-responsavel.php", { id: demandaId, responsavel_id: valorResp });
      if (!rr.ok) {
        mostrarErro("mensagem", rr.error || "Nao foi possivel atualizar o responsável.");
        definirCarregando(botao, false);
        return;
      }
      demandaAtual.responsavel_id = valorResp ? parseInt(valorResp, 10) : null;
      demandaAtual.responsavel_nome = valorResp ? selResp.options[selResp.selectedIndex].textContent : null;
      document.getElementById("d-responsavel-view").textContent = demandaAtual.responsavel_nome || "—";
    }
    if (valorProjeto !== projetoAtual) {
      const rp = await postApi("/api/demandas/definir-projeto.php", { id: demandaId, projeto_id: valorProjeto });
      if (!rp.ok) {
        mostrarErro("mensagem", rp.error || "Nao foi possivel atualizar o projeto.");
        definirCarregando(botao, false);
        return;
      }
      demandaAtual.projeto_id = valorProjeto ? parseInt(valorProjeto, 10) : null;
      demandaAtual.projeto_nome = valorProjeto ? select.options[select.selectedIndex].textContent : null;
      renderProjetoStat(demandaAtual);
    }
    if (valorPrazo !== prazoAtual) {
      const rd = await postApi("/api/demandas/definir-prazo.php", { id: demandaId, prazo: valorPrazo });
      if (!rd.ok) {
        mostrarErro("mensagem", rd.error || "Nao foi possivel atualizar o prazo.");
        definirCarregando(botao, false);
        return;
      }
      demandaAtual.prazo_alvo = valorPrazo || null;
      document.getElementById("d-prazo-alvo-view").textContent = valorPrazo ? formatarPrazoAlvo(valorPrazo) : "—";
    }
    definirCarregando(botao, false);
    mostrarSucesso("mensagem", "Demanda atualizada.");
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel atualizar a demanda.");
    definirCarregando(botao, false);
  }
}

// Formata AAAA-MM-DD como DD/MM/AAAA (prazo alvo).
function formatarPrazoAlvo(iso) {
  if (!iso) return "—";
  const s = String(iso).substring(0, 10).split("-");
  return s.length === 3 ? (s[2] + "/" + s[1] + "/" + s[0]) : "—";
}

// Abre o modal de edicao da demanda pre-preenchido com o conteudo atual.
function abrirEditarDemanda() {
  const d = demandaAtual;
  document.getElementById("editar-mensagem").hidden = true;
  document.getElementById("ed-titulo").value = d.titulo || "";
  document.getElementById("ed-status").value = (d.status === "aberta" || d.status === "em_andamento") ? d.status : "em_andamento";
  document.getElementById("ed-origem").value = d.origem || "";
  document.getElementById("ed-momento").value = d.momento_etapa || "";
  document.getElementById("ed-intencao").value = d.intencao || "";
  document.getElementById("ed-pilar").value = d.pilar || "";
  document.getElementById("ed-objetivo").value = d.objetivo || "";
  document.getElementById("ed-problema").value = d.problema || "";
  document.getElementById("ed-impacto").value = d.impacto_operacional || "";
  document.getElementById("ed-risco").value = d.risco || "";
  document.getElementById("ed-afeta").value = d.afeta_outros || "";
  document.getElementById("ed-workaround").value = d.workaround || "";
  document.getElementById("ed-sugestao").value = d.sugestao_solucao || "";
  document.getElementById("ed-gut-gravidade").value = String(d.gut_gravidade || 3);
  document.getElementById("ed-gut-urgencia").value = String(d.gut_urgencia || 3);
  document.getElementById("ed-gut-tendencia").value = String(d.gut_tendencia || 3);
  abrirModal("modal-editar");
}

async function salvarEditarDemanda(evento) {
  evento.preventDefault();
  const botao = document.getElementById("botao-editar-salvar");
  const titulo = document.getElementById("ed-titulo").value.trim();

  const campos = {
    problema: valEd("ed-problema"),
    impacto_operacional: valEd("ed-impacto"),
    risco: valEd("ed-risco"),
    afeta_outros: valEd("ed-afeta"),
    workaround: valEd("ed-workaround"),
    sugestao_solucao: valEd("ed-sugestao")
  };
  const triagem = {
    origem: valEd("ed-origem"),
    momento_etapa: valEd("ed-momento"),
    intencao: document.getElementById("ed-intencao").value,
    pilar: document.getElementById("ed-pilar").value,
    objetivo: document.getElementById("ed-objetivo").value
  };
  const gut = {
    gut_gravidade: parseInt(document.getElementById("ed-gut-gravidade").value, 10) || 0,
    gut_urgencia: parseInt(document.getElementById("ed-gut-urgencia").value, 10) || 0,
    gut_tendencia: parseInt(document.getElementById("ed-gut-tendencia").value, 10) || 0
  };

  if (!tamanhoEntre(titulo, 2, 160)) {
    mostrarErro("editar-mensagem", "Informe um título (2 a 160 caracteres).");
    return;
  }
  if (Object.keys(campos).some(function (k) { return campos[k].length < 2; })) {
    mostrarErro("editar-mensagem", "Responda todas as 6 perguntas obrigatórias.");
    return;
  }
  if (triagem.origem.length < 2 || triagem.momento_etapa.length < 2) {
    mostrarErro("editar-mensagem", "Preencha \"Onde?\" e \"Em qual momento ou etapa?\".");
    return;
  }
  if (!triagem.intencao || !triagem.pilar || !triagem.objetivo) {
    mostrarErro("editar-mensagem", "Selecione intenção, pilar e objetivo na triagem.");
    return;
  }

  definirCarregando(botao, true);
  try {
    const dados = Object.assign(
      { id: demandaId, titulo: titulo, status: document.getElementById("ed-status").value },
      campos, triagem, gut
    );
    const r = await postApi("/api/demandas/atualizar.php", dados);
    if (!r.ok) {
      mostrarErro("editar-mensagem", r.error || "Não foi possível salvar a demanda.");
      definirCarregando(botao, false);
      return;
    }
    definirCarregando(botao, false);
    fecharModal("modal-editar");
    await carregarTudo();
  } catch (e) {
    mostrarErro("editar-mensagem", "Não foi possível salvar a demanda.");
    definirCarregando(botao, false);
  }
}

function valEd(id) {
  return document.getElementById(id).value.trim();
}

// Reabre a demanda concluida (Gestor/Admin): volta a em_andamento e reabre a acao chave.
async function reabrirDemanda() {
  if (!confirm("Reabrir esta demanda? Ela volta para \"em andamento\" e a ação chave volta a pendente.")) {
    return;
  }
  try {
    const r = await postApi("/api/demandas/reabrir.php", { id: demandaId });
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível reabrir a demanda.");
      return;
    }
    await carregarTudo();
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível reabrir a demanda.");
  }
}

async function carregarAcoes() {
  const alvo = document.getElementById("lista-acoes");
  mostrarCarregando("lista-acoes", 3);

  try {
    // Carrega acoes, comentarios, anexos (de comentario e de acao) e participantes juntos.
    const [respAcoes, respComent, respAnexos, respAnexosAcao, respPart] = await Promise.all([
      getApi("/api/acoes/listar.php?demanda_id=" + demandaId),
      getApi("/api/comentarios/listar-demanda.php?demanda_id=" + demandaId),
      getApi("/api/anexos/listar-comentarios.php?demanda_id=" + demandaId),
      getApi("/api/anexos/listar-acoes.php?demanda_id=" + demandaId),
      getApi("/api/acoes/participantes.php?demanda_id=" + demandaId)
    ]);

    if (!respAcoes.ok) {
      alvo.textContent = "Nao foi possivel carregar as ações.";
      return;
    }

    acoesAtuais = respAcoes.data.acoes;
    comentariosAtuais = (respComent && respComent.ok) ? respComent.data.comentarios : [];
    comentariosAnexos = (respAnexos && respAnexos.ok) ? respAnexos.data.anexos : [];
    acoesAnexos = (respAnexosAcao && respAnexosAcao.ok) ? respAnexosAcao.data.anexos : [];
    acoesParticipantes = (respPart && respPart.ok) ? respPart.data.participantes : [];
    atualizarPrazoChave();
    atualizarStatusCabecalho();
    renderizarDecisoesReunioes();

    if (acoesAtuais.length === 0) {
      mostrarVazio("lista-acoes", "Nenhuma ação ainda. Crie a primeira ação do plano.");
      return;
    }

    renderizarAcoes(alvo, acoesAtuais);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as ações.";
  }
}

function atualizarPrazoChave() {
  const chave = acoesAtuais.find(function (a) { return parseInt(a.chave, 10) === 1; });
  const el = document.getElementById("d-prazo");
  const prazoChave = (chave && chave.prazo) ? chave.prazo.substring(0, 10) : null;
  el.textContent = prazoChave ? prazoChave : "—";

  // Previsao x meta: se a previsao (prazo da acao chave) passa do prazo alvo da demanda, alerta.
  const alvo = demandaAtual && demandaAtual.prazo_alvo ? String(demandaAtual.prazo_alvo).substring(0, 10) : null;
  const aviso = document.getElementById("aviso-meta");
  if (aviso) {
    if (prazoChave && alvo && prazoChave > alvo) {
      el.classList.add("prazo-atrasado");
      aviso.textContent = "⚠ Previsão da entrega (" + formatarPrazoAlvo(prazoChave) + ") passa da meta da demanda (" + formatarPrazoAlvo(alvo) + ").";
      aviso.hidden = false;
    } else {
      el.classList.remove("prazo-atrasado");
      aviso.hidden = true;
    }
  }
}

// Status exibido no cabecalho: se concluida, mostra concluida;
// senao, se houver acao atrasada, mostra "Atrasada"; senao o status real.
function atualizarStatusCabecalho() {
  const badge = document.getElementById("d-status");
  if (demandaAtual.status === "concluida") {
    return;
  }

  const hoje = new Date().toISOString().substring(0, 10);
  const temAtrasada = acoesAtuais.some(function (a) {
    return a.prazo && a.prazo.substring(0, 10) < hoje && a.status !== "concluida" && a.status !== "cancelada";
  });

  if (temAtrasada) {
    badge.className = "badge badge-erro";
    badge.textContent = "Atrasada";
  }
}

function statusDerivado(a) {
  if (a.status === "pendente" && parseInt(a.prereq_pendentes, 10) > 0) {
    return "bloqueada";
  }
  return a.status;
}

function renderizarAcoes(alvo, acoes) {
  alvo.innerHTML = "";

  acoes.forEach(function (a, indice) {
    const item = document.createElement("div");
    item.className = "acao-item";
    if (parseInt(a.chave, 10) === 1) {
      item.classList.add("acao-item-chave");
    }

    // Cabecalho: numero + titulo (+ chave), meta (responsavel/prazo) e status/concluir.
    const cab = document.createElement("div");
    cab.className = "acao-cabecalho";

    const info = document.createElement("div");
    info.className = "acao-info";

    const linha = document.createElement("div");
    linha.className = "acao-titulo-linha";
    const nome = document.createElement("span");
    nome.className = "acao-nome";
    nome.textContent = (indice + 1) + ". " + a.titulo;
    linha.appendChild(nome);
    const bt = document.createElement("span");
    bt.className = "badge badge-tipo";
    bt.textContent = rotuloTipoAcao(a.tipo);
    linha.appendChild(bt);
    if (parseInt(a.chave, 10) === 1) {
      const bc = document.createElement("span");
      bc.className = "badge badge-chave";
      bc.textContent = "Ação chave";
      linha.appendChild(bc);
    }
    info.appendChild(linha);

    const meta = document.createElement("div");
    meta.className = "acao-meta";
    const resp = document.createElement("span");
    resp.textContent = "Responsável: " + (a.responsavel_nome || "—");
    const prazo = document.createElement("span");
    prazo.textContent = "Prazo: " + (a.prazo ? a.prazo.substring(0, 10) : "—");
    meta.appendChild(resp);
    meta.appendChild(prazo);
    info.appendChild(meta);

    // Pessoas envolvidas (reuniao).
    const participantes = montarParticipantesDaAcao(a.id);
    if (participantes) {
      info.appendChild(participantes);
    }

    // Motivo da recusa (tarefas de entrega recusadas).
    if (a.status === "recusada" && a.motivo_recusa) {
      const nota = document.createElement("p");
      nota.className = "acao-recusa";
      nota.textContent = "Recusada: " + a.motivo_recusa;
      info.appendChild(nota);
    }

    // Evidencias (anexos da acao, ex.: arquivo de analise).
    const evidencias = montarAnexosDaAcao(a.id);
    if (evidencias) {
      info.appendChild(evidencias);
    }

    // Rodape: "Ver detalhes" (abre popup e marca visualizado) + contador de vistos.
    const rodape = document.createElement("div");
    rodape.className = "acao-rodape";

    const btnDet = document.createElement("button");
    btnDet.className = "botao-link";
    btnDet.type = "button";
    btnDet.textContent = "Ver detalhes";

    const vistos = document.createElement("span");
    vistos.className = "acao-vistos texto-secundario";
    atualizarContadorVistos(vistos, parseInt(a.total_visualizacoes, 10) || 0);

    btnDet.addEventListener("click", function () { abrirDetalheAcao(a, vistos); });

    rodape.appendChild(btnDet);
    rodape.appendChild(vistos);

    // Tornar chave: gestor/admin, apenas em acoes que ainda nao sao a chave
    // e que nao estejam concluidas/canceladas (a chave e o marco a concluir).
    if ((perfilUsuario === "administrador" || perfilUsuario === "gestor")
      && parseInt(a.chave, 10) !== 1
      && a.status !== "concluida" && a.status !== "cancelada") {
      const btnChave = document.createElement("button");
      btnChave.className = "botao-link";
      btnChave.type = "button";
      btnChave.textContent = "★ Tornar chave";
      btnChave.addEventListener("click", function () { tornarChave(a.id); });
      rodape.appendChild(btnChave);
    }

    // Gerenciar participantes: so reuniao, para Gestor/Admin ou o responsavel,
    // e enquanto a acao nao estiver concluida/recusada/cancelada.
    const podeGerenciarPart = a.tipo === "reuniao"
      && a.status !== "concluida" && a.status !== "recusada" && a.status !== "cancelada"
      && (perfilUsuario === "administrador" || perfilUsuario === "gestor"
          || parseInt(a.responsavel_id, 10) === usuarioId);

    if (podeGerenciarPart) {
      const btnPart = document.createElement("button");
      btnPart.className = "botao-link";
      btnPart.type = "button";
      btnPart.textContent = "Gerenciar participantes";
      btnPart.addEventListener("click", function () { abrirGerenciarParticipantes(a); });
      rodape.appendChild(btnPart);
    }

    info.appendChild(rodape);

    cab.appendChild(info);

    const statusArea = document.createElement("div");
    statusArea.className = "acao-status-area";
    const derivado = statusDerivado(a);
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(derivado);
    badge.textContent = rotuloStatus(derivado);
    statusArea.appendChild(badge);

    if (derivado === "bloqueada") {
      const nota = document.createElement("span");
      nota.className = "texto-secundario";
      nota.textContent = "Aguardando pré-requisito";
      statusArea.appendChild(nota);
    }

    // Concluir: o responsavel OU o key user do setor da demanda (melhoria #5),
    // com acao pendente e sem pre-requisito pendente.
    const ehKeyUser = demandaAtual && demandaAtual.setor_responsavel_id
      && parseInt(demandaAtual.setor_responsavel_id, 10) === usuarioId;
    const podeConcluir = (parseInt(a.responsavel_id, 10) === usuarioId || ehKeyUser)
      && a.status === "pendente"
      && parseInt(a.prereq_pendentes, 10) === 0;

    if (podeConcluir) {
      const botao = document.createElement("button");
      botao.className = "botao botao-secundario";
      botao.type = "button";
      botao.textContent = "Concluir";
      botao.addEventListener("click", function () { abrirAssinatura(a); });
      statusArea.appendChild(botao);
    }

    // Recusar: so tarefa de ENTREGA pendente, e so Gestor/Admin (D19).
    const podeRecusar = a.tipo === "entrega"
      && a.status === "pendente"
      && (perfilUsuario === "administrador" || perfilUsuario === "gestor");

    if (podeRecusar) {
      const btnRec = document.createElement("button");
      btnRec.className = "botao botao-secundario";
      btnRec.type = "button";
      btnRec.textContent = "Recusar";
      btnRec.addEventListener("click", function () { abrirRecusa(a); });
      statusArea.appendChild(btnRec);
    }

    // Reabrir: tarefa recusada volta a pendente para retomar o fluxo. So Gestor/Admin (melhoria #4).
    const podeReabrir = a.status === "recusada"
      && (perfilUsuario === "administrador" || perfilUsuario === "gestor");

    if (podeReabrir) {
      const btnReabrir = document.createElement("button");
      btnReabrir.className = "botao botao-secundario";
      btnReabrir.type = "button";
      btnReabrir.textContent = "Reabrir";
      btnReabrir.addEventListener("click", function () { reabrirAcao(a); });
      statusArea.appendChild(btnReabrir);
    }

    cab.appendChild(statusArea);
    item.appendChild(cab);

    // Comentarios desta acao, recuados abaixo dela (estilo forum).
    item.appendChild(montarComentariosDaAcao(a));

    alvo.appendChild(item);
  });
}

// Conclusao com assinatura (declaracao + 1 clique): abre o modal de confirmacao.
// Para tarefa de analise, exibe o campo de arquivo de evidencia (obrigatorio).
function abrirAssinatura(a) {
  acaoParaAssinar = a;
  document.getElementById("assinar-acao").textContent = "Ação: " + a.titulo;
  document.getElementById("assinar-confirma").checked = false;
  document.getElementById("botao-assinar-confirmar").disabled = true;
  document.getElementById("assinar-mensagem").hidden = true;

  const areaAnexo = document.getElementById("assinar-anexo");
  const inputAnexo = document.getElementById("assinar-arquivos");
  inputAnexo.value = "";
  areaAnexo.hidden = !tipoExigeAnexo(a.tipo);

  // Rotulo conforme o tipo: ata (reuniao) ou arquivo de analise.
  if (tipoExigeAnexo(a.tipo)) {
    const ehReuniao = a.tipo === "reuniao";
    document.getElementById("assinar-anexo-label").textContent =
      (ehReuniao ? "Ata da reunião" : "Arquivo de análise") + " (obrigatório) *";
    document.getElementById("assinar-anexo-ajuda").textContent =
      ehReuniao
        ? "A reunião só é concluída com a ata anexada."
        : "A análise só é concluída com um arquivo de evidência anexado.";
  }

  // Reuniao: campo obrigatorio de decisoes/regras tomadas.
  const areaDec = document.getElementById("assinar-decisoes-area");
  areaDec.hidden = (a.tipo !== "reuniao");
  document.getElementById("assinar-decisoes").value = "";

  abrirModal("modal-assinar");
}

async function confirmarAssinatura() {
  if (!acaoParaAssinar) return;

  if (!document.getElementById("assinar-confirma").checked) {
    mostrarErro("assinar-mensagem", "Marque a confirmação para assinar.");
    return;
  }

  const ehAnalise = tipoExigeAnexo(acaoParaAssinar.tipo);
  const arquivos = document.getElementById("assinar-arquivos").files;

  if (ehAnalise) {
    if (!arquivos || arquivos.length === 0) {
      const oque = acaoParaAssinar.tipo === "reuniao" ? "a ata da reunião" : "o arquivo de análise";
      mostrarErro("assinar-mensagem", "Anexe " + oque + " para concluir.");
      return;
    }
    const erroAnexo = validarAnexosCliente(arquivos);
    if (erroAnexo) {
      mostrarErro("assinar-mensagem", erroAnexo);
      return;
    }
  }

  // Reuniao: decisoes/regras obrigatorias.
  const ehReuniao = acaoParaAssinar.tipo === "reuniao";
  let decisoes = "";
  if (ehReuniao) {
    decisoes = document.getElementById("assinar-decisoes").value.trim();
    if (decisoes === "") {
      mostrarErro("assinar-mensagem", "Registre as decisões/regras tomadas na reunião.");
      return;
    }
  }

  const botao = document.getElementById("botao-assinar-confirmar");
  definirCarregando(botao, true);

  try {
    // Analise: envia a evidencia ANTES de concluir (o backend exige o anexo).
    if (ehAnalise) {
      const erroEnvio = await enviarAnexosAcao(acaoParaAssinar.id, arquivos);
      if (erroEnvio) {
        mostrarErro("assinar-mensagem", erroEnvio);
        definirCarregando(botao, false);
        return;
      }
    }

    const corpo = { id: acaoParaAssinar.id, assinado: true };
    if (ehReuniao) corpo.decisoes = decisoes;

    const resposta = await postApi("/api/acoes/concluir.php", corpo);
    if (!resposta.ok) {
      mostrarErro("assinar-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    fecharModal("modal-assinar");
    definirCarregando(botao, false);
    await carregarTudo();
  } catch (erro) {
    mostrarErro("assinar-mensagem", "Nao foi possivel concluir a ação.");
    definirCarregando(botao, false);
  }
}

// Recusa de entrega (Gestor/Admin): abre o modal pedindo o motivo.
function abrirRecusa(a) {
  acaoRecusando = a.id;
  document.getElementById("recusar-acao").textContent = "Entrega: " + a.titulo;
  document.getElementById("recusar-motivo").value = "";
  document.getElementById("recusar-mensagem").hidden = true;
  abrirModal("modal-recusar");
}

async function confirmarRecusa() {
  if (acaoRecusando <= 0) return;

  const motivo = document.getElementById("recusar-motivo").value.trim();
  if (motivo.length < 3) {
    mostrarErro("recusar-mensagem", "Explique o motivo da recusa.");
    return;
  }

  const botao = document.getElementById("botao-recusar-confirmar");
  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/acoes/recusar.php", { id: acaoRecusando, motivo: motivo });
    if (!resposta.ok) {
      mostrarErro("recusar-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    fecharModal("modal-recusar");
    definirCarregando(botao, false);
    await carregarTudo();
  } catch (erro) {
    mostrarErro("recusar-mensagem", "Nao foi possivel recusar a entrega.");
    definirCarregando(botao, false);
  }
}

// Reabre uma tarefa recusada (Gestor/Admin): volta a pendente para retomar o fluxo.
async function reabrirAcao(a) {
  if (!confirm("Reabrir esta tarefa? Ela volta para pendente e o responsável poderá concluí-la novamente.")) {
    return;
  }
  try {
    const resposta = await postApi("/api/acoes/reabrir.php", { id: a.id });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Nao foi possivel reabrir a tarefa.");
      return;
    }
    await carregarTudo();
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel reabrir a tarefa.");
  }
}

// Rotulo amigavel do tipo da tarefa.
function rotuloTipoAcao(tipo) {
  const mapa = {
    analise: "Análise",
    desenvolvimento: "Desenvolvimento",
    entrega: "Entrega",
    incidente: "Incidente",
    reuniao: "Reunião"
  };
  return mapa[tipo] || "Tarefa";
}

// Tipos cuja conclusao exige anexo (espelha o backend): analise e reuniao.
function tipoExigeAnexo(tipo) {
  return tipo === "analise" || tipo === "reuniao";
}

// Monta a lista de evidencias (anexos) de uma acao, ou null se nao houver.
// Renderiza a secao "Decisoes das reunioes" da demanda (reunioes concluidas com texto).
function renderizarDecisoesReunioes() {
  const card = document.getElementById("card-decisoes");
  const alvo = document.getElementById("lista-decisoes");
  if (!card || !alvo) return;

  const reunioes = acoesAtuais.filter(function (a) {
    return a.tipo === "reuniao" && a.status === "concluida" && a.decisoes;
  });

  alvo.innerHTML = "";
  if (reunioes.length === 0) {
    card.hidden = true;
    return;
  }

  reunioes.forEach(function (a) {
    const bloco = document.createElement("div");
    bloco.className = "decisao-item";

    const titulo = document.createElement("p");
    titulo.className = "decisao-titulo";
    titulo.textContent = a.titulo;
    bloco.appendChild(titulo);

    const texto = document.createElement("p");
    texto.className = "decisao-texto";
    texto.textContent = a.decisoes;
    bloco.appendChild(texto);

    // Link para a ata (anexo da acao), se houver.
    const atas = acoesAnexos.filter(function (x) {
      return parseInt(x.acao_id, 10) === parseInt(a.id, 10);
    });
    if (atas.length > 0) {
      const link = document.createElement("a");
      link.className = "decisao-ata";
      link.href = "/api/anexos/baixar.php?id=" + atas[0].id;
      link.textContent = "Baixar ata: " + atas[0].nome_original;
      bloco.appendChild(link);
    }

    alvo.appendChild(bloco);
  });

  card.hidden = false;
}

// Linha com as pessoas envolvidas (participantes) de uma acao, ou null se nao houver.
function montarParticipantesDaAcao(acaoId) {
  const daAcao = acoesParticipantes.filter(function (p) {
    return parseInt(p.acao_id, 10) === parseInt(acaoId, 10);
  });
  if (daAcao.length === 0) return null;

  const linha = document.createElement("p");
  linha.className = "acao-participantes texto-secundario";
  linha.textContent = "Envolvidos: " + daAcao.map(function (p) { return p.nome; }).join(", ");
  return linha;
}

// Abre o modal para incluir/remover participantes de uma reuniao (pre-marca os atuais).
async function abrirGerenciarParticipantes(a) {
  acaoGerenciandoParticipantes = a.id;
  document.getElementById("part-acao").textContent = "Reunião: " + a.titulo;
  document.getElementById("part-mensagem").hidden = true;

  const atuais = acoesParticipantes
    .filter(function (p) { return parseInt(p.acao_id, 10) === parseInt(a.id, 10); })
    .map(function (p) { return parseInt(p.usuario_id, 10); });

  const select = document.getElementById("part-usuarios");
  select.innerHTML = "";
  try {
    const resposta = await getApi("/api/usuarios/listar.php");
    if (resposta.ok) {
      resposta.data.usuarios.forEach(function (u) {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.nome;
        if (atuais.indexOf(parseInt(u.id, 10)) !== -1) opt.selected = true;
        select.appendChild(opt);
      });
    }
  } catch (erro) {
    // Segue com a lista vazia.
  }

  abrirModal("modal-participantes");
}

async function confirmarParticipantes() {
  if (acaoGerenciandoParticipantes <= 0) return;

  const select = document.getElementById("part-usuarios");
  const ids = Array.prototype.slice.call(select.selectedOptions).map(function (o) {
    return parseInt(o.value, 10);
  });

  const botao = document.getElementById("botao-part-confirmar");
  definirCarregando(botao, true);
  try {
    const resposta = await postApi("/api/acoes/participantes-definir.php", {
      acao_id: acaoGerenciandoParticipantes,
      participantes: ids
    });
    if (!resposta.ok) {
      mostrarErro("part-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    fecharModal("modal-participantes");
    definirCarregando(botao, false);
    await carregarTudo();
  } catch (erro) {
    mostrarErro("part-mensagem", "Nao foi possivel salvar os participantes.");
    definirCarregando(botao, false);
  }
}

function montarAnexosDaAcao(acaoId) {
  const daAcao = acoesAnexos.filter(function (a) {
    return parseInt(a.acao_id, 10) === parseInt(acaoId, 10);
  });
  if (daAcao.length === 0) return null;

  const lista = document.createElement("div");
  lista.className = "acao-anexos";
  daAcao.forEach(function (a) {
    const link = document.createElement("a");
    link.className = "acao-anexo";
    link.href = "/api/anexos/baixar.php?id=" + a.id;
    link.textContent = a.nome_original + " (" + formatarTamanho(a.tamanho) + ")";
    lista.appendChild(link);
  });
  return lista;
}

// Envia evidencia (multipart) de uma acao. Retorna "" se ok, ou uma mensagem de erro.
// Aqui o anexo e obrigatorio (analise): a falha impede a conclusao.
async function enviarAnexosAcao(acaoId, arquivos) {
  const fd = new FormData();
  fd.append("acao_id", acaoId);
  for (let i = 0; i < arquivos.length; i++) {
    fd.append("arquivos[]", arquivos[i]);
  }
  try {
    const resposta = await fetch("/api/anexos/enviar-acao.php", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: fd
    });
    const dados = await resposta.json();
    if (!dados.ok) {
      return dados.error || "Não foi possível anexar o arquivo de análise.";
    }
    if (!dados.data.salvos || dados.data.salvos.length === 0) {
      const motivo = (dados.data.rejeitados && dados.data.rejeitados.length > 0)
        ? (": " + dados.data.rejeitados.map(function (r) { return r.nome + " (" + r.erro + ")"; }).join("; "))
        : ".";
      return "Nenhum arquivo foi anexado" + motivo;
    }
    return "";
  } catch (erro) {
    return "Não foi possível anexar o arquivo de análise.";
  }
}

// Define uma acao como a chave da demanda (gestor/admin). Recarrega o plano.
async function tornarChave(acaoId) {
  try {
    const resposta = await postApi("/api/acoes/definir-chave.php", { id: acaoId });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      return;
    }
    await carregarAcoes();
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel definir a ação chave.");
  }
}

async function abrirNovaAcao() {
  document.getElementById("form-acao").reset();
  document.getElementById("acao-mensagem").hidden = true;
  document.getElementById("a-demanda").value = demandaAtual.titulo;
  // Responsavel ja vem pre-selecionado com o responsavel principal do setor da demanda (editavel).
  await carregarResponsaveis("a-responsavel", demandaAtual ? demandaAtual.setor_responsavel_id : null);
  await carregarParticipantesSelect();
  preencherPrerequisitos();
  // Mostra os participantes so quando o tipo for "reuniao".
  document.getElementById("a-tipo").onchange = atualizarAreaParticipantes;
  atualizarAreaParticipantes();
  abrirModal("modal-acao");
}

// Exibe a area de participantes apenas para o tipo "reuniao".
function atualizarAreaParticipantes() {
  const ehReuniao = document.getElementById("a-tipo").value === "reuniao";
  document.getElementById("a-participantes-area").hidden = !ehReuniao;
}

// Popula o select multiplo de participantes com os usuarios ativos.
async function carregarParticipantesSelect() {
  const select = document.getElementById("a-participantes");
  select.innerHTML = "";
  try {
    const resposta = await getApi("/api/usuarios/listar.php");
    if (!resposta.ok) return;
    resposta.data.usuarios.forEach(function (u) {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.nome;
      select.appendChild(opt);
    });
  } catch (erro) {
    // Sem participantes selecionaveis.
  }
}

function preencherPrerequisitos() {
  const select = document.getElementById("a-prerequisito");
  select.length = 1; // mantem "Sem pré-requisito"
  acoesAtuais.forEach(function (a, i) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = (i + 1) + ". " + a.titulo;
    select.appendChild(opt);
  });
}

async function carregarResponsaveis(selectId, selecionado) {
  const select = document.getElementById(selectId);
  try {
    const resposta = await getApi("/api/usuarios/listar.php");
    if (!resposta.ok) return;
    select.length = 1;
    resposta.data.usuarios.forEach(function (u) {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.nome;
      if (selecionado && parseInt(selecionado, 10) === u.id) opt.selected = true;
      select.appendChild(opt);
    });
  } catch (erro) {
    // Mantem apenas "Sem responsável".
  }
}

async function salvarAcao(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-acao-salvar");
  const titulo = document.getElementById("a-titulo").value.trim();
  const tipo = document.getElementById("a-tipo").value;
  const descricao = document.getElementById("a-descricao").value.trim();
  const responsavel = document.getElementById("a-responsavel").value;
  const prazo = document.getElementById("a-prazo").value;
  const esforco = document.getElementById("a-esforco").value;

  const prereqValor = document.getElementById("a-prerequisito").value;
  const prerequisitos = prereqValor ? [parseInt(prereqValor, 10)] : [];

  // Participantes so para reuniao (select multiplo).
  let participantes = [];
  if (tipo === "reuniao") {
    const selPart = document.getElementById("a-participantes");
    participantes = Array.prototype.slice.call(selPart.selectedOptions).map(function (o) {
      return parseInt(o.value, 10);
    });
  }

  if (!tamanhoEntre(titulo, 2, 160)) {
    mostrarErro("acao-mensagem", "Informe um título (2 a 160 caracteres).");
    return;
  }
  if (!responsavel) {
    mostrarErro("acao-mensagem", "Selecione o responsável pela ação.");
    return;
  }
  if (!prazo) {
    mostrarErro("acao-mensagem", "Informe o prazo da ação.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/acoes/criar.php", {
      demanda_id: demandaId,
      titulo: titulo,
      tipo: tipo,
      descricao: descricao,
      responsavel_id: responsavel,
      prazo: prazo,
      esforco_dias: esforco,
      prerequisitos: prerequisitos,
      participantes: participantes
    });

    if (!resposta.ok) {
      mostrarErro("acao-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    fecharModal("modal-acao");
    definirCarregando(botao, false);
    await carregarAcoes();
  } catch (erro) {
    mostrarErro("acao-mensagem", "Nao foi possivel criar a ação.");
    definirCarregando(botao, false);
  }
}

// (Edicao da demanda removida: a tela e somente leitura. Arquivar continua disponivel.)

async function arquivar() {
  const botao = document.getElementById("botao-arquivar-confirmar");
  definirCarregando(botao, true);
  try {
    const resposta = await postApi("/api/demandas/arquivar.php", { id: demandaId, status: "arquivada" });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      fecharModal("modal-arquivar");
      definirCarregando(botao, false);
      return;
    }
    window.location.href = "demandas.html";
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel arquivar.");
    fecharModal("modal-arquivar");
    definirCarregando(botao, false);
  }
}

// ---- Anexos (somente leitura: lista + download seguro via API) ----

async function carregarAnexos() {
  const alvo = document.getElementById("lista-anexos");
  if (!alvo) return;

  try {
    const resposta = await getApi("/api/anexos/listar.php?demanda_id=" + demandaId);
    if (!resposta.ok) {
      alvo.innerHTML = "";
      const p = document.createElement("p");
      p.className = "texto-secundario";
      p.textContent = "Nao foi possivel carregar os anexos.";
      alvo.appendChild(p);
      return;
    }
    renderizarAnexos(alvo, resposta.data.anexos);
  } catch (erro) {
    alvo.innerHTML = "";
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Nao foi possivel carregar os anexos.";
    alvo.appendChild(p);
  }
}

function renderizarAnexos(alvo, anexos) {
  alvo.innerHTML = "";

  if (!anexos || anexos.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Nenhum anexo nesta demanda.";
    alvo.appendChild(p);
    return;
  }

  anexos.forEach(function (a) {
    const item = document.createElement("div");
    item.className = "anexo-item";

    const corpo = document.createElement("div");
    corpo.className = "anexo-corpo";

    const nome = document.createElement("span");
    nome.className = "anexo-nome";
    nome.textContent = a.nome_original;

    const meta = document.createElement("span");
    meta.className = "anexo-meta texto-secundario";
    meta.textContent = formatarTamanho(a.tamanho)
      + " · enviado por " + (a.criado_por_nome || "—")
      + " em " + formatarDataHora(a.criado_em);

    corpo.appendChild(nome);
    corpo.appendChild(meta);

    const baixar = document.createElement("a");
    baixar.className = "botao botao-secundario";
    baixar.href = "/api/anexos/baixar.php?id=" + a.id;
    baixar.textContent = "Baixar";

    item.appendChild(corpo);
    item.appendChild(baixar);
    alvo.appendChild(item);
  });
}

// Formata bytes como KB/MB legivel.
function formatarTamanho(bytes) {
  const n = parseInt(bytes, 10) || 0;
  if (n < 1024) return n + " B";
  if (n < 1048576) return (n / 1024).toFixed(0) + " KB";
  return (n / 1048576).toFixed(1) + " MB";
}

// ---- Visitas (lastro: quem abriu a demanda e quando) ----

async function registrarVisita() {
  try {
    const resposta = await postApi("/api/demandas/registrar-visita.php", { demanda_id: demandaId });
    if (resposta.ok) {
      renderizarVisitas(resposta.data.visitas);
    }
  } catch (erro) {
    // Visitas sao secundarias; nao bloqueiam a tela.
  }
}

function renderizarVisitas(visitas) {
  const alvo = document.getElementById("lista-visitas");
  if (!alvo) return;
  alvo.innerHTML = "";

  if (!visitas || visitas.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Ninguém visualizou ainda.";
    alvo.appendChild(p);
    return;
  }

  visitas.forEach(function (v) {
    const item = document.createElement("div");
    item.className = "visita-item";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.background = corDoNome(v.usuario_nome);
    avatar.textContent = iniciais(v.usuario_nome);
    item.appendChild(avatar);

    const corpo = document.createElement("div");
    corpo.className = "visita-corpo";

    const nome = document.createElement("span");
    nome.className = "visita-nome";
    nome.textContent = v.usuario_nome;

    const total = parseInt(v.total_visitas, 10) || 1;
    const detalhe = document.createElement("span");
    detalhe.className = "visita-detalhe texto-secundario";
    detalhe.textContent = "Última visita: " + formatarDataHora(v.ultima_visita)
      + " · " + total + (total === 1 ? " visita" : " visitas");

    corpo.appendChild(nome);
    corpo.appendChild(detalhe);
    item.appendChild(corpo);

    alvo.appendChild(item);
  });
}

// Formata "YYYY-MM-DD HH:MM:SS" como "DD/MM/YYYY HH:MM".
function formatarDataHora(iso) {
  if (!iso) return "—";
  const s = String(iso);
  if (s.length < 16) return s;
  return s.substring(8, 10) + "/" + s.substring(5, 7) + "/" + s.substring(0, 4) + " " + s.substring(11, 16);
}

// ---- Visualizacao de tarefa (popup com detalhes; marca quem viu) ----

function abrirDetalheAcao(a, elementoVistos) {
  document.getElementById("det-titulo").textContent = a.titulo;

  const status = document.getElementById("det-status");
  const derivado = statusDerivado(a);
  status.className = classeBadgeStatus(derivado);
  status.textContent = rotuloStatus(derivado);

  document.getElementById("det-chave").hidden = parseInt(a.chave, 10) !== 1;
  document.getElementById("det-metas").textContent =
    "Responsável: " + (a.responsavel_nome || "—") + " · Prazo: " + (a.prazo ? a.prazo.substring(0, 10) : "—");
  document.getElementById("det-descricao").textContent = a.descricao || "Sem descrição.";

  const lista = document.getElementById("det-visualizacoes");
  lista.innerHTML = "";
  const carregando = document.createElement("p");
  carregando.className = "texto-secundario";
  carregando.textContent = "Carregando...";
  lista.appendChild(carregando);

  abrirModal("modal-acao-detalhe");
  marcarVisualizada(a.id, lista, elementoVistos);
}

async function marcarVisualizada(acaoId, listaEl, elementoVistos) {
  try {
    const resposta = await postApi("/api/acoes/visualizar.php", { acao_id: acaoId });
    if (!resposta.ok) {
      listaEl.innerHTML = "";
      const p = document.createElement("p");
      p.className = "texto-secundario";
      p.textContent = resposta.error || "Nao foi possivel carregar.";
      listaEl.appendChild(p);
      return;
    }
    renderizarVisualizacoes(listaEl, resposta.data.visualizacoes);
    if (elementoVistos) {
      atualizarContadorVistos(elementoVistos, resposta.data.visualizacoes.length);
    }
  } catch (erro) {
    // silencioso: visualizacao e secundaria.
  }
}

function renderizarVisualizacoes(alvo, lista) {
  alvo.innerHTML = "";

  if (!lista || lista.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Ninguém visualizou ainda.";
    alvo.appendChild(p);
    return;
  }

  lista.forEach(function (v) {
    const item = document.createElement("div");
    item.className = "visita-item";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.background = corDoNome(v.usuario_nome);
    avatar.textContent = iniciais(v.usuario_nome);
    item.appendChild(avatar);

    const corpo = document.createElement("div");
    corpo.className = "visita-corpo";
    const nome = document.createElement("span");
    nome.className = "visita-nome";
    nome.textContent = v.usuario_nome;
    const det = document.createElement("span");
    det.className = "visita-detalhe texto-secundario";
    det.textContent = "Visualizou em " + formatarDataHora(v.visualizado_em);
    corpo.appendChild(nome);
    corpo.appendChild(det);
    item.appendChild(corpo);

    alvo.appendChild(item);
  });
}

function atualizarContadorVistos(elemento, n) {
  elemento.textContent = n > 0 ? ("Visto por " + n + (n === 1 ? " pessoa" : " pessoas")) : "Não visualizado";
}

// ---- Comentarios (estilo forum: abaixo de cada acao) ----

function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/);
  const a = (partes[0] || "")[0] || "";
  const b = (partes[1] || "")[0] || "";
  return (a + b).toUpperCase();
}

function corDoNome(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  const cores = ["#4E392F", "#2B5C8A", "#2E7D52", "#8B6F4A", "#B5852A", "#606062"];
  return cores[Math.abs(hash) % cores.length];
}

// Monta a area de comentarios (recuada) de uma acao: lista + formulario proprio.
function montarComentariosDaAcao(a) {
  const area = document.createElement("div");
  area.className = "acao-comentarios";

  const doAcao = comentariosAtuais
    .filter(function (c) { return parseInt(c.acao_id, 10) === parseInt(a.id, 10); })
    .sort(function (x, y) { return String(x.criado_em).localeCompare(String(y.criado_em)); });

  if (doAcao.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "texto-secundario acao-coment-vazio";
    vazio.textContent = "Sem comentários.";
    area.appendChild(vazio);
  } else {
    doAcao.forEach(function (c) {
      area.appendChild(montarComentario(c));
    });
  }

  area.appendChild(montarFormComentario(a.id));
  return area;
}

function montarComentario(c) {
  const item = document.createElement("div");
  item.className = "comentario";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.style.background = corDoNome(c.autor_nome);
  avatar.textContent = iniciais(c.autor_nome);
  item.appendChild(avatar);

  const corpo = document.createElement("div");
  corpo.className = "comentario-corpo";

  const cabecalho = document.createElement("div");
  cabecalho.className = "comentario-cabecalho";
  const autor = document.createElement("span");
  autor.className = "comentario-autor";
  autor.textContent = c.autor_nome;
  const data = document.createElement("span");
  data.className = "comentario-data";
  data.textContent = (c.criado_em || "").substring(0, 16) + (c.editado_em ? " (editado)" : "");
  cabecalho.appendChild(autor);
  cabecalho.appendChild(data);
  corpo.appendChild(cabecalho);

  const texto = document.createElement("p");
  texto.className = "comentario-texto";
  texto.textContent = c.texto;
  corpo.appendChild(texto);

  const anexos = montarAnexosDoComentario(c.id);
  if (anexos) {
    corpo.appendChild(anexos);
  }

  if (parseInt(c.autor_id, 10) === usuarioId) {
    const editar = document.createElement("button");
    editar.className = "botao-link";
    editar.type = "button";
    editar.textContent = "Editar";
    editar.addEventListener("click", function () { iniciarEdicao(corpo, c); });
    corpo.appendChild(editar);
  }

  item.appendChild(corpo);
  return item;
}

// Formulario compacto de novo comentario para uma acao especifica (com anexos opcionais).
function montarFormComentario(acaoId) {
  const form = document.createElement("form");
  form.className = "coment-form";

  const area = document.createElement("textarea");
  area.className = "campo-input";
  area.rows = 1;
  area.placeholder = "Escreva um comentário...";

  const arquivos = document.createElement("input");
  arquivos.className = "campo-arquivo coment-arquivo";
  arquivos.type = "file";
  arquivos.multiple = true;
  arquivos.accept = ANEXOS_ACCEPT;
  arquivos.title = "Anexar arquivos (opcional)";

  const botao = document.createElement("button");
  botao.className = "botao botao-secundario";
  botao.type = "submit";
  botao.textContent = "Comentar";

  form.appendChild(area);
  form.appendChild(arquivos);
  form.appendChild(botao);

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const texto = area.value.trim();
    if (texto === "") {
      mostrarErro("coment-mensagem", "Escreva um comentário.");
      return;
    }

    // Pre-valida os anexos no cliente (o backend revalida). Nao cria o comentario se houver invalido.
    const erroAnexo = validarAnexosCliente(arquivos.files);
    if (erroAnexo) {
      mostrarErro("coment-mensagem", erroAnexo);
      return;
    }

    definirCarregando(botao, true);
    try {
      const resposta = await postApi("/api/comentarios/criar.php", { acao_id: acaoId, texto: texto });
      if (!resposta.ok) {
        mostrarErro("coment-mensagem", resposta.error);
        definirCarregando(botao, false);
        return;
      }

      // Comentario criado: envia os anexos selecionados (se houver).
      let aviso = "";
      if (arquivos.files && arquivos.files.length > 0) {
        aviso = await enviarAnexosComentario(resposta.data.id, arquivos.files);
      }

      document.getElementById("coment-mensagem").hidden = true;
      await carregarAcoes();
      if (aviso) {
        mostrarErro("coment-mensagem", aviso);
      }
    } catch (erro) {
      mostrarErro("coment-mensagem", "Nao foi possivel enviar o comentário.");
      definirCarregando(botao, false);
    }
  });

  return form;
}

// Anexos aceitos no comentario (espelham o backend; backend e a barreira real).
const ANEXOS_EXTENSOES = ["pdf", "png", "jpg", "jpeg", "gif", "webp", "doc", "docx",
  "xls", "xlsx", "ppt", "pptx", "txt", "csv", "zip"];
const ANEXOS_ACCEPT = "." + ANEXOS_EXTENSOES.join(",.");
const ANEXO_TAMANHO_MAX = 10 * 1024 * 1024;
const ANEXOS_MAX = 10;

// Pre-validacao no cliente. Retorna "" se ok ou uma mensagem de erro.
function validarAnexosCliente(arquivos) {
  if (!arquivos || arquivos.length === 0) return "";
  if (arquivos.length > ANEXOS_MAX) return "Selecione no máximo " + ANEXOS_MAX + " arquivos.";
  for (let i = 0; i < arquivos.length; i++) {
    const f = arquivos[i];
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (ANEXOS_EXTENSOES.indexOf(ext) === -1) {
      return "Tipo de arquivo não permitido: " + f.name;
    }
    if (f.size > ANEXO_TAMANHO_MAX) {
      return "Arquivo acima de 10 MB: " + f.name;
    }
  }
  return "";
}

// Envia os anexos (multipart) de um comentario recem-criado. Nao usa postApi (que e JSON).
// Retorna "" se tudo certo, ou uma mensagem de aviso (o comentario ja foi criado).
async function enviarAnexosComentario(comentarioId, arquivos) {
  const fd = new FormData();
  fd.append("comentario_id", comentarioId);
  for (let i = 0; i < arquivos.length; i++) {
    fd.append("arquivos[]", arquivos[i]);
  }

  try {
    const resposta = await fetch("/api/anexos/enviar-comentario.php", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: fd
    });
    const dados = await resposta.json();

    if (!dados.ok) {
      return "Comentário enviado, mas os anexos não puderam ser anexados.";
    }
    if (dados.data.rejeitados && dados.data.rejeitados.length > 0) {
      const lista = dados.data.rejeitados.map(function (r) { return r.nome + " (" + r.erro + ")"; }).join("; ");
      return "Comentário enviado. Anexos não aceitos: " + lista;
    }
    return "";
  } catch (erro) {
    return "Comentário enviado, mas os anexos não puderam ser anexados.";
  }
}

// Monta a lista de anexos de um comentario (ou null se nao houver).
function montarAnexosDoComentario(comentarioId) {
  const doComentario = comentariosAnexos.filter(function (a) {
    return parseInt(a.comentario_id, 10) === parseInt(comentarioId, 10);
  });
  if (doComentario.length === 0) return null;

  const lista = document.createElement("div");
  lista.className = "comentario-anexos";

  doComentario.forEach(function (a) {
    const link = document.createElement("a");
    link.className = "comentario-anexo";
    link.href = "/api/anexos/baixar.php?id=" + a.id;
    link.textContent = a.nome_original + " (" + formatarTamanho(a.tamanho) + ")";
    lista.appendChild(link);
  });

  return lista;
}

function iniciarEdicao(corpo, comentario) {
  corpo.innerHTML = "";

  const area = document.createElement("textarea");
  area.className = "campo-input";
  area.rows = 2;
  area.value = comentario.texto;
  corpo.appendChild(area);

  const acoes = document.createElement("div");
  acoes.className = "coment-enviar";

  const cancelar = document.createElement("button");
  cancelar.className = "botao botao-secundario";
  cancelar.type = "button";
  cancelar.textContent = "Cancelar";
  cancelar.addEventListener("click", carregarAcoes);

  const salvar = document.createElement("button");
  salvar.className = "botao botao-primario";
  salvar.type = "button";
  salvar.textContent = "Salvar";
  salvar.addEventListener("click", async function () {
    const novo = area.value.trim();
    if (novo === "") return;
    definirCarregando(salvar, true);
    const resposta = await postApi("/api/comentarios/editar.php", { id: comentario.id, texto: novo });
    if (!resposta.ok) {
      mostrarErro("coment-mensagem", resposta.error);
      definirCarregando(salvar, false);
      return;
    }
    carregarAcoes();
  });

  acoes.appendChild(cancelar);
  acoes.appendChild(salvar);
  corpo.appendChild(acoes);
}

// (Comentar agora é feito no formulário de cada ação — ver montarFormComentario.)
