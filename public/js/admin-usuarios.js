// admin-usuarios.js
// Tela de administracao: convidar, gerenciar usuarios e convites.
// Exige sessao e perfil administrador (o backend tambem valida tudo).

let usuarioLogadoId = 0;
let setoresLista = [];
let usuariosAtivos = [];

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

  usuarioLogadoId = usuario.id;
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;
  document.getElementById("botao-sair").addEventListener("click", sairDoSistema);
  document.getElementById("form-convite").addEventListener("submit", gerarConvite);
  document.getElementById("botao-testar-email").addEventListener("click", testarEmail);

  await carregarSetores();
  carregarUsuarios();
  carregarConvites();
});

// Carrega setores + usuarios ativos e renderiza o card de setores (responsavel principal).
async function carregarSetores() {
  try {
    const [respSet, respUsu] = await Promise.all([
      getApi("/api/setores/listar.php"),
      getApi("/api/usuarios/listar.php")
    ]);
    setoresLista = (respSet && respSet.ok) ? respSet.data.setores : [];
    usuariosAtivos = (respUsu && respUsu.ok) ? respUsu.data.usuarios : [];
  } catch (erro) {
    setoresLista = [];
    usuariosAtivos = [];
  }
  renderSetores();
  preencherConviteSetor();
}

// Popula o select de setor do formulario de convite (mantem "Sem setor" como 1a opcao).
function preencherConviteSetor() {
  const sel = document.getElementById("convite-setor");
  if (!sel) return;
  sel.length = 1;
  setoresLista.forEach(function (s) {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.nome;
    sel.appendChild(opt);
  });
}

function renderSetores() {
  const alvo = document.getElementById("lista-setores");
  alvo.innerHTML = "";

  if (setoresLista.length === 0) {
    alvo.textContent = "Nenhum setor cadastrado.";
    return;
  }

  setoresLista.forEach(function (s) {
    const linha = document.createElement("div");
    linha.className = "setor-linha";

    const nome = document.createElement("span");
    nome.className = "setor-nome";
    nome.textContent = s.nome;
    linha.appendChild(nome);

    const sel = document.createElement("select");
    sel.className = "campo-input";
    const vazio = document.createElement("option");
    vazio.value = "";
    vazio.textContent = "Sem responsável";
    sel.appendChild(vazio);
    usuariosAtivos.forEach(function (u) {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.nome;
      if (parseInt(s.responsavel_id, 10) === parseInt(u.id, 10)) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", function () { definirResponsavelSetor(s.id, sel.value); });
    linha.appendChild(sel);

    alvo.appendChild(linha);
  });
}

async function definirResponsavelSetor(setorId, responsavelId) {
  try {
    const resposta = await postApi("/api/setores/definir-responsavel.php", {
      setor_id: setorId,
      responsavel_id: responsavelId
    });
    if (!resposta.ok) {
      mostrarErro("setores-mensagem", resposta.error);
      return;
    }
    mostrarSucesso("setores-mensagem", "Responsável do setor atualizado.");
  } catch (erro) {
    mostrarErro("setores-mensagem", "Nao foi possivel salvar o responsável do setor.");
  }
}

async function definirSetorUsuario(id, setorId) {
  try {
    const resposta = await postApi("/api/usuarios/definir-setor.php", { id: id, setor_id: setorId });
    if (!resposta.ok) {
      mostrarErro("usuarios-mensagem", resposta.error);
      return;
    }
    mostrarSucesso("usuarios-mensagem", "Setor do usuário atualizado.");
  } catch (erro) {
    mostrarErro("usuarios-mensagem", "Nao foi possivel salvar o setor.");
  }
}

async function testarEmail() {
  const botao = document.getElementById("botao-testar-email");
  const email = document.getElementById("teste-email").value.trim();

  if (!validarEmailFront(email)) {
    mostrarErro("teste-mensagem", "Informe um e-mail valido.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/admin/testar-email.php", { email: email });

    if (resposta.ok) {
      mostrarSucesso("teste-mensagem", resposta.message);
    } else {
      // Mostra o detalhe tecnico (so admin) para facilitar o diagnostico.
      const detalhe = resposta.detalhe ? " (" + resposta.detalhe + ")" : "";
      mostrarErro("teste-mensagem", resposta.error + detalhe);
    }
    definirCarregando(botao, false);
  } catch (erro) {
    mostrarErro("teste-mensagem", "Nao foi possivel testar o e-mail.");
    definirCarregando(botao, false);
  }
}

async function gerarConvite(evento) {
  evento.preventDefault();

  const botao = document.getElementById("botao-convidar");
  const email = document.getElementById("email").value.trim();
  const perfil = document.getElementById("perfil").value;
  const setorId = document.getElementById("convite-setor").value;

  if (!validarEmailFront(email)) {
    mostrarErro("mensagem", "Informe um e-mail valido.");
    return;
  }

  definirCarregando(botao, true);

  try {
    const resposta = await postApi("/api/convites/criar.php", { email: email, perfil: perfil, setor_id: setorId });

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
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cabecalho = document.createElement("tr");
  ["E-mail", "Perfil", "Status", "Expira em", "Ações"].forEach(function (texto) {
    const th = document.createElement("th");
    th.textContent = texto;
    cabecalho.appendChild(th);
  });
  thead.appendChild(cabecalho);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  convites.forEach(function (convite) {
    const linha = document.createElement("tr");
    [["E-mail", convite.email], ["Perfil", convite.perfil], ["Status", convite.status], ["Expira em", convite.expira_em]].forEach(function (par) {
      const td = document.createElement("td");
      td.setAttribute("data-rotulo", par[0]);
      td.textContent = par[1];
      linha.appendChild(td);
    });

    const tdAcoes = document.createElement("td");
    tdAcoes.setAttribute("data-rotulo", "Ações");
    if (convite.status === "pendente") {
      const copiar = document.createElement("button");
      copiar.className = "botao-link";
      copiar.type = "button";
      copiar.textContent = "Copiar link";
      copiar.addEventListener("click", function () { copiarLinkConvite(convite.token); });
      tdAcoes.appendChild(copiar);

      const cancelar = document.createElement("button");
      cancelar.className = "botao-link";
      cancelar.type = "button";
      cancelar.textContent = "Cancelar";
      cancelar.style.marginLeft = "8px";
      cancelar.addEventListener("click", function () { cancelarConvite(convite.id); });
      tdAcoes.appendChild(cancelar);
    } else {
      tdAcoes.textContent = "—";
    }
    linha.appendChild(tdAcoes);

    tbody.appendChild(linha);
  });

  tabela.appendChild(tbody);
  alvo.appendChild(tabela);
}

function copiarLinkConvite(token) {
  const link = window.location.origin + "/cadastro.html?token=" + token;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(function () {
      mostrarSucesso("mensagem", "Link copiado para a área de transferência.");
    }, function () {
      mostrarSucesso("mensagem", "Link: " + link);
    });
  } else {
    mostrarSucesso("mensagem", "Link: " + link);
  }
}

async function cancelarConvite(id) {
  try {
    const resposta = await postApi("/api/convites/cancelar.php", { id: id });
    if (!resposta.ok) {
      mostrarErro("mensagem", resposta.error);
      return;
    }
    mostrarSucesso("mensagem", resposta.message);
    carregarConvites();
  } catch (erro) {
    mostrarErro("mensagem", "Nao foi possivel cancelar o convite.");
  }
}

// ---- Usuarios cadastrados (gestao) ----

async function carregarUsuarios() {
  const alvo = document.getElementById("lista-usuarios");
  try {
    const resposta = await getApi("/api/usuarios/listar-todos.php");
    if (!resposta.ok) {
      alvo.textContent = "Nao foi possivel carregar os usuarios.";
      return;
    }
    renderUsuarios(alvo, resposta.data.usuarios);
  } catch (erro) {
    alvo.textContent = "Nao foi possivel carregar os usuarios.";
  }
}

function renderUsuarios(alvo, usuarios) {
  alvo.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.className = "tabela tabela-cards";

  const thead = document.createElement("thead");
  const cab = document.createElement("tr");
  ["Nome", "E-mail", "Perfil", "Setor", "Status", "Ação"].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    cab.appendChild(th);
  });
  thead.appendChild(cab);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  usuarios.forEach(function (u) {
    const ehVoce = parseInt(u.id, 10) === parseInt(usuarioLogadoId, 10);
    const ativo = parseInt(u.ativo, 10) === 1;

    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.setAttribute("data-rotulo", "Nome");
    tdNome.textContent = u.nome + (ehVoce ? " (você)" : "");
    tr.appendChild(tdNome);

    const tdEmail = document.createElement("td");
    tdEmail.setAttribute("data-rotulo", "E-mail");
    tdEmail.textContent = u.email;
    tr.appendChild(tdEmail);

    // Perfil (select que altera; bloqueado na propria linha).
    const tdPerfil = document.createElement("td");
    tdPerfil.setAttribute("data-rotulo", "Perfil");
    const sel = document.createElement("select");
    sel.className = "campo-input";
    [["colaborador", "Colaborador"], ["gestor", "Gestor"], ["administrador", "Administrador"]].forEach(function (op) {
      const opt = document.createElement("option");
      opt.value = op[0];
      opt.textContent = op[1];
      if (u.perfil === op[0]) opt.selected = true;
      sel.appendChild(opt);
    });
    if (ehVoce) {
      sel.disabled = true;
      sel.title = "Você não pode alterar o próprio perfil.";
    } else {
      sel.addEventListener("change", function () { alterarPerfil(u.id, sel.value); });
    }
    tdPerfil.appendChild(sel);
    tr.appendChild(tdPerfil);

    // Setor (select que altera; qualquer usuario pode ter setor definido pelo admin).
    const tdSetor = document.createElement("td");
    tdSetor.setAttribute("data-rotulo", "Setor");
    const selSetor = document.createElement("select");
    selSetor.className = "campo-input";
    const vazioSetor = document.createElement("option");
    vazioSetor.value = "";
    vazioSetor.textContent = "Sem setor";
    selSetor.appendChild(vazioSetor);
    setoresLista.forEach(function (s) {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.nome;
      if (parseInt(u.setor_id, 10) === parseInt(s.id, 10)) opt.selected = true;
      selSetor.appendChild(opt);
    });
    selSetor.addEventListener("change", function () { definirSetorUsuario(u.id, selSetor.value); });
    tdSetor.appendChild(selSetor);
    tr.appendChild(tdSetor);

    // Status (badge).
    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-rotulo", "Status");
    const badge = document.createElement("span");
    badge.className = ativo ? "badge badge-sucesso" : "badge";
    badge.textContent = ativo ? "Ativo" : "Inativo";
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    // Acao (inativar/reativar; bloqueado na propria linha).
    const tdAcao = document.createElement("td");
    tdAcao.setAttribute("data-rotulo", "Ação");
    if (ehVoce) {
      tdAcao.textContent = "—";
    } else {
      const btn = document.createElement("button");
      btn.className = "botao botao-secundario";
      btn.type = "button";
      btn.textContent = ativo ? "Inativar" : "Reativar";
      btn.addEventListener("click", function () { alternarAtivo(u.id, ativo ? 0 : 1); });
      tdAcao.appendChild(btn);
    }
    tr.appendChild(tdAcao);

    tbody.appendChild(tr);
  });

  tabela.appendChild(tbody);
  alvo.appendChild(tabela);
}

async function alterarPerfil(id, perfil) {
  try {
    const resposta = await postApi("/api/usuarios/atualizar-perfil.php", { id: id, perfil: perfil });
    if (resposta.ok) {
      mostrarSucesso("usuarios-mensagem", resposta.message);
    } else {
      mostrarErro("usuarios-mensagem", resposta.error);
    }
  } catch (erro) {
    mostrarErro("usuarios-mensagem", "Nao foi possivel atualizar o perfil.");
  }
  carregarUsuarios();
}

async function alternarAtivo(id, ativo) {
  try {
    const resposta = await postApi("/api/usuarios/definir-ativo.php", { id: id, ativo: ativo });
    if (resposta.ok) {
      mostrarSucesso("usuarios-mensagem", resposta.message);
    } else {
      mostrarErro("usuarios-mensagem", resposta.error);
    }
  } catch (erro) {
    mostrarErro("usuarios-mensagem", "Nao foi possivel atualizar o usuario.");
  }
  carregarUsuarios();
}
