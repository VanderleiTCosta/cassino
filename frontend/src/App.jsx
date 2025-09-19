// src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopStates from './components/TopStatesChart';
import EstadoList from './components/EstadoList';
import CidadeList from './components/CidadeList';
import InfoPanel from './components/InfoPanel';
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
  const [platformKeyword, setPlatformKeyword] = useState('');
  const [trendsData, setTrendsData] = useState([]);

  // Busca estados
  useEffect(() => {
    axios.get(`${API_URL}/api/estados`).then(res => setEstados(res.data));
  }, []);

  // Busca cidades ao selecionar estado
  useEffect(() => {
    if (selectedEstado) {
      setIsLoadingCidades(true);
      setSelectedCidade(null);
      setSuggestedIpInfo(null);
      axios.get(`${API_URL}/api/cidades/${selectedEstado.sigla}`)
        .then(res => setCidades(res.data))
        .finally(() => setIsLoadingCidades(false));
    }
  }, [selectedEstado]);

  // Busca IP ao selecionar cidade
  useEffect(() => {
    if (selectedCidade && selectedEstado) {
      setIsLoadingIp(true);
      axios.get(`${API_URL}/api/ip/${selectedEstado.sigla}/${selectedCidade.nome}`)
        .then(res => setSuggestedIpInfo(res.data))
        .finally(() => setIsLoadingIp(false));
    }
  }, [selectedCidade, selectedEstado]);

  // Busca a popularidade
  const handlePlatformSearch = () => {
    if (platformKeyword) {
      setIsLoadingTrends(true);
      setTrendsData([]);
      axios.get(`${API_URL}/api/trends/${platformKeyword}`)
        .then(res => setTrendsData(res.data))
        .finally(() => setIsLoadingTrends(false));
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-cyan-400">Análise de Plataformas por Localidade</h1>
        
        <div className="max-w-xl mx-auto mb-8 flex gap-2">
          <input
              type="text"
              value={platformKeyword}
              onChange={(e) => setPlatformKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlatformSearch()}
              placeholder="Digite a plataforma e pressione Enter..."
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
          <button onClick={handlePlatformSearch} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Analisar
          </button>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <EstadoList 
            estados={estados}
            selectedEstado={selectedEstado}
            onEstadoClick={setSelectedEstado}
          />
          <CidadeList 
            cidades={cidades}
            selectedEstado={selectedEstado}
            selectedCidade={selectedCidade}
            onCidadeClick={setSelectedCidade}
            isLoading={isLoadingCidades}
          />
          <InfoPanel 
            selectedCidade={selectedCidade}
            suggestedIpInfo={suggestedIpInfo}
            isLoadingIp={isLoadingIp}
          />
        </div>
        
        {platformKeyword && (
          <div className="mt-8">
            <TopStates trendsData={trendsData} isLoading={isLoadingTrends} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;