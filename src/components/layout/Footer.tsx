import React, { useState } from 'react';
import { 
  Music, Facebook, Instagram, Youtube, Send, Mail, Phone, MapPin, 
  ShieldCheck, CreditCard, Heart, ArrowRight
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const Footer: React.FC = () => {
  const { navigateTo, addToast, user } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Por favor, ingresa un correo electrónico válido', 'error');
      return;
    }
    addToast('¡Te has suscrito con éxito al boletín CubaBeats!', 'success');
    setEmail('');
  };

  return (
    <footer id="cuba-beats-modern-footer" className="bg-[#0A0A10] border-t border-[rgba(127,119,221,0.12)] pt-16 pb-8 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        
        {/* Column 1: Brand & Bio (4 cols) */}
        <div className="lg:col-span-4 space-y-5 text-left">
          <div 
            onClick={() => navigateTo('/')} 
            className="flex items-center gap-2 cursor-pointer group w-fit"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] flex items-center justify-center text-white shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-105">
              <Music size={18} fill="currentColor" />
            </span>
            <span className="text-white font-bold text-lg tracking-tight">
              Cuba<span className="text-[#7F77DD] font-semibold font-mono">[Beats]</span>
            </span>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            La plataforma líder de licenciamiento y compra-venta de beats instrumentales en Cuba. Conectamos a los mejores productores cubanos de salsatón, cubatón, trap, dembow y ritmos tradicionales con artistas emergentes de todo el país.
          </p>

          {/* Social Media Row */}
          <div className="flex items-center gap-3.5 pt-2">
            <a 
              href="#instagram" 
              onClick={() => addToast('Enlace simulado a Instagram', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all duration-250 cursor-pointer text-slate-400 hover:scale-105"
            >
              <Instagram size={16} />
            </a>
            <a 
              href="#youtube" 
              onClick={() => addToast('Enlace simulado a YouTube', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all duration-250 cursor-pointer text-slate-400 hover:scale-105"
            >
              <Youtube size={16} />
            </a>
            <a 
              href="#facebook" 
              onClick={() => addToast('Enlace simulado a Facebook', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all duration-250 cursor-pointer text-slate-400 hover:scale-105"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation (2 cols) */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <h4 className="text-xs font-bold tracking-widest text-[#7F77DD] uppercase">
            Navegación
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button 
                onClick={() => navigateTo('/')} 
                className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer block"
              >
                Catálogo de Beats
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigateTo('/cart')} 
                className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer block"
              >
                Carrito de Compras
              </button>
            </li>
            {user ? (
              <li>
                <button 
                  onClick={() => navigateTo(user.role === 'producer' ? '/producer/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/')} 
                  className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer block font-semibold text-[#7F77DD]"
                >
                  Panel de {user.role === 'producer' ? 'Productor' : user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button 
                    onClick={() => navigateTo('/login')} 
                    className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer block"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('/register')} 
                    className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer block"
                  >
                    Registrar Cuenta
                  </button>
                </li>
              </>
            )}
            <li>
              <button 
                onClick={() => navigateTo('/two-factor')} 
                className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer text-left block"
              >
                Seguridad 2FA
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Security (2 cols) */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <h4 className="text-xs font-bold tracking-widest text-[#7F77DD] uppercase">
            Soporte & KYC
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button 
                onClick={() => navigateTo('/kyc')} 
                className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all cursor-pointer block text-left"
              >
                Verificación de Identidad (KYC)
              </button>
            </li>
            <li>
              <a 
                href="#terminos-licencia" 
                onClick={() => addToast('Mostrando simulador de contratos: Licencia Básica vs Exclusiva', 'info')}
                className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all block text-left"
              >
                Términos de Licencia
              </a>
            </li>
            <li>
              <a 
                href="#soporte-faq" 
                onClick={() => addToast('Soporte técnico disponible las 24 horas vía correo', 'info')}
                className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 transition-all block text-left"
              >
                Preguntas Frecuentes
              </a>
            </li>
            <li className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 font-semibold uppercase tracking-wider mt-1">
              <ShieldCheck size={12} />
              <span>Transacciones Verificadas</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Contact (4 cols) */}
        <div className="lg:col-span-4 space-y-4 text-left">
          <h4 className="text-xs font-bold tracking-widest text-[#7F77DD] uppercase">
            Recibe Ofertas y Nuevos Beats
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Suscríbete con tu correo para enterarte primero cuando tus productores favoritos suban ritmos nuevos de estreno.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="flex gap-2 bg-[#13131F] border border-[rgba(127,119,221,0.22)] rounded-xl p-1 focus-within:border-[#7F77DD] transition-all">
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo..."
                className="bg-transparent text-xs text-white border-none outline-none w-full px-3 py-1.5 placeholder-white/30"
              />
              <button 
                type="submit"
                className="bg-[#534AB7] hover:bg-[#7F77DD] text-white p-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                title="Suscribirse"
              >
                <Send size={12} />
              </button>
            </div>
          </form>

          {/* Contact snippets */}
          <div className="pt-2 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-[#7F77DD]" />
              <span>soporte@cubabeats.cu</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#7F77DD]" />
              <span>+53 58349202 (Habana, Cuba)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Separator line */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-500">
        
        {/* Left Side: Copyright */}
        <div className="flex items-center gap-1">
          <span>&copy; {new Date().getFullYear()} CubaBeats Inc.</span>
          <span>•</span>
          <span>Hecho con</span>
          <Heart size={10} className="text-red-500 fill-red-500 mx-0.5" />
          <span>para la música cubana.</span>
        </div>

        {/* Center/Right Side: Payment Providers accepted in Cuba (visual accent) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-slate-500/80 font-semibold uppercase tracking-wider mr-1">Pasarelas Admitidas:</span>
          
          <div className="flex items-center gap-1 bg-[#13131F] px-2.5 py-1 rounded-md border border-white/5" title="Transfermóvil disponible en Cuba">
            <CreditCard size={11} className="text-blue-400" />
            <span className="text-[10px] font-bold font-mono text-slate-300">Transfermóvil</span>
          </div>

          <div className="flex items-center gap-1 bg-[#13131F] px-2.5 py-1 rounded-md border border-white/5" title="EnZona compatible con tu tarjeta CUP">
            <CreditCard size={11} className="text-emerald-400" />
            <span className="text-[10px] font-bold font-mono text-slate-300">EnZona</span>
          </div>

          <div className="flex items-center gap-1 bg-[#13131F] px-2.5 py-1 rounded-md border border-white/5" title="Cuentas MLC cubanas de bancos locales">
            <span className="text-[10px] font-black text-rose-400 font-mono">MLC</span>
            <span className="text-[10px] font-medium text-slate-300">Bancos</span>
          </div>

          <div className="flex items-center gap-1 bg-[#13131F] px-2.5 py-1 rounded-md border border-white/5" title="Moneda Nacional CUP en efectivo o transferencia">
            <span className="text-[10px] font-black text-[#7F77DD] font-mono">CUP</span>
            <span className="text-[10px] font-medium text-slate-300">Moneda</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
