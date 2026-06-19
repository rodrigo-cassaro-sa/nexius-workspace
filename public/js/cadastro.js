// cadastro.js
// Aceite de convite: le o token da URL e envia nome + senha para api/convites/aceitar.php.

let tokenConvite = "";

document.addEventListener("DOMContentLoaded", function () {
  const parametros = new URLSearchParams(window.location.search);
  tokenConvite = parametros.get("token") || "";

  if (tokenConvite === "") {
    mostrarErro("mensagem", "Convite invalido. Verifique o link recebido.");
    document.getElementById("botao-criar").disabled = true;
    return;
  }

  document.getElementById("form-cadastro").addEventListener("submit", enviarCadastro);
});

async function enviarCadastro(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-criar");
  const nome = document.getElementById("nome").value.trim();
  const senha = document.getElementById("senha").value;

  if (!naoVazio(nome) || !tamanhoMinimo(senha, 8)) {
    mostrarErro("mensagem", "Preencha o nome e uma senha de pelo menos 8 caracteres.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/convites/aceitar.php", {
      token: tokenConvite,
      nome: nome,
      senha: senha
    });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    mostrarSucesso("mensagem", "Acesso criado. Redirecionando para o login...");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1500);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel concluir. Tente novamente.");
    definirCarregando(botao, false);
  }
}
