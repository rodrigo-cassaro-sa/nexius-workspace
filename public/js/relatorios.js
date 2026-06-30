// relatorios.js
// Tela de Relatorios (Gestor/Admin). Periodo afeta "% no prazo" e "produtividade".
// O backend valida o acesso; aqui so exibe e protege a experiencia.

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  // Apenas Gestor/Admin (a regra real esta no backend).
  if (usuario.perfil !== "administrador" && usuario.perfil !== "gestor") {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("nav-relatorios").hidden = false;
  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);

  // Periodo padrao: ultimos 30 dias.
  const hoje = new Date();
  const ini = new Date();
  ini.setDate(hoje.getDate() - 30);
  document.getElementById("rel-fim").value = formatarISO(hoje);
  document.getElementById("rel-inicio").value = formatarISO(ini);

  document.getElementById("rel-inicio").addEventListener("change", carregarRelatorios);
  document.getElementById("rel-fim").addEventListener("change", carregarRelatorios);
  document.getElementById("rel-exportar").addEventListener("click", exportarCsv);

  carregarRelatorios();
});

function formatarISO(d) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mes + "-" + dia;
}

function periodoQuery() {
  const inicio = document.getElementById("rel-inicio").value;
  const fim = document.getElementById("rel-fim").value;
  return "inicio=" + encodeURIComponent(inicio) + "&fim=" + encodeURIComponent(fim);
}

async function carregarRelatorios() {
  try {
    const resposta = await getApi("/api/relatorios/resumo.php?" + periodoQuery());
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error || "Nao foi possivel carregar os relatorios.");
      return;
    }
    document.getElementById("mensagem").hidden = true;
    renderResumo(resposta.data);
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel carregar os relatorios.");
  }
}

function renderResumo(d) {
  // % no prazo (periodo)
  const p = d.acoes_prazo;
  document.getElementById("rel-prazo").textContent = (p.percentual === null) ? "—" : p.percentual + "%";
  document.getElementById("rel-prazo-base").textContent =
    p.total > 0 ? (p.no_prazo + " de " + p.total + " ações concluídas no prazo") : "Sem ações concluídas no período";

  // Demandas por status
  renderLinhas("rel-status", d.demandas_por_status, function (item) {
    return { rotulo: rotuloStatus(item.status), valor: item.total };
  });

  // Demandas por setor
  renderLinhas("rel-setor", d.demandas_por_setor, function (item) {
    return { rotulo: item.setor, valor: item.total };
  });

  // Produtividade (tabela)
  renderProdutividade(d.produtividade);
}

// Renderiza uma lista "rotulo + numero" (mesmo estilo do dashboard).
function renderLinhas(alvoId, itens, mapear) {
  const alvo = document.getElementById(alvoId);
  alvo.innerHTML = "";
  if (!itens || itens.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "texto-secundario";
    vazio.textContent = "Sem dados.";
    alvo.appendChild(vazio);
    return;
  }
  itens.forEach(function (item) {
    const m = mapear(item);
    const linha = document.createElement("div");
    linha.className = "tipo-linha";
    const rot = document.createElement("span");
    rot.textContent = m.rotulo;
    const num = document.createElement("span");
    num.className = "tipo-conta";
    num.textContent = m.valor;
    linha.appendChild(rot);
    linha.appendChild(num);
    alvo.appendChild(linha);
  });
}

function renderProdutividade(linhas) {
  const alvo = document.getElementById("rel-produtividade");
  alvo.innerHTML = "";

  if (!linhas || linhas.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "texto-secundario";
    vazio.textContent = "Nenhuma ação concluída no período.";
    alvo.appendChild(vazio);
    return;
  }

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Responsável", "Concluídas", "No prazo", "% no prazo"].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  linhas.forEach(function (l) {
    const concluidas = parseInt(l.concluidas, 10) || 0;
    const noPrazo = parseInt(l.no_prazo, 10) || 0;
    const pct = concluidas > 0 ? Math.round((noPrazo / concluidas) * 100) + "%" : "—";

    const tr = document.createElement("tr");
    tr.appendChild(celula("Responsável", l.responsavel));
    tr.appendChild(celula("Concluídas", String(concluidas)));
    tr.appendChild(celula("No prazo", String(noPrazo)));
    tr.appendChild(celula("% no prazo", pct));
    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);
  alvo.appendChild(tabela);
}

function celula(rotulo, valor) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", rotulo);
  td.textContent = valor;
  return td;
}

function exportarCsv() {
  window.location.href = "/api/relatorios/exportar.php?" + periodoQuery();
}
