import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Plus, Search, Package, Trash2, Edit3 } from 'lucide-react';

export default function Catalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    image_url: '',
    price_5g: '',
    price_10g: '',
    price_25g: '',
    price_50g: '',
    price_100g: '',
    category: 'Premium'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!axios.defaults.headers.common['Authorization']) return;
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', newProduct);
      setShowAddModal(false);
      fetchProducts();
      setNewProduct({
        name: '', description: '', image_url: '',
        price_5g: '', price_10g: '', price_25g: '',
        price_50g: '', price_100g: '', category: 'Premium'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Catálogo</h1>
          <p className="text-zinc-400">Gerencie seus produtos e preços.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto bg-gold hover:bg-gold/90 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-gold/30 transition-all"
          >
            <div className="aspect-square bg-zinc-800 relative overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Package className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:text-gold"><Edit3 className="w-4 h-4" /></button>
                <button className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-bold text-lg">{product.name}</h3>
                <span className="text-[10px] font-bold uppercase bg-gold/10 text-gold px-2 py-1 rounded-md">{product.category}</span>
              </div>
              <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {product.price_5g && <div className="bg-zinc-800/50 p-2 rounded-lg text-center"><p className="text-[10px] text-zinc-500">5g</p><p className="text-white font-bold text-sm">R$ {product.price_5g}</p></div>}
                {product.price_10g && <div className="bg-zinc-800/50 p-2 rounded-lg text-center"><p className="text-[10px] text-zinc-500">10g</p><p className="text-white font-bold text-sm">R$ {product.price_10g}</p></div>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Adicionar Novo Produto</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Nome do Produto</label>
                  <input 
                    type="text" required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Categoria</label>
                  <select 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>Premium</option>
                    <option>Standard</option>
                    <option>Promo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">URL da Imagem</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold"
                  value={newProduct.image_url}
                  onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Descrição</label>
                <textarea 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-gold h-24"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {['5g', '10g', '25g', '50g', '100g'].map(size => (
                  <div key={size} className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase">{size}</label>
                    <input 
                      type="number" step="0.01"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2 text-white text-sm focus:outline-none focus:border-gold"
                      value={(newProduct as any)[`price_${size}`]}
                      onChange={e => setNewProduct({...newProduct, [`price_${size}`]: e.target.value})}
                    />
                  </div>
                ))}
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
                  Salvar Produto
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
