// login.js
// Tela de login. Cuida apenas da interacao e da chamada a API.
// A validacao real (credenciais) e a regra de permissao ficam no backend.

document.addEventListener("DOMContentLoaded", function () {
  // Se ja houver sessao valida, vai direto para o painel.
  verificarSessaoExistente();

  const form = document.getElementById("form-login");
  form.addEventListener("submit", enviarLogin);
});

async function verificarSessaoExistente() {
  try {
    const resposta = await getApi("/api/auth/me.php");
    if (resposta.ok) {
      window.location.href = "dashboard.html";
    }
  } catch (erro) {
    // Sem sessao: permanece na tela de login.
  }
}

async function enviarLogin(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-entrar");
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  // Validacao basica de experiencia (o backend valida de novo).
  if (email === "" || senha === "") {
    mostrarErro("mensagem", "Preencha e-mail e senha.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/auth/login.php", { email: email, senha: senha });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    // Sucesso: vai para o painel.
    window.location.href = "dashboard.html";
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel entrar. Tente novamente.");
    definirCarregando(botao, false);
  }
}
