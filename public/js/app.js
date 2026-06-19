// app.js
// Utilidades gerais da aplicacao. No MVP cuida do tema claro/escuro.
// A preferencia de tema e visual (nao sensivel), entao pode ficar em localStorage.

const CHAVE_TEMA = "tema";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema === "escuro" ? "escuro" : "claro");
}

function alternarTema() {
  const atual = localStorage.getItem(CHAVE_TEMA) === "escuro" ? "escuro" : "claro";
  const novo = atual === "escuro" ? "claro" : "escuro";
  localStorage.setItem(CHAVE_TEMA, novo);
  aplicarTema(novo);
}

function iniciarTema() {
  const salvo = localStorage.getItem(CHAVE_TEMA) || "claro";
  aplicarTema(salvo);
}

// Aplica o tema assim que o script carrega, evitando "piscar".
iniciarTema();
