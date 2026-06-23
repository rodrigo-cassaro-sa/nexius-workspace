// demandas.js
// Lista de demandas: filtros (busca, status, responsavel), paginacao, criar (modal) e abrir detalhe.

let perfilUsuario = "";
let paginaAtual = 1;
let totalPaginas = 1;
let usuarioAtual = null;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  perfilUsuario = usuario.perfil;
  usuarioAtual = usuario;
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);

  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  // Apenas Gestor/Admin criam demandas.
  if (perfilUsuario === "administrador" || perfilUsuario === "gestor") {
    document.getElementById("botao-nova").hidden = false;
    document.getElementById("botao-nova").addEventListener("click", abrirNova);
    document.getElementById("botao-cancelar").addEventListener("click", function () { fecharModal("modal-nova"); });
    document.getElementById("form-nova").addEventListener("submit", salvarNova);
  }

  // A busca agora fica na topbar (#busca-topo). Aceita ?busca= vindo de outra tela.
  const buscaTopo = document.getElementById("busca-topo");
  const buscaInicial = new URLSearchParams(location.search).get("busca") || "";
  if (buscaInicial) buscaTopo.value = buscaInicial;
  buscaTopo.addEventListener("input", debounce(recarregar, 350));
  document.getElementById("form-busca-topo").addEventListener("submit", function (e) { e.preventDefault(); recarregar(); });

  document.getElementById("filtro-status").addEventListener("change", recarregar);
  document.getElementById("filtro-solicitante").addEventListener("change", recarregar);
  document.getElementById("filtro-pilar").addEventListener("change", recarregar);
  document.getElementById("filtro-intencao").addEventListener("change", recarregar);
  document.getElementById("filtro-objetivo").addEventListener("change", recarregar);
  document.getElementById("pag-anterior").addEventListener("click", function () { irPara(paginaAtual - 1); });
  document.getElementById("pag-proxima").addEventListener("click", function () { irPara(paginaAtual + 1); });

  carregarFiltroSolicitantes();
  carregarDemandas();
});

function debounce(fn, espera) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, espera);
  };
}

function recarregar() {
  paginaAtual = 1;
  carregarDemandas();
}

function irPara(pagina) {
  if (pagina < 1 || pagina > totalPaginas) return;
  paginaAtual = pagina;
  carregarDemandas();
}

async function carregarFiltroSolicitantes() {
  const select = document.getElementById("filtro-solicitante");
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
    // Mantem "Responsável: todos".
  }
}

async function carregarDemandas() {
  const alvo = document.getElementById("lista-demandas");
  mostrarCarregando("lista-demandas", 4);
  document.getElementById("paginacao").hidden = true;

  const busca = document.getElementById("busca-topo").value.trim();
  const status = document.getElementById("filtro-status").value;
  const solicitante = document.getElementById("filtro-solicitante").value;
  const pilar = document.getElementById("filtro-pilar").value;
  const intencao = document.getElementById("filtro-intencao").value;
  const objetivo = document.getElementById("filtro-objetivo").value;

  const url = "/api/demandas/listar.php"
    + "?busca=" + encodeURIComponent(busca)
    + "&status=" + encodeURIComponent(status)
    + "&solicitante=" + encodeURIComponent(solicitante)
    + "&pilar=" + encodeURIComponent(pilar)
    + "&intencao=" + encodeURIComponent(intencao)
    + "&objetivo=" + encodeURIComponent(objetivo)
    + "&pagina=" + paginaAtual;

  try {
    const resposta = await getApi(url);
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as demandas.";
      return;
    }

    const dados = resposta.data;
    if (dados.demandas.length === 0) {
      mostrarVazio("lista-demandas", "Nenhuma demanda encontrada.");
      return;
    }

    renderizarLista(alvo, dados.demandas);
    renderizarPaginacao(dados.total, dados.pagina, dados.por_pagina);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as demandas.";
  }
}

function renderizarLista(alvo, demandas) {
  alvo.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Título", "Prioridade", "Status", "Solicitante", "SLA", "Progresso", "Prazo", ""].forEach(function (texto) {
    const th = document.createElement("th");
    th.textContent = texto;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  demandas.forEach(function (d) {
    const tr = document.createElement("tr");

    const prioridade = parseInt(d.prioridade, 10) || 0;
    if (prioridade >= 75) {
      tr.classList.add("prioridade-alta");
    }

    tr.appendChild(celula("Título", d.titulo));
    tr.appendChild(celulaPrioridade(prioridade));

    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(d.status);
    badge.textContent = rotuloStatus(d.status);
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    tr.appendChild(celula("Solicitante", d.solicitante_nome || "—"));
    tr.appendChild(celulaSla(d));

    tr.appendChild(celulaProgresso(d));

    tr.appendChild(celulaPrazo(d.prazo_chave));

    const tdAcao = document.createElement("td");
    tdAcao.setAttribute("data-rotulo", "");
    const link = document.createElement("a");
    link.href = "demanda.html?id=" + d.id;
    link.textContent = "Abrir";
    tdAcao.appendChild(link);
    tr.appendChild(tdAcao);

    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);

  alvo.appendChild(tabela);
}

function celula(rotulo, texto) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", rotulo);
  td.textContent = texto;
  return td;
}

function celulaProgresso(d) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", "Progresso");

  const total = parseInt(d.total_acoes, 10) || 0;
  const feitas = parseInt(d.acoes_concluidas, 10) || 0;
  const pct = total > 0 ? Math.round((feitas / total) * 100) : 0;

  const barra = document.createElement("span");
  barra.className = "progresso";
  const preenchido = document.createElement("span");
  preenchido.className = "progresso-preenchido";
  preenchido.style.width = pct + "%";
  preenchido.style.display = "block";
  barra.appendChild(preenchido);

  const texto = document.createElement("span");
  texto.className = "progresso-texto";
  texto.textContent = feitas + "/" + total;

  td.appendChild(barra);
  td.appendChild(texto);
  return td;
}

// Classifica a prioridade GUT (G*U*T): Alta >= 75, Media 25-74, Baixa < 25.
function classificarGut(p) {
  if (!p || p <= 0) return null;
  if (p >= 75) return { rotulo: "Alta", classe: "badge badge-erro" };
  if (p >= 25) return { rotulo: "Média", classe: "badge badge-aviso" };
  return { rotulo: "Baixa", classe: "badge" };
}

function celulaPrioridade(prioridade) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", "Prioridade");

  const info = classificarGut(prioridade);
  if (!info) {
    td.textContent = "—";
    return td;
  }

  const wrap = document.createElement("span");
  wrap.className = "prioridade-celula";

  const score = document.createElement("span");
  score.className = "prioridade-score";
  score.textContent = prioridade;

  const badge = document.createElement("span");
  badge.className = info.classe;
  badge.textContent = info.rotulo;

  wrap.appendChild(score);
  wrap.appendChild(badge);
  td.appendChild(wrap);
  return td;
}

function celulaPrazo(prazo) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", "Prazo");

  if (!prazo) {
    td.textContent = "—";
    return td;
  }

  const hoje = new Date().toISOString().substring(0, 10);
  td.textContent = prazo.substring(0, 10);
  if (prazo.substring(0, 10) < hoje) {
    td.className = "prazo-atrasado";
  }
  return td;
}

// Data de hoje como DD/MM/AAAA.
function dataHoje() {
  const d = new Date();
  return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
}

// Formata "YYYY-MM-DD HH:MM:SS" como DD/MM/AAAA.
function formatarData(iso) {
  if (!iso) return "—";
  const s = String(iso);
  return s.substring(8, 10) + "/" + s.substring(5, 7) + "/" + s.substring(0, 4);
}

// SLA de resposta: 3 dias a partir da solicitacao (criado_em).
// "Respondida" = primeira acao criada (respondida_em).
function calcularSla(criadoEm, respondidaEm) {
  if (!criadoEm) return null;
  const criado = new Date(String(criadoEm).replace(" ", "T"));
  const prazo = new Date(criado.getTime() + 3 * 24 * 60 * 60 * 1000);

  if (respondidaEm) {
    const resp = new Date(String(respondidaEm).replace(" ", "T"));
    return resp <= prazo
      ? { rotulo: "Respondida no prazo", classe: "badge badge-sucesso" }
      : { rotulo: "Respondida fora do prazo", classe: "badge badge-aviso" };
  }

  const agora = new Date();
  if (agora > prazo) {
    return { rotulo: "SLA vencido", classe: "badge badge-erro" };
  }
  const dias = Math.ceil((prazo - agora) / (24 * 60 * 60 * 1000));
  return { rotulo: "Aguardando · " + dias + "d", classe: "badge badge-info" };
}

function celulaSla(d) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", "SLA");

  const info = calcularSla(d.criado_em, d.respondida_em);
  if (!info) {
    td.textContent = "—";
    return td;
  }

  const badge = document.createElement("span");
  badge.className = info.classe;
  badge.textContent = info.rotulo;
  td.appendChild(badge);

  const sub = document.createElement("div");
  sub.className = "texto-secundario sla-sub";
  sub.textContent = "Solic.: " + formatarData(d.criado_em);
  td.appendChild(sub);

  return td;
}

function renderizarPaginacao(total, pagina, porPagina) {
  totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  paginaAtual = pagina;

  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  document.getElementById("paginacao-info").textContent = inicio + "–" + fim + " de " + total;
  document.getElementById("pag-anterior").disabled = pagina <= 1;
  document.getElementById("pag-proxima").disabled = pagina >= totalPaginas;
  document.getElementById("paginacao").hidden = false;
}

function abrirNova() {
  document.getElementById("form-nova").reset();
  document.getElementById("modal-mensagem").hidden = true;
  // Solicitante = usuario logado (criador). Data de solicitacao = hoje.
  document.getElementById("solicitante-nome").value = usuarioAtual ? usuarioAtual.nome : "";
  document.getElementById("solicitado-em").textContent = dataHoje();
  abrirModal("modal-nova");
}

async function salvarNova(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-salvar");
  const titulo = document.getElementById("titulo").value.trim();

  // Questionario obrigatorio (6 perguntas).
  const campos = {
    problema: document.getElementById("problema").value.trim(),
    impacto_operacional: document.getElementById("impacto").value.trim(),
    risco: document.getElementById("risco").value.trim(),
    afeta_outros: document.getElementById("afeta").value.trim(),
    workaround: document.getElementById("workaround").value.trim(),
    sugestao_solucao: document.getElementById("sugestao").value.trim()
  };

  // Matriz GUT (1 a 5). Prioridade = G * U * T.
  const gut = {
    gut_gravidade: parseInt(document.getElementById("gut-gravidade").value, 10) || 0,
    gut_urgencia: parseInt(document.getElementById("gut-urgencia").value, 10) || 0,
    gut_tendencia: parseInt(document.getElementById("gut-tendencia").value, 10) || 0
  };

  // Triagem (classificacao da demanda).
  const triagem = {
    origem: document.getElementById("origem").value.trim(),
    momento_etapa: document.getElementById("momento").value.trim(),
    intencao: document.getElementById("intencao").value,
    pilar: document.getElementById("pilar").value,
    objetivo: document.getElementById("objetivo").value
  };

  if (!tamanhoEntre(titulo, 2, 160)) {
    mostrarErro("modal-mensagem", "Informe um título (2 a 160 caracteres).");
    return;
  }

  const algumVazio = Object.keys(campos).some(function (k) { return campos[k].length < 2; });
  if (algumVazio) {
    mostrarErro("modal-mensagem", "Responda todas as 6 perguntas obrigatórias.");
    return;
  }

  if (triagem.origem.length < 2 || triagem.momento_etapa.length < 2) {
    mostrarErro("modal-mensagem", "Preencha \"Onde?\" e \"Em qual momento ou etapa?\".");
    return;
  }
  if (!triagem.intencao || !triagem.pilar || !triagem.objetivo) {
    mostrarErro("modal-mensagem", "Selecione intenção, pilar e objetivo na triagem.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const dados = Object.assign({ titulo: titulo }, campos, triagem, gut);
    const resposta = await postApi("/api/demandas/criar.php", dados);

    if (!resposta.ok) {
      mostrarErro("modal-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    fecharModal("modal-nova");
    definirCarregando(botao, false);
    recarregar();
  } catch (erro) {
    mostrarErro("modal-mensagem", "Nao foi possivel criar a demanda.");
    definirCarregando(botao, false);
  }
}
