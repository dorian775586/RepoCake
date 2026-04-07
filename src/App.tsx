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
  Instagram,
  Flame,
  Store,
  ExternalLink
} from 'lucide-react';

// --- Types ---
interface Cake {
  id: number;
  name: string;
  price: number;
  category: string;
  popularity: number;
  desc?: string;
  image?: string;
  calories?: string;
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
    price: 45, 
    category: "sponge", 
    popularity: 95, 
    desc: "Классический десерт с ярко-красными бисквитами и нежнейшим крем-чизом.", 
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80",
    calories: "320 ккал"
  },
  { 
    id: 2, 
    name: "Ягодный Мусс", 
    price: 50, 
    category: "mousse", 
    popularity: 88, 
    desc: "Легкий мусс на основе натуральных лесных ягод.", 
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    calories: "210 ккал"
  },
  { 
    id: 3, 
    name: "Детский Космос", 
    price: 65, 
    category: "kids", 
    popularity: 100, 
    desc: "Шоколадный взрыв с космическим декором.", 
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=800&q=80",
    calories: "380 ккал"
  },
  { 
    id: 4, 
    name: "Шоко-Трюфель", 
    price: 55, 
    category: "sponge", 
    popularity: 92, 
    desc: "Насыщенный шоколадный вкус для истинных ценителей.", 
    image: "https://images.unsplash.com/photo-1578985543812-0525828d51cd?auto=format&fit=crop&w=800&q=80",
    calories: "410 ккал"
  },
  { 
    id: 5, 
    name: "Чизкейк Классик", 
    price: 40, 
    category: "mousse", 
    popularity: 85, 
    desc: "Настоящий Нью-Йорк чизкейк на песочной основе.", 
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
    calories: "350 ккал"
  },
  { 
    id: 6, 
    name: "Морковный пряный", 
    price: 38, 
    category: "sponge", 
    popularity: 80, 
    desc: "Ароматные коржи с корицей и грецким орехом.", 
    image: "https://images.unsplash.com/photo-1536599485751-25e70d28864a?auto=format&fit=crop&w=800&q=80",
    calories: "290 ккал"
  },
  { 
    id: 7, 
    name: "Фисташка-Малина", 
    price: 60, 
    category: "mousse", 
    popularity: 94, 
    desc: "Фисташковый мусс с малиновым конфитюром.", 
    image: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=800&q=80",
    calories: "310 ккал"
  },
  { 
    id: 8, 
    name: "Фруктовый Рай", 
    price: 48, 
    category: "kids", 
    popularity: 89, 
    desc: "Легкий ванильный бисквит со свежими фруктами.", 
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    calories: "240 ккал"
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
  const [isAdminShopOpen, setIsAdminShopOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  const tg = (window as any).Telegram?.WebApp;

  // Load data & Check Auth
  useEffect(() => {
    const saved = localStorage.getItem('cakes_v5');
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
      localStorage.setItem('cakes_v5', JSON.stringify(cakes));
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
      window.open('https://instagram.com/your_account', '_blank');
    }
  };

  const handleOpenExternal = () => {
    if (tg) {
      tg.openLink('https://repo-cake.vercel.app/');
    } else {
      window.open('https://repo-cake.vercel.app/', '_blank');
    }
  };

  const handleSaveCake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCake) return;

    const finalCake = {
      ...editingCake,
      id: editingCake.id || Date.now(),
      popularity: editingCake.popularity || 50,
      // Если строка пустая - удаляем поле
      desc: editingCake.desc?.trim() || undefined,
      image: editingCake.image?.trim() || undefined,
      calories: editingCake.calories?.trim() || undefined,
    } as Cake;

    if (editingCake.id) {
      setCakes(prev => prev.map(c => c.id === editingCake.id ? finalCake : c));
    } else {
      setCakes(prev => [...prev, finalCake]);
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
      price: selectedCake?.price,
      customer: formData.get('name'),
      phone: formData.get('phone'),
      date: formData.get('date'),
      time: formData.get('time'),
      wishes: formData.get('wishes'),
      type: 'Самовывоз (Улица Сладкая, 15)'
    };

    if (tg) {
      tg.MainButton.showProgress();
    }
    
    try {
      // Используем относительный путь, если мы на том же домене, 
      // или пытаемся достучаться до API текущего сервера
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });

      if (res.ok) {
        setIsOrderFormOpen(false);
        setSelectedCake(null);
        setIsOrderSuccessOpen(true);
        if (tg) {
          tg.HapticFeedback.notificationOccurred('success');
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }
    } catch (err: any) {
      console.error("Order error:", err);
      if (tg) {
        tg.showAlert(`Ошибка: ${err.message || "Не удалось отправить заказ. Проверьте настройки бота."}`);
      } else {
        alert("Ошибка отправки заказа.");
      }
    } finally {
      if (tg) tg.MainButton.hideProgress();
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
      <main className="pb-32">
        <header className="pt-10 pb-6 px-5 text-center relative">
          <div className="absolute top-4 left-5 flex space-x-2">
            <button 
              onClick={handleToggleAdmin}
              className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl text-[#AD1457] shadow-sm border border-pink-50 active:scale-90 transition-transform"
            >
              <Instagram className="w-5 h-5" />
            </button>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-[#AD1457] leading-tight mt-12"
          >
            Шедевры<br/><span className="text-slate-800 text-3xl">ручной работы</span>
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
                className="relative h-44 overflow-hidden cursor-pointer bg-pink-50/30"
                onClick={() => setSelectedCake(cake)}
              >
                {cake.image ? (
                  <img 
                    src={cake.image} 
                    alt={cake.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-pink-200">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                )}
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
                    {cake.price} <span className="text-[9px] font-normal text-slate-400 uppercase tracking-tighter">BYN</span>
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

      {/* Admin Bottom Bar */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-50 p-4 z-[110] flex space-x-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
          >
            <button 
              onClick={() => setIsAdminShopOpen(true)}
              className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
              <Store className="w-5 h-5" />
              <span>Магазин</span>
            </button>
            <button 
              onClick={() => { setEditingCake({ category: 'sponge' }); setIsEditModalOpen(true); }}
              className="p-4 bg-brand-berry text-white rounded-2xl active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Shop Management Modal */}
      <AnimatePresence>
        {isAdminShopOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#FFFDF7] z-[150] p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-3xl text-slate-800">Управление<br/><span className="text-[#AD1457]">магазином</span></h2>
              <button 
                onClick={() => setIsAdminShopOpen(false)}
                className="p-3 bg-slate-50 rounded-full"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <div className="space-y-3">
              {cakes.map(cake => (
                <button
                  key={cake.id}
                  onClick={() => { setEditingCake(cake); setIsEditModalOpen(true); }}
                  className="w-full p-5 bg-white border border-pink-50 rounded-2xl flex items-center justify-between shadow-sm active:bg-pink-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 overflow-hidden flex-shrink-0">
                      {cake.image && <img src={cake.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{cake.name}</p>
                      <p className="text-xs text-brand-berry font-bold">{cake.price} BYN</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <p className="text-xs text-slate-400 italic">Нажмите на торт, чтобы изменить его или удалить</p>
            </div>
          </motion.div>
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
            <div className="relative h-[45vh] bg-pink-50/30">
              {selectedCake.image && <img src={selectedCake.image} className="w-full h-full object-cover" />}
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
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-right">BYN</p>
                </div>
              </div>

              {selectedCake.desc && (
                <p className="text-slate-500 leading-relaxed text-base mb-8">
                  {selectedCake.desc}
                </p>
              )}

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
                {selectedCake.calories && (
                  <div className="bg-white border border-pink-50 p-4 rounded-3xl flex items-center space-x-3">
                    <div className="p-2 bg-pink-50 rounded-xl text-[#AD1457]">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Энергия</p>
                      <p className="text-xs font-bold">{selectedCake.calories}</p>
                    </div>
                  </div>
                )}
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
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-3">Способ получения</label>
                <div className="w-full p-4 rounded-2xl border border-pink-100 bg-pink-50/30 shadow-sm text-sm">
                  <p className="font-bold text-[#AD1457]">Самовывоз по адресу:</p>
                  <p className="text-slate-600">Улица Сладкая, 15</p>
                </div>
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

      {/* Order Success Modal */}
      <AnimatePresence>
        {isOrderSuccessOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#FFFDF7] z-[200] flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl border border-pink-50 max-w-sm w-full"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-pink-50 shadow-inner">
                <img 
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80" 
                  alt="Cute Cat" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="font-serif text-3xl text-[#AD1457] mb-4">Мяу! Заказ принят!</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Спасибо за доверие! В ближайшее время мы свяжемся с вами для подтверждения деталей. ✨
              </p>
              <button 
                onClick={() => { setIsOrderSuccessOpen(false); tg?.close(); }}
                className="w-full py-4 bg-[#AD1457] text-white rounded-2xl font-bold shadow-lg shadow-pink-100 active:scale-95 transition-transform"
              >
                Отлично!
              </button>
            </motion.div>
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
                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Цена (BYN)</label>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">URL Фото (опц.)</label>
                    <input 
                      value={editingCake?.image || ''} 
                      onChange={e => setEditingCake(prev => ({ ...prev!, image: e.target.value }))}
                      placeholder="Пусто = без фото"
                      className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Калории (опц.)</label>
                    <input 
                      value={editingCake?.calories || ''} 
                      onChange={e => setEditingCake(prev => ({ ...prev!, calories: e.target.value }))}
                      placeholder="Напр: 300 ккал"
                      className="w-full p-3.5 rounded-xl border border-pink-50 bg-slate-50 focus:outline-none text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase ml-3">Описание (опц.)</label>
                  <textarea 
                    value={editingCake?.desc || ''} 
                    onChange={e => setEditingCake(prev => ({ ...prev!, desc: e.target.value }))}
                    rows={3} 
                    placeholder="Пусто = без описания"
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
