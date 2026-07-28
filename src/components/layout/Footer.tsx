import React, { useState } from 'react';
import { 
  Music, Facebook, Instagram, Youtube, Send, Mail, Phone, MapPin, 
  ShieldCheck, CreditCard, Heart, ArrowRight, Twitter
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { BrandLogo } from './BrandLogo';

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
      <footer id="cuba-beats-modern-footer" className="bg-[#0A0A10] border-t border-[rgba(127,119,221,0.12)] py-6 text-slate-500 text-[12px] text-center">
        <div className="max-w-7xl xl:max-w-[1450px] mx-auto px-4 md:px-10 lg:px-14 flex items-center justify-center">
          <span className="font-mono text-[11px] tracking-wide font-normal">&copy; {new Date().getFullYear()} D'Cuban Beats Inc. • Panel Administrativo Autorizado.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer id="cuba-beats-modern-footer" className="bg-[#0A0A10] border-t border-[rgba(127,119,221,0.12)] pt-12 pb-8 text-slate-300">
      <div className="max-w-7xl xl:max-w-[1450px] mx-auto px-4 md:px-10 lg:px-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8">
        
        {/* Logo, brief description and social media (4 cols) */}
        <div className="md:col-span-6 lg:col-span-4 space-y-4 text-left">
          <div 
            onClick={() => navigateTo('/')} 
            className="flex items-center gap-2 cursor-pointer group w-fit"
          >
            <BrandLogo className="h-20 w-auto transition-transform group-hover:scale-[1.02]" />
          </div>
          
          <p className="text-[14px] font-normal text-slate-400 leading-relaxed max-w-sm">
            La plataforma líder de compra-venta de instrumentales exclusivas en Cuba. Conectamos a los mejores productores locales con artistas emergentes de todo el país.
          </p>

          {/* Social Media Row */}
          <div className="flex items-center gap-[16px] pt-1">
            <a 
              href="#instagram" 
              onClick={() => addToast('https://www.instagram.com/dcubanbeatsoficial/', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="#youtube" 
              onClick={() => addToast('https://youtube.com/@dcubanbeatssoporte?si=EUKPk57Yg7B6EPzu', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
              title="YouTube"
            >
              <Youtube size={18} />
            </a>
            <a 
              href="#facebook" 
              onClick={() => addToast('https://www.facebook.com/profile.php?id=61591638920697', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
              title="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a 
              href="#telegram" 
              onClick={() => addToast('https://t.me/+0Jw3azyZPTc1Njkx', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
              title="Telegram"
            >
              <Send size={18} />
            </a>
            <a 
              href="#twitter" 
              onClick={() => addToast('https://x.com/dcubanbeats', 'info')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#7F77DD]/20 hover:text-[#7F77DD] flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:scale-105"
              title="X (Twitter)"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>

        {/* Links: Términos, FAQ, y Privacidad (2 cols) */}
        <div className="md:col-span-6 lg:col-span-2 space-y-3.5 text-left">
          <h4 className="text-[14px] font-semibold tracking-widest text-[#7F77DD] uppercase">
            Plataforma
          </h4>
          <ul className="space-y-2.5 text-[13px] font-normal">
            <li>
              <a 
                href="#about" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/about');
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer block text-left font-medium text-brand-primary-light"
              >
                Sobre Nosotros
              </a>
            </li>
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

        {/* Payment Methods (3 cols) */}
        <div className="md:col-span-6 lg:col-span-3 space-y-3.5 text-left">
          <h4 className="text-[14px] font-semibold tracking-widest text-[#7F77DD] uppercase">
            Métodos de Pago
          </h4>
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex flex-col items-center gap-1.5 w-[75px] text-center select-none">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5 shadow-inner">
                <CreditCard size={18} />
              </div>
              <span className="text-slate-400 text-[11px] font-medium leading-tight">Transfermóvil</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-[75px] text-center select-none">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 shadow-inner">
                <ShieldCheck size={18} />
              </div>
              <span className="text-slate-400 text-[11px] font-medium leading-tight">EnZona</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-[75px] text-center select-none">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-purple-400 border border-white/5 shadow-inner">
                <ArrowRight size={18} />
              </div>
              <span className="text-slate-400 text-[11px] font-medium leading-tight">QvaPay</span>
            </div>
          </div>
        </div>

        {/* Support contact info: Email and Phone (3 cols) */}
        <div className="md:col-span-6 lg:col-span-3 space-y-3.5 text-left">
          <h4 className="text-[14px] font-semibold tracking-widest text-[#7F77DD] uppercase">
            Contacto de Soporte
          </h4>
          <div className="space-y-2.5 text-[13px] font-normal text-slate-400">
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-[#7F77DD] flex-shrink-0" />
              <a href="mailto:soporte@dcubanbeats.cu" className="truncate hover:text-white transition-colors">
                soporte@dcubanbeats.cu
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#7F77DD] flex-shrink-0" />
              <a href="tel:+5358349202" className="hover:text-white transition-colors">
                +53 58349202
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#7F77DD] flex-shrink-0" />
              <a href="tel:+5352938174" className="hover:text-white transition-colors">
                +53 52938174
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom copyright spacing */}
      <div className="max-w-7xl xl:max-w-[1450px] mx-auto px-4 md:px-10 lg:px-14 mt-8 pt-6 border-t border-white/5 text-center text-[12px] font-normal text-slate-500">
        <span>&copy; {new Date().getFullYear()} D'Cuban Beats Inc. • Todos los derechos reservados.</span>
      </div>
    </footer>
  );
};
