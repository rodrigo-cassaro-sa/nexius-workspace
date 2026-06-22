// redefinir-senha.js
// Le o token da URL e envia a nova senha para api/auth/redefinir-senha.php.

let tokenRecuperacao = "";

document.addEventListener("DOMContentLoaded", function () {
  const parametros = new URLSearchParams(window.location.search);
  tokenRecuperacao = parametros.get("token") || "";

  if (tokenRecuperacao === "") {
    mostrarErro("mensagem", "Link invalido. Solicite uma nova recuperacao de senha.");
    document.getElementById("botao-redefinir").disabled = true;
    return;
  }

  document.getElementById("form-redefinir").addEventListener("submit", enviarNovaSenha);
});

async function enviarNovaSenha(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-redefinir");
  const senha = document.getElementById("senha").value;

  if (!tamanhoMinimo(senha, 8)) {
    mostrarErro("mensagem", "A senha deve ter pelo menos 8 caracteres.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/auth/redefinir-senha.php", {
      token: tokenRecuperacao,
      senha: senha
    });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    mostrarSucesso("mensagem", "Senha alterada. Redirecionando para o login...");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1500);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel concluir. Tente novamente.");
    definirCarregando(botao, false);
  }
}
