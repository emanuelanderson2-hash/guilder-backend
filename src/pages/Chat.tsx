import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Send, User, Truck, Search, MessageSquare, Image as ImageIcon, X, ChevronLeft } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.order_id);
      const interval = setInterval(() => fetchMessages(selectedChat.order_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await axios.get('/api/chats');
      setChats(res.data);
      
      // Auto-select chat if orderIdParam is present
      if (orderIdParam && !selectedChat) {
        const chat = res.data.find((c: any) => c.order_id === parseInt(orderIdParam));
        if (chat) setSelectedChat(chat);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (orderId: number) => {
    try {
      const res = await axios.get(`/api/messages/${orderId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || isSending) return;

    setIsSending(true);
    try {
      await axios.post('/api/messages', {
        order_id: selectedChat.order_id,
        content: newMessage,
        image_url: imagePreview
      });
      setNewMessage('');
      setImagePreview(null);
      await fetchMessages(selectedChat.order_id);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem. Verifique o tamanho da imagem.');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] m-0 lg:m-4 flex bg-zinc-900/50 border-0 lg:border border-zinc-800 rounded-none lg:rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Sidebar */}
      <div className={`
        ${selectedChat ? 'hidden lg:flex' : 'flex'}
        w-full lg:w-80 border-r border-zinc-800 flex-col
      `}>
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">Pedidos Ativos</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar pedido..." 
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.order_id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-4 flex gap-3 hover:bg-zinc-800/30 transition-all border-b border-zinc-800/50 ${selectedChat?.order_id === chat.order_id ? 'bg-gold/5 border-r-2 border-r-gold' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-gold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-bold truncate">Pedido #{chat.order_id}</h4>
                  <span className="text-[10px] text-zinc-500">{chat.last_time ? new Date(chat.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <p className="text-zinc-400 text-xs truncate mb-1">{chat.client_name}</p>
                <p className="text-zinc-500 text-sm truncate">{chat.last_message || 'Inicie uma conversa'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        ${selectedChat ? 'flex' : 'hidden lg:flex'}
        flex-1 flex-col
      `}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
              <button 
                onClick={() => setSelectedChat(null)}
                className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
              >
                <ChevronLeft />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm md:text-base">Pedido #{selectedChat.order_id}</h3>
                <p className="text-zinc-500 text-[10px] md:text-xs">{selectedChat.client_name} • {selectedChat.status}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-zinc-500 mb-1 px-2">
                    {msg.sender_name} ({msg.sender_role})
                  </span>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.sender_id === user?.id 
                      ? 'bg-gold text-black font-medium rounded-tr-none' 
                      : 'bg-zinc-800 text-white rounded-tl-none'
                  }`}>
                    {msg.image_url && (
                      <img 
                        src={msg.image_url} 
                        alt="Comprovante" 
                        className="w-full rounded-lg mb-2 border border-black/10 cursor-pointer"
                        onClick={() => window.open(msg.image_url, '_blank')}
                      />
                    )}
                    <p>{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${msg.sender_id === user?.id ? 'text-black/60' : 'text-zinc-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {imagePreview && (
              <div className="px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImagePreview(null)}
                    className="absolute top-0 right-0 bg-black/60 text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Imagem selecionada</p>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex gap-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-2 rounded-xl transition-all"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
              />
              <button 
                type="submit"
                disabled={isSending}
                className={`p-2 rounded-xl transition-all shadow-[0_0_10px_rgba(255,215,0,0.2)] ${isSending ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-gold hover:bg-gold/90 text-black'}`}
              >
                <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Selecione um pedido para abrir o chat do grupo</p>
          </div>
        )}
      </div>
    </div>
  );
}
