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

  document.getElementById("botao-prazo-fechar").addEventListener("click", function () { fecharModal("modal-prazo"); });
  document.getElementById("botao-prazo-salvar").addEventListener("click", salvarPrazo);

  carregarSetores();
  carregarProjetos();
  carregarRoadmap();
});

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
  cabRot.textContent = "Projeto / Demanda / Tarefa";
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

  // Agrupa por projeto -> demanda preservando a ordem vinda do backend.
  let projAtual = null;
  let demAtual = null;
  itens.forEach(function (it) {
    const projKey = it.projeto_id ? ("p" + it.projeto_id) : "sem";
    if (projKey !== projAtual) {
      projAtual = projKey;
      demAtual = null;
      corpo.appendChild(linhaGrupo("gantt-grupo", it.projeto_nome || "Sem projeto", trackW));
    }
    if (parseInt(it.demanda_id, 10) !== demAtual) {
      demAtual = parseInt(it.demanda_id, 10);
      corpo.appendChild(linhaGrupo("gantt-subgrupo", it.demanda_titulo, trackW));
    }
    corpo.appendChild(linhaItem(it, ini, totalDias, trackW));
  });

  gantt.appendChild(corpo);

  const scroll = document.createElement("div");
  scroll.className = "gantt-scroll";
  scroll.appendChild(gantt);
  alvo.appendChild(scroll);
}

function linhaGrupo(classe, texto, trackW) {
  const linha = document.createElement("div");
  linha.className = "gantt-linha";
  const rot = document.createElement("div");
  rot.className = "gantt-rotulo " + classe;
  rot.textContent = texto;
  const track = document.createElement("div");
  track.className = "gantt-track";
  track.style.width = trackW + "px";
  linha.appendChild(rot);
  linha.appendChild(track);
  return linha;
}

function linhaItem(it, ini, totalDias, trackW) {
  const linha = document.createElement("div");
  linha.className = "gantt-linha";

  const rot = document.createElement("div");
  rot.className = "gantt-rotulo gantt-rotulo-item";
  const titulo = document.createElement("span");
  titulo.className = "gantt-item-titulo";
  titulo.textContent = (parseInt(it.chave, 10) === 1 ? "★ " : "") + it.titulo;
  const sub = document.createElement("span");
  sub.className = "gantt-item-sub texto-secundario";
  sub.textContent = (it.responsavel_nome || "—") + " · " + rotuloTipo(it.tipo);
  rot.appendChild(titulo);
  rot.appendChild(sub);

  const track = document.createElement("div");
  track.className = "gantt-track";
  track.style.width = trackW + "px";

  // Barra: inicio = criacao da tarefa; fim = conclusao (se concluida) ou prazo.
  const inicioBar = parseData(it.criado_em);
  const fimBar = (it.status === "concluida" && it.concluida_em) ? parseData(it.concluida_em) : parseData(it.prazo);
  const fimRange = new Date(ini.getTime() + (totalDias - 1) * 86400000);
  let s = inicioBar < ini ? ini : inicioBar;
  let e = fimBar > fimRange ? fimRange : fimBar;
  if (e < s) e = s;

  const bar = document.createElement("button");
  bar.type = "button";
  bar.className = "gantt-bar gantt-bar-" + classeSituacao(it);
  bar.style.left = (diffDias(ini, s) * PX_DIA) + "px";
  bar.style.width = Math.max((diffDias(s, e) + 1) * PX_DIA, 10) + "px";
  bar.title = it.titulo + " — prazo " + fmtDataBR(it.prazo);
  const txt = document.createElement("span");
  txt.className = "gantt-bar-texto";
  txt.textContent = it.titulo;
  bar.appendChild(txt);
  bar.addEventListener("click", function () { abrirPrazo(it); });

  track.appendChild(bar);
  linha.appendChild(rot);
  linha.appendChild(track);
  return linha;
}

function podeEditarPrazo(it) {
  if (it.status === "concluida" || it.status === "cancelada") return false;
  if (perfilUsuario === "administrador" || perfilUsuario === "gestor") return true;
  return it.setor_responsavel_id && parseInt(it.setor_responsavel_id, 10) === usuarioId;
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
    document.getElementById("prazo-novo").value = String(it.prazo).substring(0, 10);
  }

  abrirModal("modal-prazo");
}

async function salvarPrazo() {
  if (!itemPrazo) return;
  const botao = document.getElementById("botao-prazo-salvar");
  const novo = document.getElementById("prazo-novo").value;

  definirCarregando(botao, true);
  try {
    const r = await postApi("/api/acoes/definir-prazo.php", { id: itemPrazo.id, prazo: novo });
    if (!r.ok) {
      mostrarErro("prazo-mensagem", r.error || "Não foi possível salvar o prazo.");
      definirCarregando(botao, false);
      return;
    }
    definirCarregando(botao, false);
    fecharModal("modal-prazo");
    carregarRoadmap();
  } catch (e) {
    mostrarErro("prazo-mensagem", "Não foi possível salvar o prazo.");
    definirCarregando(botao, false);
  }
}
