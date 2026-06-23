// demanda.js
// Detalhe da demanda: cabecalho, abas (Plano de acao / Informacoes),
// acoes (criar, concluir) e edicao/arquivamento da demanda.

let demandaId = 0;
let perfilUsuario = "";
let usuarioId = 0;
let demandaAtual = null;
let acoesAtuais = [];
let comentariosAtuais = [];
let acaoParaAssinar = 0;

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
  document.getElementById("botao-det-fechar").addEventListener("click", function () { fecharModal("modal-acao-detalhe"); });
  document.getElementById("assinar-confirma").addEventListener("change", function () {
    document.getElementById("botao-assinar-confirmar").disabled = !this.checked;
  });
  document.getElementById("botao-assinar-cancelar").addEventListener("click", function () { fecharModal("modal-assinar"); });
  document.getElementById("botao-assinar-confirmar").addEventListener("click", confirmarAssinatura);
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

  await carregarTudo();
});

// (Abas removidas: a demanda tem uma unica visao, somente leitura.)

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
    registrarVisita();
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
  document.getElementById("d-responsavel").textContent = d.responsavel_nome || "—";

  // Prioridade GUT (G*U*T).
  const prio = (parseInt(d.gut_gravidade, 10) || 0) * (parseInt(d.gut_urgencia, 10) || 0) * (parseInt(d.gut_tendencia, 10) || 0);
  document.getElementById("d-prioridade").textContent = prio > 0 ? (prio + " · " + rotuloGut(prio)) : "—";

  // Questionario da demanda (6 perguntas).
  document.getElementById("d-problema").textContent = d.problema || "—";
  document.getElementById("d-impacto").textContent = d.impacto_operacional || "—";
  document.getElementById("d-risco").textContent = d.risco || "—";
  document.getElementById("d-afeta").textContent = d.afeta_outros || "—";
  document.getElementById("d-workaround").textContent = d.workaround || "—";
  document.getElementById("d-sugestao").textContent = d.sugestao_solucao || "—";
}

// Rotulo da prioridade GUT: Alta >= 75, Media 25-74, Baixa < 25.
function rotuloGut(p) {
  if (p >= 75) return "Alta";
  if (p >= 25) return "Média";
  return "Baixa";
}

function prepararGestor() {
  const podeEditar = perfilUsuario === "administrador" || perfilUsuario === "gestor";
  if (!podeEditar) return;

  document.getElementById("botao-nova-acao").hidden = false;
  document.getElementById("botao-nova-acao").addEventListener("click", abrirNovaAcao);
  document.getElementById("botao-acao-cancelar").addEventListener("click", function () { fecharModal("modal-acao"); });
  document.getElementById("form-acao").addEventListener("submit", salvarAcao);

  // Arquivamento da demanda (acao de ciclo de vida; nao edita o conteudo).
  document.getElementById("demanda-acoes").hidden = false;
  document.getElementById("botao-arquivar").addEventListener("click", function () { abrirModal("modal-arquivar"); });
  document.getElementById("botao-arquivar-cancelar").addEventListener("click", function () { fecharModal("modal-arquivar"); });
  document.getElementById("botao-arquivar-confirmar").addEventListener("click", arquivar);
}

async function carregarAcoes() {
  const alvo = document.getElementById("lista-acoes");
  mostrarCarregando("lista-acoes", 3);

  try {
    // Carrega acoes e comentarios juntos: os comentarios sao agrupados por acao.
    const [respAcoes, respComent] = await Promise.all([
      getApi("/api/acoes/listar.php?demanda_id=" + demandaId),
      getApi("/api/comentarios/listar-demanda.php?demanda_id=" + demandaId)
    ]);

    if (!respAcoes.ok) {
      alvo.textContent = "Nao foi possivel carregar as ações.";
      return;
    }

    acoesAtuais = respAcoes.data.acoes;
    comentariosAtuais = (respComent && respComent.ok) ? respComent.data.comentarios : [];
    atualizarPrazoChave();
    atualizarStatusCabecalho();

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

  acoes.forEach(function (a, indice) {
    const item = document.createElement("div");
    item.className = "acao-item";

    // Cabecalho: numero + titulo (+ chave), meta (responsavel/prazo) e status/concluir.
    const cab = document.createElement("div");
    cab.className = "acao-cabecalho";

    const info = document.createElement("div");
    info.className = "acao-info";

    const linha = document.createElement("div");
    linha.className = "acao-titulo-linha";
    const nome = document.createElement("span");
    nome.className = "acao-nome";
    nome.textContent = (indice + 1) + ". " + a.titulo;
    linha.appendChild(nome);
    if (parseInt(a.chave, 10) === 1) {
      const bc = document.createElement("span");
      bc.className = "badge badge-chave";
      bc.textContent = "Ação chave";
      linha.appendChild(bc);
    }
    info.appendChild(linha);

    const meta = document.createElement("div");
    meta.className = "acao-meta";
    const resp = document.createElement("span");
    resp.textContent = "Responsável: " + (a.responsavel_nome || "—");
    const prazo = document.createElement("span");
    prazo.textContent = "Prazo: " + (a.prazo ? a.prazo.substring(0, 10) : "—");
    meta.appendChild(resp);
    meta.appendChild(prazo);
    info.appendChild(meta);

    // Rodape: "Ver detalhes" (abre popup e marca visualizado) + contador de vistos.
    const rodape = document.createElement("div");
    rodape.className = "acao-rodape";

    const btnDet = document.createElement("button");
    btnDet.className = "botao-link";
    btnDet.type = "button";
    btnDet.textContent = "Ver detalhes";

    const vistos = document.createElement("span");
    vistos.className = "acao-vistos texto-secundario";
    atualizarContadorVistos(vistos, parseInt(a.total_visualizacoes, 10) || 0);

    btnDet.addEventListener("click", function () { abrirDetalheAcao(a, vistos); });

    rodape.appendChild(btnDet);
    rodape.appendChild(vistos);
    info.appendChild(rodape);

    cab.appendChild(info);

    const statusArea = document.createElement("div");
    statusArea.className = "acao-status-area";
    const derivado = statusDerivado(a);
    const badge = document.createElement("span");
    badge.className = classeBadgeStatus(derivado);
    badge.textContent = rotuloStatus(derivado);
    statusArea.appendChild(badge);

    if (derivado === "bloqueada") {
      const nota = document.createElement("span");
      nota.className = "texto-secundario";
      nota.textContent = "Aguardando pré-requisito";
      statusArea.appendChild(nota);
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
      botao.addEventListener("click", function () { abrirAssinatura(a); });
      statusArea.appendChild(botao);
    }

    cab.appendChild(statusArea);
    item.appendChild(cab);

    // Comentarios desta acao, recuados abaixo dela (estilo forum).
    item.appendChild(montarComentariosDaAcao(a));

    alvo.appendChild(item);
  });
}

// Conclusao com assinatura (declaracao + 1 clique): abre o modal de confirmacao.
function abrirAssinatura(a) {
  acaoParaAssinar = a.id;
  document.getElementById("assinar-acao").textContent = "Ação: " + a.titulo;
  document.getElementById("assinar-confirma").checked = false;
  document.getElementById("botao-assinar-confirmar").disabled = true;
  document.getElementById("assinar-mensagem").hidden = true;
  abrirModal("modal-assinar");
}

async function confirmarAssinatura() {
  if (acaoParaAssinar <= 0) return;

  if (!document.getElementById("assinar-confirma").checked) {
    mostrarErro("assinar-mensagem", "Marque a confirmação para assinar.");
    return;
  }

  const botao = document.getElementById("botao-assinar-confirmar");
  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/acoes/concluir.php", { id: acaoParaAssinar, assinado: true });
    if (!resposta.ok) {
      mostrarErro("assinar-mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    fecharModal("modal-assinar");
    definirCarregando(botao, false);
    await carregarTudo();
  } catch (erro) {
    mostrarErro("assinar-mensagem", "Nao foi possivel concluir a ação.");
    definirCarregando(botao, false);
  }
}

async function abrirNovaAcao() {
  document.getElementById("form-acao").reset();
  document.getElementById("acao-mensagem").hidden = true;
  document.getElementById("a-demanda").value = demandaAtual.titulo;
  await carregarResponsaveis("a-responsavel", null);
  preencherPrerequisitos();
  abrirModal("modal-acao");
}

function preencherPrerequisitos() {
  const select = document.getElementById("a-prerequisito");
  select.length = 1; // mantem "Sem pré-requisito"
  acoesAtuais.forEach(function (a, i) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = (i + 1) + ". " + a.titulo;
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

  const prereqValor = document.getElementById("a-prerequisito").value;
  const prerequisitos = prereqValor ? [parseInt(prereqValor, 10)] : [];

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

// (Edicao da demanda removida: a tela e somente leitura. Arquivar continua disponivel.)

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

// ---- Visitas (lastro: quem abriu a demanda e quando) ----

async function registrarVisita() {
  try {
    const resposta = await postApi("/api/demandas/registrar-visita.php", { demanda_id: demandaId });
    if (resposta.ok) {
      renderizarVisitas(resposta.data.visitas);
    }
  } catch (erro) {
    // Visitas sao secundarias; nao bloqueiam a tela.
  }
}

function renderizarVisitas(visitas) {
  const alvo = document.getElementById("lista-visitas");
  if (!alvo) return;
  alvo.innerHTML = "";

  if (!visitas || visitas.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Ninguém visualizou ainda.";
    alvo.appendChild(p);
    return;
  }

  visitas.forEach(function (v) {
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

    const total = parseInt(v.total_visitas, 10) || 1;
    const detalhe = document.createElement("span");
    detalhe.className = "visita-detalhe texto-secundario";
    detalhe.textContent = "Última visita: " + formatarDataHora(v.ultima_visita)
      + " · " + total + (total === 1 ? " visita" : " visitas");

    corpo.appendChild(nome);
    corpo.appendChild(detalhe);
    item.appendChild(corpo);

    alvo.appendChild(item);
  });
}

// Formata "YYYY-MM-DD HH:MM:SS" como "DD/MM/YYYY HH:MM".
function formatarDataHora(iso) {
  if (!iso) return "—";
  const s = String(iso);
  if (s.length < 16) return s;
  return s.substring(8, 10) + "/" + s.substring(5, 7) + "/" + s.substring(0, 4) + " " + s.substring(11, 16);
}

// ---- Visualizacao de tarefa (popup com detalhes; marca quem viu) ----

function abrirDetalheAcao(a, elementoVistos) {
  document.getElementById("det-titulo").textContent = a.titulo;

  const status = document.getElementById("det-status");
  const derivado = statusDerivado(a);
  status.className = classeBadgeStatus(derivado);
  status.textContent = rotuloStatus(derivado);

  document.getElementById("det-chave").hidden = parseInt(a.chave, 10) !== 1;
  document.getElementById("det-metas").textContent =
    "Responsável: " + (a.responsavel_nome || "—") + " · Prazo: " + (a.prazo ? a.prazo.substring(0, 10) : "—");
  document.getElementById("det-descricao").textContent = a.descricao || "Sem descrição.";

  const lista = document.getElementById("det-visualizacoes");
  lista.innerHTML = "";
  const carregando = document.createElement("p");
  carregando.className = "texto-secundario";
  carregando.textContent = "Carregando...";
  lista.appendChild(carregando);

  abrirModal("modal-acao-detalhe");
  marcarVisualizada(a.id, lista, elementoVistos);
}

async function marcarVisualizada(acaoId, listaEl, elementoVistos) {
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
    if (elementoVistos) {
      atualizarContadorVistos(elementoVistos, resposta.data.visualizacoes.length);
    }
  } catch (erro) {
    // silencioso: visualizacao e secundaria.
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
    det.textContent = "Visualizou em " + formatarDataHora(v.visualizado_em);
    corpo.appendChild(nome);
    corpo.appendChild(det);
    item.appendChild(corpo);

    alvo.appendChild(item);
  });
}

function atualizarContadorVistos(elemento, n) {
  elemento.textContent = n > 0 ? ("Visto por " + n + (n === 1 ? " pessoa" : " pessoas")) : "Não visualizado";
}

// ---- Comentarios (estilo forum: abaixo de cada acao) ----

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

// Monta a area de comentarios (recuada) de uma acao: lista + formulario proprio.
function montarComentariosDaAcao(a) {
  const area = document.createElement("div");
  area.className = "acao-comentarios";

  const doAcao = comentariosAtuais
    .filter(function (c) { return parseInt(c.acao_id, 10) === parseInt(a.id, 10); })
    .sort(function (x, y) { return String(x.criado_em).localeCompare(String(y.criado_em)); });

  if (doAcao.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "texto-secundario acao-coment-vazio";
    vazio.textContent = "Sem comentários.";
    area.appendChild(vazio);
  } else {
    doAcao.forEach(function (c) {
      area.appendChild(montarComentario(c));
    });
  }

  area.appendChild(montarFormComentario(a.id));
  return area;
}

function montarComentario(c) {
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
  return item;
}

// Formulario compacto de novo comentario para uma acao especifica.
function montarFormComentario(acaoId) {
  const form = document.createElement("form");
  form.className = "coment-form";

  const area = document.createElement("textarea");
  area.className = "campo-input";
  area.rows = 1;
  area.placeholder = "Escreva um comentário...";

  const botao = document.createElement("button");
  botao.className = "botao botao-secundario";
  botao.type = "submit";
  botao.textContent = "Comentar";

  form.appendChild(area);
  form.appendChild(botao);

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const texto = area.value.trim();
    if (texto === "") {
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
      document.getElementById("coment-mensagem").hidden = true;
      await carregarAcoes();
    } catch (erro) {
      mostrarErro("coment-mensagem", "Nao foi possivel enviar o comentário.");
      definirCarregando(botao, false);
    }
  });

  return form;
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
  cancelar.addEventListener("click", carregarAcoes);

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
    carregarAcoes();
  });

  acoes.appendChild(cancelar);
  acoes.appendChild(salvar);
  corpo.appendChild(acoes);
}

// (Comentar agora é feito no formulário de cada ação — ver montarFormComentario.)
