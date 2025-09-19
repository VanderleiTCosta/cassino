// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopStatesChart from './components/TopStatesChart';
import EstadoList from './components/EstadoList';
import CidadeList from './components/CidadeList';
import InfoPanel from './components/InfoPanel';
import { AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

// ✅ CORREÇÃO: Definindo a URL base para a API
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
  const [activeView, setActiveView] = useState('estados');

  useEffect(() => {
    // ✅ CORREÇÃO: Usando crases (`) e a variável API_URL
    axios.get(`${API_URL}/api/estados`)
      .then(res => setEstados(res.data))
      .catch(() => toast.error("Falha ao carregar estados."));
  }, []);

  useEffect(() => {
    if (selectedEstado) {
      setIsLoadingCidades(true);
      // ✅ CORREÇÃO: Usando crases (`) e a variável API_URL
      axios.get(`${API_URL}/api/cidades/${selectedEstado.sigla}`)
        .then(res => setCidades(res.data))
        .catch(() => toast.error(`Falha ao carregar cidades de ${selectedEstado.sigla}.`))
        .finally(() => setIsLoadingCidades(false));
    }
  }, [selectedEstado]);

  useEffect(() => {
    if (selectedCidade && selectedEstado) {
      setIsLoadingIp(true);
      // ✅ CORREÇÃO: Usando crases (`) e a variável API_URL
      axios.get(`${API_URL}/api/ip/${selectedEstado.sigla}/${selectedCidade.nome}`)
        .then(res => setSuggestedIpInfo(res.data))
        .catch(() => toast.error("Falha ao buscar IP."))
        .finally(() => setIsLoadingIp(false));
    }
  }, [selectedCidade, selectedEstado]);

  const handlePlatformSearch = () => {
    if (platformKeyword) {
      setIsLoadingTrends(true);
      setTrendsData([]);
      // ✅ CORREÇÃO: Usando crases (`) e a variável API_URL
      axios.get(`${API_URL}/api/trends/${platformKeyword}`)
        .then(res => setTrendsData(res.data))
        .catch(() => toast.error("Falha ao buscar popularidade."))
        .finally(() => setIsLoadingTrends(false));
    } else {
      toast.error("Por favor, digite uma plataforma.");
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

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
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
          <input type="text" value={platformKeyword} onChange={(e) => setPlatformKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePlatformSearch()} placeholder="Digite a plataforma..." className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"/>
          <button onClick={handlePlatformSearch} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Analisar</button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-1 flex justify-around mb-4">
          <button onClick={() => setActiveView('estados')} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'estados' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700'}`}>1. ESTADOS</button>
          <button onClick={() => setActiveView('cidades')} disabled={!selectedEstado} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'cidades' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700 disabled:opacity-50'}`}>2. CIDADES</button>
          <button onClick={() => setActiveView('info')} disabled={!selectedCidade} className={`w-full py-2 rounded-md font-semibold transition-colors text-sm ${activeView === 'info' ? 'bg-cyan-600' : 'text-gray-400 hover:bg-gray-700 disabled:opacity-50'}`}>3. INFORMAÇÕES</button>
        </div>

        <main className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 min-h-[50vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
            >
              {activeView === 'estados' && <EstadoList estados={estados} selectedEstado={selectedEstado} onEstadoClick={handleEstadoClick} />}
              {activeView === 'cidades' && <CidadeList cidades={cidades} selectedEstado={selectedEstado} selectedCidade={selectedCidade} onCidadeClick={handleCidadeClick} isLoading={isLoadingCidades} />}
              {activeView === 'info' && <InfoPanel selectedCidade={selectedCidade} suggestedIpInfo={suggestedIpInfo} isLoadingIp={isLoadingIp} />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {platformKeyword && trendsData.length > 0 && (
          <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.5 } }}>
            <TopStatesChart trendsData={trendsData} isLoading={isLoadingTrends} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
export default App;