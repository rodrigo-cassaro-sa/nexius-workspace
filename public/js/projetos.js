// projetos.js
// Lista de projetos: busca, filtros (status, setor), criar (modal) e abrir detalhe.

let perfilUsuario = "";
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

  // Apenas Gestor/Admin criam projetos.
  if (perfilUsuario === "administrador" || perfilUsuario === "gestor") {
    document.getElementById("botao-novo").hidden = false;
    document.getElementById("botao-novo").addEventListener("click", abrirNovo);
    document.getElementById("botao-cancelar").addEventListener("click", function () { fecharModal("modal-novo"); });
    document.getElementById("form-novo").addEventListener("submit", salvarNovo);
  }

  document.getElementById("proj-busca").addEventListener("input", debounce(carregarProjetos, 350));
  document.getElementById("proj-status").addEventListener("change", carregarProjetos);
  document.getElementById("proj-setor").addEventListener("change", carregarProjetos);

  carregarSetores();
  carregarUsuarios();
  carregarProjetos();
});

function debounce(fn, espera) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, espera);
  };
}

function rotuloStatusProjeto(status) {
  const mapa = {
    aberto: "Aberto",
    em_andamento: "Em andamento",
    concluido: "Concluído",
    arquivado: "Arquivado",
    cancelado: "Cancelado"
  };
  return mapa[status] || status;
}

function classeBadgeProjeto(status) {
  const mapa = {
    aberto: "badge",
    em_andamento: "badge badge-info",
    concluido: "badge badge-sucesso",
    arquivado: "badge",
    cancelado: "badge badge-erro"
  };
  return mapa[status] || "badge";
}

async function carregarSetores() {
  const filtro = document.getElementById("proj-setor");
  const modal = document.getElementById("proj-form-setor");
  try {
    const resposta = await getApi("/api/setores/listar.php");
    if (!resposta.ok) return;
    resposta.data.setores.forEach(function (s) {
      const o1 = document.createElement("option");
      o1.value = s.id;
      o1.textContent = s.nome;
      filtro.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = s.id;
      o2.textContent = s.nome;
      modal.appendChild(o2);
    });
  } catch (erro) {
    // Mantem apenas as opcoes padrao.
  }
}

async function carregarUsuarios() {
  const select = document.getElementById("proj-responsavel");
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
    // Mantem "Sem responsavel".
  }
}

async function carregarProjetos() {
  const alvo = document.getElementById("lista-projetos");
  mostrarCarregando("lista-projetos", 3);

  const busca = document.getElementById("proj-busca").value.trim();
  const status = document.getElementById("proj-status").value;
  const setor = document.getElementById("proj-setor").value;

  const url = "/api/projetos/listar.php"
    + "?busca=" + encodeURIComponent(busca)
    + "&status=" + encodeURIComponent(status)
    + "&setor=" + encodeURIComponent(setor);

  try {
    const resposta = await getApi(url);
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar os projetos.";
      return;
    }
    const projetos = resposta.data.projetos;
    if (projetos.length === 0) {
      mostrarVazio("lista-projetos", "Nenhum projeto encontrado.");
      return;
    }
    renderizarLista(alvo, projetos);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar os projetos.";
  }
}

function renderizarLista(alvo, projetos) {
  alvo.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Projeto", "Status", "Responsável", "Setor", "Demandas", ""].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  projetos.forEach(function (p) {
    const tr = document.createElement("tr");

    tr.appendChild(celula("Projeto", p.nome));

    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const badge = document.createElement("span");
    badge.className = classeBadgeProjeto(p.status);
    badge.textContent = rotuloStatusProjeto(p.status);
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    tr.appendChild(celula("Responsável", p.responsavel_nome || "—"));
    tr.appendChild(celula("Setor", p.setor_nome || "—"));

    const total = parseInt(p.total_demandas, 10) || 0;
    const feitas = parseInt(p.demandas_concluidas, 10) || 0;
    tr.appendChild(celula("Demandas", feitas + "/" + total));

    const tdAcao = document.createElement("td");
    tdAcao.setAttribute("data-rotulo", "");
    const link = document.createElement("a");
    link.href = "projeto.html?id=" + p.id;
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

function abrirNovo() {
  document.getElementById("form-novo").reset();
  document.getElementById("modal-mensagem").hidden = true;
  abrirModal("modal-novo");
}

async function salvarNovo(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-salvar");
  const nome = document.getElementById("proj-nome").value.trim();

  if (!tamanhoEntre(nome, 2, 160)) {
    mostrarErro("modal-mensagem", "Informe um nome (2 a 160 caracteres).");
    return;
  }

  const dados = {
    nome: nome,
    descricao: document.getElementById("proj-descricao").value.trim(),
    status: document.getElementById("proj-form-status").value,
    responsavel_id: document.getElementById("proj-responsavel").value,
    setor_id: document.getElementById("proj-form-setor").value
  };

  definirCarregando(botao, true);
  try {
    const resposta = await postApi("/api/projetos/criar.php", dados);
    if (!resposta.ok) {
      mostrarErro("modal-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    fecharModal("modal-novo");
    definirCarregando(botao, false);
    // Vai direto para o detalhe do projeto recem-criado.
    window.location.href = "projeto.html?id=" + resposta.data.id;
  } catch (erro) {
    mostrarErro("modal-mensagem", "Nao foi possivel criar o projeto.");
    definirCarregando(botao, false);
  }
}
