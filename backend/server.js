// backend/server.js

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const googleTrends = require("google-trends-api");

const app = express();

app.use(cors());
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// BANCO DE DADOS SIMULADO PARA ARMAZENAR CLIQUES
// Em uma aplicação real, você usaria um banco de dados como MongoDB ou PostgreSQL.
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

// --- NOVAS ROTAS PARA RASTREAMENTO DE CLIQUES ---

// Rota para registrar um novo clique
app.post("/api/track-click", (req, res) => {
  const { platform, cidade, estado } = req.body;
  if (!platform || !cidade || !estado) {
    return res
      .status(400)
      .json({ error: "Dados incompletos para rastrear o clique." });
  }

  clickDatabase.push({
    platform,
    cidade,
    estado,
    timestamp: new Date(),
  });

  console.log("Clique registrado:", { platform, cidade, estado });
  res.status(201).json({ message: "Clique registrado com sucesso!" });
});

// Rota para obter a análise de cliques por plataforma
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

// --- ROTAS EXISTENTES (sem alterações, exceto pela correção de bug anterior) ---

app.get("/api/estados", async (req, res) => {
  try {
    const r = await axios.get(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    );
    res.json(r.data.map((e) => ({ id: e.id, sigla: e.sigla, nome: e.nome })));
  } catch {
    res.status(500).json({ error: "Falha ao buscar dados dos estados." });
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
      .json({
        error: `Falha ao buscar dados das cidades de ${req.params.uf}.`,
      });
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

app.get("/api/trends/:keyword(*)", async (req, res) => {
  try {
    const results = await googleTrends.interestByRegion({
      keyword: req.params.keyword,
      geo: "BR",
      resolution: "REGION",
    });
    const parsedResults = JSON.parse(results);
    const trends = parsedResults.default.geoMapData.map((item) => ({
      sigla: item.geoCode.replace("BR-", ""),
      interesse: item.value[0],
    }));
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: "Falha ao buscar dados de popularidade." });
  }
});

app.get("/api/most-popular-city/:keyword(*)/:uf", async (req, res) => {
  try {
    const results = await googleTrends.interestByRegion({
      keyword: req.params.keyword,
      geo: `BR-${req.params.uf}`,
      resolution: "CITY",
    });
    const parsedResults = JSON.parse(results);
    const cities = parsedResults.default.geoMapData.map((item) => ({
      nome: item.geoName,
      interesse: item.value[0],
    }));
    const mostPopular = cities.sort((a, b) => b.interesse - a.interesse)[0];
    res.json(mostPopular);
  } catch (err) {
    res.status(500).json({ error: "Falha ao buscar a cidade mais popular." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// --- FUNÇÃO PARA MANTER O SERVIDOR ATIVO ---
const KEEP_ALIVE_URL = "https://cassino-back.onrender.com"; // Substitua pela URL do seu backend no Render

setInterval(() => {
  axios.get(KEEP_ALIVE_URL)
    .then(response => console.log("Ping enviado com sucesso!", new Date()))
    .catch(error => console.error("Erro ao enviar ping:", error.message));
}, 40 * 1000); // 40 segundos
