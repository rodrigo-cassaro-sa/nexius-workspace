// auditoria.js
// Tela de Auditoria (Admin): lista os logs com filtros e paginacao. So leitura.

let paginaAtual = 1;
let totalPaginas = 1;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  // Apenas Administrador (o backend tambem valida).
  if (usuario.perfil !== "administrador") {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("nav-auditoria").hidden = false;
  document.getElementById("nav-usuarios").hidden = false;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);

  document.getElementById("log-busca").addEventListener("input", debounce(recarregar, 350));
  document.getElementById("log-usuario").addEventListener("change", recarregar);
  document.getElementById("log-acao").addEventListener("change", recarregar);
  document.getElementById("log-inicio").addEventListener("change", recarregar);
  document.getElementById("log-fim").addEventListener("change", recarregar);
  document.getElementById("pag-anterior").addEventListener("click", function () { irPara(paginaAtual - 1); });
  document.getElementById("pag-proxima").addEventListener("click", function () { irPara(paginaAtual + 1); });

  carregarUsuarios();
  carregarAcoes();
  carregar();
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
  carregar();
}

function irPara(p) {
  if (p < 1 || p > totalPaginas) return;
  paginaAtual = p;
  carregar();
}

async function carregarUsuarios() {
  const sel = document.getElementById("log-usuario");
  try {
    const r = await getApi("/api/usuarios/listar.php");
    if (!r.ok) return;
    r.data.usuarios.forEach(function (u) {
      const o = document.createElement("option");
      o.value = u.id;
      o.textContent = u.nome;
      sel.appendChild(o);
    });
  } catch (e) { /* mantem "todos" */ }
}

async function carregarAcoes() {
  const sel = document.getElementById("log-acao");
  try {
    const r = await getApi("/api/logs/acoes.php");
    if (!r.ok) return;
    r.data.acoes.forEach(function (a) {
      const o = document.createElement("option");
      o.value = a;
      o.textContent = a;
      sel.appendChild(o);
    });
  } catch (e) { /* mantem "todas" */ }
}

function filtrosQuery() {
  return "busca=" + encodeURIComponent(document.getElementById("log-busca").value.trim())
    + "&usuario_id=" + encodeURIComponent(document.getElementById("log-usuario").value)
    + "&acao=" + encodeURIComponent(document.getElementById("log-acao").value)
    + "&inicio=" + encodeURIComponent(document.getElementById("log-inicio").value)
    + "&fim=" + encodeURIComponent(document.getElementById("log-fim").value)
    + "&pagina=" + paginaAtual;
}

async function carregar() {
  const alvo = document.getElementById("lista-logs");
  alvo.innerHTML = "<p class=\"texto-secundario\">Carregando...</p>";
  document.getElementById("paginacao").hidden = true;

  try {
    const r = await getApi("/api/logs/listar.php?" + filtrosQuery());
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível carregar os logs.");
      alvo.innerHTML = "";
      return;
    }
    document.getElementById("mensagem").hidden = true;
    if (r.data.logs.length === 0) {
      mostrarVazio("lista-logs", "Nenhum registro encontrado.");
      return;
    }
    renderLogs(alvo, r.data.logs);
    renderPaginacao(r.data.total, r.data.pagina, r.data.por_pagina);
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível carregar os logs.");
    alvo.innerHTML = "";
  }
}

function fmtDataHora(iso) {
  if (!iso) return "—";
  const s = String(iso);
  return s.substring(8, 10) + "/" + s.substring(5, 7) + "/" + s.substring(0, 4) + " " + s.substring(11, 16);
}

function renderLogs(alvo, logs) {
  alvo.innerHTML = "";
  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Data/hora", "Usuário", "Ação", "IP", "Detalhes"].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  logs.forEach(function (l) {
    const tr = document.createElement("tr");
    tr.appendChild(celula("Data/hora", fmtDataHora(l.criado_em)));
    tr.appendChild(celula("Usuário", l.usuario_nome || (l.usuario_id ? ("#" + l.usuario_id) : "—")));

    const tdAcao = celula("Ação", "");
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = l.acao;
    tdAcao.appendChild(badge);
    tr.appendChild(tdAcao);

    tr.appendChild(celula("IP", l.ip || "—"));
    tr.appendChild(celula("Detalhes", l.detalhes || "—"));
    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);
  alvo.appendChild(tabela);
}

function celula(rotulo, texto) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", rotulo);
  if (texto) td.textContent = texto;
  return td;
}

function renderPaginacao(total, pagina, porPagina) {
  totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  paginaAtual = pagina;
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);
  document.getElementById("paginacao-info").textContent = inicio + "–" + fim + " de " + total;
  document.getElementById("pag-anterior").disabled = pagina <= 1;
  document.getElementById("pag-proxima").disabled = pagina >= totalPaginas;
  document.getElementById("paginacao").hidden = false;
}
