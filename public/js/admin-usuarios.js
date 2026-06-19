// admin-usuarios.js
// Tela de administracao: convidar usuarios e listar convites.
// Exige sessao e perfil administrador (o backend tambem valida tudo).

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) {
    return;
  }

  // Sem permissao de admin: volta ao painel (a regra real e validada no backend).
  if (usuario.perfil !== "administrador") {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  document.getElementById("form-convite").addEventListener("submit", gerarConvite);

  carregarConvites();
});

async function gerarConvite(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-convidar");
  const email = document.getElementById("email").value.trim();
  const perfil = document.getElementById("perfil").value;

  if (email === "") {
    mostrarErro("mensagem", "Informe o e-mail.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/convites/criar.php", { email: email, perfil: perfil });

    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      definirCarregando(botao, false);
      return;
    }

    // Monta o link completo a partir da origem atual.
    const link = window.location.origin + "/" + resposta.data.caminho;
    document.getElementById("link-convite").value = link;
    document.getElementById("bloco-link").hidden = false;

    mostrarSucesso("mensagem", "Convite criado. Copie o link abaixo e envie para a pessoa.");
    document.getElementById("email").value = "";
    definirCarregando(botao, false);
    carregarConvites();
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel gerar o convite.");
    definirCarregando(botao, false);
  }
}

async function carregarConvites() {
  const alvo = document.getElementById("lista-convites");

  try {
    const resposta = await getApi("/api/convites/listar.php");

    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar os convites.";
      return;
    }

    const convites = resposta.data.convites;

    if (convites.length === 0) {
      alvo.textContent = "Nenhum convite ainda.";
      return;
    }

    preencherTabelaConvites(alvo, convites);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar os convites.";
  }
}

function preencherTabelaConvites(alvo, convites) {
  alvo.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.className = "tabela";

  const cabecalho = document.createElement("tr");
  ["E-mail", "Perfil", "Status", "Expira em"].forEach(function (texto) {
    const th = document.createElement("th");
    th.textContent = texto;
    cabecalho.appendChild(th);
  });
  tabela.appendChild(cabecalho);

  convites.forEach(function (convite) {
    const linha = document.createElement("tr");
    [convite.email, convite.perfil, convite.status, convite.expira_em].forEach(function (texto) {
      const td = document.createElement("td");
      td.textContent = texto;
      linha.appendChild(td);
    });
    tabela.appendChild(linha);
  });

  alvo.appendChild(tabela);
}
