// backend/server.js

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());

// --- ✅ NOVA FUNÇÃO PARA GERAR DADOS DE POPULARIDADE ALEATÓRIOS ---
function generateRandomTrends() {
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

  // Cria uma lista de dados com valores aleatórios entre 20 e 99
  const trends = estadosSiglas.map((sigla) => ({
    sigla: sigla,
    interesse: Math.floor(Math.random() * 80) + 20, // Gera número entre 20 e 99
  }));

  // Escolhe um estado aleatório para ter o interesse máximo de 100
  const topStateIndex = Math.floor(Math.random() * trends.length);
  trends[topStateIndex].interesse = 100;

  return trends;
}

// --- BANCO DE DADOS COMPLETO DE SERVIDORES VPN (REAIS E SIMULADOS) ---
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
  {
    cidade: "Fortaleza",
    estado: "CE",
    ip: "162.159.135.234",
    provedor: "SuperVPN",
  },
  {
    cidade: "Rio Branco",
    estado: "AC",
    ip: "177.128.10.54",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Maceió",
    estado: "AL",
    ip: "189.45.20.112",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Macapá",
    estado: "AP",
    ip: "200.215.30.98",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Manaus",
    estado: "AM",
    ip: "201.55.40.15",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Salvador",
    estado: "BA",
    ip: "177.85.50.201",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Brasília",
    estado: "DF",
    ip: "186.202.60.44",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Vitória",
    estado: "ES",
    ip: "189.125.70.89",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Goiânia",
    estado: "GO",
    ip: "200.188.80.176",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "São Luís",
    estado: "MA",
    ip: "177.135.90.231",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Cuiabá",
    estado: "MT",
    ip: "186.225.100.12",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Campo Grande",
    estado: "MS",
    ip: "201.85.110.67",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Belo Horizonte",
    estado: "MG",
    ip: "177.95.120.143",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Belém",
    estado: "PA",
    ip: "189.88.130.22",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "João Pessoa",
    estado: "PB",
    ip: "200.222.140.88",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Curitiba",
    estado: "PR",
    ip: "177.105.150.199",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Recife",
    estado: "PE",
    ip: "186.212.160.33",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Teresina",
    estado: "PI",
    ip: "201.65.170.101",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Natal",
    estado: "RN",
    ip: "177.155.180.55",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Porto Alegre",
    estado: "RS",
    ip: "189.65.190.132",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Porto Velho",
    estado: "RO",
    ip: "200.198.200.77",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Boa Vista",
    estado: "RR",
    ip: "177.185.210.118",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Florianópolis",
    estado: "SC",
    ip: "186.235.220.201",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Aracaju",
    estado: "SE",
    ip: "201.95.230.15",
    provedor: "Provedor Local (Simulado)",
  },
  {
    cidade: "Palmas",
    estado: "TO",
    ip: "177.195.240.92",
    provedor: "Provedor Local (Simulado)",
  },
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

// --- ROTAS DO IBGE E DE IP ---
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
  const resp = {
    ip: s.ip,
    local: `${s.cidade}, ${s.estado}`,
    provedor: s.provedor,
    message: m,
  };
  res.json(resp);
});

// --- ROTA DE TRENDS AGORA GERA DADOS ALEATÓRIOS ---
app.get("/api/trends/:keyword", (req, res) => {
  const randomTrends = generateRandomTrends();
  console.log(
    `Buscando popularidade para "${req.params.keyword}". Retornando dados aleatórios.`
  );
  res.json(randomTrends);
});

app.listen(PORT, () => {
  console.log(
    `🚀 Backend final rodando na porta ${PORT} com dados dinâmicos simulados.`
  );
});
