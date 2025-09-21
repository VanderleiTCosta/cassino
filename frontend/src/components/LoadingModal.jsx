import React from 'react';

const LoadingModal = ({ isOpen, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-center shadow-xl">
        <p className="text-white text-xl mb-6">{message}</p>
        {message === 'Conectando ao IP...' && (
          <div className="spinner"></div>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;