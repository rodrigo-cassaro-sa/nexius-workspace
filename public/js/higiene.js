// higiene.js
// Painel de Controle/Higiene: lista o que esta fora de controle (Gestor/Admin).
// Permite reatribuir tarefas orfas (responsavel inativo). So leitura, exceto a reatribuicao.

let usuariosLista = [];

document.addEventListener("DOMContentLoaded", async function () {
  const usuario = await exigirSessaoNoFront();
  if (!usuario) return;

  // Tela gerencial: Colaborador nao acessa (o backend tambem bloqueia).
  if (usuario.perfil !== "administrador" && usuario.perfil !== "gestor") {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("nav-higiene").hidden = false;
  if (usuario.perfil === "administrador") {
    document.getElementById("nav-usuarios").hidden = false;
  }
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);

  await carregarUsuarios();
  carregar();
});

async function carregarUsuarios() {
  try {
    const r = await getApi("/api/usuarios/listar.php");
    if (r.ok) usuariosLista = r.data.usuarios || [];
  } catch (e) {
    usuariosLista = [];
  }
}

async function carregar() {
  try {
    const r = await getApi("/api/higiene/resumo.php");
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível carregar o painel.");
      return;
    }
    document.getElementById("mensagem").hidden = true;
    render(r.data);
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível carregar o painel.");
  }
}

function render(d) {
  document.getElementById("c-dias").textContent = d.dias_parada;

  renderDemandas("h-sem-acao", d.demandas_sem_acao, "c-sem-acao-n", "criado");
  renderDemandas("h-sem-responsavel", d.demandas_sem_responsavel, "c-sem-resp-n", "criado");
  renderAcoes("h-sem-prazo", d.acoes_sem_prazo, "c-sem-prazo-n", false);
  renderAcoes("h-orfaos", d.acoes_responsavel_inativo, "c-orfaos-n", true);
  renderDemandas("h-paradas", d.demandas_paradas, "c-paradas-n", "movimento");
}

function fmtData(iso) {
  if (!iso) return "—";
  const s = String(iso).substring(0, 10).split("-");
  return s.length === 3 ? (s[2] + "/" + s[1] + "/" + s[0]) : "—";
}

function contador(id, n, classeAlerta) {
  const el = document.getElementById(id);
  el.textContent = n;
  // Zero = bom (verde); com itens = a cor de alerta da secao.
  el.className = n === 0 ? "badge badge-sucesso" : (classeAlerta || "badge badge-aviso");
}

function vazioOk(alvoId, texto) {
  const alvo = document.getElementById(alvoId);
  alvo.innerHTML = "";
  const p = document.createElement("p");
  p.className = "texto-secundario";
  p.textContent = texto;
  alvo.appendChild(p);
}

function novaTabela(colunas) {
  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  colunas.forEach(function (c) {
    const th = document.createElement("th");
    th.textContent = c;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  tabela.appendChild(thead);
  const tbody = document.createElement("tbody");
  tabela.appendChild(tbody);
  return { tabela: tabela, tbody: tbody };
}

function celula(rotulo, conteudo) {
  const td = document.createElement("td");
  td.setAttribute("data-rotulo", rotulo);
  if (typeof conteudo === "string") {
    td.textContent = conteudo;
  } else if (conteudo) {
    td.appendChild(conteudo);
  }
  return td;
}

function linkDemanda(id, titulo) {
  const a = document.createElement("a");
  a.href = "demanda.html?id=" + id;
  a.textContent = titulo;
  return a;
}

// Lista de demandas. tipoData = "criado" | "movimento".
function renderDemandas(alvoId, itens, contadorId, tipoData) {
  contador(contadorId, itens.length, "badge badge-aviso");
  const alvo = document.getElementById(alvoId);
  if (itens.length === 0) {
    vazioOk(alvoId, "Nenhuma. ✔");
    return;
  }
  alvo.innerHTML = "";
  const rotuloData = tipoData === "movimento" ? "Último movimento" : "Criada em";
  const t = novaTabela(["Demanda", "Setor", rotuloData]);
  itens.forEach(function (it) {
    const tr = document.createElement("tr");
    tr.appendChild(celula("Demanda", linkDemanda(it.id, it.titulo)));
    tr.appendChild(celula("Setor", it.setor_nome || "—"));
    tr.appendChild(celula(rotuloData, fmtData(tipoData === "movimento" ? it.ultimo_movimento : it.criado_em)));
    t.tbody.appendChild(tr);
  });
  alvo.appendChild(t.tabela);
}

// Lista de acoes. reatribuir = true adiciona o controle de reatribuicao (orfas).
function renderAcoes(alvoId, itens, contadorId, reatribuir) {
  contador(contadorId, itens.length, reatribuir ? "badge badge-erro" : "badge badge-aviso");
  const alvo = document.getElementById(alvoId);
  if (itens.length === 0) {
    vazioOk(alvoId, "Nenhuma. ✔");
    return;
  }
  alvo.innerHTML = "";
  const colunas = ["Tarefa", "Demanda", "Responsável"];
  if (reatribuir) colunas.push("Reatribuir");
  const t = novaTabela(colunas);

  itens.forEach(function (it) {
    const tr = document.createElement("tr");
    tr.appendChild(celula("Tarefa", it.titulo));
    tr.appendChild(celula("Demanda", linkDemanda(it.demanda_id, it.demanda_titulo)));
    tr.appendChild(celula("Responsável", it.responsavel_nome || "—"));

    if (reatribuir) {
      const wrap = document.createElement("div");
      wrap.className = "projeto-mover-linha";
      const sel = document.createElement("select");
      sel.className = "campo-input";
      const vazio = document.createElement("option");
      vazio.value = "";
      vazio.textContent = "Escolher...";
      sel.appendChild(vazio);
      usuariosLista.forEach(function (u) {
        const o = document.createElement("option");
        o.value = u.id;
        o.textContent = u.nome;
        sel.appendChild(o);
      });
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "botao botao-secundario";
      botao.textContent = "Reatribuir";
      botao.addEventListener("click", function () { reatribuirAcao(it.id, sel.value, botao); });
      wrap.appendChild(sel);
      wrap.appendChild(botao);
      tr.appendChild(celula("Reatribuir", wrap));
    }

    t.tbody.appendChild(tr);
  });
  alvo.appendChild(t.tabela);
}

async function reatribuirAcao(acaoId, responsavelId, botao) {
  if (!responsavelId) {
    mostrarErro("mensagem", "Escolha um responsável para reatribuir.");
    return;
  }
  definirCarregando(botao, true);
  try {
    const r = await postApi("/api/acoes/definir-responsavel.php", { id: acaoId, responsavel_id: responsavelId });
    if (!r.ok) {
      mostrarErro("mensagem", r.error || "Não foi possível reatribuir.");
      definirCarregando(botao, false);
      return;
    }
    definirCarregando(botao, false);
    mostrarSucesso("mensagem", "Tarefa reatribuída.");
    carregar();
  } catch (e) {
    mostrarErro("mensagem", "Não foi possível reatribuir.");
    definirCarregando(botao, false);
  }
}
