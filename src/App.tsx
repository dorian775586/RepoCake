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

const ADMIN_LIST: (string | number)[] = ["skolodko38"];

const CATEGORIES: Record<string, string> = {
  all: "Все торты",
  sponge: "Бисквитные",
  mousse: "Муссовые",
  kids: "Детские"
};

const INITIAL_CAKES: Cake[] = [
  { id: 1, name: "Красный бархат", price: 45, category: "sponge", popularity: 95, desc: "Классический десерт.", image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Ягодный Мусс", price: 50, category: "mousse", popularity: 88, desc: "Легкий мусс.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80" }
];

export default function App() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentSort, setCurrentSort] = useState('popularity');
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    const saved = localStorage.getItem('cakes_v5');
    setCakes(saved ? JSON.parse(saved) : INITIAL_CAKES);
    if (tg) {
      tg.expand();
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) setIsAuthorized(ADMIN_LIST.includes(user.id) || ADMIN_LIST.includes(user.username));
    }
  }, []);

  const filteredCakes = useMemo(() => {
    let result = currentCategory === 'all' ? [...cakes] : cakes.filter(c => c.category === currentCategory);
    result.sort((a, b) => b.popularity - a.popularity);
    return result;
  }, [cakes, currentCategory]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Собираем данные вручную, чтобы точно знать формат
    const orderData = {
      cake: selectedCake?.name || "Не указан",
      price: selectedCake?.price || 0,
      customer: formData.get('name')?.toString() || "Аноним",
      phone: formData.get('phone')?.toString() || "Нет номера",
      date: formData.get('date')?.toString() || "Не указана",
      time: formData.get('time')?.toString() || "Не указано",
      wishes: formData.get('wishes')?.toString() || "-",
      type: 'Самовывоз'
    };

    if (tg) tg.MainButton.showProgress();
    
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        setIsOrderFormOpen(false);
        setSelectedCake(null);
        setIsOrderSuccessOpen(true);
      } else {
        const errorText = await res.text();
        throw new Error(errorText || 'Ошибка сервера');
      }
    } catch (err: any) {
      if (tg) tg.showAlert(`Ошибка: ${err.message}`);
      else alert("Ошибка при отправке");
    } finally {
      if (tg) tg.MainButton.hideProgress();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans">
      <main className="pb-32">
        <header className="pt-10 pb-6 px-5 text-center">
          <motion.h1 className="font-serif text-4xl text-[#AD1457] mt-12">
            Авторские<br/><span className="text-slate-800 text-3xl">тортики</span>
          </motion.h1>
        </header>

        <div className="px-5 py-2 flex overflow-x-auto space-x-2 no-scrollbar">
          {Object.entries(CATEGORIES).map(([id, name]) => (
            <button
              key={id}
              onClick={() => setCurrentCategory(id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border ${
                currentCategory === id ? 'bg-[#AD1457] text-white border-[#AD1457]' : 'bg-white text-slate-400 border-pink-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="px-4 grid grid-cols-2 gap-3 mt-6">
          {filteredCakes.map((cake) => (
            <div key={cake.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-50/30 flex flex-col">
              <div className="h-40 bg-pink-50 cursor-pointer" onClick={() => setSelectedCake(cake)}>
                {cake.image && <img src={cake.image} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3">
                <h3 className="font-serif text-sm line-clamp-1">{cake.name}</h3>
                <p className="text-[#AD1457] font-bold mb-2">{cake.price} BYN</p>
                <button onClick={() => setSelectedCake(cake)} className="w-full py-2 bg-[#AD1457] text-white rounded-xl text-[10px] font-bold">ВЫБРАТЬ</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {selectedCake && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white z-[120] overflow-y-auto">
            <div className="h-[40vh] bg-pink-50 relative">
              {selectedCake.image && <img src={selectedCake.image} className="w-full h-full object-cover" />}
              <button onClick={() => setSelectedCake(null)} className="absolute top-6 left-5 bg-white p-3 rounded-full shadow-lg"><ChevronLeft className="w-5 h-5 text-[#AD1457]" /></button>
            </div>
            <div className="p-8 -mt-10 bg-[#FFFDF7] rounded-t-[3rem] min-h-[60vh]">
              <h2 className="font-serif text-3xl mb-4">{selectedCake.name}</h2>
              <p className="text-slate-500 mb-8">{selectedCake.desc}</p>
              <button onClick={() => setIsOrderFormOpen(true)} className="w-full py-4 bg-[#AD1457] text-white rounded-2xl font-bold shadow-xl">ЗАКАЗАТЬ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrderFormOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-[#FFFDF7] z-[130] p-6 overflow-y-auto">
            <button onClick={() => setIsOrderFormOpen(false)} className="mb-6 text-[#AD1457] font-bold flex items-center bg-pink-50 px-4 py-2 rounded-xl text-sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Назад
            </button>
            <h2 className="font-serif text-3xl text-[#AD1457] mb-8">Оформление</h2>
            
            {/* Форма без каких-либо pattern и специальных типов */}
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <input name="name" type="text" placeholder="Ваше имя" required className="w-full p-4 rounded-2xl border border-pink-100 bg-white shadow-sm text-sm" />
              <input name="phone" type="text" placeholder="Телефон (+375...)" required className="w-full p-4 rounded-2xl border border-pink-100 bg-white shadow-sm text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="date" type="text" placeholder="Дата (12.04)" required className="w-full p-4 rounded-2xl border border-pink-100 bg-white shadow-sm text-sm" />
                <input name="time" type="text" placeholder="Время (15:00)" required className="w-full p-4 rounded-2xl border border-pink-100 bg-white shadow-sm text-sm" />
              </div>
              <textarea name="wishes" placeholder="Пожелания" className="w-full p-4 rounded-2xl border border-pink-100 bg-white shadow-sm text-sm" rows={2} />
              <button type="submit" className="w-full py-4 bg-[#AD1457] text-white rounded-2xl font-bold shadow-xl mt-4">ОТПРАВИТЬ</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrderSuccessOpen && (
          <div className="fixed inset-0 bg-[#FFFDF7] z-[200] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-pink-50 max-w-sm w-full">
              <h2 className="font-serif text-3xl text-[#AD1457] mb-4">Готово!</h2>
              <p className="text-slate-600 mb-8">Заказ отправлен. Скоро свяжемся!</p>
              <button onClick={() => { setIsOrderSuccessOpen(false); tg?.close(); }} className="w-full py-4 bg-[#AD1457] text-white rounded-2xl font-bold">ОК</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}