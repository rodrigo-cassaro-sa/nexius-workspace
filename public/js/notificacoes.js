// notificacoes.js
// Lista as notificacoes do usuario, marca como lida (uma ou todas) e abre o item relacionado.

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  document.getElementById("botao-marcar-todas").addEventListener("click", marcarTodas);

  carregarNotificacoes();
});

async function carregarNotificacoes() {
  const alvo = document.getElementById("lista-notificacoes");
  mostrarCarregando("lista-notificacoes", 4);

  try {
    const resposta = await getApi("/api/notificacoes/listar.php");
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as notificacoes.";
      return;
    }

    if (resposta.data.notificacoes.length === 0) {
      mostrarVazio("lista-notificacoes", "Você está em dia. Nenhuma notificação.");
      return;
    }

    renderizar(alvo, resposta.data.notificacoes);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as notificacoes.";
  }
}

function renderizar(alvo, notificacoes) {
  alvo.innerHTML = "";

  notificacoes.forEach(function (n) {
    const item = document.createElement("div");
    item.className = "notificacao" + (parseInt(n.lida, 10) === 0 ? " nao-lida" : "");

    const titulo = document.createElement("p");
    titulo.className = "notificacao-titulo";
    titulo.textContent = n.titulo;

    const mensagem = document.createElement("p");
    mensagem.className = "notificacao-mensagem";
    mensagem.textContent = n.mensagem;

    const data = document.createElement("span");
    data.className = "comentario-data";
    data.textContent = (n.criado_em || "").substring(0, 16);

    item.appendChild(titulo);
    item.appendChild(mensagem);
    item.appendChild(data);

    item.addEventListener("click", function () { abrirNotificacao(n); });
    alvo.appendChild(item);
  });
}

async function abrirNotificacao(n) {
  try {
    if (parseInt(n.lida, 10) === 0) {
      await postApi("/api/notificacoes/marcar-lida.php", { id: n.id });
    }
  } catch (erro) {
    // Mesmo se falhar, segue para o link.
  }

  if (n.link) {
    window.location.href = n.link;
  } else {
    carregarNotificacoes();
  }
}

async function marcarTodas() {
  try {
    const resposta = await postApi("/api/notificacoes/marcar-todas-lidas.php", {});
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      return;
    }
    carregarNotificacoes();
    atualizarContadorNotificacoes();
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel marcar como lidas.");
  }
}
