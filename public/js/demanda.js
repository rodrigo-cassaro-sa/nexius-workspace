// demanda.js
// Detalhe da demanda: cabecalho, abas (Plano de acao / Informacoes),
// acoes (criar, concluir) e edicao/arquivamento da demanda.

let demandaId = 0;
let perfilUsuario = "";
let usuarioId = 0;
let demandaAtual = null;
let acoesAtuais = [];

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

  configurarAbas();
  document.getElementById("form-comentario").addEventListener("submit", enviarComentario);
  await carregarTudo();
});

function configurarAbas() {
  document.querySelectorAll(".aba").forEach(function (aba) {
    aba.addEventListener("click", function () {
      document.querySelectorAll(".aba").forEach(function (a) { a.classList.remove("ativa"); });
      aba.classList.add("ativa");
      const alvo = aba.getAttribute("data-aba");
      document.getElementById("aba-plano").hidden = alvo !== "plano";
      document.getElementById("aba-info").hidden = alvo !== "info";
    });
  });
}

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
    preencherCabecalho(demandaAtual);
    prepararGestor();
    await carregarAcoes();
  } catch (erro) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Nao foi possivel carregar a demanda.");
  }
}

function preencherCabecalho(d) {
  document.getElementById("d-titulo").textContent = d.titulo;
  const badge = document.getElementById("d-status");
  badge.className = classeBadgeStatus(d.status);
  badge.textContent = rotuloStatus(d.status);
  document.getElementById("d-descricao").textContent = d.descricao || "Sem descrição.";
  document.getElementById("d-responsavel").textContent = d.responsavel_nome || "—";
}

function prepararGestor() {
  const podeEditar = perfilUsuario === "administrador" || perfilUsuario === "gestor";
  if (!podeEditar) return;

  document.getElementById("botao-nova-acao").hidden = false;
  document.getElementById("botao-nova-acao").addEventListener("click", abrirNovaAcao);
  document.getElementById("botao-acao-cancelar").addEventListener("click", function () { fecharModal("modal-acao"); });
  document.getElementById("form-acao").addEventListener("submit", salvarAcao);

  // Edicao da demanda (aba Informacoes).
  document.getElementById("e-titulo").value = demandaAtual.titulo;
  document.getElementById("e-descricao").value = demandaAtual.descricao || "";
  document.getElementById("e-status").value = (demandaAtual.status === "em_andamento") ? "em_andamento" : "aberta";
  carregarResponsaveis("e-responsavel", demandaAtual.responsavel_id);
  document.getElementById("form-editar").addEventListener("submit", salvarEdicao);

  document.getElementById("botao-arquivar").addEventListener("click", function () { abrirModal("modal-arquivar"); });
  document.getElementById("botao-arquivar-cancelar").addEventListener("click", function () { fecharModal("modal-arquivar"); });
  document.getElementById("botao-arquivar-confirmar").addEventListener("click", arquivar);
}

async function carregarAcoes() {
  const alvo = document.getElementById("lista-acoes");
  mostrarCarregando("lista-acoes", 3);

  try {
    const resposta = await getApi("/api/acoes/listar.php?demanda_id=" + demandaId);
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as ações.";
      return;
    }

    acoesAtuais = resposta.data.acoes;
    atualizarPrazoChave();
    atualizarStatusCabecalho();
    popularSelectAcoes();
    carregarComentariosDemanda();

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
  document.getElementById("d-prazo").textContent = (chave && chave.prazo) ? chave.prazo.substring(0, 10) : "—";
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

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Ação", "Responsável", "Prazo", "Status"].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  acoes.forEach(function (a, indice) {
    const tr = document.createElement("tr");

    // Acao (numero + titulo + badge chave)
    const tdTitulo = document.createElement("td");
    tdTitulo.setAttribute("data-rotulo", "Ação");
    const linha = document.createElement("div");
    linha.className = "acao-titulo-linha";
    const nome = document.createElement("span");
    nome.textContent = (indice + 1) + ". " + a.titulo;
    linha.appendChild(nome);
    if (parseInt(a.chave, 10) === 1) {
      const bc = document.createElement("span");
      bc.className = "badge badge-chave";
      bc.textContent = "Ação chave";
      linha.appendChild(bc);
    }
    tdTitulo.appendChild(linha);
    tr.appendChild(tdTitulo);

    tr.appendChild(celula("Responsável", a.responsavel_nome || "—"));
    tr.appendChild(celula("Prazo", a.prazo ? a.prazo.substring(0, 10) : "—"));

    // Status (derivado) + concluir
    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const derivado = statusDerivado(a);
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(derivado);
    badge.textContent = rotuloStatus(derivado);
    tdStatus.appendChild(badge);

    if (derivado === "bloqueada") {
      const nota = document.createElement("div");
      nota.className = "texto-secundario";
      nota.textContent = "Aguardando pré-requisito";
      tdStatus.appendChild(nota);
    }

    // Concluir: so o responsavel, acao pendente e sem pre-requisito pendente.
    const podeConcluir = parseInt(a.responsavel_id, 10) === usuarioId
      && a.status === "pendente"
      && parseInt(a.prereq_pendentes, 10) === 0;

    if (podeConcluir) {
      const botao = document.createElement("button");
      botao.className = "botao botao-secundario";
      botao.type = "button";
      botao.textContent = "Concluir";
      botao.style.marginTop = "8px";
      botao.addEventListener("click", function () { concluirAcao(a.id, botao); });
      tdStatus.appendChild(botao);
    }

    tr.appendChild(tdStatus);
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

async function concluirAcao(id, botao) {
  definirCarregando(botao, true);
  try {
    const resposta = await postApi("/api/acoes/concluir.php", { id: id });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    // Recarrega demanda (status pode ter mudado) e acoes.
    await carregarTudo();
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel concluir a ação.");
    definirCarregando(botao, false);
  }
}

async function abrirNovaAcao() {
  document.getElementById("form-acao").reset();
  document.getElementById("acao-mensagem").hidden = true;
  await carregarResponsaveis("a-responsavel", null);
  preencherPrerequisitos();
  abrirModal("modal-acao");
}

function preencherPrerequisitos() {
  const select = document.getElementById("a-prerequisitos");
  select.innerHTML = "";
  acoesAtuais.forEach(function (a) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.titulo;
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
  const descricao = document.getElementById("a-descricao").value.trim();
  const responsavel = document.getElementById("a-responsavel").value;
  const prazo = document.getElementById("a-prazo").value;
  const chave = document.getElementById("a-chave").checked;

  const prerequisitos = Array.prototype.slice
    .call(document.getElementById("a-prerequisitos").selectedOptions)
    .map(function (o) { return parseInt(o.value, 10); });

  if (!tamanhoEntre(titulo, 2, 160)) {
    mostrarErro("acao-mensagem", "Informe um título (2 a 160 caracteres).");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/acoes/criar.php", {
      demanda_id: demandaId,
      titulo: titulo,
      descricao: descricao,
      responsavel_id: responsavel,
      prazo: prazo,
      chave: chave,
      prerequisitos: prerequisitos
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

async function salvarEdicao(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-salvar-edicao");
  const titulo = document.getElementById("e-titulo").value.trim();
  const descricao = document.getElementById("e-descricao").value.trim();
  const responsavel = document.getElementById("e-responsavel").value;
  const status = document.getElementById("e-status").value;

  if (!tamanhoEntre(titulo, 2, 160)) {
    mostrarErro("edicao-mensagem", "Informe um título (2 a 160 caracteres).");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/demandas/atualizar.php", {
      id: demandaId,
      titulo: titulo,
      descricao: descricao,
      responsavel_id: responsavel,
      status: status
    });

    if (!resposta.ok) {
      mostrarErro("edicao-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    window.location.reload();
  } catch (erro) {
    mostrarErro("edicao-mensagem", "Nao foi possivel salvar.");
    definirCarregando(botao, false);
  }
}

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

// ---- Comentarios (stream da demanda; cada comentario pertence a uma acao) ----

// Preenche o select de acao do formulario de comentario.
function popularSelectAcoes() {
  const select = document.getElementById("coment-acao");
  const texto = document.getElementById("coment-texto");
  const botao = document.getElementById("botao-comentar");
  select.innerHTML = "";

  if (acoesAtuais.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Crie uma ação para comentar";
    select.appendChild(opt);
    select.disabled = true;
    texto.disabled = true;
    botao.disabled = true;
    return;
  }

  select.disabled = false;
  texto.disabled = false;
  botao.disabled = false;

  acoesAtuais.forEach(function (a, i) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = (i + 1) + ". " + a.titulo;
    select.appendChild(opt);
  });
}

async function carregarComentariosDemanda() {
  const lista = document.getElementById("coment-lista");
  lista.textContent = "Carregando...";

  try {
    const resposta = await getApi("/api/comentarios/listar-demanda.php?demanda_id=" + demandaId);
    if (!resposta.ok) {
      lista.textContent = "Nao foi possivel carregar os comentarios.";
      return;
    }
    renderizarComentarios(lista, resposta.data.comentarios);
  } catch (erro) {
    lista.textContent = "Nao foi possivel carregar os comentarios.";
  }
}

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

function renderizarComentarios(lista, comentarios) {
  lista.innerHTML = "";

  if (comentarios.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "texto-secundario";
    vazio.textContent = "Sem comentários ainda.";
    lista.appendChild(vazio);
    return;
  }

  comentarios.forEach(function (c) {
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

    const acaoLabel = document.createElement("span");
    acaoLabel.className = "comentario-acao";
    acaoLabel.textContent = c.acao_titulo;
    corpo.appendChild(acaoLabel);

    const texto = document.createElement("p");
    texto.className = "comentario-texto";
    texto.textContent = c.texto;
    corpo.appendChild(texto);

    if (parseInt(c.autor_id, 10) === usuarioId) {
      const editar = document.createElement("button");
      editar.className = "botao-link";
      editar.type = "button";
      editar.textContent = "Editar";
      editar.addEventListener("click", function () { iniciarEdicao(corpo, c); });
      corpo.appendChild(editar);
    }

    item.appendChild(corpo);
    lista.appendChild(item);
  });
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
  cancelar.addEventListener("click", carregarComentariosDemanda);

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
    carregarComentariosDemanda();
  });

  acoes.appendChild(cancelar);
  acoes.appendChild(salvar);
  corpo.appendChild(acoes);
}

async function enviarComentario(evento) {
  evento.preventDefault();

  const acaoId = parseInt(document.getElementById("coment-acao").value, 10) || 0;
  if (acaoId <= 0) return;

  const botao = document.getElementById("botao-comentar");
  const texto = document.getElementById("coment-texto").value.trim();

  if (!naoVazio(texto)) {
    mostrarErro("coment-mensagem", "Escreva um comentário.");
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
    document.getElementById("coment-texto").value = "";
    document.getElementById("coment-mensagem").hidden = true;
    definirCarregando(botao, false);
    carregarComentariosDemanda();
  } catch (erro) {
    mostrarErro("coment-mensagem", "Nao foi possivel enviar o comentário.");
    definirCarregando(botao, false);
  }
}
