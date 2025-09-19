import React from 'react';
import { FaCity } from 'react-icons/fa';

const CidadeList = ({ cidades, selectedEstado, selectedCidade, onCidadeClick, isLoading }) => {
  return (
    <div>
      <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-gray-300">
        <FaCity />
        {selectedEstado ? `Cidades de ${selectedEstado.nome}` : 'Cidades'}
      </h2>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gray-700 rounded-md"></div>
            <div className="h-10 bg-gray-700 rounded-md"></div>
            <div className="h-10 bg-gray-700 rounded-md"></div>
        </div>
      ) : (
        <ul className="space-y-2">
          {cidades.map(cidade => (
            <li
              key={cidade.id}
              onClick={() => onCidadeClick(cidade)}
              className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${selectedCidade?.id === cidade.id ? 'bg-cyan-600 shadow-lg text-white font-bold' : 'bg-gray-700 hover:bg-cyan-800'}`}
            >
              {cidade.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default CidadeList;