// demandas.js
// Lista de demandas: filtros, criar (modal) e abrir detalhe.
// A permissao real e validada no backend; aqui so experiencia.

let perfilUsuario = "";

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

  // Apenas Gestor/Admin criam demandas.
  if (perfilUsuario === "administrador" || perfilUsuario === "gestor") {
    document.getElementById("botao-nova").hidden = false;
    document.getElementById("botao-nova").addEventListener("click", abrirNova);
    document.getElementById("botao-cancelar").addEventListener("click", function () { fecharModal("modal-nova"); });
    document.getElementById("form-nova").addEventListener("submit", salvarNova);
  }

  document.getElementById("filtro-busca").addEventListener("input", debounce(carregarDemandas, 350));
  document.getElementById("filtro-status").addEventListener("change", carregarDemandas);

  carregarDemandas();
});

function debounce(fn, espera) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, espera);
  };
}

async function carregarDemandas() {
  const alvo = document.getElementById("lista-demandas");
  mostrarCarregando("lista-demandas", 3);

  const busca = document.getElementById("filtro-busca").value.trim();
  const status = document.getElementById("filtro-status").value;

  const url = "/api/demandas/listar.php?busca=" + encodeURIComponent(busca) + "&status=" + encodeURIComponent(status);

  try {
    const resposta = await getApi(url);
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as demandas.";
      return;
    }

    const demandas = resposta.data.demandas;
    if (demandas.length === 0) {
      mostrarVazio("lista-demandas", "Nenhuma demanda encontrada.");
      return;
    }

    renderizarLista(alvo, demandas);
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
  ["Título", "Status", "Responsável", "Criada em", ""].forEach(function (texto) {
    const th = document.createElement("th");
    th.textContent = texto;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  demandas.forEach(function (d) {
    const tr = document.createElement("tr");

    const tdTitulo = celula("Título", d.titulo);

    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(d.status);
    badge.textContent = rotuloStatus(d.status);
    tdStatus.appendChild(badge);

    const tdResp = celula("Responsável", d.responsavel_nome || "—");
    const tdData = celula("Criada em", (d.criado_em || "").substring(0, 10));

    const tdAcao = document.createElement("td");
    tdAcao.setAttribute("data-rotulo", "");
    const link = document.createElement("a");
    link.href = "demanda.html?id=" + d.id;
    link.textContent = "Abrir";
    tdAcao.appendChild(link);

    tr.appendChild(tdTitulo);
    tr.appendChild(tdStatus);
    tr.appendChild(tdResp);
    tr.appendChild(tdData);
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

    // Mantem a primeira opcao ("Sem responsável") e adiciona os usuarios.
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
    carregarDemandas();
  } catch (erro) {
    mostrarErro("modal-mensagem", "Nao foi possivel criar a demanda.");
    definirCarregando(botao, false);
  }
}
