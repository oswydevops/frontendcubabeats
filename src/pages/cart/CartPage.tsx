import React from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, navigateTo, addToast } = useApp();

  const totalAmountCUP = cart.reduce((acc, item) => acc + item.price, 0);

  const handleProceedCheckout = () => {
    if (cart.length === 0) {
      addToast('Tu carrito está vacío', 'info');
      return;
    }
    navigateTo('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-8 text-left">
      
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ShoppingCart size={22} className="text-[#7F77DD]" />
        <h2 className="text-xl font-bold tracking-tight text-white uppercase">Mi Carrito de Compras</h2>
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center bg-[#13131F] rounded-3xl border border-dashed border-white/10 space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
            <ShoppingCart size={26} />
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium text-sm">Tu carrito está vacío</p>
            <p className="text-white/40 text-xs text-center">Explora el catálogo para agregar tus beats favoritos.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/')}>
            Explorar Beats
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Items col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-mono">Ítems elegidos ({cart.length})</span>
              <button 
                onClick={() => { clearCart(); addToast('Carrito vaciado', 'info'); }}
                className="text-xs text-red-400 hover:underline bg-transparent border-none cursor-pointer"
              >
                Vaciar Carrito
              </button>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#13131F] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-[rgba(127,119,221,0.25)]"
                >
                  {/* Left thumbnail */}
                  <img 
                    src={item.beat.coverUrl} 
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0" 
                    alt="cover shadow" 
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Middle texts */}
                  <div className="flex-grow min-w-0">
                    <span 
                      onClick={() => navigateTo('/', { beatId: item.beat.id })}
                      className="text-white font-semibold text-sm hover:text-brand-primary-light transition-colors truncate block cursor-pointer"
                    >
                      {item.beat.title}
                    </span>
                    <span className="text-xs text-white/40 block">Prod. {item.beat.producerName}</span>
                    
                    <span className="inline-block px-2 py-0.5 mt-2 bg-brand-primary/10 border border-brand-primary/20 text-[#7F77DD] text-[9px] font-bold uppercase rounded">
                      Licencia {item.licenseType === 'basic' ? 'Básica MP3' : 'Exclusiva + Stems'}
                    </span>
                  </div>

                  {/* Right actions */}
                  <div className="text-right flex-shrink-0 space-y-2">
                    <span className="font-mono text-sm font-bold text-brand-primary-light block">${item.price.toLocaleString()} CUP</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/40 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer inline-block"
                      title="Eliminar beat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout column info summary */}
          <div className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/5">Resumen del Pedido</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal Beats:</span>
                <span className="font-mono text-white/80 font-semibold">${totalAmountCUP.toLocaleString()} CUP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Comisión de plataforma:</span>
                <span className="text-emerald-400 font-bold uppercase">Gratis (0%)</span>
              </div>

              {/* Promo input field */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Cupón de descuento"
                  className="flex-grow bg-[#1C1C2E] border border-white/5 text-[11px] rounded-lg px-3 py-1.5 text-white/90 outline-none focus:border-brand-primary-light"
                />
                <button 
                  onClick={() => addToast('Cupón no encontrado', 'error')}
                  className="px-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer"
                >
                  Aplicar
                </button>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between text-sm">
                <span className="font-bold text-white">Importe Total:</span>
                <span className="font-mono font-bold text-[#7F77DD] text-base">${totalAmountCUP.toLocaleString()} CUP</span>
              </div>
            </div>

            {/* Shield list status badge */}
            <div className="bg-[#0C0C14] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/50 leading-relaxed font-normal">
                Al comprar recibes archivos originales listos para cargar en tu DAW. Soporte garantizado por CubaBeats contra estafas.
              </p>
            </div>

            {/* Check action click */}
            <Button variant="primary" fullWidth onClick={handleProceedCheckout}>
              Proceder al Pago
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>

        </div>
      )}

    </div>
  );
};
