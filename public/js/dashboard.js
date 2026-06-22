// dashboard.js
// Protege a tela: exige sessao valida e mostra o usuario logado.
// A regra de permissao real continua no backend; aqui e so experiencia.

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();

  // Sem sessao: exigirSessaoNoFront ja redirecionou para o login.
  if (!usuario) {
    return;
  }

  // Primeiro acesso: garante o onboarding antes do painel.
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;

  // Mostra o acesso a administracao apenas para admin (apenas experiencia; o backend valida).
  if (usuario.perfil === "administrador") {
    document.getElementById("link-admin").hidden = false;
  }

  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
});
