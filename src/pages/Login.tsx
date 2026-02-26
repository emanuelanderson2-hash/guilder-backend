import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Lock, Mail, Key } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isAccessCode, setIsAccessCode] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isAccessCode) {
        await login({ accessCode });
      } else {
        await login({ name, password });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao entrar');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <span className="text-black text-3xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Guilder</h1>
          <p className="text-zinc-400">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex bg-zinc-800/50 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setIsAccessCode(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isAccessCode ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Usuário
            </button>
            <button
              type="button"
              onClick={() => setIsAccessCode(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isAccessCode ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Código
            </button>
          </div>

          {!isAccessCode ? (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
                  required
                />
              </div>
            </>
          ) : (
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Código de 8 dígitos"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)] active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </motion.div>
    </div>
  );
}
