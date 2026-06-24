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
    addToast('¡Te has suscrito con éxito al boletín D\'Cuban Beats!', 'success');
    setEmail('');
  };

  if (user?.role === 'admin') {
    return (
      <footer id="cuba-beats-modern-footer" className="bg-[#0A0A10] border-t border-[rgba(127,119,221,0.12)] py-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <span className="font-mono text-[11px] tracking-wide">&copy; {new Date().getFullYear()} D'Cuban Beats Inc. • Panel Administrativo Autorizado.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer id="cuba-beats-modern-footer" className="bg-[#0A0A10] border-t border-[rgba(127,119,221,0.12)] pt-12 pb-8 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Logo, brief description and social media (6 cols) */}
        <div className="md:col-span-6 space-y-4 text-left">
          <div 
            onClick={() => navigateTo('/')} 
            className="flex items-center gap-2 cursor-pointer group w-fit"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105">
              <Music size={18} fill="currentColor" />
            </span>
            <span className="text-white font-bold text-lg tracking-tight">
              D'Cuban<span className="text-[#7F77DD] font-semibold font-mono">[Beats]</span>
            </span>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            La plataforma líder de licenciamiento y compra-venta de beats instrumentales en Cuba. Conectamos a los mejores productores locales con artistas emergentes de todo el país.
          </p>

          {/* Social Media Row */}
          <div className="flex items-center gap-3 pt-1">
            <a 
              href="#instagram" 
              onClick={() => addToast('Enlace simulado a Instagram', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
            >
              <Instagram size={16} />
            </a>
            <a 
              href="#youtube" 
              onClick={() => addToast('Enlace simulado a YouTube', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
            >
              <Youtube size={16} />
            </a>
            <a 
              href="#facebook" 
              onClick={() => addToast('Enlace simulado a Facebook', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Links: Términos, FAQ, y Privacidad (3 cols) */}
        <div className="md:col-span-3 space-y-3.5 text-left">
          <h4 className="text-xs font-bold tracking-widest text-[#7F77DD] uppercase">
            Plataforma
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a 
                href="#terminos" 
                onClick={() => addToast('Términos y condiciones de la plataforma', 'info')}
                className="text-slate-400 hover:text-white transition-all cursor-pointer block text-left"
              >
                Términos y Condiciones
              </a>
            </li>
            <li>
              <a 
                href="#faq" 
                onClick={() => addToast('Preguntas Frecuentes', 'info')}
                className="text-slate-400 hover:text-white transition-all cursor-pointer block text-left"
              >
                Preguntas Frecuentes
              </a>
            </li>
            <li>
              <a 
                href="#privacidad" 
                onClick={() => addToast('Políticas de Privacidad de D\'Cuban Beats', 'info')}
                className="text-slate-400 hover:text-white transition-all cursor-pointer block text-left"
              >
                Políticas de Privacidad
              </a>
            </li>
          </ul>
        </div>

        {/* Support contact info: Email and Phone (3 cols) */}
        <div className="md:col-span-3 space-y-3.5 text-left">
          <h4 className="text-xs font-bold tracking-widest text-[#7F77DD] uppercase">
            Contacto de Soporte
          </h4>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-[#7F77DD] flex-shrink-0" />
              <span className="truncate">soporte@dcubanbeats.cu</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#7F77DD] flex-shrink-0" />
              <span>+53 58349202</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom copyright spacing */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
        <span>&copy; {new Date().getFullYear()} D'Cuban Beats Inc. • Todos los derechos reservados.</span>
      </div>
    </footer>
  );
};
