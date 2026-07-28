import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, Clock, Infinity, Info, CheckSquare, Square, Lock, LogIn, AlertCircle } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { 
    cart, removeFromCart, clearCart, toggleCartItemSelection, toggleAllCartItems,
    navigateTo, addToast, user, convertPrice, getProducerPaymentMethods 
  } = useApp();
  
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const selectedItems = useMemo(() => cart.filter(item => item.selected !== false), [cart]);
  const isAllSelected = cart.length > 0 && cart.every(item => item.selected !== false);
  const totalAmountCUP = selectedItems.reduce((acc, item) => acc + item.price, 0);

  // Identify producers in cart with no active payment methods configured
  const unconfiguredProducersMap = useMemo(() => {
    const map: Record<string, { producerId: string; producerName: string }> = {};
    cart.forEach(item => {
      const pId = item.beat.producerId;
      const pName = item.beat.producerName || 'el productor';
      const methods = getProducerPaymentMethods(pId).filter(m => m.active !== false);
      if (methods.length === 0) {
        map[pId] = { producerId: pId, producerName: pName };
      }
    });
    return map;
  }, [cart, getProducerPaymentMethods]);

  const unconfiguredProducersList = useMemo(() => Object.values(unconfiguredProducersMap), [unconfiguredProducersMap]);

  // Selected items that belong to producers without payment methods
  const selectedUnconfiguredProducers = useMemo(() => {
    const list: string[] = [];
    selectedItems.forEach(item => {
      const pId = item.beat.producerId;
      if (unconfiguredProducersMap[pId]) {
        const name = unconfiguredProducersMap[pId].producerName;
        if (!list.includes(name)) list.push(name);
      }
    });
    return list;
  }, [selectedItems, unconfiguredProducersMap]);

  const getItemTimeLeft = (addedAt?: string) => {
    const added = addedAt ? new Date(addedAt).getTime() : now;
    const expire = added + 24 * 3600 * 1000;
    const diff = expire - now;
    if (diff <= 0) return 'Expirado';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  const handleProceedCheckout = () => {
    if (!user) {
      addToast('Debes iniciar sesión para proceder al pago', 'info');
      navigateTo('/auth');
      return;
    }
    if (cart.length === 0) {
      addToast('Tu carrito está vacío', 'info');
      return;
    }
    if (selectedItems.length === 0) {
      addToast('Por favor, selecciona al menos un elemento para pagar', 'info');
      return;
    }
    if (selectedUnconfiguredProducers.length > 0) {
      addToast(`El productor "${selectedUnconfiguredProducers.join(', ')}" no ha configurado ningún método de pago para solicitar la compra`, 'error');
      return;
    }
    if (user.role !== 'client') {
      addToast('Solo las cuentas de Comprador/Artista pueden realizar compras o proceder al pago', 'error');
      return;
    }
    if (!user.verified) {
      addToast('Para proceder al pago debes estar verificado. Por favor realiza tu verificación KYC en Ajustes de Perfil.', 'error');
      navigateTo('/artist/dashboard');
      return;
    }
    navigateTo('/checkout');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 text-left space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <ShoppingCart size={22} className="text-[#7F77DD]" />
          <h1 className="text-[24px] font-bold tracking-tight text-white uppercase">Mi Carrito de Compras</h1>
        </div>

        <div className="py-16 px-6 text-center bg-[#13131F] rounded-3xl border border-dashed border-white/10 space-y-5">
          <div className="w-16 h-16 bg-[#7F77DD]/10 border border-[#7F77DD]/20 rounded-full flex items-center justify-center mx-auto text-[#7F77DD]">
            <Lock size={28} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-white font-bold text-[18px]">Acceso Restringido al Carrito</h3>
            <p className="text-white/60 text-[14px] leading-relaxed">
              El carrito de compras está vinculado exclusivamente a tu cuenta personal. Para visualizar tus elementos guardados o agregar nuevos beats, debes iniciar sesión.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" size="md" onClick={() => navigateTo('/auth')} className="text-[14px] font-semibold gap-2">
              <LogIn size={16} />
              Iniciar Sesión / Registrarse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-6 text-left">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShoppingCart size={22} className="text-[#7F77DD]" />
          <h1 className="text-[24px] font-bold tracking-tight text-white uppercase">Mi Carrito de Compras</h1>
        </div>
      </div>

      {unconfiguredProducersList.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left animate-in fade-in">
          <AlertCircle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-200/90 leading-relaxed min-w-0 space-y-1">
            <strong className="text-red-300 font-bold block uppercase tracking-wider text-[11px]">
              ⚠️ Método de pago no configurado
            </strong>
            {unconfiguredProducersList.length === 1 ? (
              <p>
                El productor <strong className="text-white font-bold">{unconfiguredProducersList[0].producerName}</strong> no ha configurado ningún método de pago para solicitar la compra.
              </p>
            ) : (
              <p>
                Los siguientes productores no han configurado ningún método de pago para solicitar la compra: <strong className="text-white font-bold">{unconfiguredProducersList.map(p => p.producerName).join(', ')}</strong>.
              </p>
            )}
            <p className="text-[11px] text-red-300/80 pt-0.5">
              Para poder continuar con tu pago, desmarca sus items del carrito o solicita al productor que configure sus opciones de cobro.
            </p>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <Info size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-bold block mb-1">⏱️ Reglas del Carrito D'Cuban Beats:</strong>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Beats:</strong> Tienen una ventana de reserva de <strong>24 horas</strong>. Si no son comprados en este plazo, se liberan automáticamente de tu carrito.</li>
              <li><strong>Librerías de Sonidos:</strong> Permanecen en tu carrito hasta que decidas pagarlas o eliminarlas.</li>
              <li><strong>Selección:</strong> Puedes marcar o desmarcar cada elemento individualmente o en grupo para elegir exactamente qué pagar en este pedido.</li>
            </ul>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="py-20 text-center bg-[#13131F] rounded-3xl border border-dashed border-white/10 space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
            <ShoppingCart size={26} />
          </div>
          <div className="space-y-1">
            <p className="text-white font-semibold text-[14px]">Tu carrito está vacío</p>
            <p className="text-white/40 text-[14px] font-normal text-center">Explora el catálogo para agregar tus beats y librerías favoritos.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/')} className="text-[14px] font-medium">
            Explorar Beats
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Items column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Top Toolbar for Select All & Clear */}
            <div className="bg-[#13131F] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
              <button 
                onClick={() => toggleAllCartItems(!isAllSelected)}
                className="flex items-center gap-2 text-[13px] font-medium text-white/80 hover:text-white cursor-pointer transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare size={18} className="text-[#7F77DD]" />
                ) : (
                  <Square size={18} className="text-white/30" />
                )}
                <span>{isAllSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos'}</span>
              </button>

              <span className="text-[12px] font-mono text-white/40">
                Seleccionados: <strong className="text-white">{selectedItems.length}</strong> de <strong className="text-white">{cart.length}</strong>
              </span>

              <button 
                onClick={() => { clearCart(); addToast('Carrito vaciado', 'info'); }}
                className="text-[12px] font-medium text-red-400 hover:underline bg-transparent border-none cursor-pointer"
              >
                Vaciar Carrito
              </button>
            </div>

            {/* List of items */}
            <div className="space-y-3">
              {cart.map((item) => {
                const isLib = item.beat.isSoundLibrary || 
                              item.beat.genre === 'Librería' || 
                              item.beat.genre === 'Librería de Sonidos' ||
                              item.beat.genre === 'Sound Library';
                const timeLeft = getItemTimeLeft(item.addedAt);
                const isSelected = item.selected !== false;

                return (
                  <div 
                    key={item.id}
                    className={`bg-[#13131F] border ${isSelected ? 'border-[rgba(127,119,221,0.3)] bg-[#13131F]' : 'border-white/5 opacity-60'} p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[rgba(127,119,221,0.4)]`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkbox */}
                      <button 
                        onClick={() => toggleCartItemSelection(item.id)}
                        className="text-white/60 hover:text-[#7F77DD] p-1 flex-shrink-0 cursor-pointer"
                        title={isSelected ? 'Desmarcar para pago' : 'Marcar para pago'}
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-[#7F77DD]" />
                        ) : (
                          <Square size={20} className="text-white/30" />
                        )}
                      </button>

                      {/* Cover thumbnail */}
                      <img 
                        src={item.beat.coverUrl} 
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0" 
                        alt="cover shadow" 
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Details */}
                      <div className="flex-grow min-w-0 space-y-1">
                        <span 
                          onClick={() => navigateTo('/', { beatId: item.beat.id })}
                          className="text-white font-semibold text-base hover:text-brand-primary-light transition-colors truncate block cursor-pointer"
                        >
                          {item.beat.title}
                        </span>
                        <span className="text-xs font-medium text-white/50 block">Prod. {item.beat.producerName}</span>
                        
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="inline-block px-2.5 py-0.5 bg-brand-primary/10 border border-brand-primary/20 text-[#7F77DD] text-[11px] font-semibold uppercase tracking-wider rounded-md">
                            {isLib ? 'Librería de Sonidos' : 'Licencia Exclusiva'}
                          </span>

                          {!isLib && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px] font-bold rounded-md">
                              <Clock size={12} />
                              Expira en carrito: {timeLeft}
                            </span>
                          )}

                          {unconfiguredProducersMap[item.beat.producerId] && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-[11px] font-bold rounded-md">
                              <AlertCircle size={11} />
                              Sin método de pago configurado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center flex-shrink-0 gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <span className="font-mono text-base font-bold text-brand-primary-light block">{convertPrice(item.price).formatted}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/40 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer inline-block"
                        title="Eliminar del carrito"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout summary column */}
          <div className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-semibold uppercase tracking-wider text-white pb-3 border-b border-white/10">Resumen del Pedido</h3>
            
            <div className="space-y-4 text-xs font-normal">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Elementos Habilitados:</span>
                <span className="font-mono text-white font-semibold text-xs">{selectedItems.length} de {cart.length}</span>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="font-semibold text-white text-sm">Importe a Pagar:</span>
                <span className="font-mono font-bold text-[#7F77DD] text-lg">{convertPrice(totalAmountCUP).formatted}</span>
              </div>
            </div>

            {/* Shield info badge */}
            <div className="bg-[#0C0C14] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/50 leading-relaxed font-normal">
                Al comprar recibes archivos originales listos para cargar en tu DAW. Soporte garantizado por D'Cuban Beats contra estafas.
              </p>
            </div>

            {/* Checkout Action Button */}
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleProceedCheckout}
              disabled={selectedItems.length === 0 || selectedUnconfiguredProducers.length > 0}
            >
              {selectedItems.length === 0 
                ? 'Selecciona elementos para pagar' 
                : selectedUnconfiguredProducers.length > 0
                  ? `Productor sin método de pago (${selectedUnconfiguredProducers[0]})`
                  : `Proceder al Pago (${selectedItems.length})`}
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>

        </div>
      )}

    </div>
  );
};
