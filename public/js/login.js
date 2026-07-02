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

  const captcha = document.getElementById("captcha").value.trim();

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/auth/login.php", { email: email, senha: senha, captcha: captcha });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      // Se o backend passou a exigir captcha, exibe/atualiza o desafio.
      if (resposta.captcha_required) {
        await mostrarCaptcha();
      }
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

// Busca um novo desafio de captcha e exibe o campo.
async function mostrarCaptcha() {
  try {
    const r = await getApi("/api/auth/captcha.php");
    if (r && r.ok) {
      document.getElementById("captcha-pergunta").textContent = r.data.pergunta;
      document.getElementById("campo-captcha").hidden = false;
      document.getElementById("captcha").value = "";
      document.getElementById("captcha").focus();
    }
  } catch (e) {
    // Sem captcha visivel: o backend ainda barra ate responder certo.
  }
}
