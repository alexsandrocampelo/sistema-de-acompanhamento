import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white p-6 text-center rounded-b-xl shadow-lg mb-6">
      <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide mb-2 text-blue-300">
        Igreja Evangélica Assembleia de Deus em Pernambuco
      </h1>
      <div className="text-sm md:text-base text-gray-300 space-y-1">
        <p>Pastor Presidente: Pr. Ailton José Alves</p>
        <p>Pastor Setorial: Pr. Sergio Correia</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="font-medium text-blue-100">Sistema de Controle e Acompanhamento de Atividades</p>
      </div>
    </header>
  );
};
