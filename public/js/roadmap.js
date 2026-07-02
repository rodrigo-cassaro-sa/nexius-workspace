// roadmap.js
// Gantt/linha do tempo (D23): tarefas com prazo posicionadas no tempo, agrupadas por
// projeto e demanda. Visao geral para todos (escopo aplicado no backend). Gestor/Admin e
// o key user do setor podem prorrogar o prazo (clicando na barra). Sem bibliotecas.

const PX_DIA = 14;   // largura de cada dia em pixels
const LABEL_W = 240; // largura da coluna de rotulos (igual ao CSS .gantt-rotulo)

let perfilUsuario = "";
let usuarioId = 0;
let itemPrazo = null;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  perfilUsuario = usuario.perfil;
  usuarioId = parseInt(usuario.id, 10);
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  // Recalcular agenda por prioridade: Gestor/Admin.
  if (usuario.perfil === "administrador" || usuario.perfil === "gestor") {
    const btnRecalc = document.getElementById("road-recalcular");
    btnRecalc.hidden = false;
    btnRecalc.addEventListener("click", recalcularAgenda);
  }

  // Janela padrao: 2 semanas atras ate 3 meses a frente.
  const hoje = new Date();
  const ini = new Date(); ini.setDate(hoje.getDate() - 14);
  const fim = new Date(); fim.setDate(hoje.getDate() + 90);
  document.getElementById("road-inicio").value = formatarISO(ini);
  document.getElementById("road-fim").value = formatarISO(fim);

  document.getElementById("road-inicio").addEventListener("change", carregarRoadmap);
  document.getElementById("road-fim").addEventListener("change", carregarRoadmap);
  document.getElementById("road-projeto").addEventListener("change", carregarRoadmap);
  document.getElementById("road-setor").addEventListener("change", carregarRoadmap);
  document.getElementById("road-agrupar").addEventListener("change", carregarRoadmap);

  document.getElementById("botao-prazo-fechar").addEventListener("click", function () { fecharModal("modal-prazo"); });
  document.getElementById("botao-prazo-salvar").addEventListener("click", salvarTarefa);

  carregarSetores();
  carregarProjetos();
  carregarUsuarios();
  carregarRoadmap();
});

// Popula o select de responsavel do modal (usado ao editar a tarefa).
async function carregarUsuarios() {
  const sel = document.getElementById("prazo-responsavel");
  try {
    const r = await getApi("/api/usuarios/listar.php");
    if (!r.ok) return;
    r.data.usuarios.forEach(function (u) {
      const o = document.createElement("option");
      o.value = u.id;
      o.textContent = u.nome;
      sel.appendChild(o);
    });
  } catch (e) {
    // Mantem "Sem responsável".
  }
}

// ---- Helpers de data ----
function formatarISO(d) {
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
}
function parseData(s) {
  const p = String(s).substring(0, 10).split("-");
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}
function diffDias(a, b) {
  return Math.round((b - a) / 86400000);
}
function fmtDiaMes(d) {
  return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2);
}
function fmtDataBR(iso) {
  if (!iso) return "—";
  const s = String(iso).substring(0, 10).split("-");
  return s[2] + "/" + s[1] + "/" + s[0];
}

function rotuloTipo(tipo) {
  const mapa = { analise: "Análise", desenvolvimento: "Desenvolvimento", entrega: "Entrega", incidente: "Incidente", reuniao: "Reunião" };
  return mapa[tipo] || tipo;
}

// Intervalo (em ms) que a tarefa ocupa: inicio = criacao; fim = conclusao (se concluida) ou prazo.
function intervaloBarra(it) {
  const ini = parseData(it.criado_em).getTime();
  const fim = ((it.status === "concluida" && it.concluida_em) ? parseData(it.concluida_em) : parseData(it.prazo)).getTime();
  return { ini: ini, fim: fim };
}

// Converte um intervalo (ms) em left/width (px), recortado a janela visivel.
function posicaoBarra(iniMs, fimMs, ini, totalDias) {
  const fimRange = new Date(ini.getTime() + (totalDias - 1) * 86400000);
  let s = new Date(iniMs); s.setHours(0, 0, 0, 0);
  let e = new Date(fimMs); e.setHours(0, 0, 0, 0);
  if (s < ini) s = ini;
  if (e > fimRange) e = fimRange;
  if (e < s) e = s;
  return {
    left: diffDias(ini, s) * PX_DIA,
    width: Math.max((diffDias(s, e) + 1) * PX_DIA, 10)
  };
}

// Situacao (cor da barra): recusada, concluida, atrasada (pendente vencida), bloqueada, pendente.
function classeSituacao(it) {
  if (it.status === "recusada") return "recusada";
  if (it.status === "concluida") return "concluida";
  const bloqueada = it.status === "pendente" && parseInt(it.prereq_pendentes, 10) > 0;
  if (bloqueada) return "bloqueada";
  if (it.status === "pendente") {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    if (parseData(it.prazo) < hoje) return "atrasada";
    return "pendente";
  }
  return it.status;
}
function rotuloSituacao(it) {
  const mapa = { pendente: "Pendente", bloqueada: "Bloqueada", atrasada: "Atrasada", concluida: "Concluída", recusada: "Recusada" };
  return mapa[classeSituacao(it)] || it.status;
}

async function carregarSetores() {
  const sel = document.getElementById("road-setor");
  try {
    const r = await getApi("/api/setores/listar.php");
    if (!r.ok) return;
    r.data.setores.forEach(function (s) {
      const o = document.createElement("option");
      o.value = s.id; o.textContent = s.nome;
      sel.appendChild(o);
    });
  } catch (e) { /* mantem "todos" */ }
}

async function carregarProjetos() {
  const sel = document.getElementById("road-projeto");
  try {
    const r = await getApi("/api/projetos/listar.php");
    if (!r.ok) return;
    r.data.projetos.forEach(function (p) {
      const o = document.createElement("option");
      o.value = p.id; o.textContent = p.nome;
      sel.appendChild(o);
    });
  } catch (e) { /* mantem "todos" */ }
}

async function carregarRoadmap() {
  const alvo = document.getElementById("roadmap");
  alvo.innerHTML = "<p class=\"texto-secundario\">Carregando...</p>";

  const inicio = document.getElementById("road-inicio").value;
  const fim = document.getElementById("road-fim").value;
  const projeto = document.getElementById("road-projeto").value;
  const setor = document.getElementById("road-setor").value;

  const url = "/api/roadmap/listar.php?inicio=" + encodeURIComponent(inicio)
    + "&fim=" + encodeURIComponent(fim)
    + "&projeto=" + encodeURIComponent(projeto)
    + "&setor=" + encodeURIComponent(setor);

  try {
    const r = await getApi(url);
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível carregar o roadmap.");
      alvo.innerHTML = "";
      return;
    }
    document.getElementById("mensagem").hidden = true;
    render(r.data);
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível carregar o roadmap.");
    alvo.innerHTML = "";
  }
}

function render(data) {
  const alvo = document.getElementById("roadmap");
  alvo.innerHTML = "";

  const itens = data.itens || [];
  if (itens.length === 0) {
    mostrarVazio("roadmap", "Nenhuma tarefa com prazo no período selecionado.");
    return;
  }

  // Sinalizacao de impacto por prioridade (o backend marca em_risco; nao altera prazos).
  itens.forEach(function (it) { it.__risco = parseInt(it.em_risco, 10) === 1; });

  const totalRisco = itens.filter(function (it) { return it.__risco; }).length;
  const aviso = document.createElement("div");
  if (totalRisco > 0) {
    aviso.className = "gantt-risco-aviso";
    aviso.textContent = "⚠ " + totalRisco + (totalRisco === 1 ? " tarefa em risco de atraso" : " tarefas em risco de atraso")
      + ": uma de maior prioridade concorre no mesmo período com o mesmo responsável. Repriorize ou reagende para tirar o conflito.";
  } else {
    aviso.className = "gantt-risco-aviso gantt-risco-ok";
    aviso.textContent = "Sem conflitos de prioridade no período: cada responsável dá conta da fila sem sobreposição de maior prioridade.";
  }
  alvo.appendChild(aviso);

  const modo = document.getElementById("road-agrupar").value;
  const ini = parseData(data.inicio);
  const fim = parseData(data.fim);
  const totalDias = diffDias(ini, fim) + 1;
  const trackW = totalDias * PX_DIA;

  const gantt = document.createElement("div");
  gantt.className = "gantt";
  gantt.style.width = (LABEL_W + trackW) + "px";

  // Cabecalho com marcas a cada 7 dias.
  const cab = document.createElement("div");
  cab.className = "gantt-cabecalho";
  const cabRot = document.createElement("div");
  cabRot.className = "gantt-rotulo gantt-rotulo-cab";
  cabRot.textContent = modo === "responsavel" ? "Responsável / Tarefa"
    : (modo === "setor" ? "Setor / Tarefa" : "Projeto / Demanda / Tarefa");
  const eixo = document.createElement("div");
  eixo.className = "gantt-eixo";
  eixo.style.width = trackW + "px";
  for (let i = 0; i <= totalDias; i += 7) {
    const tick = document.createElement("div");
    tick.className = "gantt-tick";
    tick.style.left = (i * PX_DIA) + "px";
    tick.textContent = fmtDiaMes(new Date(ini.getTime() + i * 86400000));
    eixo.appendChild(tick);
  }
  cab.appendChild(cabRot);
  cab.appendChild(eixo);
  gantt.appendChild(cab);

  const corpo = document.createElement("div");
  corpo.className = "gantt-corpo";

  // Linha vertical do "hoje".
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const offHoje = diffDias(ini, hoje);
  if (offHoje >= 0 && offHoje <= totalDias) {
    const lh = document.createElement("div");
    lh.className = "gantt-hoje";
    lh.style.left = (LABEL_W + offHoje * PX_DIA) + "px";
    lh.title = "Hoje";
    corpo.appendChild(lh);
  }

  if (modo === "responsavel" || modo === "setor") {
    renderPorChave(corpo, itens, ini, totalDias, trackW, modo);
  } else {
    renderPorProjeto(corpo, itens, ini, totalDias, trackW);
  }

  gantt.appendChild(corpo);

  const scroll = document.createElement("div");
  scroll.className = "gantt-scroll";
  scroll.appendChild(gantt);
  alvo.appendChild(scroll);
}

// Visao padrao: projeto -> demanda -> tarefa (com barras-resumo por grupo).
function renderPorProjeto(corpo, itens, ini, totalDias, trackW) {
  const spanProj = {};
  const spanDem = {};
  const riscoProj = {};
  const riscoDem = {};
  itens.forEach(function (it) {
    const iv = intervaloBarra(it);
    const pk = it.projeto_id ? ("p" + it.projeto_id) : "sem";
    if (!spanProj[pk]) { spanProj[pk] = { ini: iv.ini, fim: iv.fim }; }
    else { spanProj[pk].ini = Math.min(spanProj[pk].ini, iv.ini); spanProj[pk].fim = Math.max(spanProj[pk].fim, iv.fim); }
    const dk = it.demanda_id;
    if (!spanDem[dk]) { spanDem[dk] = { ini: iv.ini, fim: iv.fim }; }
    else { spanDem[dk].ini = Math.min(spanDem[dk].ini, iv.ini); spanDem[dk].fim = Math.max(spanDem[dk].fim, iv.fim); }
    if (it.__risco) { riscoProj[pk] = true; riscoDem[dk] = true; }
  });

  let projAtual = null;
  let demAtual = null;
  itens.forEach(function (it) {
    const projKey = it.projeto_id ? ("p" + it.projeto_id) : "sem";
    if (projKey !== projAtual) {
      projAtual = projKey;
      demAtual = null;
      const rotProj = (it.projeto_nome || "Sem projeto") + (riscoProj[projKey] ? " ⚠" : "");
      corpo.appendChild(linhaGrupo("gantt-grupo", rotProj, trackW, ini, totalDias, spanProj[projKey]));
    }
    if (parseInt(it.demanda_id, 10) !== demAtual) {
      demAtual = parseInt(it.demanda_id, 10);
      const rotDem = it.demanda_titulo + (riscoDem[it.demanda_id] ? " ⚠" : "");
      corpo.appendChild(linhaGrupo("gantt-subgrupo", rotDem, trackW, ini, totalDias, spanDem[it.demanda_id]));
    }
    corpo.appendChild(linhaItem(it, ini, totalDias, trackW, (it.responsavel_nome || "—") + " · " + rotuloTipo(it.tipo)));
  });
}

// Visao de carga: agrupa por responsavel (key user/pessoa) ou por setor, com a fila
// de tarefas pelo prazo. O contador e a barra-resumo ajudam a ver sobrecarga.
function renderPorChave(corpo, itens, ini, totalDias, trackW, modo) {
  function chave(it) {
    if (modo === "setor") return it.setor_id ? ("s" + it.setor_id) : "sem";
    return it.responsavel_id ? ("u" + it.responsavel_id) : "sem";
  }
  function rotulo(it) {
    if (modo === "setor") return it.setor_nome || "Sem setor";
    return it.responsavel_nome || "Sem responsável";
  }

  // Ordena por grupo (rotulo) e depois por prazo.
  const ordenados = itens.slice().sort(function (a, b) {
    const ra = rotulo(a).toLowerCase();
    const rb = rotulo(b).toLowerCase();
    if (ra !== rb) return ra < rb ? -1 : 1;
    return String(a.prazo).localeCompare(String(b.prazo));
  });

  // Span (janela total), contagem e tarefas em risco por grupo.
  const spans = {};
  const contagem = {};
  const riscoGrupo = {};
  ordenados.forEach(function (it) {
    const k = chave(it);
    const iv = intervaloBarra(it);
    if (!spans[k]) { spans[k] = { ini: iv.ini, fim: iv.fim }; contagem[k] = 0; riscoGrupo[k] = 0; }
    else { spans[k].ini = Math.min(spans[k].ini, iv.ini); spans[k].fim = Math.max(spans[k].fim, iv.fim); }
    contagem[k]++;
    if (it.__risco) riscoGrupo[k]++;
  });

  let atual = null;
  ordenados.forEach(function (it) {
    const k = chave(it);
    if (k !== atual) {
      atual = k;
      const n = contagem[k];
      let titulo = rotulo(it) + " · " + n + (n === 1 ? " tarefa" : " tarefas");
      if (riscoGrupo[k] > 0) titulo += " · ⚠ " + riscoGrupo[k] + " em risco";
      corpo.appendChild(linhaGrupo("gantt-grupo", titulo, trackW, ini, totalDias, spans[k]));
    }
    // Subtitulo de contexto: no setor mostra o responsavel; no responsavel mostra a demanda.
    const sub = (modo === "setor" ? (it.responsavel_nome || "—") : it.demanda_titulo) + " · " + rotuloTipo(it.tipo);
    corpo.appendChild(linhaItem(it, ini, totalDias, trackW, sub));
  });
}

function linhaGrupo(classe, texto, trackW, ini, totalDias, span) {
  const linha = document.createElement("div");
  linha.className = "gantt-linha";
  const rot = document.createElement("div");
  rot.className = "gantt-rotulo " + classe;
  rot.textContent = texto;
  const track = document.createElement("div");
  track.className = "gantt-track";
  track.style.width = trackW + "px";

  // Barra-resumo: span do inicio mais cedo ao prazo mais tarde do grupo (overview).
  if (span) {
    const pos = posicaoBarra(span.ini, span.fim, ini, totalDias);
    const resumo = document.createElement("div");
    resumo.className = "gantt-bar-resumo";
    resumo.style.left = pos.left + "px";
    resumo.style.width = pos.width + "px";
    track.appendChild(resumo);
  }

  linha.appendChild(rot);
  linha.appendChild(track);
  return linha;
}

function linhaItem(it, ini, totalDias, trackW, subTexto) {
  const linha = document.createElement("div");
  linha.className = "gantt-linha";

  const rot = document.createElement("div");
  rot.className = "gantt-rotulo gantt-rotulo-item";
  const titulo = document.createElement("span");
  titulo.className = "gantt-item-titulo";
  titulo.textContent = (parseInt(it.chave, 10) === 1 ? "★ " : "") + it.titulo + (it.__risco ? " ⚠" : "");
  const sub = document.createElement("span");
  sub.className = "gantt-item-sub texto-secundario";
  sub.textContent = subTexto || ((it.responsavel_nome || "—") + " · " + rotuloTipo(it.tipo));
  rot.appendChild(titulo);
  rot.appendChild(sub);

  const track = document.createElement("div");
  track.className = "gantt-track";
  track.style.width = trackW + "px";

  // Barra: inicio = criacao da tarefa; fim = conclusao (se concluida) ou prazo.
  const iv = intervaloBarra(it);
  const pos = posicaoBarra(iv.ini, iv.fim, ini, totalDias);

  const bar = document.createElement("button");
  bar.type = "button";
  bar.className = "gantt-bar gantt-bar-" + classeSituacao(it) + (it.__risco ? " gantt-bar-risco" : "");
  bar.style.left = pos.left + "px";
  bar.style.width = pos.width + "px";
  bar.title = it.titulo + " — prazo " + fmtDataBR(it.prazo)
    + (it.__risco ? " · Em risco: tarefa de maior prioridade concorre no mesmo período (mesmo responsável)." : "");
  const txt = document.createElement("span");
  txt.className = "gantt-bar-texto";
  txt.textContent = it.titulo;
  bar.appendChild(txt);
  configurarBarra(bar, it);

  track.appendChild(bar);
  linha.appendChild(rot);
  linha.appendChild(track);
  return linha;
}

// Configura a barra: clique abre o popup; se o usuario pode editar e a tarefa tem prazo,
// habilita arrastar para deslocar o prazo em dias (rasta e solta).
// - No corpo da barra: arrasta so com MOUSE (no toque isso rolaria a timeline).
// - Numa alca dedicada (direita): arrasta com mouse E toque (a alca nao rola).
function configurarBarra(bar, it) {
  if (podeEditarPrazo(it) && it.prazo) {
    bar.classList.add("gantt-bar-editavel");
    ativarArraste(bar, bar, it, "mouse");

    const alca = document.createElement("span");
    alca.className = "gantt-bar-alca";
    alca.title = "Arraste para mudar o prazo";
    bar.appendChild(alca);
    ativarArraste(alca, bar, it, "qualquer");
  }

  bar.addEventListener("click", function (e) {
    // Se acabou de arrastar, nao abre o popup (o arraste ja aplicou o prazo).
    if (bar.dataset.arrastou === "1") {
      bar.dataset.arrastou = "";
      e.preventDefault();
      return;
    }
    abrirPrazo(it);
  });
}

// Liga o arraste em "alvo" movendo visualmente "bar" e ajustando o prazo de "it".
// modo "mouse" = so ponteiro de mouse; "qualquer" = mouse ou toque.
function ativarArraste(alvo, bar, it, modo) {
  let arrastando = false;
  let startX = 0;
  let dx = 0;

  alvo.addEventListener("pointerdown", function (e) {
    if (modo === "mouse" && e.pointerType !== "mouse") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    arrastando = true;
    dx = 0;
    startX = e.clientX;
    bar.dataset.arrastou = "";
    alvo.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });

  alvo.addEventListener("pointermove", function (e) {
    if (!arrastando) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 3) {
      bar.dataset.arrastou = "1";
      bar.classList.add("gantt-bar-arrastando");
    }
    bar.style.transform = "translateX(" + dx + "px)";
    if (bar.dataset.arrastou === "1") {
      const dias = Math.round(dx / PX_DIA);
      const novo = formatarISO(new Date(parseData(it.prazo).getTime() + dias * 86400000));
      mostrarDicaArraste(e.clientX, e.clientY, fmtDataBR(novo) + " (" + (dias >= 0 ? "+" : "") + dias + "d)");
    }
    e.preventDefault();
  });

  function finalizar() {
    if (!arrastando) return;
    arrastando = false;
    bar.classList.remove("gantt-bar-arrastando");
    bar.style.transform = "";
    esconderDicaArraste();
    if (bar.dataset.arrastou === "1") {
      const dias = Math.round(dx / PX_DIA);
      if (dias !== 0) {
        aplicarNovoPrazo(it, dias);
      }
    }
  }

  alvo.addEventListener("pointerup", finalizar);
  alvo.addEventListener("pointercancel", function () {
    arrastando = false;
    bar.classList.remove("gantt-bar-arrastando");
    bar.style.transform = "";
    esconderDicaArraste();
  });
}

// Dica flutuante com a nova data enquanto arrasta (elemento unico, reaproveitado).
let dicaArrasteEl = null;
function mostrarDicaArraste(x, y, texto) {
  if (!dicaArrasteEl) {
    dicaArrasteEl = document.createElement("div");
    dicaArrasteEl.className = "gantt-drag-dica";
    document.body.appendChild(dicaArrasteEl);
  }
  dicaArrasteEl.textContent = texto;
  dicaArrasteEl.style.left = (x + 12) + "px";
  dicaArrasteEl.style.top = (y + 12) + "px";
  dicaArrasteEl.hidden = false;
}
function esconderDicaArraste() {
  if (dicaArrasteEl) {
    dicaArrasteEl.hidden = true;
  }
}

function podeEditarPrazo(it) {
  if (it.status === "concluida" || it.status === "cancelada") return false;
  if (perfilUsuario === "administrador" || perfilUsuario === "gestor") return true;
  // Key user do setor da demanda.
  if (it.setor_responsavel_id && parseInt(it.setor_responsavel_id, 10) === usuarioId) return true;
  // Responsavel pela propria tarefa.
  return parseInt(it.responsavel_id, 10) === usuarioId;
}

function abrirPrazo(it) {
  itemPrazo = it;
  document.getElementById("prazo-titulo").textContent = it.titulo;
  document.getElementById("prazo-info").textContent =
    "Demanda: " + it.demanda_titulo
    + (it.projeto_nome ? (" · Projeto: " + it.projeto_nome) : "")
    + " · Prazo atual: " + fmtDataBR(it.prazo)
    + " · Situação: " + rotuloSituacao(it);
  document.getElementById("prazo-link").href = "demanda.html?id=" + it.demanda_id;
  document.getElementById("prazo-mensagem").hidden = true;

  const canEdit = podeEditarPrazo(it);
  document.getElementById("prazo-editar").hidden = !canEdit;
  document.getElementById("botao-prazo-salvar").hidden = !canEdit;
  if (canEdit) {
    document.getElementById("prazo-novo").value = it.prazo ? String(it.prazo).substring(0, 10) : "";
    document.getElementById("prazo-responsavel").value = it.responsavel_id ? String(it.responsavel_id) : "";
    document.getElementById("prazo-esforco").value = it.esforco_dias ? String(it.esforco_dias) : "";
  }

  abrirModal("modal-prazo");
}

// Salva responsavel, prazo e/ou esforco (so envia o que mudou).
async function salvarTarefa() {
  if (!itemPrazo) return;
  const botao = document.getElementById("botao-prazo-salvar");
  const novoPrazo = document.getElementById("prazo-novo").value;
  const novoResp = document.getElementById("prazo-responsavel").value;
  const novoEsforco = document.getElementById("prazo-esforco").value;

  const prazoAtual = itemPrazo.prazo ? String(itemPrazo.prazo).substring(0, 10) : "";
  const respAtual = itemPrazo.responsavel_id ? String(itemPrazo.responsavel_id) : "";
  const esforcoAtual = itemPrazo.esforco_dias ? String(itemPrazo.esforco_dias) : "";

  definirCarregando(botao, true);
  try {
    if (novoResp !== respAtual) {
      const rr = await postApi("/api/acoes/definir-responsavel.php", { id: itemPrazo.id, responsavel_id: novoResp });
      if (!rr.ok) {
        mostrarErro("prazo-mensagem", rr.error || "Não foi possível salvar o responsável.");
        definirCarregando(botao, false);
        return;
      }
    }
    if (novoPrazo !== prazoAtual) {
      const rp = await postApi("/api/acoes/definir-prazo.php", { id: itemPrazo.id, prazo: novoPrazo });
      if (!rp.ok) {
        mostrarErro("prazo-mensagem", rp.error || "Não foi possível salvar o prazo.");
        definirCarregando(botao, false);
        return;
      }
    }
    if (novoEsforco !== esforcoAtual) {
      const re = await postApi("/api/acoes/definir-esforco.php", { id: itemPrazo.id, esforco_dias: novoEsforco });
      if (!re.ok) {
        mostrarErro("prazo-mensagem", re.error || "Não foi possível salvar o esforço.");
        definirCarregando(botao, false);
        return;
      }
    }
    definirCarregando(botao, false);
    fecharModal("modal-prazo");
    carregarRoadmap();
  } catch (e) {
    mostrarErro("prazo-mensagem", "Não foi possível salvar a tarefa.");
    definirCarregando(botao, false);
  }
}

// Recalcula a agenda por prioridade (Gestor/Admin): REESCREVE os prazos das tarefas pendentes.
async function recalcularAgenda() {
  if (!confirm("Recalcular a agenda por prioridade?\n\nIsto REESCREVE os prazos das tarefas pendentes de cada responsável (as de maior prioridade primeiro, respeitando o esforço e a capacidade). Não pode ser desfeito automaticamente.")) {
    return;
  }
  try {
    const r = await postApi("/api/agenda/recalcular.php", {});
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível recalcular a agenda.");
      return;
    }
    window.alert(r.message || "Agenda recalculada.");
    carregarRoadmap();
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível recalcular a agenda.");
  }
}

// Aplica um novo prazo deslocado por N dias (usado pelo arrastar-e-soltar da barra).
async function aplicarNovoPrazo(it, dias) {
  const base = parseData(it.prazo);
  const novo = formatarISO(new Date(base.getTime() + dias * 86400000));
  try {
    const r = await postApi("/api/acoes/definir-prazo.php", { id: it.id, prazo: novo });
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível ajustar o prazo.");
      return;
    }
    carregarRoadmap();
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível ajustar o prazo.");
  }
}
