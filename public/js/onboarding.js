// onboarding.js
// Onboarding informativo do primeiro acesso. Nao coleta dados.
// Explica o conceito central (demanda -> acoes -> acao chave -> conclusao).
// "Avancar/Voltar" navegam pelas etapas; "Pular" e "Comecar a usar" concluem o onboarding.

const etapas = [
  {
    titulo: "Demandas",
    texto: "Registre cada demanda de projeto em um so lugar: titulo, descricao e responsavel."
  },
  {
    titulo: "Plano de acao",
    texto: "Desdobre a demanda em acoes. Cada acao tem responsavel e prazo, e pode depender de outra (pre-requisito)."
  },
  {
    titulo: "Acao chave e conclusao",
    texto: "Marque a acao chave da demanda. Quando ela e concluida, a demanda tambem e concluida."
  }
];

let etapaAtual = 0;

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();

  // Sem sessao: exigirSessaoNoFront ja redirecionou para o login.
  if (!usuario) {
    return;
  }

  // Ja concluiu o onboarding: vai direto ao painel.
  if (usuario.onboarding_concluido) {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("carregando").hidden = true;
  document.getElementById("etapa").hidden = false;
  document.getElementById("acoes").hidden = false;

  document.getElementById("botao-voltar").addEventListener("click", voltar);
  document.getElementById("botao-avancar").addEventListener("click", avancar);
  document.getElementById("botao-pular").addEventListener("click", finalizar);
  document.getElementById("botao-concluir").addEventListener("click", finalizar);

  renderizarEtapa();
});

function renderizarEtapa() {
  const etapa = etapas[etapaAtual];

  document.getElementById("etapa-titulo").textContent = etapa.titulo;
  document.getElementById("etapa-texto").textContent = etapa.texto;
  document.getElementById("etapa-indicador").textContent = "Passo " + (etapaAtual + 1) + " de " + etapas.length;

  document.getElementById("botao-voltar").disabled = etapaAtual === 0;

  const ultima = etapaAtual === etapas.length - 1;
  document.getElementById("botao-avancar").hidden = ultima;
  document.getElementById("botao-concluir").hidden = !ultima;
}

function voltar() {
  if (etapaAtual > 0) {
    etapaAtual--;
    renderizarEtapa();
  }
}

function avancar() {
  if (etapaAtual < etapas.length - 1) {
    etapaAtual++;
    renderizarEtapa();
  }
}

async function finalizar() {
  const botoes = document.querySelectorAll(".onboarding-acoes button");
  botoes.forEach(function (botao) { botao.disabled = true; });

  try {
    const resposta = await postApi("/api/onboarding/concluir.php", {});

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Nao foi possivel concluir.");
      botoes.forEach(function (botao) { botao.disabled = false; });
      renderizarEtapa();
      return;
    }

    window.location.href = "dashboard.html";
  } catch (erro) {
    mostrarErro("mensagem", "Sem conexao. Tente novamente.");
    botoes.forEach(function (botao) { botao.disabled = false; });
    renderizarEtapa();
  }
}
