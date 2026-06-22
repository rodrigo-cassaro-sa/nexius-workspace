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
    bloqueada: "badge badge-aviso"
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
    bloqueada: "Bloqueada"
  };
  return mapa[status] || status;
}

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
