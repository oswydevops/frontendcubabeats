import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Clock, ShieldCheck, ArrowLeft, LogOut, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../components/layout/BrandLogo';

export const ProducerPendingApproval: React.FC = () => {
  const { user, setUser, navigateTo, addToast, planRequests = [] } = useApp();

  const myRequest = planRequests.find(r => r.producerId === user?.id || r.producerName === user?.artistName);

  const handleCheckStatus = () => {
    if (user?.producerApprovalStatus === 'approved') {
      addToast('¡Tu solicitud ha sido aprobada! Redirigiendo...', 'success');
      navigateTo('/producer/dashboard');
    } else {
      addToast('Tu solicitud continúa en proceso de revisión por la administración.', 'info');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-2px)] w-full flex flex-col items-center justify-center bg-[#07070C] p-4 sm:p-8 overflow-hidden text-left">
      
      {/* Dynamic Animated Colored Shadows/Blobs Floating Behind */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, -45, 0],
            y: [0, -110, 55, 0],
            scale: [1, 1.18, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-amber-500/10 blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 85, 0],
            y: [0, 90, -85, 0],
            scale: [1, 0.88, 1.22, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7F77DD]/15 blur-[120px]"
        />
      </div>

      {/* Floating Logo - Go Home/Catalog */}
      <div 
        onClick={() => navigateTo('/')}
        className="z-10 mb-6 flex items-center justify-center gap-2 cursor-pointer group active:scale-95 transition-all"
        title="Volver al inicio"
      >
        <BrandLogo className="h-20 w-auto transition-transform group-hover:scale-[1.02]" />
      </div>

      {/* Main Review Card Container */}
      <div className="max-w-xl w-full bg-[#13131F]/90 backdrop-blur-md border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-left space-y-6">
        
        {/* Animated Status Header Icon */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Clock size={32} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-black text-[10px] font-bold animate-ping" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-amber-400 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full inline-block">
              Solicitud en Revisión
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white pt-1">
              Tu Registro de Productor está siendo Procesado
            </h1>
            <p className="text-xs text-white/50 leading-relaxed font-normal">
              Nuestro equipo de administración está validando tu transferencia bancaria y datos de vendedor.
            </p>
          </div>
        </div>

        {/* Request Details Box */}
        <div className="bg-[#0D0D14]/90 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3 font-sans">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center justify-between">
            <span>Resumen de la Solicitud</span>
            <span className="text-amber-400 font-mono text-[11px] font-bold flex items-center gap-1">
              ● Pendiente
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-white/40 block text-[10px] uppercase font-mono">Nombre Artístico</span>
              <span className="font-bold text-white truncate block">{user?.artistName || user?.name}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase font-mono">Correo Electrónico</span>
              <span className="font-bold text-white truncate block">{user?.email}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase font-mono">Membresía Solicitada</span>
              <span className="font-bold text-[#7F77DD] block">Plan {user?.plan || 'Pro'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase font-mono">Comprobante</span>
              <span className="font-mono text-emerald-400 font-bold block truncate">
                {myRequest?.transactionId ? `Ref: ${myRequest.transactionId}` : 'Adjuntado'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-indigo-950/40 border border-[#7F77DD]/20 rounded-2xl flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#7F77DD] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/70 leading-relaxed space-y-1">
            <p className="font-bold text-white">¿Qué sucede a continuación?</p>
            <p className="text-[11px] text-white/60">
              Tan pronto como el administrador verifique la transacción, se activará tu cuenta de vendedor. 
              Si tu cuenta aún no ha realizado la verificación de identidad (KYC), se te solicitará subir tu documento al acceder.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleCheckStatus}
            className="bg-gradient-to-r from-[#534AB7] to-[#7F77DD] hover:opacity-90 font-bold text-xs"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Comprobar Estado de Aprobación
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => navigateTo('/')}
              className="text-xs font-semibold"
            >
              <ArrowLeft size={13} className="mr-1.5" />
              Volver al Catálogo
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setUser(null);
                navigateTo('/');
                addToast('Sesión cerrada correctamente', 'info');
              }}
              className="text-xs font-semibold text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
            >
              <LogOut size={13} className="mr-1.5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
