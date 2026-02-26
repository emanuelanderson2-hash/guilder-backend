import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { Truck, Package, MapPin, CheckCircle2, Clock, DollarSign, ExternalLink, MessageSquare, ChevronRight } from 'lucide-react';

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderForComplete, setSelectedOrderForComplete] = useState<any>(null);
  const [paymentReceived, setPaymentReceived] = useState('pix');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    if (!axios.defaults.headers.common['Authorization']) return;
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const activeOrders = orders.filter(o => o.status === 'on_way' || (o.status === 'preparing' && !o.delivery_id));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalEarnings = completedOrders.reduce((acc, o) => acc + (o.delivery_fee || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Olá, Entregador</h1>
          <p className="text-zinc-400">Aqui estão suas entregas disponíveis e ativas.</p>
        </div>
        <div className="w-full md:w-auto bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-left md:text-right">
          <p className="text-[10px] text-emerald-500 uppercase font-bold">Ganhos Totais</p>
          <p className="text-2xl font-bold text-white">R$ {totalEarnings.toFixed(2)}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" />
            Disponíveis / Ativas
          </h2>
          {activeOrders.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-12 rounded-2xl text-center text-zinc-600">
              Nenhuma entrega no momento.
            </div>
          ) : (
            activeOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <Package className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Pedido #{order.id}</h3>
                      <p className="text-zinc-500 text-sm">{order.client_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      {order.status === 'preparing' ? 'Pendente' : 'Em Rota'}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-800/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2 text-zinc-300 text-sm">
                    <MapPin className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Endereço de Entrega</p>
                      <p className="text-white">{order.address || 'Não informado'}</p>
                    </div>
                  </div>
                  {order.address && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver no Google Maps
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold px-1">Produtos</p>
                  <div className="space-y-1">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-zinc-800/30 p-2 rounded-lg border border-zinc-800/50">
                        <span className="text-zinc-300">
                          <span className="font-bold text-gold">{item.quantity}x</span> {item.name} ({item.size})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-xl">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Total a Receber do Cliente</p>
                    <p className="text-xl font-bold text-white">R$ {order.total_price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Sua Taxa (Ganha)</p>
                    <p className="text-emerald-400 font-bold">R$ {(order.delivery_fee || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate('/chats')}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat
                  </button>
                  
                  {order.status === 'preparing' ? (
                    <button 
                      onClick={async () => {
                        await axios.patch(`/api/orders/${order.id}/status`, { status: 'on_way' });
                        fetchOrders();
                      }}
                      className="flex-[2] bg-gold text-black font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                    >
                      Aceitar Entrega
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedOrderForComplete(order)}
                      className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Finalizar Entrega
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Histórico Recente
          </h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {completedOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Pedido #{order.id}</p>
                  <p className="text-zinc-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-emerald-400 font-bold">R$ {(order.delivery_fee || 0).toFixed(2)}</p>
              </div>
            ))}
            {completedOrders.length === 0 && (
              <p className="p-8 text-center text-zinc-600 text-sm">Nenhuma entrega finalizada ainda.</p>
            )}
          </div>
        </div>
      </div>

      {selectedOrderForComplete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Finalizar Entrega</h2>
            <p className="text-zinc-500 mb-6 text-sm">Como você recebeu o pagamento deste pedido?</p>
            
            <div className="space-y-3 mb-8">
              {['pix', 'dinheiro', 'cartao'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentReceived(method)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    paymentReceived === method 
                      ? 'bg-gold/10 border-gold text-gold' 
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <span className="capitalize font-bold">{method}</span>
                  {paymentReceived === method && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedOrderForComplete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  await axios.patch(`/api/orders/${selectedOrderForComplete.id}/status`, { 
                    status: 'completed',
                    payment_received_method: paymentReceived
                  });
                  setSelectedOrderForComplete(null);
                  fetchOrders();
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
