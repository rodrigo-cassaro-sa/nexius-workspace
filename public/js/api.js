// api.js
// Comunicacao com a API JSON. Centraliza as chamadas (nao espalhar fetch pelas telas).
// Sempre usa credentials: "include" por causa da sessao por cookie.

async function getApi(url) {
  const resposta = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store"
  });

  return await resposta.json();
}

async function postApi(url, body) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(body || {})
  });

  return await resposta.json();
}
