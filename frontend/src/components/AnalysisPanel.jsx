import React from 'react';
import { FaChartLine, FaMousePointer, FaTrophy, FaEye } from 'react-icons/fa';

const AnalysisPanel = ({ trendsData, clickData, platform }) => {

  if (!platform) {
    return (
      <div className="text-center text-gray-500">
        <FaChartLine size={48} className="mx-auto mb-4" />
        <p>Digite o nome de uma plataforma e clique em "Analisar" para ver os resultados.</p>
      </div>
    );
  }

  // Desestrutura os dados de cliques, com valores padrão para segurança
  const { total: totalClicks = 0, breakdown: allClicks = [] } = clickData || {};

  // --- NOVA LÓGICA CONECTADA ---

  // 1. Encontra os 5 estados com maior interesse de busca
  const top5StatesByInterest = [...trendsData]
    .sort((a, b) => b.interesse - a.interesse)
    .slice(0, 5);
  const top5StateSiglas = top5StatesByInterest.map(s => s.sigla);

  // 2. Filtra os cliques para mostrar apenas cidades que estão nesses 5 estados
  const clicksInTopStates = allClicks
    .filter(item => {
      const stateSigla = item.location.split(', ')[1]; // Extrai a sigla do estado (ex: "São Paulo, SP" -> "SP")
      return top5StateSiglas.includes(stateSigla);
    });

  // 3. Define os "campeões" com base nos dados filtrados e de interesse
  const topInterestState = top5StatesByInterest.length > 0 ? top5StatesByInterest[0] : null;
  const topClickCity = clicksInTopStates.length > 0 ? clicksInTopStates[0] : null;

  const renderRecommendation = () => {
    if (!topInterestState && !topClickCity) {
      return "Não há dados suficientes para uma recomendação.";
    }

    // A recomendação agora compara a melhor cidade DENTRE OS TOP ESTADOS
    if (topClickCity) {
      return (
        <>
          Dentro dos estados mais populares, a plataforma tem o melhor desempenho de cliques em <span className="font-bold text-cyan-400">{topClickCity.location}</span>. 
          Esta é a melhor região para fazer suas apostas.
        </>
      );
    }
    
    if (topInterestState) {
      return (
        <>
          O maior interesse de busca está no estado de <span className="font-bold text-cyan-400">{topInterestState.sigla}</span>. 
          Considere realizar apostas nesta região.
        </>
      );
    }

    return "Não foi possível gerar uma recomendação.";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-2 text-gray-300">
          <FaEye /> Acessos Totais
        </h2>
        <div className="bg-gray-700 p-4 rounded-md text-center">
          <p className="text-4xl font-bold text-white">{totalClicks.toLocaleString('pt-BR')}</p>
          <p className="text-gray-400">clique(s) registrados para esta plataforma</p>
        </div>
      </div>

      <div>
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-2 text-gray-300">
          <FaTrophy /> Recomendação Final
        </h2>
        <p className="bg-gray-700 p-4 rounded-md text-white">{renderRecommendation()}</p>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-400"><FaMousePointer /> Top Cidades por Cliques (Nos Estados Populares)</h3>
        <ul className="mt-2 space-y-2">
          {clicksInTopStates.length > 0 ? (
            clicksInTopStates.slice(0, 5).map(item => (
              <li key={item.location} className="bg-gray-700 p-3 rounded-md flex justify-between">
                <span>{item.location}</span>
                <span className="font-bold">{item.clicks.toLocaleString('pt-BR')} clique(s)</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Não há dados de cliques nos estados mais populares.</p>
          )}
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-400"><FaChartLine /> Top 5 Estados por Interesse</h3>
        <ul className="mt-2 space-y-2">
          {top5StatesByInterest.length > 0 ? (
             top5StatesByInterest.map(item => (
              <li key={item.sigla} className="bg-gray-700 p-3 rounded-md flex justify-between">
                <span>{item.sigla}</span>
                <span className="font-bold">Índice {item.interesse}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Não há dados de interesse de busca.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisPanel;