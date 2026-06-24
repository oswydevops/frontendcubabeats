import React from 'react';
import { Users, Shield, Heart, Sparkles, Music, Star } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const AboutUsPage: React.FC = () => {
  const { addToast } = useApp();

  const team = [
    {
      name: 'Osvaldo Navas Martínez',
      role: 'Fundador & Director de Tecnología',
      bio: 'Inició D\'Cuban Beats con el sueño de digitalizar y monetizar el talento musical cubano, abriendo las puertas al mercado internacional para productores locales.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    {
      name: 'Maikel "On The Beat" Sierra',
      role: 'Curador de Calidad Musical',
      bio: 'Productor galardonado con más de 10 años en la escena urbana cubana. Supervisa la calidad de cada beat que sube a la plataforma para garantizar altos estándares.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
    {
      name: 'Dayana Valdés Soler',
      role: 'Soporte de Licencias & Legal',
      bio: 'Especialista en propiedad intelectual. Se asegura de que los contratos de licencias básicas y exclusivas cumplan con las regulaciones de autoría vigentes.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-500">
      
      {/* Hero Headline Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7F77DD]/10 border border-[#7F77DD]/20 text-[#7F77DD] text-[10px] font-bold uppercase tracking-widest rounded-full">
          <Music size={11} /> Conoce D'Cuban Beats
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight text-white leading-tight">
          El latido del ritmo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-[#7F77DD] to-purple-400">cubano</span> en un solo lugar.
        </h1>
        <p className="text-sm md:text-base text-slate-400 leading-relaxed">
          D'Cuban Beats es la plataforma líder dedicada exclusivamente al licenciamiento y la compra-venta de ritmos instrumentales auténticos en Cuba. Nuestro objetivo es conectar el incalculable talento de nuestros productores con artistas y creadores tanto dentro como fuera de la isla.
        </p>
      </div>

      {/* Grid: Pillars/Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-[#121220]/60 border border-white/5 p-6 rounded-2xl space-y-3 hover:border-[#7F77DD]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[#7F77DD]">
            <Heart size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Pasión Local</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nacimos con el propósito de descentralizar la industria, dando a cada productor local, sin importar su procedencia, la oportunidad de exponer sus creaciones.
          </p>
        </div>

        <div className="bg-[#121220]/60 border border-white/5 p-6 rounded-2xl space-y-3 hover:border-[#7F77DD]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Shield size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Licenciamiento Sólido</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ofrecemos un entorno seguro de contratos listos para descargar, donde se detallan de forma clara los derechos de autor, reproducciones y exclusividad para el artista.
          </p>
        </div>

        <div className="bg-[#121220]/60 border border-white/5 p-6 rounded-2xl space-y-3 hover:border-[#7F77DD]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Impulso a la Escena</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fomentamos colaboraciones inéditas, otorgando herramientas digitales potentes para un cobro simplificado y acceso rápido a soporte certificado.
          </p>
        </div>
      </div>

      {/* Corporate Story Details */}
      <div className="bg-gradient-to-r from-[#11111E] to-[#16162a] border border-[#7F77DD]/10 rounded-3xl p-8 md:p-12 gap-8 grid grid-cols-1 md:grid-cols-12 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Star size={13} className="fill-amber-400" /> Nuestra Misión
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Empoderando a productores de Cubatón, Salsatón, Trap y Dembow
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Entendemos los retos de los músicos cubanos para comercializar sus creaciones y acceder a herramientas globales. D'Cuban Beats actúa como la pasarela nativa que garantiza la distribución legal en formatos WAV y MP3 de alta fidelidad, con soporte para Transfermóvil, EnZona y transferencias de cuentas locales.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[#7F77DD]">
            <span>✓ Audios de alta fidelidad</span>
            <span>✓ Contratos certificados</span>
            <span>✓ Cobro instantáneo</span>
          </div>
        </div>
        <div className="md:col-span-5 flex justify-center">
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
            <img 
              referrerPolicy="no-referrer"
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80" 
              alt="Estudio de Grabación"
              className="object-cover w-full h-[220px] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply" />
          </div>
        </div>
      </div>

      {/* Simple Team Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Nuestro Equipo</h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
            El grupo de profesionales que hace posible el desarrollo constante de la escena instrumental en todo el archipiélago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <div 
              key={i} 
              className="bg-[#121220]/45 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:border-white/10 transition-colors"
            >
              <img 
                referrerPolicy="no-referrer"
                src={member.avatar} 
                alt={member.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-[#7F77DD]/40"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{member.name}</h4>
                <p className="text-[11px] font-mono text-[#7F77DD] font-semibold">{member.role}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
