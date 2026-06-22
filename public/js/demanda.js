// demanda.js
// Detalhe da demanda: exibe, edita (Gestor/Admin) e arquiva.

let demandaId = 0;
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

  const parametros = new URLSearchParams(window.location.search);
  demandaId = parseInt(parametros.get("id"), 10) || 0;

  if (demandaId <= 0) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Demanda nao informada.");
    return;
  }

  carregarDemanda();
});

async function carregarDemanda() {
  try {
    const resposta = await getApi("/api/demandas/detalhe.php?id=" + demandaId);
    document.getElementById("carregando").hidden = true;

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Nao foi possivel carregar a demanda.");
      return;
    }

    preencherDetalhe(resposta.data.demanda);
  } catch (erro) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Nao foi possivel carregar a demanda.");
  }
}

function preencherDetalhe(d) {
  document.getElementById("d-titulo").textContent = d.titulo;

  const badge = document.getElementById("d-status");
  badge.className = classeBadgeStatus(d.status);
  badge.textContent = rotuloStatus(d.status);

  document.getElementById("d-descricao").textContent = d.descricao || "Sem descrição.";
  document.getElementById("d-responsavel").textContent = d.responsavel_nome || "—";
  document.getElementById("d-criador").textContent = d.criador_nome || "—";
  document.getElementById("d-data").textContent = (d.criado_em || "").substring(0, 10);

  document.getElementById("bloco-detalhe").hidden = false;
  document.getElementById("bloco-plano").hidden = false;

  // Acoes de Gestor/Admin.
  const podeEditar = perfilUsuario === "administrador" || perfilUsuario === "gestor";
  // Concluida nao se edita manualmente; arquivada/cancelada tambem encerram a edicao.
  const editavel = d.status === "aberta" || d.status === "em_andamento";

  if (podeEditar && editavel) {
    document.getElementById("acoes-gestor").hidden = false;
    document.getElementById("botao-editar").addEventListener("click", function () { abrirEdicao(d); });
    document.getElementById("botao-arquivar").addEventListener("click", function () { abrirModal("modal-arquivar"); });

    document.getElementById("botao-arquivar-cancelar").addEventListener("click", function () { fecharModal("modal-arquivar"); });
    document.getElementById("botao-arquivar-confirmar").addEventListener("click", arquivar);
    document.getElementById("botao-cancelar-edicao").addEventListener("click", function () {
      document.getElementById("bloco-edicao").hidden = true;
    });
    document.getElementById("form-editar").addEventListener("submit", salvarEdicao);
  }
}

async function abrirEdicao(d) {
  document.getElementById("edicao-mensagem").hidden = true;
  document.getElementById("e-titulo").value = d.titulo;
  document.getElementById("e-descricao").value = d.descricao || "";
  document.getElementById("e-status").value = (d.status === "em_andamento") ? "em_andamento" : "aberta";

  await carregarResponsaveis(d.responsavel_id);
  document.getElementById("bloco-edicao").hidden = false;
}

async function carregarResponsaveis(selecionado) {
  const select = document.getElementById("e-responsavel");
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
