import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, User, Star, ArrowRight, ArrowLeft, Music } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setUser, navigateTo, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorObj, setErrorObj] = useState<{ email?: string; password?: string }>({});

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'El correo electrónico es requerido';
    if (!password) errors.password = 'La contraseña es requerida';

    if (Object.keys(errors).length > 0) {
      setErrorObj(errors);
      addToast('Por favor, ingresa los campos requeridos', 'error');
      return;
    }

    // Determine role based on email or default to client
    const isProd = email.toLowerCase().includes('prod') || email.toLowerCase().includes('chama') || email.toLowerCase().includes('carlos');
    const isAdmin = email.toLowerCase().includes('admin');

    const mockUser = {
      id: isProd ? 'p2' : isAdmin ? 'admin_user' : 'c1',
      name: isProd ? 'Carlos' : isAdmin ? 'Admin' : 'Estudiante',
      email: email,
      role: isProd ? 'producer' as const : isAdmin ? 'admin' as const : 'client' as const,
      artistName: isProd ? 'Flow Habano' : isAdmin ? 'Admin General' : undefined,
      avatarUrl: isProd ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' : undefined,
      plan: isProd ? 'Elite' as const : 'Gratis' as const,
      verified: isProd,
    };

    // If producer, prompt for 2FA !
    if (isProd) {
      addToast('Código de doble factor (2FA) requerido para productores', 'info');
      navigateTo('/2fa');
    } else {
      setUser(mockUser);
    }
  };

  const handleShortcutLogin = (roleType: 'client' | 'producer' | 'admin') => {
    const emailMapping = {
      client: 'comprador@dcubanbeats.cu',
      producer: 'carlitos.flow@gmail.com',
      admin: 'admin@dcubanbeats.cu'
    };
    setEmail(emailMapping[roleType]);
    setPassword('contraseña123');
    addToast(`Preset seleccionado: ${roleType.toUpperCase()}`, 'info');
  };

  return (
    <div className="relative min-h-[calc(100vh-2px)] w-full flex flex-col items-center justify-center bg-[#07070C] p-4 sm:p-8 overflow-hidden">
      
      {/* Dynamic Animated Colored Shadows/Blobs Floating Behind */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Blob 1: Indigo theme */}
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
          className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#534AB7]/20 blur-[100px]"
        />
        
        {/* Blob 2: Violet theme */}
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
          className="absolute bottom-1/3 right-1/4 w-[380px] h-[380px] rounded-full bg-[#7F77DD]/18 blur-[110px]"
        />
        
        {/* Blob 3: Rose theme */}
        <motion.div
          animate={{
            x: [0, 90, -90, 0],
            y: [0, 65, -100, 0],
            scale: [1, 1.2, 0.85, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/3 w-[280px] h-[280px] rounded-full bg-pink-500/8 blur-[90px]"
        />
      </div>

      {/* Floating Logo - Go Home/Catalog */}
      <div 
        onClick={() => navigateTo('/')}
        className="z-10 mb-6 flex items-center justify-center gap-2 cursor-pointer group active:scale-95 transition-all"
        title="Volver al inicio"
      >
        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] flex items-center justify-center text-white shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-105">
          <Music size={18} fill="currentColor" />
        </span>
        <span className="text-white font-bold text-xl tracking-tight">
          D'Cuban<span className="text-[#7F77DD] font-semibold font-mono">[Beats]</span>
        </span>
      </div>

      {/* Actual Form Modal Card Container */}
      <div className="max-w-md w-full bg-[#13131F]/90 backdrop-blur-md border border-[rgba(127,119,221,0.22)] rounded-3xl p-8 shadow-2xl relative z-10 text-left">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-550/10 rounded-xl flex items-center justify-center text-[#7F77DD] mx-auto border border-[rgba(127,119,221,0.15)] bg-[#1c1c2e]">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Inicia Sesión en D'Cuban Beats</h2>
            <p className="text-white/40 text-xs">Accede a tu cuenta de venta y compra estéreo</p>
          </div>

          {/* Shortcut Quick Logins for Evaluator */}
          <div className="bg-[#0D0D14]/90 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">Acceso Rápido de Prueba</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleShortcutLogin('client')}
                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer text-center"
              >
                Comprador
              </button>
              <button 
                onClick={() => handleShortcutLogin('producer')}
                className="px-2 py-1.5 bg-brand-primary-dark/30 hover:bg-brand-primary-dark/50 text-[10px] font-bold text-[#7F77DD] rounded-lg transition-colors cursor-pointer text-center"
              >
                Productor
              </button>
              <button 
                onClick={() => handleShortcutLogin('admin')}
                className="px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold text-amber-400 rounded-lg transition-colors cursor-pointer text-center"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.cu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errorObj.email}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errorObj.password}
            />

            <div className="flex items-center justify-between text-[11px] text-[#7F77DD] pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded bg-[#1C1C2E] border-white/10 text-[#7F77DD] focus:ring-0" />
                Recordarme
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); addToast('Enlace de restablecimiento enviado', 'info'); }} className="hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <Button variant="primary" fullWidth type="submit" className="mt-4 shadow-lg shadow-[#534AB7]/10">
              Entrar a la Cuenta
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </form>

          {/* Footer info link */}
          <div className="text-center pt-2 flex flex-col items-center gap-3">
            <p className="text-xs text-white/40">
              ¿No tienes cuenta?{' '}
              <button 
                onClick={() => navigateTo('/register')}
                className="text-[#7F77DD] hover:underline font-semibold bg-transparent border-none cursor-pointer"
              >
                Regístrate gratis
              </button>
            </p>

            <button
              onClick={() => navigateTo('/')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              <ArrowLeft size={13} />
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

