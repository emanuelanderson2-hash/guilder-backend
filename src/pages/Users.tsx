import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { UserPlus, Search, User, Key, Shield, Trash2, Ban } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'client', access_code: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setNewUser({ ...newUser, access_code: code });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', newUser);
      setShowAddModal(false);
      fetchUsers();
      setNewUser({ name: '', email: '', role: 'client', access_code: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar usuário');
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await axios.patch(`/api/users/${id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400">Gerencie clientes e entregadores.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto bg-gold hover:bg-gold/90 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
        >
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </header>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou código..." 
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/30 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Cargo</th>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-zinc-500 text-xs">{u.email || 'Sem email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : u.role === 'delivery' ? 'bg-blue-500/10 text-blue-400' : 'bg-gold/10 text-gold'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{u.access_code || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={`p-2 rounded-lg transition-all ${u.status === 'active' ? 'bg-zinc-800 text-zinc-400 hover:text-red-400' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                        title={u.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Novo Usuário</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Email (Opcional)</label>
                <input 
                  type="email"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Cargo</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="client">Cliente</option>
                  <option value="delivery">Entregador</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Código de Acesso</label>
                <div className="flex gap-2">
                  <input 
                    type="text" required
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-gold"
                    value={newUser.access_code}
                    onChange={e => setNewUser({...newUser, access_code: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={generateCode}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white p-3 rounded-xl transition-all"
                  >
                    <Key className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
