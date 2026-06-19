// storage.js
// Wrapper simples de localStorage para PREFERENCIAS NAO SENSIVEIS (ex.: tema).
// Nunca guardar token, senha ou dado sensivel aqui (ver boas-praticas-seguranca).

function lerLocal(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor === null ? (padrao === undefined ? null : padrao) : valor;
  } catch (erro) {
    return padrao === undefined ? null : padrao;
  }
}

function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch (erro) {
    // Ignora se o navegador bloquear o armazenamento local.
  }
}

function removerLocal(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (erro) {
    // Ignora.
  }
}
