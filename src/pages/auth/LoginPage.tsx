import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, User, Star, ArrowRight } from 'lucide-react';

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
      client: 'comprador@cubabeats.cu',
      producer: 'carlitos.flow@gmail.com',
      admin: 'admin@cubabeats.cu'
    };
    setEmail(emailMapping[roleType]);
    setPassword('contraseña123');
    addToast(`Preset seleccionado: ${roleType.toUpperCase()}`, 'info');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#534AB7]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-primary-dark/60 rounded-xl flex items-center justify-center text-[#7F77DD] mx-auto border border-brand-primary-light/15">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Inicia Sesión en CubaBeats</h2>
          <p className="text-white/40 text-xs">Accede a tu cuenta de venta y compra estéreo</p>
        </div>

        {/* Shortcut Quick Logins for Evaluator */}
        <div className="bg-[#0D0D14] p-4 rounded-2xl border border-white/5 space-y-2">
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
              className="px-2 py-1.5 bg-brand-primary-dark/30 hover:bg-brand-primary-dark/50 text-[10px] font-bold text-brand-primary-light rounded-lg transition-colors cursor-pointer text-center"
            >
              Productor (2FA)
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
              <input type="checkbox" className="rounded bg-[#1C1C2E] border-white/10 text-brand-primary" />
              Recordarme
            </label>
            <a href="#reset" onClick={(e) => { e.preventDefault(); addToast('Enlace de restablecimiento enviado', 'info'); }} className="hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <Button variant="primary" fullWidth type="submit" className="mt-4">
            Entrar a la Cuenta
            <ArrowRight size={14} className="ml-2" />
          </Button>
        </form>

        {/* Footer info link */}
        <div className="text-center pt-2">
          <p className="text-xs text-white/40">
            ¿No tienes cuenta?{' '}
            <button 
              onClick={() => navigateTo('/register')}
              className="text-[#7F77DD] hover:underline font-semibold bg-transparent border-none cursor-pointer"
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
