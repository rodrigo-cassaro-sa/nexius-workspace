// app.js
// Utilidades gerais da aplicacao. No MVP cuida do tema claro/escuro.
// A preferencia de tema e visual (nao sensivel) e fica no localStorage via storage.js.

const CHAVE_TEMA = "tema";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema === "escuro" ? "escuro" : "claro");
}

function alternarTema() {
  const atual = lerLocal(CHAVE_TEMA, "claro") === "escuro" ? "escuro" : "claro";
  const novo = atual === "escuro" ? "claro" : "escuro";
  gravarLocal(CHAVE_TEMA, novo);
  aplicarTema(novo);
}

function iniciarTema() {
  aplicarTema(lerLocal(CHAVE_TEMA, "claro"));
}

// Aplica o tema assim que o script carrega, evitando "piscar".
iniciarTema();
