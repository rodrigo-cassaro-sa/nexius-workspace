// gamificacao.js
// Tela de Progresso: exibe pontos, nivel, numeros e conquistas (calculados no backend).

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  carregarProgresso();
});

async function carregarProgresso() {
  try {
    const resposta = await getApi("/api/gamificacao/progresso.php");
    document.getElementById("carregando").hidden = true;

    if (!resposta.ok) {
      mostrarErro("mensagem", "Nao foi possivel carregar o progresso.");
      return;
    }

    preencherProgresso(resposta.data);
    document.getElementById("conteudo").hidden = false;
  } catch (erro) {
    document.getElementById("carregando").hidden = true;
    mostrarErro("mensagem", "Nao foi possivel carregar o progresso.");
  }
}

function preencherProgresso(d) {
  document.getElementById("g-periodo").textContent = d.periodo;
  document.getElementById("g-pontos").textContent = d.pontos;

  const nivel = document.getElementById("g-nivel");
  nivel.textContent = "Nível " + d.nivel.nome;
  nivel.className = "badge badge-info";

  document.getElementById("g-barra").style.width = d.nivel.progresso_pct + "%";
  document.getElementById("g-proximo").textContent = d.nivel.proximo_nome
    ? ("Faltam " + d.nivel.faltam + " pts para " + d.nivel.proximo_nome + " neste mês")
    : "Nível máximo do mês alcançado.";

  document.getElementById("g-total-pts").textContent = d.pontos_total;
  document.getElementById("g-total-acoes").textContent = d.total_concluidas_geral;

  document.getElementById("g-total").textContent = d.numeros.total_concluidas;
  document.getElementById("g-pct").textContent = d.numeros.pct_no_prazo + "%";
  document.getElementById("g-chave").textContent = d.numeros.chave_concluidas;
  document.getElementById("g-atrasadas").textContent = d.numeros.atrasadas;

  renderConquistas(d.conquistas);
}

function renderConquistas(lista) {
  const alvo = document.getElementById("g-conquistas");
  alvo.innerHTML = "";

  lista.forEach(function (c) {
    const desbloqueada = parseInt(c.desbloqueada, 10) === 1;

    const item = document.createElement("div");
    item.className = "conquista " + (desbloqueada ? "conquista-on" : "conquista-off");

    const titulo = document.createElement("strong");
    titulo.textContent = c.titulo;

    const desc = document.createElement("p");
    desc.className = "texto-secundario";
    desc.textContent = c.descricao;

    const prog = document.createElement("span");
    prog.className = "conquista-prog";
    prog.textContent = desbloqueada ? "✓ Conquistada" : c.progresso;

    item.appendChild(titulo);
    item.appendChild(desc);
    item.appendChild(prog);
    alvo.appendChild(item);
  });
}
