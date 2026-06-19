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
