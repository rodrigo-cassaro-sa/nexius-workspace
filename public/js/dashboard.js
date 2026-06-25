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
  carregarRetencao();
  carregarAtividades();
});

// ---- Retencao: minhas pendencias + "continue de onde parou" ----

async function carregarRetencao() {
  const alvo = document.getElementById("lista-pendencias");
  try {
    const resposta = await getApi("/api/dashboard/retencao.php");
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as pendencias.";
      return;
    }
    renderContinuar(resposta.data.ultima_demanda);
    renderPendencias(alvo, resposta.data.pendencias);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as pendencias.";
  }
}

function renderContinuar(demanda) {
  const link = document.getElementById("continue-link");
  if (!demanda) {
    link.hidden = true;
    return;
  }
  link.href = "demanda.html?id=" + demanda.id;
  link.textContent = "Continuar: " + demanda.titulo + " →";
  link.hidden = false;
}

function renderPendencias(alvo, lista) {
  alvo.innerHTML = "";

  if (!lista || lista.length === 0) {
    const p = document.createElement("p");
    p.className = "texto-secundario";
    p.textContent = "Você está em dia. Sem ações pendentes.";
    alvo.appendChild(p);
    return;
  }

  const hoje = new Date().toISOString().substring(0, 10);

  lista.forEach(function (a) {
    const linha = document.createElement("a");
    linha.className = "atividade";
    linha.href = "demanda.html?id=" + a.demanda_id;

    const texto = document.createElement("div");
    texto.className = "atividade-texto";
    const titulo = document.createElement("strong");
    titulo.className = "atividade-titulo";
    titulo.textContent = a.acao_titulo;
    const desc = document.createElement("span");
    desc.className = "atividade-desc";
    desc.textContent = a.demanda_titulo;
    texto.appendChild(titulo);
    texto.appendChild(desc);

    const meta = document.createElement("span");
    const prazo = a.prazo ? a.prazo.substring(0, 10) : null;
    if (parseInt(a.prereq_pendentes, 10) > 0) {
      meta.className = "badge badge-aviso";
      meta.textContent = "Bloqueada";
    } else if (prazo && prazo < hoje) {
      meta.className = "badge badge-erro";
      meta.textContent = "Atrasada · " + prazo;
    } else if (prazo) {
      meta.className = "atividade-data";
      meta.textContent = "Prazo " + prazo;
    } else {
      meta.className = "atividade-data";
      meta.textContent = "Sem prazo";
    }

    linha.appendChild(texto);
    linha.appendChild(meta);
    alvo.appendChild(linha);
  });
}

async function carregarAtividades() {
  const alvo = document.getElementById("atividades");
  try {
    const resposta = await getApi("/api/notificacoes/listar.php");
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar as atividades.";
      return;
    }

    const itens = resposta.data.notificacoes.slice(0, 6);
    if (itens.length === 0) {
      alvo.innerHTML = "";
      const vazio = document.createElement("p");
      vazio.className = "texto-secundario";
      vazio.textContent = "Sem atividades recentes.";
      alvo.appendChild(vazio);
      return;
    }

    alvo.innerHTML = "";
    itens.forEach(function (n) {
      const linha = document.createElement("a");
      linha.className = "atividade";
      linha.href = n.link || "notificacoes.html";

      const info = iconeAtividade(n.tipo);
      const icone = document.createElement("span");
      icone.className = "atividade-icone " + info.classe;
      icone.setAttribute("aria-hidden", "true");
      // SVG e markup proprio (constante), nao dado do usuario.
      icone.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + info.svg + "</svg>";

      const texto = document.createElement("div");
      texto.className = "atividade-texto";
      const titulo = document.createElement("strong");
      titulo.className = "atividade-titulo";
      titulo.textContent = n.titulo;
      const desc = document.createElement("span");
      desc.className = "atividade-desc";
      desc.textContent = n.mensagem;
      texto.appendChild(titulo);
      texto.appendChild(desc);

      const data = document.createElement("span");
      data.className = "atividade-data";
      data.textContent = formatarDataRelativa(n.criado_em);

      linha.appendChild(icone);
      linha.appendChild(texto);
      linha.appendChild(data);
      alvo.appendChild(linha);
    });
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar as atividades.";
  }
}

// Icone (e cor) da atividade conforme o tipo da notificacao de origem.
function iconeAtividade(tipo) {
  const mapa = {
    conclusao: {
      classe: "atividade-icone-conclusao",
      svg: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
    },
    comentario: {
      classe: "atividade-icone-comentario",
      svg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>'
    },
    atribuicao: {
      classe: "atividade-icone-atribuicao",
      svg: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line>'
    },
    status: {
      classe: "atividade-icone-status",
      svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>'
    }
  };
  return mapa[tipo] || mapa.status;
}

// Formata a data/hora como "Hoje, 09:15" / "Ontem, 16:40" / "18/06, 11:22".
function formatarDataRelativa(iso) {
  if (!iso) return "";
  const data = new Date(String(iso).replace(" ", "T"));
  if (isNaN(data.getTime())) return String(iso).substring(0, 16);

  const hora = ("0" + data.getHours()).slice(-2) + ":" + ("0" + data.getMinutes()).slice(-2);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  function mesmoDia(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  if (mesmoDia(data, hoje)) return "Hoje, " + hora;
  if (mesmoDia(data, ontem)) return "Ontem, " + hora;

  const dia = ("0" + data.getDate()).slice(-2);
  const mes = ("0" + (data.getMonth() + 1)).slice(-2);
  return dia + "/" + mes + ", " + hora;
}

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
  document.getElementById("kpi-recusadas").textContent = d.acoes_recusadas;

  montarDonutDemandas(d.demandas_por_status);
  montarAcoesPorTipo(d.acoes_por_tipo);
}

// Contador de tarefas por tipo (analise, desenvolvimento, entrega, incidente, reuniao).
function montarAcoesPorTipo(porTipo) {
  const alvo = document.getElementById("acoes-por-tipo");
  alvo.innerHTML = "";

  const itens = [
    { chave: "analise", rotulo: "Análise" },
    { chave: "desenvolvimento", rotulo: "Desenvolvimento" },
    { chave: "entrega", rotulo: "Entrega" },
    { chave: "incidente", rotulo: "Incidente" },
    { chave: "reuniao", rotulo: "Reunião" }
  ];

  itens.forEach(function (it) {
    const item = document.createElement("div");
    item.className = "tipo-item";

    const num = document.createElement("p");
    num.className = "tipo-numero";
    num.textContent = (porTipo && porTipo[it.chave] != null) ? porTipo[it.chave] : 0;

    const rot = document.createElement("p");
    rot.className = "tipo-rotulo texto-secundario";
    rot.textContent = it.rotulo;

    item.appendChild(num);
    item.appendChild(rot);
    alvo.appendChild(item);
  });
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
