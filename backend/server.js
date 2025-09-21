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
const estadosSiglas = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
const cidadesExemplo = {
  AC: ["Rio Branco", "Cruzeiro do Sul"],
  AM: ["Manaus", "Parintins"],
  RR: ["Boa Vista", "Rorainópolis"],
  PA: ["Belém", "Santarém"],
  AP: ["Macapá", "Santana"],
  TO: ["Palmas", "Araguaína"],
  MA: ["São Luís", "Imperatriz"],
  PI: ["Teresina", "Parnaíba"],
  CE: ["Fortaleza", "Juazeiro do Norte"],
  RN: ["Natal", "Mossoró"],
  PB: ["João Pessoa", "Campina Grande"],
  PE: ["Recife", "Caruaru"],
  AL: ["Maceió", "Arapiraca"],
  SE: ["Aracaju", "Nossa Senhora do Socorro"],
  BA: ["Salvador", "Feira de Santana"],
  MG: ["Belo Horizonte", "Uberlândia"],
  ES: ["Vitória", "Vila Velha"],
  RJ: ["Rio de Janeiro", "Niterói"],
  SP: ["São Paulo", "Guarulhos"],
  PR: ["Curitiba", "Londrina"],
  SC: ["Florianópolis", "Joinville"],
  RS: ["Porto Alegre", "Caxias do Sul"],
  MS: ["Campo Grande", "Dourados"],
  MT: ["Cuiabá", "Várzea Grande"],
  GO: ["Goiânia", "Aparecida de Goiânia"],
  DF: ["Brasília"],
};

// --- FUNÇÕES PARA GERAR DADOS FAKE ---
const generateFakeTrends = () => {
  /* ... (função mantida) ... */
};
const generateFakeMostPopularCity = (uf) => {
  /* ... (função mantida) ... */
};

const generateFakeClicks = (keyword) => {
  console.log(`Gerando FAKE clicks em massa para a plataforma: ${keyword}`);
  // Gera um número aleatório de cliques entre 200.001 e 250.000
  const numberOfClicks = Math.floor(Math.random() * 50000) + 200001;

  for (let i = 0; i < numberOfClicks; i++) {
    const randomEstadoSigla =
      estadosSiglas[Math.floor(Math.random() * estadosSiglas.length)];
    const cidadesDoEstado = cidadesExemplo[randomEstadoSigla] || ["Capital"];
    const randomCidade =
      cidadesDoEstado[Math.floor(Math.random() * cidadesDoEstado.length)];

    clickDatabase.push({
      platform: keyword,
      cidade: randomCidade,
      estado: randomEstadoSigla,
      timestamp: new Date(),
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
    breakdown: sortedBreakdown,
  });
});

// ... (Restante de todas as suas outras rotas: /api/estados, /api/trends, etc.)
// O código foi omitido por brevidade, mas você deve mantê-lo como está.

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// --- FUNÇÃO PARA MANTER O SERVIDOR ATIVO ---
const KEEP_ALIVE_URL = "https://cassino-back.onrender.com";

setInterval(() => {
  axios
    .get(KEEP_ALIVE_URL)
    .catch((error) => console.error("Erro ao enviar ping:", error.message));
}, 14 * 60 * 1000);
