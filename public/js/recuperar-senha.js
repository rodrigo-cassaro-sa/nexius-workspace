// recuperar-senha.js
// Solicita o link de redefinicao. A resposta e sempre neutra (nao revela se o e-mail existe).

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("form-recuperar").addEventListener("submit", enviarPedido);
});

async function enviarPedido(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-enviar");
  const email = document.getElementById("email").value.trim();

  if (!validarEmailFront(email)) {
    mostrarErro("mensagem", "Informe um e-mail valido.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/auth/recuperar-senha.php", { email: email });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    mostrarSucesso("mensagem", resposta.message);
    document.getElementById("form-recuperar").reset();
    definirCarregando(botao, false);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel enviar. Tente novamente.");
    definirCarregando(botao, false);
  }
}
