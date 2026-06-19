// validators.js
// Validacoes basicas de experiencia no frontend (o backend valida de novo, de verdade).
// Funcoes pequenas e reutilizaveis. Sem regra de negocio complexa.

function naoVazio(valor) {
  return valor !== null && valor !== undefined && String(valor).trim() !== "";
}

function validarEmailFront(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function tamanhoMinimo(valor, minimo) {
  return String(valor).length >= minimo;
}

function tamanhoEntre(valor, minimo, maximo) {
  const tamanho = String(valor).trim().length;
  return tamanho >= minimo && tamanho <= maximo;
}
