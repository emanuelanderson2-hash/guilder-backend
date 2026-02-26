import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  Radio,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState({ chats: 0, orders: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;
      try {
        const [chatsRes, ordersRes] = await Promise.all([
          axios.get('/api/chats'),
          axios.get('/api/orders')
        ]);
        
        // Count unread or active items
        const activeChats = chatsRes.data.length;
        const activeOrders = ordersRes.data.filter((o: any) => 
          user?.role === 'admin' ? (o.status === 'pending' || o.status === 'preparing') :
          user?.role === 'delivery' ? (o.status === 'preparing' && !o.delivery_id) :
          (o.status !== 'completed' && o.status !== 'cancelled')
        ).length;

        setCounts({ chats: activeChats, orders: activeOrders });
      } catch (err) {
        console.error(err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: MessageSquare, label: 'Chats', path: '/chats' },
      { icon: Package, label: 'Catálogo', path: '/catalog' },
      { icon: ShoppingCart, label: 'Pedidos', path: '/orders' },
      { icon: Radio, label: 'Broadcast', path: '/broadcast' },
      { icon: Users, label: 'Usuários', path: '/users' },
      { icon: ShieldCheck, label: 'Verificações', path: '/verifications' },
      { icon: Settings, label: 'Configurações', path: '/settings' },
    ],
    client: [
      { icon: Package, label: 'Produtos', path: '/' },
      { icon: ShoppingCart, label: 'Meus Pedidos', path: '/orders' },
      { icon: MessageSquare, label: 'Suporte', path: '/chats' },
    ],
    delivery: [
      { icon: ShoppingCart, label: 'Entregas', path: '/' },
      { icon: MessageSquare, label: 'Mensagens', path: '/chats' },
    ]
  };

  const items = menuItems[user?.role || 'client'];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">G</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Guilder</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <span className="text-black font-bold text-xl">G</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Guilder</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-20 lg:mt-0 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative
                ${isActive 
                  ? 'bg-gold/10 text-gold border border-gold/20 shadow-[inset_0_0_10px_rgba(255,215,0,0.05)]' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium flex-1">{item.label}</span>
              
              {item.path === '/chats' && counts.chats > 0 && (
                <span className="bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {counts.chats}
                </span>
              )}
              
              {(item.path === '/' || item.path === '/orders') && counts.orders > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {counts.orders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-zinc-500 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
