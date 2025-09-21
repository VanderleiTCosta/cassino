import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopStatesChart from './components/TopStatesChart';
import EstadoList from './components/EstadoList';
import CidadeList from './components/CidadeList';
import InfoPanel from './components/InfoPanel';
import MostPopular from './components/MostPopular';
import AnalysisPanel from './components/AnalysisPanel';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [selectedCidade, setSelectedCidade] = useState(null);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [isLoadingIp, setIsLoadingIp] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [suggestedIpInfo, setSuggestedIpInfo] = useState(null);
  const [platformUrl, setPlatformUrl] = useState('');
  const [trendsData, setTrendsData] = useState([]);
  const [activeView, setActiveView] = useState('estados');
  const [mostPopular, setMostPopular] = useState({ estado: null, cidade: null });
  const [clickData, setClickData] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/estados`)
      .then(res => setEstados(res.data))
      .catch(() => toast.error("Falha ao carregar estados."));
  }, []);

  useEffect(() => {
    if (selectedEstado) {
      setIsLoadingCidades(true);
      axios.get(`${API_URL}/api/cidades/${selectedEstado.sigla}`)
        .then(res => setCidades(res.data))
        .catch(() => toast.error(`Falha ao carregar cidades de ${selectedEstado.sigla}.`))
        .finally(() => setIsLoadingCidades(false));
    }
  }, [selectedEstado]);

  const fetchIp = useCallback(() => {
    if (selectedCidade && selectedEstado) {
      if (!suggestedIpInfo) setIsLoadingIp(true);
      axios.get(`${API_URL}/api/ip/${selectedEstado.sigla}/${selectedCidade.nome}`)
        .then(res => setSuggestedIpInfo(res.data))
        .catch(() => toast.error("Falha ao buscar IP."))
        .finally(() => setIsLoadingIp(false));
    }
  }, [selectedCidade, selectedEstado, suggestedIpInfo]);
  
  const extractKeywordFromUrl = (url) => {
    try {
      let fullUrl = url;
      if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = 'https://' + fullUrl;
      }
      const hostname = new URL(fullUrl).hostname;
      const parts = hostname.replace('www.', '').split('.');
      return parts.length > 1 ? parts[0] : parts[0];
    } catch (error) {
      return url;
    }
  };

  const handlePlatformSearch = useCallback(() => {
    const keyword = extractKeywordFromUrl(platformUrl);
    if (keyword) {
      setIsLoadingTrends(true);
      
      const trendsRequest = axios.get(`${API_URL}/api/trends/${keyword}`);
      const clicksRequest = axios.get(`${API_URL}/api/click-analysis/${keyword}`);

      Promise.all([trendsRequest, clicksRequest])
        .then(([trendsRes, clicksRes]) => {
          setTrendsData(trendsRes.data);
          setClickData(clicksRes.data);

          if (trendsRes.data.length > 0) {
            const topState = [...trendsRes.data].sort((a, b) => b.interesse - a.interesse)[0];
            return axios.get(`${API_URL}/api/most-popular-city/${keyword}/${topState.sigla}`);
          }
        })
        .then(cityRes => {
          if (cityRes) {
            const topStateSigla = cityRes.config.url.split('/').pop();
            const estado = estados.find(e => e.sigla === topStateSigla);
            setMostPopular({ estado: estado ? estado.nome : topStateSigla, cidade: cityRes.data.nome });
          }
        })
        .catch(() => toast.error("Falha ao buscar dados da plataforma."))
        .finally(() => setIsLoadingTrends(false));

    } else {
      toast.error("Por favor, digite o nome ou URL da plataforma.");
    }
  }, [platformUrl, estados]);

  useEffect(() => {
    fetchIp();
  }, [fetchIp]);
  
  const handleEstadoClick = (estado) => {
    setSelectedEstado(estado);
    setSelectedCidade(null);
    setActiveView('cidades');
  };

  const handleCidadeClick = (cidade) => {
    setSelectedCidade(cidade);
    setActiveView('info');
  };

  const handleConnectClick = () => {
    if (!platformUrl || !selectedCidade) {
      toast.error("Selecione uma cidade primeiro.");
      return;
    }

    const keyword = extractKeywordFromUrl(platformUrl);
    axios.post(`${API_URL}/api/track-click`, {
      platform: keyword,
      cidade: selectedCidade.nome,
      estado: selectedEstado.sigla,
    }).catch(err => console.error("Falha ao registrar clique:", err));

    // Conteúdo HTML e CSS para a nova página de carregamento
    const newTabContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Conectando...</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #111827;
            color: #d1d5db;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: 'Inter', sans-serif;
          }
          .container {
            text-align: center;
          }
          h1 {
            font-size: 2rem;
            color: #ffffff;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.1rem;
          }
          .spinner {
            border: 5px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            border-top: 5px solid #22d3ee;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 30px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Conectando à plataforma...</h1>
          <p>Por favor, aguarde. Você será redirecionado em breve.</p>
          <div class="spinner"></div>
        </div>
      </body>
      </html>
    `;

    const newTab = window.open('', '_blank');
    if (!newTab) {
      toast.error("Bloqueador de pop-ups ativado. Por favor, desabilite para continuar.");
      return;
    }
    
    newTab.document.write(newTabContent);
    newTab.document.close();

    setTimeout(() => {
      let url = platformUrl;
      if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
      }
      newTab.location.href = url;
    }, 7000);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 font-sans flex flex-col items-center">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ className: 'bg-gray-800 text-white', }} />
      <div className="w-full max-w-md mx-auto">
        <header className="text-center my-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">PLATFORM <span className="text-cyan-400">ANALYTICS</span></h1>
            <p className="text-gray-500 text-sm">Análise de Popularidade por Região</p>
        </header>
        
        <div className="mb-4 flex gap-2">
          <input type="text" value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePlatformSearch()} placeholder="Digite a plataforma..." className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"/>
          <button onClick={handlePlatformSearch} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Analisar</button>
        </div>

        {mostPopular.cidade && <MostPopular estado={mostPopular.estado} cidade={mostPopular.cidade} />}

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-1 flex justify-around mb-4">
          <button onClick={() => setActiveView('analise')} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'analise' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700'}`}>ANÁLISE</button>
          <button onClick={() => setActiveView('estados')} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'estados' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700'}`}>ESTADOS</button>
          <button onClick={() => setActiveView('cidades')} disabled={!selectedEstado} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'cidades' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700 disabled:opacity-50'}`}>CIDADES</button>
          <button onClick={() => setActiveView('info')} disabled={!selectedCidade} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'info' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700 disabled:opacity-50'}`}>INFORMAÇÕES</button>
        </div>

        <main className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 min-h-[50vh]">
          {activeView === 'analise' && <AnalysisPanel trendsData={trendsData} clickData={clickData} platform={platformUrl} />}
          {activeView === 'estados' && <EstadoList estados={estados} selectedEstado={selectedEstado} onEstadoClick={handleEstadoClick} />}
          {activeView === 'cidades' && <CidadeList cidades={cidades} selectedEstado={selectedEstado} selectedCidade={selectedCidade} onCidadeClick={handleCidadeClick} isLoading={isLoadingCidades} />}
          {activeView === 'info' && <InfoPanel selectedCidade={selectedCidade} suggestedIpInfo={suggestedIpInfo} isLoadingIp={isLoadingIp} onConnectClick={handleConnectClick} />}
        </main>
        
        {platformUrl && trendsData.length > 0 && activeView !== 'analise' && (
          <div className="mt-4">
            <TopStatesChart trendsData={trendsData} isLoading={isLoadingTrends} />
          </div>
        )}
      </div>
    </div>
  );
}
export default App;