// chat.js
// Mensagens (chat 1:1). Lista de conversas + thread + envio. Atualizacao por polling leve.
// Pessoal: o usuario so ve as conversas das quais participa (validado no backend).

let usuarioId = 0;
let conversaAtual = 0;
let outroNomeAtual = "";

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  usuarioId = parseInt(usuario.id, 10);
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  if (usuario.perfil === "administrador") {
    const nav = document.getElementById("nav-usuarios");
    if (nav) nav.hidden = false;
  }
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);

  document.getElementById("chat-usuarios").addEventListener("change", aoSelecionarUsuario);
  document.getElementById("chat-form").addEventListener("submit", enviarMensagem);

  await carregarUsuarios();
  await carregarDemandasRef();
  await carregarConversas();

  // Atalho: abrir direto a conversa com um usuario via ?u=<id>.
  const params = new URLSearchParams(window.location.search);
  const u = parseInt(params.get("u"), 10);
  if (u > 0) {
    await abrirComUsuario(u);
  }

  // Polling leve: atualiza a lista e, se houver conversa aberta, as mensagens.
  setInterval(function () {
    carregarConversas();
    if (conversaAtual > 0) {
      carregarMensagens(true);
    }
  }, 12000);
});

// Popular o select de usuarios (para iniciar conversa), exceto o proprio.
async function carregarUsuarios() {
  const sel = document.getElementById("chat-usuarios");
  try {
    const resposta = await getApi("/api/usuarios/listar.php");
    if (!resposta.ok) return;
    resposta.data.usuarios.forEach(function (u) {
      if (parseInt(u.id, 10) === usuarioId) return;
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.nome;
      sel.appendChild(opt);
    });
  } catch (erro) {
    // Mantem so o placeholder.
  }
}

// Popular o select de referencia a demanda (somente as demandas visiveis ao usuario).
async function carregarDemandasRef() {
  const sel = document.getElementById("chat-ref-demanda");
  try {
    const resposta = await getApi("/api/demandas/listar.php");
    if (!resposta.ok || !resposta.data.demandas) return;
    resposta.data.demandas.forEach(function (d) {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = "#" + d.id + " " + d.titulo;
      sel.appendChild(opt);
    });
  } catch (erro) {
    // Referencia indisponivel; o chat funciona sem ela.
  }
}

async function carregarConversas() {
  const alvo = document.getElementById("chat-lista");
  try {
    const resposta = await getApi("/api/chat/conversas-listar.php");
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as conversas.";
      return;
    }
    renderConversas(alvo, resposta.data.conversas);
    atualizarContadorMensagens(); // atualiza o badge do menu
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as conversas.";
  }
}

function renderConversas(alvo, conversas) {
  alvo.innerHTML = "";

  if (!conversas || conversas.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Nenhuma conversa ainda. Escolha um usuário acima para começar.";
    alvo.appendChild(p);
    return;
  }

  conversas.forEach(function (c) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "chat-conversa" + (parseInt(c.id, 10) === conversaAtual ? " ativa" : "");

    const topo = document.createElement("div");
    topo.className = "chat-conversa-topo";

    const nome = document.createElement("span");
    nome.className = "chat-conversa-nome";
    nome.textContent = c.outro_nome;
    topo.appendChild(nome);

    if (parseInt(c.nao_lidas, 10) > 0) {
      const badge = document.createElement("span");
      badge.className = "badge badge-erro";
      badge.textContent = c.nao_lidas;
      topo.appendChild(badge);
    }
    item.appendChild(topo);

    const previa = document.createElement("span");
    previa.className = "chat-conversa-previa texto-secundario";
    previa.textContent = c.ultima_texto ? c.ultima_texto : "Sem mensagens.";
    item.appendChild(previa);

    item.addEventListener("click", function () {
      abrirConversa(parseInt(c.id, 10), c.outro_nome);
    });
    alvo.appendChild(item);
  });
}

// Abre a conversa com um usuario (cria se nao existir).
async function aoSelecionarUsuario() {
  const sel = document.getElementById("chat-usuarios");
  const id = parseInt(sel.value, 10);
  sel.value = "";
  if (id > 0) {
    await abrirComUsuario(id);
  }
}

async function abrirComUsuario(usuarioAlvoId) {
  try {
    const resposta = await postApi("/api/chat/abrir.php", { usuario_id: usuarioAlvoId });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      return;
    }
    await carregarConversas();
    abrirConversa(resposta.data.conversa_id, resposta.data.outro_nome);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel abrir a conversa.");
  }
}

function abrirConversa(id, nome) {
  conversaAtual = id;
  outroNomeAtual = nome || "Conversa";
  document.getElementById("chat-vazio").hidden = true;
  document.getElementById("chat-ativo").hidden = false;
  document.getElementById("chat-titulo").textContent = outroNomeAtual;
  carregarMensagens(false);
}

// manterPosicao=true evita "pular" o scroll durante o polling.
async function carregarMensagens(manterPosicao) {
  if (conversaAtual <= 0) return;
  const alvo = document.getElementById("chat-mensagens");
  const noFim = alvo.scrollTop + alvo.clientHeight >= alvo.scrollHeight - 40;

  try {
    const resposta = await getApi("/api/chat/mensagens-listar.php?conversa_id=" + conversaAtual);
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      return;
    }
    renderMensagens(alvo, resposta.data.mensagens);
    // Marcar como lidas no servidor muda a contagem; atualiza lista/badge.
    carregarConversas();

    if (!manterPosicao || noFim) {
      alvo.scrollTop = alvo.scrollHeight;
    }
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel carregar as mensagens.");
  }
}

function renderMensagens(alvo, mensagens) {
  alvo.innerHTML = "";

  if (!mensagens || mensagens.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Nenhuma mensagem ainda. Diga olá!";
    alvo.appendChild(p);
    return;
  }

  mensagens.forEach(function (m) {
    const minha = parseInt(m.autor_id, 10) === usuarioId;
    const bolha = document.createElement("div");
    bolha.className = "chat-msg" + (minha ? " minha" : "");

    const corpo = document.createElement("div");
    corpo.className = "chat-msg-corpo";

    // Texto com links clicaveis (montados com seguranca, sem innerHTML).
    montarTextoComLinks(corpo, m.texto);

    // Referencia a demanda (se houver).
    if (m.demanda_id && m.demanda_titulo) {
      const ref = document.createElement("a");
      ref.className = "chat-msg-ref";
      ref.href = "demanda.html?id=" + m.demanda_id;
      ref.textContent = "Demanda #" + m.demanda_id + " · " + m.demanda_titulo;
      corpo.appendChild(ref);
    }
    bolha.appendChild(corpo);

    const meta = document.createElement("span");
    meta.className = "chat-msg-meta";
    let texto = formatarMomento(m.criado_em);
    if (minha) {
      texto += m.lida_em ? " · Visto " + formatarMomento(m.lida_em) : " · Enviado";
    }
    meta.textContent = texto;
    bolha.appendChild(meta);

    alvo.appendChild(bolha);
  });
}

async function enviarMensagem(evento) {
  evento.preventDefault();
  if (conversaAtual <= 0) return;

  const campo = document.getElementById("chat-texto");
  const texto = campo.value.trim();
  if (texto === "") {
    mostrarErro("mensagem", "Escreva uma mensagem.");
    return;
  }

  const demandaId = document.getElementById("chat-ref-demanda").value;
  const botao = document.getElementById("chat-enviar");
  definirCarregando(botao, true);

  try {
    const corpo = { conversa_id: conversaAtual, texto: texto };
    if (demandaId) corpo.demanda_id = demandaId;

    const resposta = await postApi("/api/chat/enviar.php", corpo);
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }
    campo.value = "";
    document.getElementById("chat-ref-demanda").value = "";
    document.getElementById("mensagem").hidden = true;
    definirCarregando(botao, false);
    await carregarMensagens(false);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel enviar a mensagem.");
    definirCarregando(botao, false);
  }
}

// Monta o texto da mensagem em nos de DOM, transformando URLs em links seguros.
// Usa textContent para o texto (evita XSS) e cria <a> apenas para as URLs http/https.
function montarTextoComLinks(alvo, texto) {
  const paragrafo = document.createElement("p");
  paragrafo.className = "chat-msg-texto";

  const partes = String(texto).split(/(https?:\/\/[^\s]+)/g);
  partes.forEach(function (parte) {
    if (/^https?:\/\//.test(parte)) {
      const link = document.createElement("a");
      link.href = parte;
      link.textContent = parte;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      paragrafo.appendChild(link);
    } else if (parte !== "") {
      paragrafo.appendChild(document.createTextNode(parte));
    }
  });

  alvo.appendChild(paragrafo);
}

// "YYYY-MM-DD HH:MM:SS" -> "DD/MM HH:MM"
function formatarMomento(dataHora) {
  if (!dataHora) return "";
  const s = String(dataHora);
  const data = s.substring(0, 10).split("-"); // [Y,M,D]
  const hora = s.substring(11, 16);
  if (data.length === 3) {
    return data[2] + "/" + data[1] + " " + hora;
  }
  return s;
}
