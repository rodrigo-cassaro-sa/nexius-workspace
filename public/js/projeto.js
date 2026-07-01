// projeto.js
// Detalhe do projeto: dados, edicao (Gestor/Admin), arquivar/cancelar e demandas vinculadas.

let projetoId = 0;
let perfilUsuario = "";
let podeEditar = false;
let selecoesCarregadas = false;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  perfilUsuario = usuario.perfil;
  podeEditar = (perfilUsuario === "administrador" || perfilUsuario === "gestor");

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  if (perfilUsuario === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  projetoId = parseInt(new URLSearchParams(location.search).get("id"), 10) || 0;
  if (projetoId <= 0) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Projeto não informado.");
    return;
  }

  if (podeEditar) {
    document.getElementById("botao-editar").addEventListener("click", abrirEdicao);
    document.getElementById("botao-cancelar-edicao").addEventListener("click", fecharEdicao);
    document.getElementById("form-editar").addEventListener("submit", salvarEdicao);
    document.getElementById("botao-arquivar").addEventListener("click", function () { mudarStatusArquivo("arquivado"); });
    document.getElementById("botao-cancelar-projeto").addEventListener("click", function () { mudarStatusArquivo("cancelado"); });
  }

  carregarProjeto();
  carregarDemandas();
});

function formatarPrazoBR(iso) {
  if (!iso) return "—";
  const s = String(iso).substring(0, 10).split("-");
  return s.length === 3 ? (s[2] + "/" + s[1] + "/" + s[0]) : "—";
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

let projetoAtual = null;

async function carregarProjeto() {
  try {
    const resposta = await getApi("/api/projetos/detalhe.php?id=" + projetoId);
    document.getElementById("carregando").hidden = true;

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Não foi possível carregar o projeto.");
      return;
    }

    projetoAtual = resposta.data.projeto;
    document.getElementById("conteudo").hidden = false;
    renderProjeto(projetoAtual);
  } catch (erro) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Não foi possível carregar o projeto.");
  }
}

function renderProjeto(p) {
  document.getElementById("p-nome").textContent = p.nome;

  const badge = document.getElementById("p-status");
  badge.className = classeBadgeProjeto(p.status);
  badge.textContent = rotuloStatusProjeto(p.status);

  const desc = document.getElementById("p-descricao");
  if (p.descricao && p.descricao.trim() !== "") {
    desc.textContent = p.descricao;
    desc.hidden = false;
  } else {
    desc.hidden = true;
  }

  document.getElementById("p-responsavel").textContent = p.responsavel_nome || "—";
  document.getElementById("p-setor").textContent = p.setor_nome || "—";
  document.getElementById("p-prazo").textContent = formatarPrazoBR(p.prazo);
  document.getElementById("p-criador").textContent = p.criador_nome || "—";

  const total = parseInt(p.total_demandas, 10) || 0;
  const feitas = parseInt(p.demandas_concluidas, 10) || 0;
  document.getElementById("p-demandas").textContent = feitas + "/" + total;

  if (podeEditar) {
    document.getElementById("acoes-projeto").hidden = false;
  }
}

// Carrega usuarios e setores nos selects de edicao (uma vez).
async function carregarSelecoes() {
  if (selecoesCarregadas) return;
  selecoesCarregadas = true;

  try {
    const ru = await getApi("/api/usuarios/listar.php");
    if (ru.ok) {
      const sel = document.getElementById("e-responsavel");
      ru.data.usuarios.forEach(function (u) {
        const o = document.createElement("option");
        o.value = u.id;
        o.textContent = u.nome;
        sel.appendChild(o);
      });
    }
  } catch (erro) { /* ignora */ }

  try {
    const rs = await getApi("/api/setores/listar.php");
    if (rs.ok) {
      const sel = document.getElementById("e-setor");
      rs.data.setores.forEach(function (s) {
        const o = document.createElement("option");
        o.value = s.id;
        o.textContent = s.nome;
        sel.appendChild(o);
      });
    }
  } catch (erro) { /* ignora */ }
}

async function abrirEdicao() {
  await carregarSelecoes();

  document.getElementById("e-nome").value = projetoAtual.nome;
  document.getElementById("e-descricao").value = projetoAtual.descricao || "";
  // Status de edicao so aceita aberto/em_andamento/concluido; se vier arquivado/cancelado, cai em "aberto".
  const statusEdicao = ["aberto", "em_andamento", "concluido"];
  document.getElementById("e-status").value = statusEdicao.indexOf(projetoAtual.status) !== -1 ? projetoAtual.status : "aberto";
  document.getElementById("e-responsavel").value = projetoAtual.responsavel_id || "";
  document.getElementById("e-setor").value = projetoAtual.setor_id || "";
  document.getElementById("e-prazo").value = projetoAtual.prazo ? String(projetoAtual.prazo).substring(0, 10) : "";
  document.getElementById("editar-mensagem").hidden = true;

  document.getElementById("card-editar").hidden = false;
}

function fecharEdicao() {
  document.getElementById("card-editar").hidden = true;
}

async function salvarEdicao(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-salvar-edicao");
  const nome = document.getElementById("e-nome").value.trim();
  if (!tamanhoEntre(nome, 2, 160)) {
    mostrarErro("editar-mensagem", "Informe um nome (2 a 160 caracteres).");
    return;
  }

  const dados = {
    id: projetoId,
    nome: nome,
    descricao: document.getElementById("e-descricao").value.trim(),
    status: document.getElementById("e-status").value,
    prazo: document.getElementById("e-prazo").value,
    responsavel_id: document.getElementById("e-responsavel").value,
    setor_id: document.getElementById("e-setor").value
  };

  definirCarregando(botao, true);
  try {
    const resposta = await postApi("/api/projetos/atualizar.php", dados);
    if (!resposta.ok) {
      mostrarErro("editar-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    definirCarregando(botao, false);
    fecharEdicao();
    carregarProjeto();
  } catch (erro) {
    mostrarErro("editar-mensagem", "Não foi possível salvar o projeto.");
    definirCarregando(botao, false);
  }
}

async function mudarStatusArquivo(status) {
  const acao = status === "cancelado" ? "cancelar" : "arquivar";
  if (!confirm("Tem certeza que deseja " + acao + " este projeto? As demandas vinculadas continuam existindo.")) {
    return;
  }

  try {
    const resposta = await postApi("/api/projetos/arquivar.php", { id: projetoId, status: status });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Não foi possível atualizar o projeto.");
      return;
    }
    carregarProjeto();
  } catch (erro) {
    mostrarErro("mensagem", "Não foi possível atualizar o projeto.");
  }
}

async function carregarDemandas() {
  const alvo = document.getElementById("lista-demandas-projeto");
  try {
    const resposta = await getApi("/api/demandas/listar.php?projeto=" + projetoId);
    if (!resposta.ok) {
      alvo.textContent = "Não foi possível carregar as demandas.";
      return;
    }
    const demandas = resposta.data.demandas;
    if (demandas.length === 0) {
      alvo.innerHTML = "";
      const p = document.createElement("p");
      p.className = "texto-secundario";
      p.textContent = "Nenhuma demanda vinculada a este projeto.";
      alvo.appendChild(p);
      return;
    }
    renderDemandas(alvo, demandas);
  } catch (erro) {
    alvo.textContent = "Não foi possível carregar as demandas.";
  }
}

function renderDemandas(alvo, demandas) {
  alvo.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Demanda", "Status", "Progresso", ""].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  demandas.forEach(function (d) {
    const tr = document.createElement("tr");
    tr.appendChild(celula("Demanda", d.titulo));

    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(d.status);
    badge.textContent = rotuloStatus(d.status);
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    const total = parseInt(d.total_acoes, 10) || 0;
    const feitas = parseInt(d.acoes_concluidas, 10) || 0;
    tr.appendChild(celula("Progresso", feitas + "/" + total));

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
