// setup.js
// Tela de configuracao inicial: cria o primeiro administrador via api/auth/setup.php.
// O backend so permite enquanto nao houver nenhum usuario.

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-setup");
  form.addEventListener("submit", enviarSetup);
});

async function enviarSetup(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-criar");
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  // Validacao basica de experiencia (o backend valida de novo).
  if (!naoVazio(nome) || !validarEmailFront(email) || !tamanhoMinimo(senha, 8)) {
    mostrarErro("mensagem", "Preencha nome, e-mail valido e uma senha de pelo menos 8 caracteres.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/auth/setup.php", { nome: nome, email: email, senha: senha });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    mostrarSucesso("mensagem", "Administrador criado. Redirecionando para o login...");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1500);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel concluir. Tente novamente.");
    definirCarregando(botao, false);
  }
}
