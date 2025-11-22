import React, { useState } from 'react';
import { MOCK_PASSWORDS } from '../constants';
import { SignatureRole } from '../types';

interface SignatureModalProps {
  isOpen: boolean;
  role: SignatureRole;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, role, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const correctPassword = role === SignatureRole.COORDINATOR 
      ? MOCK_PASSWORDS.COORDINATOR 
      : MOCK_PASSWORDS.SUPERVISOR;

    if (password === correctPassword) {
      if (name.trim().length < 3) {
        setError("Por favor, digite o nome completo.");
        return;
      }
      onSuccess(name);
      setPassword('');
      setName('');
      onClose();
    } else {
      setError('Senha incorreta. Acesso negado.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          Validar Assinatura: {role === SignatureRole.COORDINATOR ? 'Coordenador' : 'Supervisão'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
           Esta ação requer uma senha de segurança para validar os dados inseridos.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Responsável</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha de Validação</label>
            <input
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Assinar e Validar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};