// backend/server.js

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const googleTrends = require("google-trends-api");

const app = express();

app.use(cors());
app.use(express.json());

const clickDatabase = [];

// --- BANCO DE DADOS DE SERVIDORES VPN ---
const vpnServerDatabase = [
  {
    cidade: "São Paulo",
    estado: "SP",
    ip: "172.67.149.123",
    provedor: "ExemploVPN",
  },
  {
    cidade: "Rio de Janeiro",
    estado: "RJ",
    ip: "188.114.97.7",
    provedor: "ExemploVPN",
  },
  // ... (o resto do seu banco de dados de VPNs)
];
const capitais = {
  AC: "Rio Branco",
  AL: "Maceió",
  AP: "Macapá",
  AM: "Manaus",
  BA: "Salvador",
  CE: "Fortaleza",
  DF: "Brasília",
  ES: "Vitória",
  GO: "Goiânia",
  MA: "São Luís",
  MT: "Cuiabá",
  MS: "Campo Grande",
  MG: "Belo Horizonte",
  PA: "Belém",
  PB: "João Pessoa",
  PR: "Curitiba",
  PE: "Recife",
  PI: "Teresina",
  RJ: "Rio de Janeiro",
  RN: "Natal",
  RS: "Porto Alegre",
  RO: "Porto Velho",
  RR: "Boa Vista",
  SC: "Florianópolis",
  SP: "São Paulo",
  SE: "Aracaju",
  TO: "Palmas",
};

// --- ROTAS PARA RASTREAMENTO DE CLIQUES ---
app.post("/api/track-click", (req, res) => {
  const { platform, cidade, estado } = req.body;
  if (!platform || !cidade || !estado) {
    return res.status(400).json({ error: "Dados incompletos." });
  }
  clickDatabase.push({ platform, cidade, estado, timestamp: new Date() });
  res.status(201).json({ message: "Clique registrado." });
});

app.get("/api/click-analysis/:keyword(*)", (req, res) => {
  const { keyword } = req.params;
  const clicksForPlatform = clickDatabase.filter(
    (click) => click.platform === keyword
  );
  const analysis = clicksForPlatform.reduce((acc, click) => {
    const location = `${click.cidade}, ${click.estado}`;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});
  const sortedAnalysis = Object.entries(analysis)
    .map(([location, clicks]) => ({ location, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
  res.json(sortedAnalysis);
});

// --- ROTAS EXISTENTES ---
app.get("/api/estados", async (req, res) => {
  try {
    const r = await axios.get(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    );
    res.json(r.data.map((e) => ({ id: e.id, sigla: e.sigla, nome: e.nome })));
  } catch {
    res.status(500).json({ error: "Falha ao buscar estados." });
  }
});

app.get("/api/cidades/:uf", async (req, res) => {
  try {
    const r = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${req.params.uf}/municipios`
    );
    res.json(
      r.data.map((c) => ({ id: c.id, nome: c.nome, uf: req.params.uf }))
    );
  } catch {
    res
      .status(500)
      .json({ error: `Falha ao buscar cidades de ${req.params.uf}.` });
  }
});

app.get("/api/ip/:uf/:cidade", (req, res) => {
  const { uf, cidade } = req.params;
  let s = vpnServerDatabase.find(
    (srv) => srv.cidade.toLowerCase() === cidade.toLowerCase()
  );
  let m = `IP de servidor em ${cidade}, ${uf}`;
  if (!s) {
    const cap = capitais[uf];
    s = vpnServerDatabase.find(
      (srv) => srv.cidade.toLowerCase() === cap?.toLowerCase()
    );
    if (s)
      m = `Nenhum servidor em ${cidade}. Usando servidor da capital, ${cap}, ${uf}`;
  }
  if (!s) {
    s = vpnServerDatabase.find((srv) => srv.cidade === "São Paulo");
    m = `Nenhum servidor local. Usando servidor padrão de São Paulo, SP`;
  }
  res.json({
    ip: s.ip,
    local: `${s.cidade}, ${s.estado}`,
    provedor: s.provedor,
    message: m,
  });
});

// ROTA DE TRENDS COM MELHOR TRATAMENTO DE ERRO
app.get("/api/trends/:keyword(*)", async (req, res) => {
  try {
    const results = await googleTrends.interestByRegion({
      keyword: req.params.keyword,
      geo: "BR",
      resolution: "REGION",
    });

    // Tenta fazer o parse do JSON de forma segura
    let parsedResults;
    try {
      parsedResults = JSON.parse(results);
    } catch (parseError) {
      console.error(
        "Erro ao fazer parse da resposta do Google Trends:",
        results
      );
      throw new Error("Resposta inválida da API de tendências.");
    }

    const trends = parsedResults.default.geoMapData.map((item) => ({
      sigla: item.geoCode.replace("BR-", ""),
      interesse: item.value[0],
    }));
    res.json(trends);
  } catch (err) {
    console.error(
      `Erro na API de Trends para keyword "${req.params.keyword}":`,
      err.message
    );
    res
      .status(500)
      .json({
        error:
          "Não foi possível buscar os dados de popularidade. A plataforma pode não ter dados de busca suficientes.",
      });
  }
});

// ROTA DE CIDADE MAIS POPULAR COM MELHOR TRATAMENTO DE ERRO
app.get("/api/most-popular-city/:keyword(*)/:uf", async (req, res) => {
  try {
    const results = await googleTrends.interestByRegion({
      keyword: req.params.keyword,
      geo: `BR-${req.params.uf}`,
      resolution: "CITY",
    });

    let parsedResults;
    try {
      parsedResults = JSON.parse(results);
    } catch (parseError) {
      console.error(
        "Erro ao fazer parse da resposta do Google Trends (cidade):",
        results
      );
      throw new Error("Resposta inválida da API de tendências.");
    }

    const cities = parsedResults.default.geoMapData.map((item) => ({
      nome: item.geoName,
      interesse: item.value[0],
    }));

    if (cities.length === 0) {
      return res
        .status(404)
        .json({
          error: "Nenhuma cidade encontrada para esta plataforma no estado.",
        });
    }

    const mostPopular = cities.sort((a, b) => b.interesse - a.interesse)[0];
    res.json(mostPopular);
  } catch (err) {
    console.error(
      `Erro na API de Cidades para keyword "${req.params.keyword}":`,
      err.message
    );
    res
      .status(500)
      .json({ error: "Não foi possível buscar a cidade mais popular." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// --- FUNÇÃO PARA MANTER O SERVIDOR ATIVO ---
const KEEP_ALIVE_URL = "https://cassino-back.onrender.com";

setInterval(() => {
  axios
    .get(KEEP_ALIVE_URL)
    .catch((error) => console.error("Erro ao enviar ping:", error.message));
}, 40 * 1000);
