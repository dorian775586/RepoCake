const handleOrderSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  
  // Собираем максимально плоский и простой объект
  const rawData = {
    customer: String(formData.get('name') || 'Аноним'),
    phone: String(formData.get('phone') || '-'),
    date: String(formData.get('date') || '-'),
    time: String(formData.get('time') || '-'),
    wishes: String(formData.get('wishes') || '-'),
    cake: selectedCake?.name || 'Торт',
    price: selectedCake?.price || 0
  };

  if (tg) tg.MainButton.showProgress();

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(rawData)
    });

    const result = await res.json();

    if (res.ok && result.success) {
      setIsOrderFormOpen(false);
      setIsOrderSuccessOpen(true);
    } else {
      throw new Error(result.error || 'Ошибка API');
    }
  } catch (err: any) {
    if (tg) tg.showAlert(`Детали: ${err.message}`);
    else alert(`Ошибка: ${err.message}`);
  } finally {
    if (tg) tg.MainButton.hideProgress();
  }
};