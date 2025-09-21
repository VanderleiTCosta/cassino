import React from 'react';
import { FaChartLine, FaMousePointer, FaTrophy } from 'react-icons/fa';

const AnalysisPanel = ({ trendsData, clickData, platform }) => {

  if (!platform) {
    return (
      <div className="text-center text-gray-500">
        <FaChartLine size={48} className="mx-auto mb-4" />
        <p>Digite o nome de uma plataforma e clique em "Analisar" para ver os resultados.</p>
      </div>
    );
  }

  // Encontra o estado com maior interesse de busca
  const topInterestState = [...trendsData].sort((a, b) => b.interesse - a.interesse)[0];
  
  // Encontra a cidade com mais cliques
  const topClickCity = clickData.length > 0 ? clickData[0] : null;

  const renderRecommendation = () => {
    if (!topInterestState && !topClickCity) {
      return "Não há dados suficientes para uma recomendação.";
    }

    if (topClickCity && (!topInterestState || topClickCity.clicks > (topInterestState.interesse / 10))) {
      return (
        <>
          A plataforma tem o melhor desempenho de cliques em <span className="font-bold text-cyan-400">{topClickCity.location}</span>. 
          Esta é a melhor região para focar suas campanhas.
        </>
      );
    }
    
    if (topInterestState) {
      return (
        <>
          O maior interesse de busca está no estado de <span className="font-bold text-cyan-400">{topInterestState.sigla}</span>. 
          Considere criar campanhas de reconhecimento de marca nesta região.
        </>
      );
    }

    return "Não foi possível gerar uma recomendação.";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-2 text-gray-300">
          <FaTrophy /> Recomendação Final
        </h2>
        <p className="bg-gray-700 p-4 rounded-md text-white">{renderRecommendation()}</p>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-400"><FaMousePointer /> Top Cidades por Cliques</h3>
        <ul className="mt-2 space-y-2">
          {clickData.length > 0 ? (
            clickData.slice(0, 5).map(item => (
              <li key={item.location} className="bg-gray-700 p-3 rounded-md flex justify-between">
                <span>{item.location}</span>
                <span className="font-bold">{item.clicks} clique(s)</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Ainda não há dados de cliques para esta plataforma.</p>
          )}
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-400"><FaChartLine /> Top Estados por Interesse</h3>
        <ul className="mt-2 space-y-2">
          {trendsData.length > 0 ? (
             [...trendsData].sort((a, b) => b.interesse - a.interesse).slice(0, 5).map(item => (
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