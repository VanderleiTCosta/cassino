// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopStatesChart from './components/TopStatesChart';
import EstadoList from './components/EstadoList';
import CidadeList from './components/CidadeList';
import InfoPanel from './components/InfoPanel';
import MostPopular from './components/MostPopular';
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

  const fetchTrends = useCallback((isInitialSearch = false) => {
    const keyword = extractKeywordFromUrl(platformUrl);
    if (keyword) {
      if (isInitialSearch) setIsLoadingTrends(true);
      axios.get(`${API_URL}/api/trends/${keyword}`)
        .then(res => {
          setTrendsData(res.data);
          if (!isInitialSearch) toast.success('Dados de popularidade atualizados!');
          
          if (isInitialSearch) {
            const topState = res.data.sort((a, b) => b.interesse - a.interesse)[0];
            axios.get(`${API_URL}/api/most-popular-city/${keyword}/${topState.sigla}`)
              .then(cityRes => {
                const estado = estados.find(e => e.sigla === topState.sigla);
                setMostPopular({ estado: estado ? estado.nome : topState.sigla, cidade: cityRes.data.nome });
              })
              .catch(() => toast.error("Falha ao buscar a cidade mais popular."));
          }
        })
        .catch(() => toast.error("Falha ao buscar popularidade."))
        .finally(() => setIsLoadingTrends(false));
    }
  }, [platformUrl, estados]);

  useEffect(() => {
    fetchIp();
  }, [fetchIp]);

  const extractKeywordFromUrl = (url) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      return parts.length > 2 ? parts[1] : parts[0];
    } catch (error) {
      return url;
    }
  };

  const handlePlatformSearch = () => {
    if (platformUrl) {
      fetchTrends(true);
    } else {
      toast.error("Por favor, digite a URL da plataforma.");
    }
  }
  
  const handleEstadoClick = (estado) => {
    setSelectedEstado(estado);
    setSelectedCidade(null);
    setActiveView('cidades');
  };

  const handleCidadeClick = (cidade) => {
    setSelectedCidade(cidade);
    setActiveView('info');
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
          <input type="text" value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePlatformSearch()} placeholder="Digite a URL da plataforma..." className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"/>
          <button onClick={handlePlatformSearch} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Analisar</button>
        </div>

        <MostPopular estado={mostPopular.estado} cidade={mostPopular.cidade} />

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-1 flex justify-around mb-4">
          <button onClick={() => setActiveView('estados')} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'estados' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700'}`}>1. ESTADOS</button>
          <button onClick={() => setActiveView('cidades')} disabled={!selectedEstado} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'cidades' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700 disabled:opacity-50'}`}>2. CIDADES</button>
          <button onClick={() => setActiveView('info')} disabled={!selectedCidade} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'info' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700 disabled:opacity-50'}`}>3. INFORMAÇÕES</button>
        </div>

        <main className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 min-h-[50vh]">
          {activeView === 'estados' && <EstadoList estados={estados} selectedEstado={selectedEstado} onEstadoClick={handleEstadoClick} />}
          {activeView === 'cidades' && <CidadeList cidades={cidades} selectedEstado={selectedEstado} selectedCidade={selectedCidade} onCidadeClick={handleCidadeClick} isLoading={isLoadingCidades} />}
          {activeView === 'info' && <InfoPanel selectedCidade={selectedCidade} suggestedIpInfo={suggestedIpInfo} isLoadingIp={isLoadingIp} platformUrl={platformUrl} />}
        </main>
        
        {platformUrl && trendsData.length > 0 && (
          <div className="mt-4">
            <TopStatesChart trendsData={trendsData} isLoading={isLoadingTrends} />
          </div>
        )}
      </div>
    </div>
  );
}
export default App;