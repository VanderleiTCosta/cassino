// backend/server.js

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const googleTrends = require("google-trends-api");

const app = express();

app.use(cors());
app.use(express.json());

const clickDatabase = [];

// --- DADOS PARA GERAÇÃO FAKE ---
const estadosSiglas = [ "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO" ];
const cidadesExemplo = {
  AC: ["Rio Branco", "Cruzeiro do Sul"], AM: ["Manaus", "Parintins"], RR: ["Boa Vista", "Rorainópolis"],
  PA: ["Belém", "Santarém"], AP: ["Macapá", "Santana"], TO: ["Palmas", "Araguaína"],
  MA: ["São Luís", "Imperatriz"], PI: ["Teresina", "Parnaíba"], CE: ["Fortaleza", "Juazeiro do Norte"],
  RN: ["Natal", "Mossoró"], PB: ["João Pessoa", "Campina Grande"], PE: ["Recife", "Caruaru"],
  AL: ["Maceió", "Arapiraca"], SE: ["Aracaju", "Nossa Senhora do Socorro"], BA: ["Salvador", "Feira de Santana"],
  MG: ["Belo Horizonte", "Uberlândia"], ES: ["Vitória", "Vila Velha"], RJ: ["Rio de Janeiro", "Niterói"],
  SP: ["São Paulo", "Guarulhos"], PR: ["Curitiba", "Londrina"], SC: ["Florianópolis", "Joinville"],
  RS: ["Porto Alegre", "Caxias do Sul"], MS: ["Campo Grande", "Dourados"], MT: ["Cuiabá", "Várzea Grande"],
  GO: ["Goiânia", "Aparecida de Goiânia"], DF: ["Brasília"]
};

// --- FUNÇÕES PARA GERAR DADOS FAKE ---
const generateFakeTrends = () => {
  console.log("Gerando dados de tendências FAKE.");
  const trends = estadosSiglas.map(sigla => ({
    sigla,
    interesse: Math.floor(Math.random() * 80) + 20
  }));
  trends[Math.floor(Math.random() * trends.length)].interesse = 100;
  return trends.sort((a, b) => b.interesse - a.interesse);
};

const generateFakeMostPopularCity = (uf) => {
    console.log(`Gerando cidade popular FAKE para ${uf}.`);
    const cidadesDoEstado = cidadesExemplo[uf] || ["Capital"];
    const cidadeFake = cidadesDoEstado[Math.floor(Math.random() * cidadesDoEstado.length)];
    return { nome: cidadeFake, interesse: 100 };
};

const generateFakeClicks = (keyword) => {
  console.log(`Gerando FAKE clicks em massa para a plataforma: ${keyword}`);
  const numberOfClicks = Math.floor(Math.random() * 50000) + 200001; 
  for (let i = 0; i < numberOfClicks; i++) {
    const randomEstadoSigla = estadosSiglas[Math.floor(Math.random() * estadosSiglas.length)];
    const cidadesDoEstado = cidadesExemplo[randomEstadoSigla] || ["Capital"];
    const randomCidade = cidadesDoEstado[Math.floor(Math.random() * cidadesDoEstado.length)];
    clickDatabase.push({
      platform: keyword,
      cidade: randomCidade,
      estado: randomEstadoSigla,
      timestamp: new Date()
    });
  }
};

// --- ROTAS ---

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
  let clicksForPlatform = clickDatabase.filter(
    (click) => click.platform === keyword
  );

  // Se não houver cliques REAIS para esta plataforma, gera os fakes
  if (clicksForPlatform.length === 0) {
    generateFakeClicks(keyword);
    // E busca novamente para incluir os fakes na análise
    clicksForPlatform = clickDatabase.filter(
      (click) => click.platform === keyword
    );
  }
  
  const totalClicks = clicksForPlatform.length;
  const analysisByCity = clicksForPlatform.reduce((acc, click) => {
    const location = `${click.cidade}, ${click.estado}`;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  const sortedBreakdown = Object.entries(analysisByCity)
    .map(([location, clicks]) => ({ location, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
  
  res.json({
    total: totalClicks,
    breakdown: sortedBreakdown
  });
});

app.get("/api/estados", async (req, res) => {
  try {
    const r = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
    res.json(r.data.map((e) => ({ id: e.id, sigla: e.sigla, nome: e.nome })));
  } catch {
    res.status(500).json({ error: "Falha ao buscar estados." });
  }
});

app.get("/api/cidades/:uf", async (req, res) => {
  try {
    const r = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${req.params.uf}/municipios`);
    res.json(r.data.map((c) => ({ id: c.id, nome: c.nome, uf: req.params.uf })));
  } catch {
    res.status(500).json({ error: `Falha ao buscar cidades de ${req.params.uf}.` });
  }
});

app.get("/api/ip/:uf/:cidade", (req, res) => {
  const { uf, cidade } = req.params;
  // Lógica para encontrar IP (omitida para brevidade, mantenha a sua)
  const ipInfo = { ip: "201.55.40.15", message: "IP de fallback" }; // Exemplo
  res.json(ipInfo);
});

app.get("/api/trends/:keyword(*)", async (req, res) => {
  try {
    const results = await googleTrends.interestByRegion({ keyword: req.params.keyword, geo: "BR", resolution: "REGION" });
    const parsedResults = JSON.parse(results);
    if (!parsedResults?.default?.geoMapData || parsedResults.default.geoMapData.length === 0) {
      return res.json(generateFakeTrends());
    }
    const trends = parsedResults.default.geoMapData.map((item) => ({
      sigla: item.geoCode.replace("BR-", ""),
      interesse: item.value[0],
    }));
    res.json(trends);
  } catch (err) {
    console.error(`Erro na API de Trends, gerando dados FAKE. Erro: ${err.message}`);
    res.json(generateFakeTrends());
  }
});

app.get("/api/most-popular-city/:keyword(*)/:uf", async (req, res) => {
  const { uf } = req.params;
  try {
    const results = await googleTrends.interestByRegion({ keyword: req.params.keyword, geo: `BR-${uf}`, resolution: "CITY" });
    const parsedResults = JSON.parse(results);
    if (!parsedResults?.default?.geoMapData || parsedResults.default.geoMapData.length === 0) {
        return res.json(generateFakeMostPopularCity(uf));
    }
    const cities = parsedResults.default.geoMapData.map((item) => ({
      nome: item.geoName,
      interesse: item.value[0],
    }));
    const mostPopular = cities.sort((a, b) => b.interesse - a.interesse)[0];
    res.json(mostPopular);
  } catch (err) {
    console.error(`Erro na API de Cidades, gerando dados FAKE. Erro: ${err.message}`);
    res.json(generateFakeMostPopularCity(uf));
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// --- FUNÇÃO PARA MANTER O SERVIDOR ATIVO ---
const KEEP_ALIVE_URL = "https://cassino-back.onrender.com";

setInterval(() => {
  axios.get(KEEP_ALIVE_URL + "/api/estados") // Fazendo ping em uma rota que existe
    .catch(error => {}); // Silencia o erro para não poluir o log
}, 14 * 60 * 1000);