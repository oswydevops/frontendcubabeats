import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Check, AlertCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from '../../components/layout/BrandLogo';

export const RegisterPage: React.FC = () => {
  const { setUser, navigateTo, addToast, addAdminNotification } = useApp();
  
  // Registration data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic visual validation calculation
  const { totalRequired, filledCount, progressPercent } = useMemo(() => {
    let filled = 0;
    if (name.trim()) filled++;
    if (email.trim() && email.includes('@')) filled++;
    if (password.trim() && password.length >= 6) filled++;
    
    const countRequired = 3;
    const percent = Math.round((filled / countRequired) * 100);
    return {
      totalRequired: countRequired,
      filledCount: filled,
      progressPercent: percent,
    };
  }, [name, email, password]);

  // Password strength checker helper
  const passwordStrength = useMemo(() => {
    if (!password) {
      return { score: 0, color: 'bg-transparent', label: '', width: 'w-0' };
    }
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score, color: 'bg-red-500', label: 'Débil', width: 'w-1/3' };
    } else if (score === 3) {
      return { score, color: 'bg-yellow-500', label: 'Media', width: 'w-2/3' };
    } else {
      return { score, color: 'bg-emerald-500', label: 'Fuerte', width: 'w-full' };
    }
  }, [password]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!name.trim()) tempErrors.name = 'El nombre completo es requerido';
    if (!email.trim()) {
      tempErrors.email = 'El correo electrónico es requerido';
    } else if (!email.includes('@')) {
      tempErrors.email = 'El correo debe ser válido (ejemplo@correo.cu)';
    }
    if (!password.trim()) {
      tempErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      tempErrors.password = 'La contraseña debe tener un mínimo de 6 caracteres';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      addToast('Hay errores u omisiones en campos obligatorios', 'error');
      return;
    }

    const newUserId = `c_${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: 'client' as const,
      artistName: artistName.trim() || undefined,
      plan: 'Gratis' as const,
      verified: false,
    };

    addToast('¡Registro completado con éxito! Bienvenido a D\'Cuban Beats', 'success');
    
    // Trigger Admin notifications
    addAdminNotification(
      'user_registered',
      'Nuevo Cliente / Artista Registrado',
      `El artista "${artistName.trim() || name.trim()}" (${email}) ha creado su cuenta en D'Cuban Beats.`
    );

    setUser(newUser);
  };

  return (
    <div className="relative min-h-[calc(100vh-2px)] w-full flex flex-col items-center justify-center bg-[#07070C] p-4 sm:p-8 overflow-hidden text-left">
      
      {/* Dynamic Animated Colored Shadows/Blobs Floating Behind */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 90, -50, 0],
            y: [0, -100, 60, 0],
            scale: [1, 1.15, 0.92, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-[#534AB7]/18 blur-[110px]"
        />
        
        <motion.div
          animate={{
            x: [0, -80, 75, 0],
            y: [0, 100, -75, 0],
            scale: [1, 0.9, 1.25, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7F77DD]/15 blur-[120px]"
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

      {/* Form Card Container */}
      <div className="max-w-xl w-full bg-[#13131F]/90 backdrop-blur-md border border-[rgba(127,119,221,0.22)] rounded-3xl p-8 shadow-2xl relative z-10 text-left">
        <div className="space-y-6">
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            <Badge variant="purple">Registro de Artista</Badge>
            <h1 className="text-[24px] font-bold tracking-tight text-white">Crea tu Cuenta de Artista</h1>
            <p className="text-white/40 text-[14px] font-normal">Encuentra y adquiere licencias de beats únicos para tus proyectos</p>
          </div>

          {/* Visual Validation Progress Module */}
          <div className="p-4 bg-[#0D0D14]/90 border border-white/5 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Campos Obligatorios</span>
              <span className={`text-[11px] font-mono font-extrabold ${progressPercent === 100 ? 'text-emerald-400' : 'text-[#7F77DD]'}`}>
                {progressPercent}% ({filledCount} de {totalRequired})
              </span>
            </div>
            
            <div className="w-full bg-[#1C1C2E] h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  progressPercent === 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-[#10B981]' 
                    : 'bg-gradient-to-r from-[#534AB7] to-[#7F77DD]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {progressPercent < 100 ? (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-medium">
                <AlertCircle size={13} className="text-amber-500" />
                <span>Completa los campos obligatorios (*)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                <Check size={13} className="text-emerald-500 animate-bounce" />
                <span>¡Listo para registrar tu cuenta!</span>
              </div>
            )}
          </div>

          {/* Form elements */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre Completo *"
                placeholder="Ej. Carlos Santana"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                error={errors.name}
                className={`${name.trim() ? 'border-emerald-500/40 focus:border-emerald-400' : errors.name ? 'border-brand-accent-red/80' : ''}`}
              />

              <Input
                label="Correo Electrónico *"
                type="email"
                placeholder="correo@ejemplo.cu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                error={errors.email}
                className={`${email.trim() && email.includes('@') ? 'border-emerald-500/40 focus:border-emerald-400' : errors.email ? 'border-brand-accent-red/80' : ''}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 justify-start">
                <Input
                  label="Contraseña *"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  error={errors.password}
                  className={`${password.trim() && password.length >= 6 ? 'border-emerald-500/40 focus:border-emerald-400' : errors.password ? 'border-brand-accent-red/80' : ''}`}
                />
                {password && (
                  <div className="px-1 space-y-1.5 transition-all duration-300">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/45">Fortaleza:</span>
                      <span className={`font-bold tracking-wider uppercase ${
                        passwordStrength.label === 'Débil' ? 'text-red-400' :
                        passwordStrength.label === 'Media' ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                    </div>
                  </div>
                )}
              </div>
              
              <Input
                label="Nombre Artístico (Opcional)"
                placeholder="Ej. MC Habana"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>

            <Button 
              variant={progressPercent === 100 ? "primary" : "secondary"} 
              fullWidth 
              type="submit" 
              className={`mt-4 shadow-lg text-[14px] font-semibold ${progressPercent === 100 ? 'shadow-[#534AB7]/10' : 'opacity-80 border-dashed border-amber-500/50 text-amber-500 hover:bg-amber-500/5'}`}
            >
              {progressPercent === 100 ? 'Registrar mi Cuenta ✓' : `Completa los Datos Obligatorios (${filledCount}/${totalRequired})`}
            </Button>

            <p className="text-[11px] text-center text-white/40 leading-relaxed px-2">
              Al hacer clic en <strong className="text-white/70">"Registrar mi Cuenta"</strong>, declaras ser mayor de edad y aceptas plenamente los{' '}
              <button
                type="button"
                onClick={() => navigateTo('/terminos')}
                className="text-[#7F77DD] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer text-[11px]"
              >
                Términos y Condiciones
              </button>{' '}
              y las{' '}
              <button
                type="button"
                onClick={() => navigateTo('/privacidad')}
                className="text-[#7F77DD] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer text-[11px]"
              >
                Políticas de Privacidad
              </button>{' '}
              de D'Cuban Beats.
            </p>
          </form>

          <div className="text-center flex flex-col items-center gap-3 pt-2">
            <p className="text-[14px] font-normal text-white/40">
              ¿Ya tienes una cuenta?{' '}
              <button 
                onClick={() => navigateTo('/login')}
                className="text-[#7F77DD] hover:underline font-semibold bg-transparent border-none cursor-pointer text-[14px]"
              >
                Inicia sesión
              </button>
            </p>

            <button
              onClick={() => navigateTo('/')}
              className="inline-flex items-center gap-1.5 text-[14px] font-normal text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
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
