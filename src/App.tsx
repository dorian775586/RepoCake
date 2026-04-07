/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  X, 
  ShoppingBag,
  Star,
  Clock,
  Weight,
  Instagram
} from 'lucide-react';

// --- Types ---
interface Cake {
  id: number;
  name: string;
  price: number;
  category: string;
  popularity: number;
  desc: string;
  image: string;
}

// СПИСОК АДМИНОВ (ID или Username)
const ADMIN_LIST: (string | number)[] = [
  "skolodko38", 
];

const CATEGORIES: Record<string, string> = {
  all: "Все торты",
  sponge: "Бисквитные",
  mousse: "Муссовые",
  kids: "Детские"
};

// --- Initial Data ---
const INITIAL_CAKES: Cake[] = [
  { 
    id: 1, 
    name: "Красный бархат", 
    price: 35, 
    category: "sponge", 
    popularity: 95, 
    desc: "Классический десерт с ярко-красными бисквитами и нежнейшим крем-чизом. Идеальный баланс сладости и легкой кислинки.", 
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 2, 
    name: "Ягодный Мусс", 
    price: 42, 
    category: "mousse", 
    popularity: 88, 
    desc: "Легкий мусс на основе натуральных лесных ягод с тонким слоем миндального бисквита. Освежающий и не приторный.", 
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 3, 
    name: "Детский Космос", 
    price: 55, 
    category: "kids", 
    popularity: 100, 
    desc: "Шоколадный взрыв с космическим декором. Внутри — три вида шоколада и хрустящие шарики. Мечта любого ребенка!", 
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 4, 
    name: "Шоко-Трюфель", 
    price: 48, 
    category: "sponge", 
    popularity: 92, 
    desc: "Насыщенный шоколадный вкус для истинных ценителей. Бельгийский шоколад и ганаш в каждом кусочке.", 
    image: "https://images.unsplash.com/photo-1578985543812-0525828d51cd?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 5, 
    name: "Чизкейк Классик", 
    price: 38, 
    category: "mousse", 
    popularity: 85, 
    desc: "Настоящий Нью-Йорк чизкейк на песочной основе. Плотный, сливочный и невероятно нежный.", 
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 6, 
    name: "Морковный пряный", 
    price: 36, 
    category: "sponge", 
    popularity: 80, 
    desc: "Ароматные коржи с корицей, грецким орехом и карамелью. Покрыт легким сметанным кремом.", 
    image: "https://images.unsplash.com/photo-1536599485751-25e70d28864a?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 7, 
    name: "Фисташка-Малина", 
    price: 52, 
    category: "mousse", 
    popularity: 94, 
    desc: "Фисташковый мусс с малиновым конфитюром. Изысканное сочетание для гурманов.", 
    image: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: 8, 
    name: "Фруктовый Рай", 
    price: 45, 
    category: "kids", 
    popularity: 89, 
    desc: "Легкий ванильный бисквит с обилием свежих сезонных фруктов и ягод. Минимум калорий, максимум вкуса.", 
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80" 
  }
];

export default function App() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentSort, setCurrentSort] = useState('popularity');
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<Partial<Cake> | null>(null);

  const tg = (window as any).Telegram?.WebApp;

  // Load data & Check Auth
  useEffect(() => {
    const saved = localStorage.getItem('cakes_v4');
    if (saved) {
      setCakes(JSON.parse(saved));
    } else {
      setCakes(INITIAL_CAKES);
    }

    if (tg) {
      tg.expand();
      tg.ready();
      
      // Проверка на админа
      const user = tg.initDataUnsafe?.user;
      if (user) {
        const isUserAdmin = ADMIN_LIST.includes(user.id) || ADMIN_LIST.includes(user.username);
        setIsAuthorized(isUserAdmin);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    if (cakes.length > 0) {
      localStorage.setItem('cakes_v4', JSON.stringify(cakes));
    }
  }, [cakes]);

  // Filtering & Sorting
  const filteredCakes = useMemo(() => {
    let result = currentCategory === 'all' ? [...cakes] : cakes.filter(c => c.category === currentCategory);
    result.sort((a, b) => {
      if (currentSort === 'price-asc') return a.price - b.price;
      if (currentSort === 'price-desc') return b.price - a.price;
      return b.popularity - a.popularity;
    });
    return result;
  }, [cakes, currentCategory, currentSort]);

  // Handlers
  const handleToggleAdmin = () => {
    if (isAuthorized) {
      setIsAdmin(!isAdmin);
      tg?.HapticFeedback.impactOccurred('medium');
    } else {
      // Для обычных пользователей - переход в инсту
      window.open('https://instagram.com/your_account', '_blank');
    }
  };

  const handleSaveCake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCake) return;

    if (editingCake.id) {
      setCakes(prev => prev.map(c => c.id === editingCake.id ? (editingCake as Cake) : c));
    } else {
      const newCake = { ...editingCake, id: Date.now(), popularity: 50 } as Cake;
      setCakes(prev => [...prev, newCake]);
    }
    setIsEditModalOpen(false);
    setEditingCake(null);
    tg?.HapticFeedback.notificationOccurred('success');
  };

  const handleDeleteCake = (id: number) => {
    if (window.confirm("Удалить этот торт?")) {
      setCakes(prev => prev.filter(c => c.id !== id));
      setIsEditModalOpen(false);
      tg?.HapticFeedback.notificationOccurred('warning');
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const orderData = {
      cake: selectedCake?.name,
      customer: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      date: formData.get('date'),
      time: formData.get('time'),
      wishes: formData.get('wishes'),
    };

    if (tg) tg.MainButton.showProgress();
    
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });
      if (res.ok) {
        tg?.showAlert("Заказ принят! Наш кондитер уже выбирает лучшие ингредиенты 🎂");
        tg?.close();
      }
    } catch (err) {
      tg?.showAlert("Ошибка отправки. Попробуйте еще раз.");
    } finally {
      tg?.MainButton.hideProgress();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-brand-berry/10 overflow-x-hidden">
      
      {/* Admin Badge */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-2 right-4 z-[100] bg-black text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest"
          >
            Admin
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog Page */}
      <main className="pb-24">
        <header className="pt-10 pb-6 px-5 text-center relative">
          <button 
            onClick={handleToggleAdmin}
            className="absolute top-4 left-5 bg-white/80 backdrop-blur-md p-2.5 rounded-xl text-[#AD1457] shadow-sm border border-pink-50 active:scale-90 transition-transform"
          >
            <Instagram className="w-5 h-5" />
          </button>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-[#AD1457] leading-tight"
          >
            Шедевры<br/><span className="text-slate-800">ручной работы</span>
          </motion.h1>
          <div className="w-10 h-1 bg-[#AD1457] mx-auto mt-4 rounded-full opacity-20" />
        </header>

        {/* Categories */}
        <div className="px-5 py-2 flex overflow-x-auto space-x-2 no-scrollbar">
          {Object.entries(CATEGORIES).map(([id, name]) => (
            <button
              key={id}
              onClick={() => { setCurrentCategory(id); tg?.HapticFeedback.selectionChanged(); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                currentCategory === id 
                ? 'bg-[#AD1457] text-white border-[#AD1457] shadow-md shadow-pink-100' 
                : 'bg-white text-slate-400 border-pink-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Sort & Title */}
        <div className="px-5 flex items-center justify-between mt-6 mb-4">
          <h2 className="text-lg font-bold text-slate-800">{CATEGORIES[currentCategory]}</h2>
          <select 
            value={currentSort}
            onChange={(e) => { setCurrentSort(e.target.value); tg?.HapticFeedback.selectionChanged(); }}
            className="text-[10px] font-bold text-[#AD1457] bg-transparent outline-none uppercase tracking-wider"
          >
            <option value="popularity">Популярные</option>
            <option value="price-asc">Дешевле</option>
            <option value="price-desc">Дороже</option>
          </select>
        </div>

        {/* Grid */}
        <div className="px-4 grid grid-cols-2 gap-3">
          {filteredCakes.map((cake, idx) => (
            <motion.div
              key={cake.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-pink-100/10 border border-pink-50/30 flex flex-col"
            >
              <div 
                className="relative h-44 overflow-hidden cursor-pointer"
                onClick={() => setSelectedCake(cake)}
              >
                <img 
                  src={cake.image} 
                  alt={cake.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest inline-block mb-1">
                    {CATEGORIES[cake.category]}
                  </p>
                  <h3 className="font-serif text-base leading-tight line-clamp-1">{cake.name}</h3>
                </div>
              </div>
              
              <div className="p-3 flex flex-col justify-between flex-grow">
                <div className="mb-2">
                  <p className="text-lg font-bold text-[#AD1457]">
                    {cake.price} <span className="text-[9px] font-normal text-slate-400 uppercase tracking-tighter">BYN/кг</span>
                  </p>
                </div>
                <div className="flex space-x-1.5">
                  {isAdmin && (
                    <button 
                      onClick={() => { setEditingCake(cake); setIsEditModalOpen(true); }}
                      className="p-2.5 bg-slate-50 rounded-xl text-slate-400 active:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedCake(cake)}
                    className="flex-1 py-2.5 bg-[#AD1457] text-white rounded-xl shadow-md shadow-pink-100 active:scale-95 transition-transform text-[10px] font-bold uppercase tracking-wider"
                  >
                    Выбрать
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Admin Add Button */}
      <AnimatePresence>
        {isAdmin && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setEditingCake({ category: 'sponge' }); setIsEditModalOpen(true); }}
            className="fixed bottom-6 right-6 z-50 bg-black text-white p-5 rounded-full shadow-2xl active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCake && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[120] overflow-y-auto"
          >
            <div className="relative h-[45vh]">
              <img src={selectedCake.image} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedCake(null)}
                className="absolute top-6 left-5 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 text-[#AD1457]" />
              </button>
            </div>
            
            <motion.div 
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              className="relative -mt-12 bg-[#FFFDF7] rounded-t-[3.5rem] p-8 min-h-[55vh] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[#AD1457] font-bold uppercase tracking-widest text-[10px] mb-2">
                    {CATEGORIES[selectedCake.category]}
                  </p>
                  <h2 className="font-serif text-3xl text-slate-800 leading-tight">{selectedCake.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#AD1457]">{selectedCake.price}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">BYN/кг</p>
                </div>
              </div>

              <p className="text-slate-500 leading-relaxed text-base mb-8">
                {selectedCake.desc}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white border border-pink-50 p-4 rounded-3xl flex items-center space-x-3">
                  <div className="p-2 bg-pink-50 rounded-xl text-[#AD1457]">
                    <Weight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Вес</p>
                    <p className="text-xs font-bold">от 1.5 кг</p>
                  </div>
                </div>
                <div className="bg-white border border-pink-50 p-4 rounded-3xl flex items-center space-x-3">
                  <div className="p-2 bg-pink-50 rounded-xl text-[#AD1457]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Срок</p>
                    <p className="text-xs font-bold">2-3 дня</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setIsOrderFormOpen(true); tg?.HapticFeedback.impactOccurred('light'); }}
                className="w-full py-4.5 bg-[#AD1457] text-white rounded-2xl font-bold text-base shadow-xl shadow-pink-100 active:scale-95 transition-transform flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Заказать</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Form Modal */}
      <AnimatePresence>
        {isOrderFormOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#FFFDF7] z-[130] p-6 overflow-y-auto"
          >
            <button 
              onClick={() => setIsOrderFormOpen(false)}
              className="mb-6 text-[#AD1457] font-bold flex items-center bg-pink-50 px-4 py-2 rounded-xl text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </button>
            
            <h2 className="font-serif text-3xl text-[#AD1457] mb-8">Оформление<br/><span className="text-slate-800 text-2xl">заказа</span></h2>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Ваше имя</label>
                <input name="name" type="text" required className="w-full p-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-[#AD1457] bg-white shadow-sm text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Телефон</label>
                <input name="phone" type="tel" placeholder="+375" required className="w-full p-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-[#AD1457] bg-white shadow-sm text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Адрес доставки</label>
                <textarea name="address" required rows={2} className="w-full p-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-[#AD1457] bg-white shadow-sm text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Дата</label>
                  <input name="date" type="date" required className="w-full p-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-[#AD1457] bg-white shadow-sm text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Время</label>
                  <input name="time" type="time" required className="w-full p-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-[#AD1457] bg-white shadow-sm text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Пожелания</label>
                <textarea name="wishes" rows={2} placeholder="Надпись на торте..." className="w-full p-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-[#AD1457] bg-white shadow-sm text-sm" />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4.5 bg-[#AD1457] text-white rounded-2xl font-bold text-base shadow-xl shadow-pink-100 mt-6 active:scale-95 transition-transform"
              >
                Подтвердить
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-end justify-center p-0"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-[#AD1457]">
                  {editingCake?.id ? "Редактировать" : "Новый торт"}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-50 rounded-full">
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>
              
              <form onSubmit={handleSaveCake} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Название</label>
                  <input 
                    value={editingCake?.name || ''} 
                    onChange={e => setEditingCake(prev => ({ ...prev!, name: e.target.value }))}
                    required 
                    className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Цена (BYN/кг)</label>
                    <input 
                      type="number"
                      value={editingCake?.price || ''} 
                      onChange={e => setEditingCake(prev => ({ ...prev!, price: parseInt(e.target.value) }))}
                      required 
                      className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Категория</label>
                    <select 
                      value={editingCake?.category || 'sponge'} 
                      onChange={e => setEditingCake(prev => ({ ...prev!, category: e.target.value }))}
                      className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm"
                    >
                      <option value="sponge">Бисквитные</option>
                      <option value="mousse">Муссовые</option>
                      <option value="kids">Детские</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">URL Фото</label>
                  <input 
                    value={editingCake?.image || ''} 
                    onChange={e => setEditingCake(prev => ({ ...prev!, image: e.target.value }))}
                    required 
                    className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Описание</label>
                  <textarea 
                    value={editingCake?.desc || ''} 
                    onChange={e => setEditingCake(prev => ({ ...prev!, desc: e.target.value }))}
                    rows={3} 
                    className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm" 
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  {editingCake?.id && (
                    <button 
                      type="button" 
                      onClick={() => handleDeleteCake(editingCake.id!)}
                      className="flex-1 py-4 rounded-xl font-bold text-red-400 border border-red-50 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="flex-[2] py-4 bg-[#AD1457] text-white rounded-xl font-bold shadow-lg shadow-pink-100 text-sm"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
