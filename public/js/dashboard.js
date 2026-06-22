// dashboard.js
// Painel: protege a tela, mostra o usuario e carrega os numeros (api/dashboard/resumo.php).

// Cores do donut de demandas por status.
const CORES_STATUS = {
  concluida: "#2E7D52",
  em_andamento: "#2B5C8A",
  aberta: "#B5852A"
};

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  // Primeiro acesso: garante o onboarding antes do painel.
  if (!usuario.onboarding_concluido) {
    window.location.href = "onboarding.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;

  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }

  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);

  carregarResumo();
});

async function carregarResumo() {
  try {
    const resposta = await getApi("/api/dashboard/resumo.php");
    if (!resposta.ok) {
      mostrarErro("mensagem", "Nao foi possivel carregar o painel.");
      return;
    }
    preencherResumo(resposta.data);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel carregar o painel.");
  }
}

function preencherResumo(d) {
  document.getElementById("kpi-total-demandas").textContent = d.total_demandas;
  document.getElementById("kpi-minhas-acoes").textContent = d.minhas_acoes_pendentes;
  document.getElementById("kpi-atrasadas").textContent = d.acoes_atrasadas;
  document.getElementById("kpi-no-prazo").textContent =
    d.percentual_no_prazo === null ? "—" : d.percentual_no_prazo + "%";

  montarDonutDemandas(d.demandas_por_status);
}

function montarDonutDemandas(porStatus) {
  const donut = document.getElementById("donut-demandas");
  const legenda = document.getElementById("legenda-demandas");

  const segmentos = [
    { chave: "concluida", rotulo: "Concluídas", valor: porStatus.concluida, cor: CORES_STATUS.concluida },
    { chave: "em_andamento", rotulo: "Em andamento", valor: porStatus.em_andamento, cor: CORES_STATUS.em_andamento },
    { chave: "aberta", rotulo: "Abertas", valor: porStatus.aberta, cor: CORES_STATUS.aberta }
  ];

  const total = segmentos.reduce(function (soma, seg) { return soma + seg.valor; }, 0);

  // Donut (conic-gradient). Sem dados: fica cinza.
  if (total === 0) {
    donut.style.background = "var(--cor-borda)";
  } else {
    let acumulado = 0;
    const partes = [];
    segmentos.forEach(function (seg) {
      const inicio = (acumulado / total) * 100;
      acumulado += seg.valor;
      const fim = (acumulado / total) * 100;
      partes.push(seg.cor + " " + inicio + "% " + fim + "%");
    });
    donut.style.background = "conic-gradient(" + partes.join(", ") + ")";
  }

  // Legenda.
  legenda.innerHTML = "";
  segmentos.forEach(function (seg) {
    const li = document.createElement("li");

    const cor = document.createElement("span");
    cor.className = "donut-cor";
    cor.style.background = seg.cor;

    const rotulo = document.createElement("span");
    rotulo.textContent = seg.rotulo;

    const conta = document.createElement("span");
    conta.className = "conta";
    conta.textContent = seg.valor;

    li.appendChild(cor);
    li.appendChild(rotulo);
    li.appendChild(conta);
    legenda.appendChild(li);
  });
}
