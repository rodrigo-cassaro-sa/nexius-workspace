// auth.js
// Verificacao de sessao no frontend (apenas experiencia; a permissao real e no backend).
// O endpoint api/auth/sessao.php sera criado na fase de autenticacao.

async function verificarSessao() {
  try {
    const resposta = await getApi("/api/auth/sessao.php");
    return resposta.ok ? resposta.data : null;
  } catch (erro) {
    return null;
  }
}

function redirecionarLogin() {
  window.location.href = "/index.html";
}

// Uso tipico nas telas internas: se nao houver sessao, voltar ao login.
async function exigirSessaoNoFront() {
  const usuario = await verificarSessao();

  if (!usuario) {
    redirecionarLogin();
  }

  return usuario;
}

// Encerra a sessao no backend e volta para o login. Reutilizavel em qualquer tela.
async function sairDoSistema() {
  try {
    await postApi("/api/auth/logout.php", {});
  } catch (erro) {
    // Mesmo se falhar, leva o usuario de volta ao login.
  }
  redirecionarLogin();
}
