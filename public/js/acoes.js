// acoes.js
// Lista global de acoes (de varias demandas): filtros, paginacao e popup de detalhes.
// O backend aplica o escopo (colaborador so ve as suas demandas envolvidas).

let paginaAtual = 1;
let totalPaginas = 1;
let usuarioId = 0;
let visao = "lista";                       // "lista" | "calendario"
let mesAtual = primeiroDiaDoMes(new Date()); // primeiro dia do mes visivel no calendario

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  usuarioId = usuario.id;
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  // Pre-filtros vindos por URL (ex.: dashboard -> acoes.html?situacao=atrasadas).
  const params = new URLSearchParams(location.search);
  aplicarPreFiltro("filtro-status", params.get("status"));
  aplicarPreFiltro("filtro-situacao", params.get("situacao"));

  document.getElementById("filtro-busca").addEventListener("input", debounce(recarregarAtiva, 350));
  document.getElementById("filtro-status").addEventListener("change", recarregarAtiva);
  document.getElementById("filtro-responsavel").addEventListener("change", recarregarAtiva);
  document.getElementById("filtro-situacao").addEventListener("change", recarregarAtiva);
  document.getElementById("pag-anterior").addEventListener("click", function () { irPara(paginaAtual - 1); });
  document.getElementById("pag-proxima").addEventListener("click", function () { irPara(paginaAtual + 1); });
  document.getElementById("botao-det-fechar").addEventListener("click", function () { fecharModal("modal-acao-detalhe"); });

  // Alternador de visao (Lista / Calendário) e navegacao por mes.
  document.getElementById("visao-lista").addEventListener("click", function () { alternarVisao("lista"); });
  document.getElementById("visao-calendario").addEventListener("click", function () { alternarVisao("calendario"); });
  document.getElementById("cal-anterior").addEventListener("click", function () { mudarMes(-1); });
  document.getElementById("cal-proximo").addEventListener("click", function () { mudarMes(1); });
  document.getElementById("cal-hoje").addEventListener("click", function () {
    mesAtual = primeiroDiaDoMes(new Date());
    carregarCalendario();
  });

  carregarResponsaveis();

  // Permite abrir direto no calendário via URL (ex.: acoes.html?visao=calendario).
  if (params.get("visao") === "calendario") {
    alternarVisao("calendario");
  } else {
    carregarAcoes();
  }
});

function aplicarPreFiltro(id, valor) {
  if (!valor) return;
  const el = document.getElementById(id);
  if (el) el.value = valor;
}

function debounce(fn, espera) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, espera);
  };
}

function recarregar() {
  paginaAtual = 1;
  carregarAcoes();
}

// Recarrega a visao ativa (lista ou calendário) ao mudar um filtro.
function recarregarAtiva() {
  if (visao === "calendario") {
    carregarCalendario();
  } else {
    recarregar();
  }
}

// Filtros comuns as duas visoes (lista e calendário), em querystring.
function paramsFiltros() {
  const busca = document.getElementById("filtro-busca").value.trim();
  const status = document.getElementById("filtro-status").value;
  const responsavel = document.getElementById("filtro-responsavel").value;
  const situacao = document.getElementById("filtro-situacao").value;
  return "busca=" + encodeURIComponent(busca)
    + "&status=" + encodeURIComponent(status)
    + "&responsavel=" + encodeURIComponent(responsavel)
    + "&situacao=" + encodeURIComponent(situacao);
}

function alternarVisao(nova) {
  visao = nova;
  const ehCal = nova === "calendario";

  document.getElementById("painel-lista").hidden = ehCal;
  document.getElementById("painel-calendario").hidden = !ehCal;

  const btnLista = document.getElementById("visao-lista");
  const btnCal = document.getElementById("visao-calendario");
  btnLista.classList.toggle("ativo", !ehCal);
  btnCal.classList.toggle("ativo", ehCal);
  btnLista.setAttribute("aria-selected", String(!ehCal));
  btnCal.setAttribute("aria-selected", String(ehCal));

  if (ehCal) {
    carregarCalendario();
  } else {
    carregarAcoes();
  }
}

function irPara(pagina) {
  if (pagina < 1 || pagina > totalPaginas) return;
  paginaAtual = pagina;
  carregarAcoes();
}

async function carregarResponsaveis() {
  const select = document.getElementById("filtro-responsavel");
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

async function carregarAcoes() {
  const alvo = document.getElementById("lista-acoes");
  mostrarCarregando("lista-acoes", 4);
  document.getElementById("paginacao").hidden = true;

  const url = "/api/acoes/listar-todas.php?" + paramsFiltros() + "&pagina=" + paginaAtual;

  try {
    const resposta = await getApi(url);
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as ações.";
      return;
    }

    const dados = resposta.data;
    if (dados.acoes.length === 0) {
      mostrarVazio("lista-acoes", "Nenhuma ação encontrada.");
      return;
    }

    renderizarLista(alvo, dados.acoes);
    renderizarPaginacao(dados.total, dados.pagina, dados.por_pagina);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as ações.";
  }
}

function statusDerivado(a) {
  if (a.status === "pendente" && parseInt(a.prereq_pendentes, 10) > 0) {
    return "bloqueada";
  }
  return a.status;
}

function renderizarLista(alvo, acoes) {
  alvo.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Ação", "Demanda", "Responsável", "Prazo", "Status", ""].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  const hoje = new Date().toISOString().substring(0, 10);

  acoes.forEach(function (a) {
    const tr = document.createElement("tr");

    // Ação (titulo + badge chave)
    const tdAcao = document.createElement("td");
    tdAcao.setAttribute("data-rotulo", "Ação");
    const linha = document.createElement("div");
    linha.className = "acao-titulo-linha";
    const nome = document.createElement("span");
    nome.textContent = a.titulo;
    linha.appendChild(nome);
    if (parseInt(a.chave, 10) === 1) {
      const bc = document.createElement("span");
      bc.className = "badge badge-chave";
      bc.textContent = "Chave";
      linha.appendChild(bc);
    }
    tdAcao.appendChild(linha);
    tr.appendChild(tdAcao);

    // Demanda (link)
    const tdDem = document.createElement("td");
    tdDem.setAttribute("data-rotulo", "Demanda");
    const linkDem = document.createElement("a");
    linkDem.href = "demanda.html?id=" + a.demanda_id;
    linkDem.textContent = a.demanda_titulo;
    tdDem.appendChild(linkDem);
    tr.appendChild(tdDem);

    tr.appendChild(celula("Responsável", a.responsavel_nome || "—"));

    // Prazo (atrasado em vermelho)
    const tdPrazo = document.createElement("td");
    tdPrazo.setAttribute("data-rotulo", "Prazo");
    const prazo = a.prazo ? a.prazo.substring(0, 10) : null;
    tdPrazo.textContent = prazo || "—";
    if (prazo && prazo < hoje && a.status === "pendente") {
      tdPrazo.className = "prazo-atrasado";
    }
    tr.appendChild(tdPrazo);

    // Status (derivado)
    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const derivado = statusDerivado(a);
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(derivado);
    badge.textContent = rotuloStatus(derivado);
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    // Ver detalhes
    const tdAcoes = document.createElement("td");
    tdAcoes.setAttribute("data-rotulo", "");
    const btn = document.createElement("button");
    btn.className = "botao-link";
    btn.type = "button";
    btn.textContent = "Ver detalhes";
    btn.addEventListener("click", function () { abrirDetalhe(a); });
    tdAcoes.appendChild(btn);
    tr.appendChild(tdAcoes);

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

// ---- Popup de detalhes (marca como visualizado, reaproveitando o endpoint existente) ----

function abrirDetalhe(a) {
  document.getElementById("det-titulo").textContent = a.titulo;

  const status = document.getElementById("det-status");
  const derivado = statusDerivado(a);
  status.className = classeBadgeStatus(derivado);
  status.textContent = rotuloStatus(derivado);

  document.getElementById("det-chave").hidden = parseInt(a.chave, 10) !== 1;
  document.getElementById("det-metas").textContent =
    "Demanda: " + a.demanda_titulo
    + " · Responsável: " + (a.responsavel_nome || "—")
    + " · Prazo: " + (a.prazo ? a.prazo.substring(0, 10) : "—");
  document.getElementById("det-descricao").textContent = a.descricao || "Sem descrição.";
  document.getElementById("det-abrir").href = "demanda.html?id=" + a.demanda_id;

  const lista = document.getElementById("det-visualizacoes");
  lista.innerHTML = "";
  const carregando = document.createElement("p");
  carregando.className = "texto-secundario";
  carregando.textContent = "Carregando...";
  lista.appendChild(carregando);

  abrirModal("modal-acao-detalhe");
  marcarVisualizada(a.id, lista);
}

async function marcarVisualizada(acaoId, listaEl) {
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
  } catch (erro) {
    // silencioso
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
    det.textContent = "Visualizou em " + String(v.visualizado_em || "").substring(0, 16);
    corpo.appendChild(nome);
    corpo.appendChild(det);
    item.appendChild(corpo);

    alvo.appendChild(item);
  });
}

function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/);
  const a = (partes[0] || "")[0] || "";
  const b = (partes[1] || "")[0] || "";
  return (a + b).toUpperCase();
}

function corDoNome(nome) {
  let hash = 0;
  for (let i = 0; i < String(nome).length; i++) {
    hash = String(nome).charCodeAt(i) + ((hash << 5) - hash);
  }
  const cores = ["#4E392F", "#2B5C8A", "#2E7D52", "#8B6F4A", "#B5852A", "#606062"];
  return cores[Math.abs(hash) % cores.length];
}

// ---- Visao de calendário (ações posicionadas pelo prazo) ----

function primeiroDiaDoMes(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Data local em YYYY-MM-DD (evita o deslocamento de fuso do toISOString).
function ymd(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + dia;
}

function mudarMes(delta) {
  mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + delta, 1);
  carregarCalendario();
}

// Classe de cor do evento: atrasada (pendente vencida), bloqueada, pendente ou concluída.
function classeEventoCalendario(a, dataChave, hoje) {
  const derivado = statusDerivado(a); // pendente | bloqueada | concluida
  if (derivado === "pendente" && dataChave < hoje) {
    return "atrasada";
  }
  return derivado;
}

async function carregarCalendario() {
  const grade = document.getElementById("cal-grade");
  grade.innerHTML = "";
  const carregando = document.createElement("p");
  carregando.className = "texto-secundario";
  carregando.textContent = "Carregando...";
  grade.appendChild(carregando);

  document.getElementById("cal-titulo").textContent =
    MESES[mesAtual.getMonth()] + " de " + mesAtual.getFullYear();

  // A grade comeca no domingo igual/anterior ao dia 1 e cobre semanas completas.
  const primeiro = primeiroDiaDoMes(mesAtual);
  const inicioGrade = new Date(primeiro);
  inicioGrade.setDate(1 - primeiro.getDay());

  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const totalCelulas = Math.ceil((primeiro.getDay() + diasNoMes) / 7) * 7;

  const fimGrade = new Date(inicioGrade);
  fimGrade.setDate(inicioGrade.getDate() + totalCelulas - 1);

  const url = "/api/acoes/calendario.php?" + paramsFiltros()
    + "&inicio=" + ymd(inicioGrade) + "&fim=" + ymd(fimGrade);

  try {
    const resposta = await getApi(url);
    if (!resposta.ok) {
      grade.innerHTML = "";
      grade.textContent = "Nao foi possivel carregar o calendário.";
      return;
    }
    renderizarCalendario(grade, resposta.data.acoes, inicioGrade, totalCelulas);
  } catch (erro) {
    grade.innerHTML = "";
    grade.textContent = "Nao foi possivel carregar o calendário.";
  }
}

function renderizarCalendario(grade, acoes, inicioGrade, totalCelulas) {
  // Agrupa as ações por dia do prazo (YYYY-MM-DD).
  const porDia = {};
  (acoes || []).forEach(function (a) {
    const chave = String(a.prazo).substring(0, 10);
    if (!porDia[chave]) porDia[chave] = [];
    porDia[chave].push(a);
  });

  grade.innerHTML = "";
  const hoje = ymd(new Date());
  const mesVisivel = mesAtual.getMonth();

  for (let i = 0; i < totalCelulas; i++) {
    const dia = new Date(inicioGrade);
    dia.setDate(inicioGrade.getDate() + i);
    const chave = ymd(dia);

    const celula = document.createElement("div");
    celula.className = "cal-dia";
    if (dia.getMonth() !== mesVisivel) celula.classList.add("cal-dia-fora");
    if (chave === hoje) celula.classList.add("cal-dia-hoje");

    const num = document.createElement("span");
    num.className = "cal-num";
    num.textContent = dia.getDate();
    celula.appendChild(num);

    const eventos = porDia[chave] || [];
    eventos.forEach(function (a) {
      const ev = document.createElement("button");
      ev.type = "button";
      ev.className = "cal-evento cal-evento-" + classeEventoCalendario(a, chave, hoje)
        + (parseInt(a.chave, 10) === 1 ? " cal-evento-chave" : "");
      ev.title = a.titulo + " — " + a.demanda_titulo;
      ev.textContent = a.titulo;
      ev.addEventListener("click", function () { abrirDetalhe(a); });
      celula.appendChild(ev);
    });

    grade.appendChild(celula);
  }
}
