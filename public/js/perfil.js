// perfil.js
// Tela de perfil: protege a sessao, mostra os dados do usuario e alterna o tema.

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;

  document.getElementById("p-nome").textContent = usuario.nome;
  document.getElementById("p-email").textContent = usuario.email;
  document.getElementById("p-perfil").textContent = usuario.perfil;

  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  document.getElementById("botao-tema").addEventListener("click", alternarTema);
});
