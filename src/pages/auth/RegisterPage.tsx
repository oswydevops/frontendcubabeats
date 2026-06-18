import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Music, Check, Sparkles, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { setUser, navigateTo, plans, addToast, addAdminNotification } = useApp();
  const [role, setRole] = useState<'client' | 'producer'>('client');
  const [selectedPlan, setSelectedPlan] = useState('p_pro'); // Default preset Pro card
  
  // Registration data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic visual validation calculation
  const { totalRequired, filledCount, progressPercent, isPlanSelected } = useMemo(() => {
    const requiredFields = role === 'producer' ? ['name', 'email', 'password', 'artistName'] : ['name', 'email', 'password'];
    let filled = 0;
    if (name.trim()) filled++;
    if (email.trim() && email.includes('@')) filled++;
    if (password.trim() && password.length >= 6) filled++;
    if (role === 'producer' && artistName.trim()) filled++;
    
    const countRequired = requiredFields.length;
    const percent = Math.round((filled / countRequired) * 100);
    return {
      totalRequired: countRequired,
      filledCount: filled,
      progressPercent: percent,
      isPlanSelected: !!selectedPlan
    };
  }, [role, name, email, password, artistName, selectedPlan]);

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
    if (role === 'producer' && !artistName.trim()) tempErrors.artistName = 'El nombre artístico de productor es requerido';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      addToast('Hay errores u omisiones en campos obligatorios', 'error');
      return;
    }

    const planName = plans.find(p => p.id === selectedPlan)?.name || 'Gratis';

    const newUser = {
      id: role === 'producer' ? 'p2_carlos_registered' : 'c_new',
      name: name,
      email: email,
      role: role,
      artistName: role === 'producer' ? artistName : undefined,
      instagram: role === 'producer' ? instagram : undefined,
      plan: role === 'producer' ? planName as 'Gratis' | 'Pro' | 'Elite' : 'Gratis' as const,
      verified: false, // Must pass KYC
    };

    addToast('¡Registro completado con éxito!', 'success');
    
    // Trigger Admin notifications
    const targetRoleLabel = role === 'producer' ? 'Productor' : 'Cliente';
    const targetNameLabel = role === 'producer' ? (artistName || name) : name;
    
    addAdminNotification(
      'user_registered',
      `Nuevo ${targetRoleLabel} Registrado`,
      `El ${targetRoleLabel.toLowerCase()} "${targetNameLabel}" (${email}) ha creado su cuenta en CubaBeats.`
    );

    if (role === 'producer' && planName !== 'Gratis') {
      const planPrice = plans.find(p => p.id === selectedPlan)?.price || 0;
      addAdminNotification(
        'plan_purchased',
        'Nueva Membresía Adquirida',
        `El productor "${targetNameLabel}" se ha suscrito al ${planName} con un costo de $${planPrice} CUP/mes.`
      );
    }
    
    if (role === 'producer') {
      setUser(newUser);
      addToast('Es obligatorio verificar tu identidad (KYC) antes de publicar beats.', 'info');
      navigateTo('/kyc'); // Route to ID upload flow
    } else {
      setUser(newUser);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-8 shadow-2xl text-left relative">
      <div className="space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <Badge variant="purple">Registro de Cuentas</Badge>
          <h2 className="text-2xl font-bold tracking-tight text-white">Únete a la Familia CubaBeats</h2>
          <p className="text-white/40 text-xs">Busca ritmos únicos o empieza a monetizar tus pistas hoy mismo</p>
        </div>

        {/* Dynamic Role Tab Buttons Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#0D0D14] rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setRole('client');
              setErrors({});
            }}
            className={`py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              role === 'client' 
                ? 'bg-[#1C1C2E] text-[#7F77DD] shadow-md border border-[rgba(127,119,221,0.2)]' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <User size={14} />
            Soy Comprador (Artista)
          </button>
          
          <button
            type="button"
            onClick={() => {
              setRole('producer');
              setErrors({});
            }}
            className={`py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              role === 'producer' 
                ? 'bg-[#1C1C2E] text-[#7F77DD] shadow-md border border-[rgba(127,119,221,0.2)]' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Music size={14} />
            Soy Productor (Vendedor)
          </button>
        </div>

        {/* Visual Validation Progress Module */}
        <div className="p-4 bg-[#0D0D14] border border-white/5 rounded-2xl space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Compleción de Campos Obligatorios</span>
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
              <span>Por favor complete todos los datos obligatorios marcados con asterisco (*)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <Check size={13} className="text-emerald-500 animate-bounce" />
              <span>¡Listo! Todos los campos de registro requeridos han sido completados.</span>
            </div>
          )}
        </div>

        {/* Form elements */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Nombre Completo * ${name.trim() ? '(✓ Listo)' : '(Requerido)'}`}
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
              label={`Correo Electrónico * ${email.trim() && email.includes('@') ? '(✓ Listo)' : '(Requerido)'}`}
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
            <Input
              label={`Contraseña * ${password.trim() && password.length >= 6 ? '(✓ Listo)' : '(Requerido)'}`}
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
            
            {role === 'client' ? (
              <Input
                label="Usuario de Artista (Opcional)"
                placeholder="@artista_flow"
              />
            ) : (
              <Input
                label={`Nombre de Productor Musical * ${artistName.trim() ? '(✓ Listo)' : '(Requerido)'}`}
                placeholder="Ej. Flow Habano"
                value={artistName}
                onChange={(e) => {
                  setArtistName(e.target.value);
                  if (errors.artistName) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.artistName;
                      return next;
                    });
                  }
                }}
                error={errors.artistName}
                className={`${artistName.trim() ? 'border-emerald-500/40 focus:border-emerald-400' : errors.artistName ? 'border-brand-accent-red/80' : ''}`}
              />
            )}
          </div>

          {role === 'producer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Usuario Instagram (Opcional)"
                placeholder="@mi_instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
              <div className="bg-[#1C1C2E] rounded-xl p-3 border border-dashed border-white/5 flex items-center gap-1.5 text-[11px] text-white/50">
                <Sparkles size={14} className="text-brand-accent-amber" />
                <span>Recibe transferencias de Transfermóvil certificadas por SMS.</span>
              </div>
            </div>
          )}

          {/* Producer Plan Picker if role is producer */}
          {role === 'producer' && (
            <div className="space-y-3 pt-3 border-t border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Selecciona un Plan de Membresía</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlan(pl.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPlan === pl.id 
                        ? 'bg-brand-primary/10 border-brand-primary-light shadow-md' 
                        : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block text-white">{pl.name}</span>
                        {selectedPlan === pl.id && <Check size={14} className="text-brand-primary-light" />}
                      </div>
                      <span className="text-xs font-semibold text-white/40 block mt-1">
                        {pl.price === 0 ? 'Gratis' : `$${pl.price} CUP/mes`}
                      </span>
                    </div>

                    <div className="text-[10px] text-white/50 mt-3 space-y-1">
                      <div>Límite: {pl.limit === 999 ? 'Ilimitados' : `${pl.limit} beats`}</div>
                      <div>Comisión: {pl.commission}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            variant={progressPercent === 100 ? "primary" : "secondary"} 
            fullWidth 
            type="submit" 
            className={`mt-4 ${progressPercent === 100 ? '' : 'opacity-80 border-dashed border-amber-500/50 text-amber-500 hover:bg-amber-500/5'}`}
          >
            {progressPercent === 100 ? 'Registrar mi Cuenta ✓' : `Completa los Datos Obligatorios (${filledCount}/${totalRequired})`}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-white/40">
            ¿Ya tienes una cuenta?{' '}
            <button 
              onClick={() => navigateTo('/login')}
              className="text-[#7F77DD] hover:underline font-semibold bg-transparent border-none cursor-pointer"
            >
              Inicia sesión
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
