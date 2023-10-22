const express = require("express");
const PORT = 3000;
const app = express();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0 });

const resultados = {
  pessoas: [{ id: 1, nome: "Marcelo" }, { id: 2, nome: "João" }, { id: 3, nome: "Maria" }],
  carros: [{ id: 1, modelo: "Fusca" }, { id: 2, modelo: "Gol" }, { id: 3, modelo: "Palio" }],
  animais: [{ id: 1, nome: "Cachorro" }, { id: 2, nome: "Gato" }, { id: 3, nome: "Papagaio" }],
};

const time = 2 * 30;

app.get("/", (req, res) => {
  const keys = Object.keys(resultados);
  const cacheData = cache.get("index");

  if (cacheData) return res.status(304).send(cacheData);

  const urlsDisponiveis = keys.map((key) => ({
    description: `Endpoint ${key}`,
    list: `/${key}`,
    detail: `/${key}/:id`,
  }));

  cache.set("index", urlsDisponiveis, time);
  res.status(200).send(urlsDisponiveis);
});

app.get("/:path", (req, res) => {
  const { params: { path } } = req;
  const data = resultados[path];
  const cacheData = cache.get(path);

  if (cacheData) return res.status(304).send(cacheData);

  let status = 200;
  let mensagem = "Ok";

  if (!data) {
    status = 400;
    mensagem = "Solicitação inválida.";
  }

  const responseData = { data: data ?? {}, mensagem };
  cache.set(path, responseData, time);
  res.status(status).send(responseData);
});

app.get("/:path/:id", (req, res) => {
  const { params: { id, path } } = req;
  const data = resultados[path];
  const keyCache = `${path}_${id}`;
  const cacheData = cache.get(keyCache);

  if (cacheData) return res.status(304).send(cacheData);

  try {
    const result = data.find((item) => item.id === Number(id));
    let status = 200;
    let mensagem = "Ok";

    if (!result) {
      status = 404;
      mensagem = "Não Existe";
    }

    const responseData = { data: result ?? {}, mensagem };
    cache.set(keyCache, responseData, time);
    res.status(status).send(responseData);
  } catch (error) {
    res.status(400).send({ data: null, mensagem: "Url inválida, por favor tente uma válida." });
  }
});

app.listen(PORT, () => {
  console.log(`Está rodando em http://localhost:${PORT}`);
});