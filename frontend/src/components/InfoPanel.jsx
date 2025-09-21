import React from "react";
import { FaInfoCircle, FaExclamationTriangle, FaWifi } from "react-icons/fa";

const InfoPanel = ({
  selectedCidade,
  suggestedIpInfo,
  isLoadingIp,
  onConnectClick,
}) => {
  if (!selectedCidade) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 text-center">
        <FaInfoCircle size={48} className="mb-4" />
        <p>Selecione um estado e uma cidade para ver as informações.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4 text-gray-300">
        <FaInfoCircle />
        Info para {selectedCidade.nome}
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-400">
            <FaWifi /> IP de VPN Sugerido
          </h3>
          <div className="bg-gray-700 p-4 rounded-md mt-2">
            {isLoadingIp ? (
              <div className="animate-pulse h-12 bg-gray-600 rounded-md"></div>
            ) : (
              suggestedIpInfo && (
                <div>
                  <p className="font-mono text-xl text-white">
                    {suggestedIpInfo.ip}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {suggestedIpInfo.message}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
        <button
          onClick={onConnectClick}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-4"
        >
          Conectar com este IP
        </button>
        <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md mt-auto">
          <h3 className="font-bold flex items-center gap-2">
            <FaExclamationTriangle /> Aviso Importante
          </h3>
          <p className="text-sm mt-1">
            O uso de VPN pode violar os Termos de Serviço e resultar no bloqueio
            de sua conta e perda de fundos.
          </p>
        </div>
      </div>
    </div>
  );
};
export default InfoPanel;
