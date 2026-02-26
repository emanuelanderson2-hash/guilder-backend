import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Weight, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Users, 
  TrendingUp 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!axios.defaults.headers.common['Authorization']) return;
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get('/api/stats'),
          axios.get('/api/orders')
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="p-8 text-gold">Carregando...</div>;

  const cards = [
    { label: 'Total Vendido', value: `R$ ${stats.totalSold.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Volume Vendido', value: `${stats.totalVolume}g`, icon: Weight, color: 'text-gold' },
    { label: 'Em Entrega', value: stats.inDelivery, icon: Truck, color: 'text-blue-400' },
    { label: 'Finalizados', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Em Aberto', value: stats.open, icon: Clock, color: 'text-orange-400' },
    { label: 'Chats Aguardando', value: 0, icon: MessageSquare, color: 'text-purple-400' },
    { label: 'Clientes Ativos', value: stats.activeClients, icon: Users, color: 'text-zinc-400' },
    { label: 'Ticket Médio', value: `R$ ${stats.ticketMedio.toFixed(2)}`, icon: TrendingUp, color: 'text-gold' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Bem-vindo de volta, Admin.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-gold/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className={`p-2 md:p-3 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors ${card.color}`}>
                <card.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <p className="text-zinc-500 text-[10px] md:text-sm font-medium">{card.label}</p>
            <h3 className="text-lg md:text-2xl font-bold text-white mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Pedidos Recentes</h2>
          <button className="text-gold text-sm font-medium hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/30 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-400 text-sm">#{order.id}</td>
                  <td className="px-6 py-4 text-white text-sm font-medium">{order.client_name}</td>
                  <td className="px-6 py-4 text-gold text-sm font-bold">R$ {order.total_price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`
                      px-3 py-1 rounded-full text-[10px] font-bold uppercase
                      ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        order.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 
                        'bg-blue-500/10 text-blue-500'}
                    `}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
