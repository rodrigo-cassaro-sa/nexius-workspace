// ui.js
// Helpers de interface reutilizaveis: feedback ao usuario e estados de tela.
// Sem regra de negocio. Usa textContent para dados do usuario (evita innerHTML).

function mostrarMensagem(elementoId, texto, tipo) {
  const alvo = document.getElementById(elementoId);
  if (!alvo) return;

  alvo.textContent = texto;
  alvo.className = "alerta alerta-" + (tipo || "info");
  alvo.hidden = false;
}

function mostrarErro(elementoId, texto) {
  mostrarMensagem(elementoId, texto || "Nao foi possivel concluir a acao.", "erro");
}

function mostrarSucesso(elementoId, texto) {
  mostrarMensagem(elementoId, texto, "sucesso");
}

// Liga/desliga um indicador de carregamento simples (ex.: botao desabilitado).
function definirCarregando(elemento, carregando) {
  if (!elemento) return;
  elemento.disabled = !!carregando;
}

// Abre/fecha um modal pelo id (usa as classes de components.css).
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("modal-ativo");
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("modal-ativo");
}

// Mostra skeletons de carregamento dentro de um elemento (lista/tabela).
function mostrarCarregando(elementoId, linhas) {
  const alvo = document.getElementById(elementoId);
  if (!alvo) return;

  const total = linhas || 3;
  alvo.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const linha = document.createElement("div");
    linha.className = "skeleton skeleton-linha";
    alvo.appendChild(linha);
  }
}

// Mostra um estado vazio com mensagem.
function mostrarVazio(elementoId, texto) {
  const alvo = document.getElementById(elementoId);
  if (!alvo) return;

  alvo.innerHTML = "";
  const bloco = document.createElement("div");
  bloco.className = "estado-vazio";
  const p = document.createElement("p");
  p.textContent = texto;
  bloco.appendChild(p);
  alvo.appendChild(bloco);
}

// Mapeia um status (demanda ou acao) para a classe do badge.
function classeBadgeStatus(status) {
  const mapa = {
    aberta: "badge",
    em_andamento: "badge badge-info",
    concluida: "badge badge-sucesso",
    arquivada: "badge",
    cancelada: "badge badge-erro",
    pendente: "badge",
    bloqueada: "badge badge-aviso",
    recusada: "badge badge-erro"
  };
  return mapa[status] || "badge";
}

// Rotulo legivel de um status.
function rotuloStatus(status) {
  const mapa = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    concluida: "Concluída",
    arquivada: "Arquivada",
    cancelada: "Cancelada",
    pendente: "Pendente",
    bloqueada: "Bloqueada",
    recusada: "Recusada"
  };
  return mapa[status] || status;
}

// Atualiza o contador de notificacoes nao lidas (em qualquer ".notif-contador" da pagina).
async function atualizarContadorNotificacoes() {
  const elementos = document.querySelectorAll(".notif-contador");
  if (elementos.length === 0) return;

  try {
    const resposta = await getApi("/api/notificacoes/contar.php");
    const n = (resposta && resposta.ok) ? resposta.data.nao_lidas : 0;
    elementos.forEach(function (el) {
      if (n > 0) {
        el.textContent = n;
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  } catch (erro) {
    // Ignora: sem contador.
  }
}

// Sino de notificacoes na topbar (se existir #sino-notificacoes na pagina).
function configurarSino() {
  const sino = document.getElementById("sino-notificacoes");
  if (!sino) return;

  const botao = document.getElementById("sino-botao");
  const painel = document.getElementById("sino-painel");

  botao.addEventListener("click", function (evento) {
    evento.stopPropagation();
    const abrir = painel.hidden;
    painel.hidden = !abrir;
    if (abrir) {
      carregarSino();
    }
  });

  // Fecha ao clicar fora.
  document.addEventListener("click", function (evento) {
    if (!sino.contains(evento.target)) {
      painel.hidden = true;
    }
  });
}

async function carregarSino() {
  const lista = document.getElementById("sino-lista");
  lista.textContent = "Carregando...";

  try {
    const resposta = await getApi("/api/notificacoes/listar.php");
    if (!resposta.ok) {
      lista.textContent = "Nao foi possivel carregar.";
      return;
    }

    const itens = resposta.data.notificacoes.slice(0, 8);
    if (itens.length === 0) {
      lista.innerHTML = "";
      const vazio = document.createElement("p");
      vazio.className = "texto-secundario";
      vazio.textContent = "Você está em dia.";
      lista.appendChild(vazio);
      return;
    }

    lista.innerHTML = "";
    itens.forEach(function (n) {
      const item = document.createElement("a");
      item.className = "sino-item" + (parseInt(n.lida, 10) === 0 ? " nao-lida" : "");
      item.href = n.link || "notificacoes.html";
      const titulo = document.createElement("strong");
      titulo.textContent = n.titulo;
      const msg = document.createElement("div");
      msg.className = "texto-secundario";
      msg.textContent = n.mensagem;
      item.appendChild(titulo);
      item.appendChild(msg);
      lista.appendChild(item);
    });
  } catch (erro) {
    lista.textContent = "Nao foi possivel carregar.";
  }
}

// Iniciais a partir do nome (ex.: "Mario Silva" -> "MS").
function iniciaisDoNome(nome) {
  const partes = (nome || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// Preenche o avatar da topbar com as iniciais. O nome chega de forma assincrona
// (via sessao), entao observamos o elemento #usuario-nome e atualizamos quando muda.
function configurarAvatar() {
  const nomeEl = document.getElementById("usuario-nome");
  const avatarEl = document.getElementById("usuario-avatar");
  if (!nomeEl || !avatarEl) return;

  function atualizar() {
    avatarEl.textContent = iniciaisDoNome(nomeEl.textContent);
  }

  atualizar();
  new MutationObserver(atualizar).observe(nomeEl, { childList: true, characterData: true, subtree: true });
}

// Busca da topbar. Na tela de demandas o proprio demandas.js filtra ao vivo;
// nas demais telas, buscar leva para a lista de demandas ja filtrada.
function configurarBuscaTopo() {
  const form = document.getElementById("form-busca-topo");
  if (!form) return;
  if (location.pathname.endsWith("demandas.html")) return;

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const termo = document.getElementById("busca-topo").value.trim();
    window.location.href = "demandas.html?busca=" + encodeURIComponent(termo);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  atualizarContadorNotificacoes();
  configurarSino();
  configurarAvatar();
  configurarBuscaTopo();
});

// Liga os botoes de mostrar/ocultar senha. Funciona em qualquer tela com
// um botao ".botao-olho" e o atributo data-alvo apontando para o id do input.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".botao-olho").forEach(function (botao) {
    botao.addEventListener("click", function () {
      const input = document.getElementById(botao.getAttribute("data-alvo"));
      if (!input) return;

      const mostrar = input.type === "password";
      input.type = mostrar ? "text" : "password";
      botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
    });
  });
});
