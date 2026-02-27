import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Search, Key, Trash2, Ban } from 'lucide-react';
import api from '../api';

type User = {
  id: number;
  name: string;
  email?: string;
  role: 'admin' | 'client' | 'delivery';
  access_code?: string;
  status: 'active' | 'blocked';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'client' as 'client' | 'delivery',
    access_code: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setNewUser(prev => ({ ...prev, access_code: code }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users', newUser);
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
      await api.patch(`/api/users/${id}/status`, { status: newStatus });
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
          className="w-full md:w-auto bg-gold hover:bg-gold/90 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
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
              placeholder="Buscar por nome..." 
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/30 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-white">{u.name}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4 text-zinc-400">{u.access_code || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={u.status === 'active' ? 'text-emerald-500' : 'text-red-500'}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => toggleStatus(u.id, u.status)}
                      className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Novo Usuário</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input 
                type="text"
                required
                placeholder="Nome"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white"
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
              />

              <input 
                type="email"
                placeholder="Email"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />

              <select 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value as any})}
              >
                <option value="client">Cliente</option>
                <option value="delivery">Entregador</option>
              </select>

              <div className="flex gap-2">
                <input 
                  type="text"
                  required
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white font-mono"
                  value={newUser.access_code}
                  onChange={e => setNewUser({...newUser, access_code: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={generateCode}
                  className="bg-zinc-700 text-white p-3 rounded-xl"
                >
                  <Key className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-zinc-800 text-white py-3 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gold text-black py-3 rounded-xl font-bold"
                >
                  Criar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}