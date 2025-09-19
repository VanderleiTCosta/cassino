import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const EstadoList = ({ estados, selectedEstado, onEstadoClick }) => {
  return (
    <div>
      <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-gray-300">
        <FaMapMarkerAlt /> Estados
      </h2>
      <ul className="space-y-2">
        {estados.map(estado => (
          <li
            key={estado.id}
            onClick={() => onEstadoClick(estado)}
            className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${selectedEstado?.id === estado.id ? 'bg-cyan-600 shadow-lg text-white font-bold' : 'bg-gray-700 hover:bg-cyan-800'}`}
          >
            {estado.nome} ({estado.sigla})
          </li>
        ))}
      </ul>
    </div>
  );
};
export default EstadoList;