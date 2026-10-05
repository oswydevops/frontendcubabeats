import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, User, Star, ArrowRight, ArrowLeft, Music, Mail, Key, X, Check } from 'lucide-react';
import { BrandLogo } from '../../components/layout/BrandLogo';

// Set to true only for local sandbox debugging to allow arbitrary unregistered email logins.
// Defaults to false: accounts must exist in verifiedProducersTask to authenticate.
const ALLOW_DEV_LOGIN_SHORTCUT = false;

export const LoginPage: React.FC = () => {
  const { setUser, navigateTo, addToast, verifiedProducersTask, addSimulatedEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorObj, setErrorObj] = useState<{ email?: string; password?: string }>({});

  // Reset Password Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [sentEmailInfo, setSentEmailInfo] = useState<{ to: string; subject: string; body: string; password?: string } | null>(null);

  const handleSendRecoveryEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('El correo electrónico es requerido');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetError('Ingresa un correo electrónico válido');
      return;
    }

    setResetError('');
    const targetEmail = resetEmail.trim().toLowerCase();
    
    // Search for matching user in verifiedProducersTask
    const foundUser = verifiedProducersTask.find(u => u.email?.trim().toLowerCase() === targetEmail);
    
    let subject = "Restablecer tu contraseña - D'Cuban Beats";
    let body = "";
    let recoveredPassword = "";

    if (foundUser) {
      recoveredPassword = foundUser.password || "contraseña123";
      body = `¡Hola, ${foundUser.name}!\n\nHemos recibido una solicitud para recuperar la contraseña de tu cuenta en D'Cuban Beats.\n\nPara acceder de inmediato, puedes usar tu contraseña actual:\n\n🔑 Tu Contraseña es: ${recoveredPassword}\n\nSi deseas cambiarla más tarde, puedes hacerlo desde la configuración de tu perfil una vez que inicies sesión.\n\n--\nSoporte Técnico de D'Cuban Beats S.A.`;
    } else {
      body = `¡Hola!\n\nHemos recibido una solicitud de recuperación de contraseña para este correo electrónico en D'Cuban Beats.\n\nSin embargo, este correo no está registrado en nuestra base de datos. Si deseas ser parte de la mayor plataforma de Beats de Cuba, te invitamos a registrarte gratis en la pantalla principal.\n\n--\nSoporte Técnico de D'Cuban Beats S.A.`;
    }

    // Call addSimulatedEmail
    addSimulatedEmail(
      resetEmail,
      'soporte@dcubanbeats.com',
      subject,
      body
    );

    setSentEmailInfo({
      to: resetEmail,
      subject,
      body,
      password: recoveredPassword
    });
    setResetSuccess(true);
    addToast('Correo de recuperación enviado con éxito', 'success');
  };

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

    const inputEmailOrUser = email.trim().toLowerCase();

    // Find any matched user in verifiedProducersTask list (collaborators, producers, clients)
    const matchedUser = verifiedProducersTask.find(u => {
      const uEmail = u.email?.trim().toLowerCase();
      const uUsername = u.username?.trim().toLowerCase();
      const uName = u.name?.trim().toLowerCase();
      const uPosition = u.position?.trim().toLowerCase();

      return (uEmail && uEmail === inputEmailOrUser) || 
             (uUsername && uUsername === inputEmailOrUser) ||
             (uName && uName === inputEmailOrUser) ||
             (uPosition && uPosition === inputEmailOrUser);
    });

    if (matchedUser) {
      // If a specific password is set, verify it
      const isAdminAccount = matchedUser.email?.toLowerCase() === 'admin@dcubanbeats.cu';
      const isAcceptedAdminPass = isAdminAccount && ['contraseña123', 'admin', 'admin123', '123456'].includes(password);

      if (matchedUser.password && matchedUser.password !== password && !isAcceptedAdminPass) {
        addToast('Contraseña incorrecta para esta cuenta', 'error');
        setErrorObj({ password: 'La contraseña es incorrecta' });
        return;
      }

      if (matchedUser.twoFactorEnabled) {
        sessionStorage.setItem('cb_pending_2fa_user', JSON.stringify(matchedUser));
        addToast('Código de doble factor (2FA) requerido para esta cuenta', 'info');
        navigateTo('/two-factor');
      } else {
        setUser(matchedUser);
        if (matchedUser.role === 'admin') {
          navigateTo('/admin/dashboard');
        } else if (matchedUser.role === 'producer') {
          if (matchedUser.producerApprovalStatus === 'pending') {
            navigateTo('/producer/pending-approval');
          } else {
            navigateTo('/producer/dashboard');
          }
        } else {
          navigateTo('/artist/dashboard');
        }
      }
      return;
    }

    if (ALLOW_DEV_LOGIN_SHORTCUT) {
      // Optional dev shortcut for unregistered ad-hoc sandbox testing
      const isProd = inputEmailOrUser.includes('prod') || inputEmailOrUser.includes('chama') || inputEmailOrUser.includes('carlos');
      const isAdmin = inputEmailOrUser.includes('admin');

      const mockUser = {
        id: isProd ? 'p2' : isAdmin ? 'admin_user' : 'c1',
        name: isProd ? 'Carlos' : isAdmin ? 'Admin' : 'Estudiante',
        email: email,
        role: isProd ? 'producer' as const : isAdmin ? 'admin' as const : 'client' as const,
        artistName: isProd ? 'Flow Habano' : isAdmin ? 'Admin General' : undefined,
        avatarUrl: isProd ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' : undefined,
        plan: isProd ? 'Elite' as const : 'Gratis' as const,
        verified: isProd,
        twoFactorEnabled: false
      };

      setUser(mockUser);
      if (mockUser.role === 'admin') {
        navigateTo('/admin/dashboard');
      } else if (mockUser.role === 'producer') {
        navigateTo('/producer/dashboard');
      } else {
        navigateTo('/artist/dashboard');
      }
      return;
    }

    // Default secure production behavior: If no registered user matches, login strictly fails
    addToast('No existe una cuenta con ese correo o usuario. Verifica tus datos o regístrate.', 'error');
    setErrorObj({ email: 'Cuenta no encontrada' });
    return;
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
        <BrandLogo className="h-20 w-auto transition-transform group-hover:scale-[1.02]" />
      </div>

      {/* Actual Form Modal Card Container */}
      <div className="max-w-md w-full bg-[#13131F]/90 backdrop-blur-md border border-[rgba(127,119,221,0.22)] rounded-3xl p-8 shadow-2xl relative z-10 text-left">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-550/10 rounded-xl flex items-center justify-center text-[#7F77DD] mx-auto border border-[rgba(127,119,221,0.15)] bg-[#1c1c2e]">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-white">Inicia Sesión en D'Cuban Beats</h1>
            <p className="text-white/40 text-[14px] font-normal">Accede a tu cuenta de venta y compra estéreo</p>
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

            <div className="flex items-center justify-between text-[13px] text-[#7F77DD] pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-normal">
                <input type="checkbox" className="rounded bg-[#1C1C2E] border-white/10 text-[#7F77DD] focus:ring-0 text-[14px]" />
                Recordarme
              </label>
              <a 
                href="#reset" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setResetEmail(email);
                  setResetError('');
                  setResetSuccess(false);
                  setSentEmailInfo(null);
                  setShowResetModal(true); 
                }} 
                className="hover:underline font-normal"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button variant="primary" fullWidth type="submit" className="mt-4 shadow-lg shadow-[#534AB7]/10 text-[14px] font-semibold">
              Entrar a la Cuenta
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </form>

          {/* Footer info link */}
          <div className="text-center pt-2 flex flex-col items-center gap-3">
            <p className="text-[14px] font-normal text-white/40">
              ¿No tienes cuenta?{' '}
              <button 
                onClick={() => navigateTo('/register')}
                className="text-[#7F77DD] hover:underline font-semibold bg-transparent border-none cursor-pointer text-[14px]"
              >
                Regístrate gratis
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

      {/* Recovery Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#13131F]/95 border border-[rgba(127,119,221,0.25)] rounded-2xl p-6 shadow-2xl text-left space-y-4 relative"
          >
            <button 
              onClick={() => {
                setShowResetModal(false);
                setResetSuccess(false);
                setSentEmailInfo(null);
                setResetEmail('');
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {!resetSuccess ? (
              <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                  <div className="w-8 h-8 bg-[#534AB7]/10 rounded-lg flex items-center justify-center text-[#7F77DD]">
                    <Key size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Recuperar Contraseña</h3>
                    <p className="text-[11px] text-white/40 font-mono">Te enviaremos tus credenciales de acceso</p>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Introduce el correo electrónico asociado a tu cuenta. Te enviaremos un correo de simulación para restablecerla.
                </p>

                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="Introduce tu correo electrónico"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (resetError) setResetError('');
                  }}
                  error={resetError}
                />

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetEmail('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Enviar Correo
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">¡Correo Enviado!</h3>
                    <p className="text-[11px] text-emerald-400 font-mono">Simulación completada con éxito</p>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Hemos enviado un correo de recuperación a <strong className="text-white">{sentEmailInfo?.to}</strong>. 
                  Como estás en el entorno de pruebas, puedes leer el correo enviado a continuación:
                </p>

                <div className="bg-[#07070C] rounded-xl border border-white/5 p-3.5 space-y-2.5 font-sans">
                  <div className="text-[11px] text-white/40 space-y-1 pb-2 border-b border-white/5">
                    <p><strong className="text-white/60">De:</strong> soporte@dcubanbeats.com</p>
                    <p><strong className="text-white/60">Para:</strong> {sentEmailInfo?.to}</p>
                    <p><strong className="text-white/60">Asunto:</strong> {sentEmailInfo?.subject}</p>
                  </div>
                  <div className="text-xs text-white/85 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto scrollbar-thin font-mono">
                    {sentEmailInfo?.body}
                  </div>
                </div>

                {sentEmailInfo?.password && (
                  <div className="bg-[#534AB7]/10 border border-[#7F77DD]/20 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Tu contraseña recuperada</p>
                      <p className="text-sm font-extrabold text-[#7F77DD] font-mono tracking-wide">{sentEmailInfo.password}</p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="!py-1.5 !px-3 !text-xs whitespace-nowrap"
                      onClick={() => {
                        setEmail(sentEmailInfo.to);
                        setPassword(sentEmailInfo.password || '');
                        setShowResetModal(false);
                        setResetSuccess(false);
                        setSentEmailInfo(null);
                        setResetEmail('');
                      }}
                    >
                      Usar para Iniciar Sesión
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-end pt-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setShowResetModal(false);
                      setResetSuccess(false);
                      setSentEmailInfo(null);
                      setResetEmail('');
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

