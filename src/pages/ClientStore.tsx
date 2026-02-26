import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { Package, ShoppingCart, Search, Filter, Plus, Minus, X, CheckCircle2, MessageSquare, Copy } from 'lucide-react';

export default function ClientStore() {
  const navigate = useNavigate();
  const cartRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    complement: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      cartRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cart.length, checkoutStep]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setPixKey(res.data.pix_key || '');
      setPixName(res.data.pix_name || '');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product: any, size: string, price: number) => {
    const existing = cart.find(item => item.id === product.id && item.size === size);
    if (existing) {
      setCart(cart.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, size, price, quantity: 1 }]);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
    } else {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!address.street.trim() || !address.number.trim() || !address.neighborhood.trim()) {
      alert('Por favor, preencha a Rua, Número e Bairro.');
      return;
    }

    const fullAddress = `${address.street}, ${address.number} - ${address.neighborhood}${address.complement ? ` (${address.complement})` : ''}`;

    try {
      const res = await axios.post('/api/orders', { 
        items: cart, 
        total_price: total,
        address: fullAddress,
        payment_method: paymentMethod
      });
      setLastOrderId(res.data.orderId);
      setShowSuccess(true);
      setCart([]);
      setCheckoutStep('cart');
      setAddress({
        street: '',
        number: '',
        neighborhood: '',
        complement: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Guilder Store</h1>
          <p className="text-zinc-400">Qualidade premium entregue na sua porta.</p>
        </div>
        {cart.length > 0 && (
          <div className="bg-gold/10 border border-gold/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gold" />
            <span className="text-white font-bold">{cart.reduce((acc, i) => acc + i.quantity, 0)} itens no carrinho</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-gold/30 transition-all flex flex-col"
          >
            <div className="aspect-square bg-zinc-800 relative overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <Package className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-black/60 backdrop-blur-md text-gold text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-gold/20">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-white font-bold text-xl mb-2">{product.name}</h3>
              <p className="text-zinc-500 text-sm mb-6 line-clamp-2 flex-1">{product.description}</p>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Escolha o tamanho</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { size: '5g', price: product.price_5g },
                    { size: '10g', price: product.price_10g },
                    { size: '25g', price: product.price_25g },
                    { size: '50g', price: product.price_50g }
                  ].filter(s => s.price).map((s) => (
                    <button
                      key={s.size}
                      onClick={() => addToCart(product, s.size, s.price)}
                      className="bg-zinc-800/50 hover:bg-gold hover:text-black border border-zinc-700 hover:border-gold p-3 rounded-2xl transition-all text-left group/btn"
                    >
                      <p className="text-[10px] text-zinc-500 group-hover/btn:text-black/60 font-bold">{s.size}</p>
                      <p className="text-white group-hover/btn:text-black font-bold">R$ {s.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cart Section - Now at the bottom */}
      {cart.length > 0 && (
        <motion.div 
          ref={cartRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl"
        >
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {checkoutStep === 'cart' ? 'Seu Carrinho' : 'Finalizar Pedido'}
            </h2>
            {checkoutStep === 'details' && (
              <button 
                onClick={() => setCheckoutStep('cart')}
                className="text-zinc-500 hover:text-white flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Voltar
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Items List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800/50">
                    <div className="w-16 h-16 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm">{item.name}</h4>
                      <p className="text-zinc-500 text-xs">{item.size} • R$ {item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => removeFromCart(i)} className="p-1 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                        <span className="text-white font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => addToCart(item, item.size, item.price)} className="p-1 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="text-gold font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Checkout Details */}
              <div className="space-y-6">
                {checkoutStep === 'cart' ? (
                  <div className="bg-zinc-800/20 p-6 rounded-2xl border border-zinc-800/50 space-y-4">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white text-2xl font-bold">
                      <span>Total</span>
                      <span className="text-gold">R$ {total.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => setCheckoutStep('details')}
                      className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                    >
                      Continuar para Entrega
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Endereço de Entrega</label>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3 space-y-1">
                          <p className="text-[10px] text-zinc-600 uppercase font-bold ml-1">Rua</p>
                          <input 
                            type="text"
                            placeholder="Ex: Av. Brasil"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold text-sm"
                            value={address.street}
                            onChange={e => setAddress({...address, street: e.target.value})}
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <p className="text-[10px] text-zinc-600 uppercase font-bold ml-1">Nº</p>
                          <input 
                            type="text"
                            placeholder="123"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold text-sm"
                            value={address.number}
                            onChange={e => setAddress({...address, number: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-[10px] text-zinc-600 uppercase font-bold ml-1">Bairro</p>
                          <input 
                            type="text"
                            placeholder="Ex: Centro"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold text-sm"
                            value={address.neighborhood}
                            onChange={e => setAddress({...address, neighborhood: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-[10px] text-zinc-600 uppercase font-bold ml-1">Complemento</p>
                          <input 
                            type="text"
                            placeholder="Apto, Bloco..."
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold text-sm"
                            value={address.complement}
                            onChange={e => setAddress({...address, complement: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Forma de Pagamento</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'pix', label: 'Pix', icon: '💎' },
                          { id: 'money', label: 'Dinheiro', icon: '💵' },
                          { id: 'card', label: 'Cartão', icon: '💳' }
                        ].map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${paymentMethod === method.id ? 'bg-gold/10 border-gold text-white' : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}
                          >
                            <span className="text-lg mb-1">{method.icon}</span>
                            <span className="text-[10px] font-bold uppercase">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <div className="flex-1">
                        <p className="text-zinc-500 text-xs mb-1">Total a pagar</p>
                        <p className="text-white text-xl font-bold">R$ {total.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={handleCheckout}
                        className="flex-2 bg-gold hover:bg-gold/90 text-black font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                      >
                        Finalizar Pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pedido Realizado!</h2>
            <p className="text-zinc-400 mb-8">Seu pedido foi enviado com sucesso. O pagamento será realizado no ato da entrega.</p>
            
            {paymentMethod === 'pix' && pixKey && (
              <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6 mb-8 space-y-3">
                <p className="text-[10px] text-gold uppercase font-bold tracking-wider">Dados para Pagamento Pix</p>
                
                {pixName && (
                  <div className="text-left mb-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Recebedor</p>
                    <p className="text-white font-bold">{pixName}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 bg-black/40 p-3 rounded-xl">
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Chave Pix</p>
                    <p className="text-white font-mono text-sm truncate">{pixKey}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixKey);
                      alert('Chave Pix copiada!');
                    }}
                    className="bg-gold text-black p-2 rounded-lg flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">Confira o nome do recebedor antes de confirmar o pagamento.</p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/chats?orderId=${lastOrderId}`)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Enviar Comprovante no Chat
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full text-zinc-500 hover:text-white font-bold py-2 transition-all"
              >
                Voltar para a Loja
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
