import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  MessageSquare,
  User,
  DollarSign,
  MapPin,
  CreditCard,
  ChevronLeft
} from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ delivery_id: '', delivery_fee: '' });

  useEffect(() => {
    fetchOrders();
    if (user?.role === 'admin') fetchDeliveries();
  }, []);

  const fetchOrders = async (updateSelectedId?: number) => {
    if (!axios.defaults.headers.common['Authorization']) return;
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
      if (updateSelectedId) {
        const updated = res.data.find((o: any) => o.id === updateSelectedId);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeliveries = async () => {
    if (!axios.defaults.headers.common['Authorization']) return;
    try {
      const res = await axios.get('/api/users');
      setDeliveries(res.data.filter((u: any) => u.role === 'delivery'));
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (orderId: number, status: string, extra = {}) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status, ...extra });
      await fetchOrders(orderId);
      setShowAssignModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-400" />;
      case 'preparing': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'on_way': return <Truck className="w-5 h-5 text-purple-400" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Em Preparo';
      case 'on_way': return 'A Caminho';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Pedidos</h1>
        <p className="text-zinc-400">Acompanhe e gerencie as solicitações.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 space-y-4 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedOrder(order)}
              className={`bg-zinc-900/50 border p-6 rounded-2xl cursor-pointer transition-all hover:border-gold/30 ${selectedOrder?.id === order.id ? 'border-gold/50 bg-gold/5' : 'border-zinc-800'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Pedido #{order.id}</h3>
                    <p className="text-zinc-500 text-sm">{order.client_name || 'Você'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-lg">R$ {order.total_price.toFixed(2)}</p>
                  <p className="text-zinc-500 text-xs">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium text-zinc-300">{getStatusLabel(order.status)}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  {order.delivery_name && (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>{order.delivery_name}</span>
                    </>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`space-y-6 ${selectedOrder ? 'block' : 'hidden lg:block'}`}>
          {selectedOrder ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sticky top-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white">Detalhes do Pedido</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-zinc-800/50 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Endereço de Entrega</p>
                      <p className="text-white text-sm">{selectedOrder.address || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gold flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Pagamento na Entrega</p>
                      <p className="text-white text-sm capitalize">{selectedOrder.payment_method || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold px-1">Itens do Pedido</p>
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-300">
                        <span className="font-bold text-gold">{item.quantity}x</span> {item.name} ({item.size})
                      </div>
                      <div className="text-white font-medium">R$ {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 mb-8">
                <div className="flex justify-between text-zinc-400 text-sm mb-2">
                  <span>Subtotal</span>
                  <span>R$ {selectedOrder.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-sm mb-4">
                  <span>Taxa de Entrega</span>
                  <span>R$ {(selectedOrder.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gold">R$ {(selectedOrder.total_price + (selectedOrder.delivery_fee || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {user?.role === 'admin' && (
                  <>
                    {selectedOrder.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'preparing')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        Aprovar e Preparar
                      </button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <button 
                        onClick={() => setShowAssignModal(true)}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        Vincular Entregador
                      </button>
                    )}
                  </>
                )}

                {user?.role === 'delivery' && (
                  <>
                    {selectedOrder.status === 'preparing' && !selectedOrder.delivery_id && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'on_way')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        Peguei o Pedido
                      </button>
                    )}
                    {selectedOrder.status === 'on_way' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'completed')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        Finalizar Entrega
                      </button>
                    )}
                  </>
                )}

                <button 
                  onClick={() => navigate('/chats')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  Abrir Chat do Pedido
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-2xl p-12 text-center text-zinc-600">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Selecione um pedido para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Vincular Entregador</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Selecionar Entregador</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                  value={assignData.delivery_id}
                  onChange={e => setAssignData({...assignData, delivery_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {deliveries.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Taxa de Entrega (R$)</label>
                <input 
                  type="number"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                  value={assignData.delivery_fee}
                  onChange={e => setAssignData({...assignData, delivery_fee: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (!assignData.delivery_id || !assignData.delivery_fee) {
                      alert('Por favor, selecione um entregador e informe a taxa.');
                      return;
                    }
                    updateStatus(selectedOrder.id, 'on_way', {
                      delivery_id: parseInt(assignData.delivery_id),
                      delivery_fee: parseFloat(assignData.delivery_fee)
                    });
                  }}
                  className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
