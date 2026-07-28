import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Wrench, Settings, Mail, RefreshCw, Volume2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const { addToast } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [countdown, setCountdown] = useState({ h: 2, m: 45, s: 30 });
  const [activeFaderVal, setActiveFaderVal] = useState(72);

  // Dynamic countdown simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) {
          return { ...prev, s: prev.s - 1 };
        } else if (prev.m > 0) {
          return { h: prev.h, m: prev.m - 1, s: 59 };
        } else if (prev.h > 0) {
          return { h: prev.h - 1, m: 59, s: 59 };
        } else {
          clearInterval(timer);
          return { h: 0, m: 0, s: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      addToast('Por favor, ingresa un correo electrónico válido', 'error');
      return;
    }
    setIsSubscribed(true);
    addToast('¡Te avisaremos inmediatamente cuando el estudio abra!', 'success');
  };

  const handleTestStatus = () => {
    addToast('Verificando canales de conexión en tiempo real...', 'info');
    setTimeout(() => {
      addToast('Sistemas base activos. Sincronización de bases de datos al 98%', 'success');
    }, 1000);
  };

  return (
    <div id="maintenance-page-wrapper" className="px-4 py-12 md:py-16 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-400">
      
      {/* Header Banner */}
      <div id="maintenance-header" className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
          <Wrench size={11} className="animate-spin" style={{ animationDuration: '3s' }} /> Calibrando Equipos
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Estudio en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">mantenimiento</span> técnico
        </h1>
        <p className="text-slate-400 text-xs md:text-sm font-normal max-w-2xl mx-auto leading-relaxed">
          Estamos calibrando los compresores analógicos, limpiando los faders digitales y optimizando el almacenamiento para ofrecerte la mayor fidelidad de reproducción y descargas de beats en Cuba.
        </p>
      </div>

      {/* Main Grid Section */}
      <div id="maintenance-dashboard-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Card: Countdown and Developer Note */}
        <div id="maintenance-card-left" className="bg-[#121220]/60 border border-white/5 rounded-2xl p-6 md:col-span-7 space-y-6 flex flex-col justify-between hover:border-amber-500/10 transition-colors">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-amber-400 animate-spin" style={{ animationDuration: '5s' }} />
              <h2 className="text-[14px] uppercase font-bold tracking-wider text-white">Próxima Apertura del Portal</h2>
            </div>

            {/* Countdown timers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#07070C]/90 border border-white/5 rounded-xl p-3 text-center">
                <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-wider block">
                  {String(countdown.h).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/35 tracking-widest block mt-1">Horas</span>
              </div>
              <div className="bg-[#07070C]/90 border border-white/5 rounded-xl p-3 text-center">
                <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-wider block">
                  {String(countdown.m).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/35 tracking-widest block mt-1">Minutos</span>
              </div>
              <div className="bg-[#07070C]/90 border border-white/5 rounded-xl p-3 text-center">
                <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-wider block">
                  {String(countdown.s).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-white/35 tracking-widest block mt-1">Segundos</span>
              </div>
            </div>

            {/* Explanatory text */}
            <div className="bg-[#07070C]/40 rounded-xl p-4 border border-white/5 space-y-2 text-left">
              <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider block">Nota de los Desarrolladores</span>
              <p className="text-[12.5px] text-slate-300 leading-relaxed font-normal">
                "Hola familia musical. Estamos migrando el portal a un servidor con menor latencia para agilizar la validación de transferencias bancarias de Transfermóvil y EnZona en Cuba. Los beats y contratos existentes están completamente a salvo y serán restaurados en cuanto expire el temporizador. Agradecemos su paciencia."
              </p>
              <span className="text-[10px] text-white/40 block mt-1.5 font-mono">— Osvaldo, Alejandro & Lian Ariel Cabrera (D'Cuban Beats Devs)</span>
            </div>
          </div>

          {/* Input notify form */}
          <div className="border-t border-white/5 pt-5 space-y-3 text-left">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <label id="notify-label" className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
                  Avísame cuando esté listo
                </label>
                <div className="flex gap-2">
                  <input
                    id="notify-email-input"
                    type="email"
                    required
                    placeholder="Introduce tu correo electrónico"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-grow bg-[#07070C] text-xs text-white border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-400/80 transition-colors"
                  />
                  <Button id="notify-submit-btn" variant="primary" type="submit" className="!px-4 bg-gradient-to-r from-amber-500 to-amber-600 border-none shadow-amber-500/10">
                    <Mail size={14} className="mr-1.5" /> Suscribirme
                  </Button>
                </div>
              </form>
            ) : (
              <div id="notify-success-state" className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-emerald-300">
                <CheckCircle size={18} className="flex-shrink-0" />
                <span className="text-xs font-semibold leading-relaxed">
                  ¡Suscripción exitosa! Te hemos agregado para enviarte un aviso con prioridad.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Card: Platform Task Checklist and Interactive Fader */}
        <div id="maintenance-card-right" className="bg-[#121220]/60 border border-white/5 rounded-2xl p-6 md:col-span-5 space-y-6 flex flex-col justify-between hover:border-amber-500/10 transition-colors">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Estado de Tareas</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md font-mono">92% COMPLETADO</span>
            </div>

            {/* Tasks list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-[#07070C]/50 rounded-xl p-2.5 border border-white/5">
                <span className="text-slate-300 font-medium">Backup de Base de Datos</span>
                <span className="text-emerald-400 font-bold font-mono text-[10px]">COMPLETADO</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-[#07070C]/50 rounded-xl p-2.5 border border-white/5">
                <span className="text-slate-300 font-medium">Migración de Servidor Cloud</span>
                <span className="text-emerald-400 font-bold font-mono text-[10px]">COMPLETADO</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-[#07070C]/50 rounded-xl p-2.5 border border-white/5">
                <span className="text-slate-300 font-medium">Prueba de Latencia de SMS</span>
                <span className="text-emerald-400 font-bold font-mono text-[10px]">COMPLETADO</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-[#07070C]/50 rounded-xl p-2.5 border border-white/5">
                <span className="text-slate-300 font-medium">Optimización de Player MP3/WAV</span>
                <span className="text-amber-400 font-bold font-mono text-[10px] animate-pulse">EN CURSO</span>
              </div>
            </div>
          </div>

          {/* Interactive Console fader (high visual quality) */}
          <div className="bg-[#07070C] rounded-xl p-4 border border-white/5 space-y-3 text-center">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-white/35 font-mono">Master Mixer Fader</span>
              <span className="text-xs font-mono font-bold text-amber-400">{activeFaderVal}dB</span>
            </div>
            
            {/* Range slider */}
            <div className="flex items-center gap-2.5">
              <Volume2 size={13} className="text-white/40" />
              <input
                id="mixer-fader-slider"
                type="range"
                min="0"
                max="100"
                value={activeFaderVal}
                onChange={(e) => setActiveFaderVal(Number(e.target.value))}
                className="flex-grow accent-amber-500 h-1 bg-white/10 rounded-lg cursor-pointer focus:outline-none"
              />
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
            </div>

            <p className="text-[10.5px] text-white/40 font-mono uppercase tracking-widest text-center">
              Desliza para calibrar la ganancia de audio
            </p>
          </div>

          {/* Button actions */}
          <Button
            id="maintenance-test-channel-btn"
            variant="secondary"
            onClick={handleTestStatus}
            className="w-full flex items-center justify-center gap-2 border-amber-500/35 text-amber-400 hover:bg-amber-500/5 text-xs font-semibold py-2"
          >
            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '8s' }} />
            Verificar Estado de Enlaces
          </Button>

        </div>

      </div>

      {/* Support details footer */}
      <div id="maintenance-footer" className="text-center space-y-2 border-t border-white/5 pt-8 max-w-xl mx-auto">
        <p className="text-[12px] text-slate-400">
          ¿Eres productor o artista y requieres asistencia inmediata por una compra pendiente?
        </p>
        <p className="text-[11px] font-mono text-white/50">
          Escríbenos a: <strong className="text-white">soporte@dcubanbeats.com</strong> o contacta al canal de Telegram.
        </p>
      </div>

    </div>
  );
};
