import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, CreditCard, Shield, Bell, Globe } from 'lucide-react';

export default function Settings() {
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setPixKey(res.data.pix_key || '');
      setPixName(res.data.pix_name || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/settings', { pix_key: pixKey, pix_name: pixName });
      setMessage('Configurações salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-gold" />
          Configurações
        </h1>
        <p className="text-zinc-400">Gerencie as preferências da plataforma Guilder.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gold/10 text-gold border border-gold/20 rounded-xl font-medium">
            <CreditCard className="w-5 h-5" />
            Pagamentos
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl font-medium transition-all">
            <Shield className="w-5 h-5" />
            Segurança
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl font-medium transition-all">
            <Bell className="w-5 h-5" />
            Notificações
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl font-medium transition-all">
            <Globe className="w-5 h-5" />
            Geral
          </button>
        </div>

        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Configurações de Pagamento</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Nome do Recebedor (Pix)</label>
                <input 
                  type="text"
                  placeholder="Ex: João Silva ou Guilder Store Ltda"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                  value={pixName}
                  onChange={e => setPixName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Chave Pix para Recebimento</label>
                <input 
                  type="text"
                  placeholder="E-mail, CPF, CNPJ ou Chave Aleatória"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all"
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                />
                <p className="text-xs text-zinc-500">Esta chave será exibida para os clientes que escolherem pagar via Pix.</p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('Erro') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold/90 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
