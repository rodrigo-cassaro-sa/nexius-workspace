// login.js
// Tela de login. Cuida apenas da interacao e da chamada a API.
// A validacao real (credenciais) e a regra de permissao ficam no backend.

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-login");
  form.addEventListener("submit", enviarLogin);
});

async function enviarLogin(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-entrar");
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  // Validacao basica de experiencia (o backend valida de novo).
  if (!validarEmailFront(email) || !naoVazio(senha)) {
    mostrarErro("mensagem", "Informe um e-mail valido e a senha.");
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

    // Primeiro acesso (onboarding pendente) vai para o onboarding; senao, para o painel.
    if (resposta.data && resposta.data.onboarding_concluido === false) {
      window.location.href = "onboarding.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel entrar. Tente novamente.");
    definirCarregando(botao, false);
  }
}
