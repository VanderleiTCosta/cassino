import React from 'react';
import { FaTrophy } from 'react-icons/fa';

const MostPopular = ({ estado, cidade }) => {
  if (!estado || !cidade) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-4">
      <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-gray-300">
        <FaTrophy /> Mais Popular
      </h2>
      <p className="text-lg text-white">
        A plataforma é mais popular em <span className="font-bold text-cyan-400">{cidade}, {estado}</span>.
      </p>
    </div>
  );
};

export default MostPopular;