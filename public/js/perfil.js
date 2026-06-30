// perfil.js
// Tela de perfil: protege a sessao, edita o nome, troca a senha e alterna o tema.

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  // Topbar.
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;

  // Formulario de perfil (nome editavel; e-mail e perfil apenas exibidos).
  document.getElementById("nome").value = usuario.nome;
  document.getElementById("email").value = usuario.email;
  document.getElementById("p-perfil").textContent = usuario.perfil;

  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  // Preferencia de resumo por e-mail (digest): reflete o valor atual e salva ao alternar.
  const toggleDigest = document.getElementById("pref-digest");
  toggleDigest.checked = !!usuario.digest_ativo;
  toggleDigest.addEventListener("change", salvarDigest);

  document.getElementById("form-perfil").addEventListener("submit", salvarPerfil);
  document.getElementById("form-senha").addEventListener("submit", alterarSenha);
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  document.getElementById("botao-tema").addEventListener("click", alternarTema);
});

async function salvarDigest() {
  const toggle = document.getElementById("pref-digest");
  try {
    const resposta = await postApi("/api/perfil/preferencias.php", { digest_ativo: toggle.checked ? 1 : 0 });
    if (!resposta.ok) {
      mostrarErro("mensagem-perfil", resposta.error);
      toggle.checked = !toggle.checked; // desfaz visualmente se falhar
      return;
    }
    mostrarSucesso("mensagem-perfil", toggle.checked ? "Resumo por e-mail ativado." : "Resumo por e-mail desativado.");
  } catch (erro) {
    mostrarErro("mensagem-perfil", "Nao foi possivel salvar a preferencia.");
    toggle.checked = !toggle.checked;
  }
}

async function salvarPerfil(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-salvar");
  const nome = document.getElementById("nome").value.trim();

  if (nome.length < 2) {
    mostrarErro("mensagem-perfil", "Informe um nome com pelo menos 2 caracteres.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/perfil/atualizar.php", { nome: nome });

    if (!resposta.ok) {
      mostrarErro("mensagem-perfil", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    // Reflete o novo nome na topbar imediatamente.
    document.getElementById("usuario-nome").textContent = nome;
    mostrarSucesso("mensagem-perfil", "Perfil atualizado.");
    definirCarregando(botao, false);
  } catch (erro) {
    mostrarErro("mensagem-perfil", "Nao foi possivel salvar o perfil.");
    definirCarregando(botao, false);
  }
}

async function alterarSenha(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-senha");
  const atual = document.getElementById("senha-atual").value;
  const nova = document.getElementById("senha-nova").value;
  const confirmar = document.getElementById("senha-confirmar").value;

  if (atual === "") {
    mostrarErro("mensagem-senha", "Informe a senha atual.");
    return;
  }
  if (nova.length < 8) {
    mostrarErro("mensagem-senha", "A nova senha deve ter pelo menos 8 caracteres.");
    return;
  }
  if (nova !== confirmar) {
    mostrarErro("mensagem-senha", "A confirmacao nao confere com a nova senha.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/perfil/alterar-senha.php", {
      senha_atual: atual,
      senha_nova: nova
    });

    if (!resposta.ok) {
      mostrarErro("mensagem-senha", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    document.getElementById("form-senha").reset();
    mostrarSucesso("mensagem-senha", "Senha alterada com sucesso.");
    definirCarregando(botao, false);
  } catch (erro) {
    mostrarErro("mensagem-senha", "Nao foi possivel alterar a senha.");
    definirCarregando(botao, false);
  }
}
