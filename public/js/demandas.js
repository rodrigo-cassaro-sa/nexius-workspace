// demandas.js
// Lista de demandas: filtros (busca, status, responsavel), paginacao, criar (modal) e abrir detalhe.

let perfilUsuario = "";
let paginaAtual = 1;
let totalPaginas = 1;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  perfilUsuario = usuario.perfil;
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
  document.getElementById("filtro-responsavel").addEventListener("change", recarregar);
  document.getElementById("pag-anterior").addEventListener("click", function () { irPara(paginaAtual - 1); });
  document.getElementById("pag-proxima").addEventListener("click", function () { irPara(paginaAtual + 1); });

  carregarFiltroResponsaveis();
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

async function carregarFiltroResponsaveis() {
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

async function carregarDemandas() {
  const alvo = document.getElementById("lista-demandas");
  mostrarCarregando("lista-demandas", 4);
  document.getElementById("paginacao").hidden = true;

  const busca = document.getElementById("busca-topo").value.trim();
  const status = document.getElementById("filtro-status").value;
  const responsavel = document.getElementById("filtro-responsavel").value;

  const url = "/api/demandas/listar.php"
    + "?busca=" + encodeURIComponent(busca)
    + "&status=" + encodeURIComponent(status)
    + "&responsavel=" + encodeURIComponent(responsavel)
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
  ["Título", "Status", "Responsável", "Progresso", "Prazo", ""].forEach(function (texto) {
    const th = document.createElement("th");
    th.textContent = texto;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  demandas.forEach(function (d) {
    const tr = document.createElement("tr");

    tr.appendChild(celula("Título", d.titulo));

    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(d.status);
    badge.textContent = rotuloStatus(d.status);
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    tr.appendChild(celula("Responsável", d.responsavel_nome || "—"));

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

async function abrirNova() {
  document.getElementById("form-nova").reset();
  document.getElementById("modal-mensagem").hidden = true;
  await carregarResponsaveis();
  abrirModal("modal-nova");
}

async function carregarResponsaveis() {
  const select = document.getElementById("responsavel");
  try {
    const resposta = await getApi("/api/usuarios/listar.php");
    if (!resposta.ok) return;
    select.length = 1;
    resposta.data.usuarios.forEach(function (u) {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.nome;
      select.appendChild(opt);
    });
  } catch (erro) {
    // Mantem apenas "Sem responsável".
  }
}

async function salvarNova(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-salvar");
  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const responsavel = document.getElementById("responsavel").value;

  if (!tamanhoEntre(titulo, 2, 160)) {
    mostrarErro("modal-mensagem", "Informe um título (2 a 160 caracteres).");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/demandas/criar.php", {
      titulo: titulo,
      descricao: descricao,
      responsavel_id: responsavel
    });

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
