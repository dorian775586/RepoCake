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

const SIZES = [
  { id: 'bento', name: 'Бенто', weight: '~500г', extra: 0 },
  { id: 'midi', name: 'Миди', weight: '~1кг', extra: 25 },
  { id: 'max', name: 'Макс', weight: '~2кг', extra: 55 },
];

const FILLINGS = [
  { id: 'cherry', name: 'Вишня', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'strawberry', name: 'Клубника', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'raspberry', name: 'Малина', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'salted_caramel', name: 'Соленая карамель', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'condensed_banana', name: 'Сгущёнка банан', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'caramel_banana', name: 'Карамель банан', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'nutella_banana', name: 'Нутелла банан', extra: { bento: 5, midi: 8, max: 15 } },
];

const BISCUITS = [
  { id: 'classic', name: 'Классический', extra: { bento: 0, midi: 0, max: 0 } },
  { id: 'chocolate', name: 'Шоколадный', extra: { bento: 2, midi: 3, max: 4 } },
];

const ADDONS = [
  { id: 'none', name: 'Нет', extra: 0 },
  { id: 'peanut', name: 'Арахис', extra: 3 },
];

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
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=800&q=80",
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
  const [orderError, setOrderError] = useState<string | null>(null);

  // Selection states
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedFilling, setSelectedFilling] = useState(FILLINGS[0]);
  const [selectedBiscuit, setSelectedBiscuit] = useState(BISCUITS[0]);
  const [selectedAddon, setSelectedAddon] = useState(ADDONS[0]);

  const tg = (window as any).Telegram?.WebApp;

  // Load data & Check Auth
  useEffect(() => {
    const saved = localStorage.getItem('cakes_v5');
    if (saved) {
      let loadedCakes = JSON.parse(saved);
      // Исправление битых ссылок для существующих пользователей
      loadedCakes = loadedCakes.map((c: Cake) => {
        if (c.id === 4 && c.image?.includes('1578985543812')) {
          return { ...c, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80" };
        }
        if (c.id === 6 && c.image?.includes('1536599485751')) {
          return { ...c, image: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=800&q=80" };
        }
        return c;
      });
      setCakes(loadedCakes);
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

  const currentPrice = useMemo(() => {
    if (!selectedCake) return 0;
    let total = selectedCake.price;
    
    // Size extra
    total += selectedSize.extra;
    
    // Filling extra based on size
    const sizeId = selectedSize.id as keyof typeof selectedFilling.extra;
    total += (selectedFilling.extra as any)[sizeId] || 0;
    
    // Biscuit extra based on size
    total += (selectedBiscuit.extra as any)[sizeId] || 0;
    
    // Addon extra
    total += selectedAddon.extra;
    
    return total;
  }, [selectedCake, selectedSize, selectedFilling, selectedBiscuit, selectedAddon]);

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
      price: currentPrice,
      size: `${selectedSize.name} (${selectedSize.weight})`,
      filling: selectedFilling.name,
      biscuit: selectedBiscuit.name,
      addon: selectedAddon.name,
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
      // Используем относительный путь - это самый надежный вариант для fetch
      const apiUrl = '/api/order';
      console.log("Sending order to:", apiUrl, orderData);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
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
      setOrderError(err.message || "Не удалось отправить заказ. Проверьте настройки бота.");
      if (tg) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      if (tg) tg.MainButton.hideProgress();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] text-slate-900 font-sans selection:bg-rose-100 overflow-x-hidden">
      
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
              className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl text-[#F06292] shadow-sm border border-rose-50 active:scale-90 transition-transform"
            >
              <Instagram className="w-5 h-5" />
            </button>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-[#D81B60] leading-tight mt-12"
          >
            Шедевры<br/><span className="text-slate-800 text-3xl">ручной работы</span>
          </motion.h1>
          <div className="w-10 h-1 bg-[#F06292] mx-auto mt-4 rounded-full opacity-20" />
        </header>

        {/* Categories */}
        <div className="px-5 py-2 flex overflow-x-auto space-x-2 no-scrollbar">
          {Object.entries(CATEGORIES).map(([id, name]) => (
            <button
              key={id}
              onClick={() => { setCurrentCategory(id); tg?.HapticFeedback.selectionChanged(); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                currentCategory === id 
                ? 'bg-[#F06292] text-white border-[#F06292] shadow-md shadow-rose-100' 
                : 'bg-white text-slate-400 border-rose-50'
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
            className="text-[10px] font-bold text-[#F06292] bg-transparent outline-none uppercase tracking-wider"
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
                    referrerPolicy="no-referrer"
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
                  <p className="text-lg font-bold text-[#F06292]">
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
                    className="flex-1 py-2.5 bg-[#F06292] text-white rounded-xl shadow-md shadow-rose-100 active:scale-95 transition-transform text-[10px] font-bold uppercase tracking-wider"
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
              <h2 className="font-serif text-3xl text-slate-800">Управление<br/><span className="text-[#F06292]">магазином</span></h2>
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
                  className="w-full p-5 bg-white border border-rose-50 rounded-2xl flex items-center justify-between shadow-sm active:bg-rose-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 overflow-hidden flex-shrink-0">
                      {cake.image && <img src={cake.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{cake.name}</p>
                      <p className="text-xs text-[#F06292] font-bold">{cake.price} BYN</p>
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
              {selectedCake.image && (
                <img 
                  src={selectedCake.image} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              )}
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
              className="relative -mt-12 bg-[#FFF9F9] rounded-t-[3.5rem] p-8 min-h-[55vh] shadow-[0_-15px_40px_rgba(0,0,0,0.08)] pb-32"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[#F06292] font-bold uppercase tracking-widest text-[10px] mb-2">
                    {CATEGORIES[selectedCake.category]}
                  </p>
                  <h2 className="font-serif text-3xl text-slate-800 leading-tight">{selectedCake.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#F06292]">{currentPrice}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-right">BYN</p>
                </div>
              </div>

              {selectedCake.desc && (
                <p className="text-slate-500 leading-relaxed text-base mb-8">
                  {selectedCake.desc}
                </p>
              )}

              {/* Selection Options */}
              <div className="space-y-8 mb-10">
                {/* Size Selection */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Размер и вес</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => { setSelectedSize(size); tg?.HapticFeedback.selectionChanged(); }}
                        className={`p-3 rounded-2xl border transition-all text-center ${
                          selectedSize.id === size.id 
                          ? 'bg-[#F06292] text-white border-[#F06292] shadow-md' 
                          : 'bg-white text-slate-600 border-rose-50'
                        }`}
                      >
                        <p className="text-xs font-bold">{size.name}</p>
                        <p className="text-[8px] opacity-70">{size.weight}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filling Selection */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Начинка</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FILLINGS.map(filling => {
                      const extra = (filling.extra as any)[selectedSize.id] || 0;
                      return (
                        <button
                          key={filling.id}
                          onClick={() => { setSelectedFilling(filling); tg?.HapticFeedback.selectionChanged(); }}
                          className={`p-3 rounded-2xl border transition-all text-left flex justify-between items-center ${
                            selectedFilling.id === filling.id 
                            ? 'bg-[#F06292] text-white border-[#F06292] shadow-md' 
                            : 'bg-white text-slate-600 border-rose-50'
                          }`}
                        >
                          <span className="text-[10px] font-bold">{filling.name}</span>
                          {extra > 0 && <span className="text-[8px] opacity-80">+{extra}р</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Biscuit Selection */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Бисквит</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {BISCUITS.map(biscuit => {
                      const extra = (biscuit.extra as any)[selectedSize.id] || 0;
                      return (
                        <button
                          key={biscuit.id}
                          onClick={() => { setSelectedBiscuit(biscuit); tg?.HapticFeedback.selectionChanged(); }}
                          className={`p-3 rounded-2xl border transition-all text-left flex justify-between items-center ${
                            selectedBiscuit.id === biscuit.id 
                            ? 'bg-[#F06292] text-white border-[#F06292] shadow-md' 
                            : 'bg-white text-slate-600 border-rose-50'
                          }`}
                        >
                          <span className="text-[10px] font-bold">{biscuit.name}</span>
                          {extra > 0 && <span className="text-[8px] opacity-80">+{extra}р</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Addons Selection */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Добавки</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ADDONS.map(addon => (
                      <button
                        key={addon.id}
                        onClick={() => { setSelectedAddon(addon); tg?.HapticFeedback.selectionChanged(); }}
                        className={`p-3 rounded-2xl border transition-all text-left flex justify-between items-center ${
                          selectedAddon.id === addon.id 
                          ? 'bg-[#F06292] text-white border-[#F06292] shadow-md' 
                          : 'bg-white text-slate-600 border-rose-50'
                        }`}
                      >
                        <span className="text-[10px] font-bold">{addon.name}</span>
                        {addon.extra > 0 && <span className="text-[8px] opacity-80">+{addon.extra}р</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FFF9F9] via-[#FFF9F9] to-transparent z-[130]">
                <button 
                  onClick={() => { setIsOrderFormOpen(true); tg?.HapticFeedback.impactOccurred('light'); }}
                  className="w-full py-4.5 bg-[#F06292] text-white rounded-2xl font-bold text-base shadow-xl shadow-rose-100 active:scale-95 transition-transform flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Заказать за {currentPrice} BYN</span>
                </button>
              </div>
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
              className="mb-6 text-[#F06292] font-bold flex items-center bg-rose-50 px-4 py-2 rounded-xl text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </button>
            
            <h2 className="font-serif text-2xl text-slate-800 mb-8 tracking-tight">Оформление заказа</h2>
            
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Ваше имя</label>
                <input name="name" type="text" required className="w-full p-4.5 rounded-2xl border border-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white shadow-sm text-sm transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Телефон</label>
                <input name="phone" type="tel" placeholder="+375" required className="w-full p-4.5 rounded-2xl border border-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white shadow-sm text-sm transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Способ получения</label>
                <div className="w-full p-4.5 rounded-2xl border border-rose-50 bg-rose-50/30 shadow-sm text-sm">
                  <p className="font-bold text-[#D81B60]">Самовывоз по адресу:</p>
                  <p className="text-slate-600">Улица Сладкая, 15</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest mb-1 block">Когда заберете?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300">
                        <Clock className="w-4 h-4" />
                      </div>
                      <input 
                        name="date" 
                        type="date" 
                        required 
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border border-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white shadow-sm text-xs transition-all appearance-none" 
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300">
                        <Star className="w-4 h-4" />
                      </div>
                      <input 
                        name="time" 
                        type="time" 
                        required 
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border border-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white shadow-sm text-xs transition-all appearance-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Пожелания</label>
                <textarea name="wishes" rows={2} placeholder="Надпись на торте или декор..." className="w-full p-4.5 rounded-2xl border border-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white shadow-sm text-sm transition-all" />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-5 bg-[#F06292] text-white rounded-2xl font-bold text-base shadow-xl shadow-rose-100 mt-4 active:scale-95 transition-transform"
              >
                Подтвердить заказ
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
            className="fixed inset-0 bg-[#FFF9F9] z-[200] flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-rose-50 max-w-sm w-full relative overflow-hidden"
            >
              {/* Floating Hearts Animation */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 100, x: Math.random() * 200 - 100, opacity: 0, scale: 0 }}
                  animate={{ 
                    y: -200, 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.8],
                    rotate: Math.random() * 90 - 45
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  className="absolute bottom-0 text-rose-400 pointer-events-none"
                  style={{ left: '50%' }}
                >
                  ❤️
                </motion.div>
              ))}

              <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-8 border-rose-50 shadow-xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=400&q=80" 
                  alt="Super Cute Cat" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="font-serif text-3xl text-[#D81B60] mb-4">Мяу! Заказ принят!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Ваш заказ уже в пути к нашему кондитеру. Мы свяжемся с вами совсем скоро! ✨
              </p>
              <button 
                onClick={() => { setIsOrderSuccessOpen(false); tg?.close(); }}
                className="w-full py-4 bg-[#F06292] text-white rounded-2xl font-bold shadow-lg shadow-rose-100 active:scale-95 transition-transform"
              >
                Чудесно!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Error Modal */}
      <AnimatePresence>
        {orderError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-red-50 max-w-sm w-full"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <X className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-2xl text-slate-800 mb-2">Ой, ошибка!</h2>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                {orderError}
              </p>
              <button 
                onClick={() => setOrderError(null)}
                className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold active:scale-95 transition-transform"
              >
                Понятно
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
