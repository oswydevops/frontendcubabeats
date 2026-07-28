import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Lock, Shield, Key, Copy, Check, QrCode, Download, 
  Smartphone, ShieldCheck, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { user, updateUserProfile, addToast } = useApp();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA simulation state
  const [copiedKey, setCopiedKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isActivating2FA, setIsActivating2FA] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);

  // Simulated secret key
  const simulatedSecretKey = useMemo(() => {
    return user?.twoFactorSecret || `DCUBAN-BEATS-2FAS-${user?.id?.toUpperCase() || 'USER'}-SECRETKEY2026`;
  }, [user?.twoFactorSecret, user?.id]);

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      addToast('Por favor, completa todos los campos de contraseña', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('La nueva contraseña y su confirmación no coinciden', 'error');
      return;
    }

    setIsChangingPassword(true);

    // Simulate saving password
    setTimeout(() => {
      updateUserProfile({
        password: newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      addToast('¡Contraseña actualizada con éxito!', 'success');
    }, 800);
  };

  // Handle Copy Secret Key
  const handleCopyKey = () => {
    navigator.clipboard.writeText(simulatedSecretKey);
    setCopiedKey('copied');
    addToast('Clave secreta copiada al portapapeles', 'success');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Toggle 2FA switch
  const handleToggle2FA = () => {
    if (user?.twoFactorEnabled) {
      updateUserProfile({
        twoFactorEnabled: false
      });
      setIsSettingUp2FA(false);
      addToast('Verificación en dos pasos (2FA) desactivada correctamente.', 'info');
    } else if (isSettingUp2FA) {
      setIsSettingUp2FA(false);
      addToast('Configuración de 2FA cancelada.', 'info');
    } else {
      setIsSettingUp2FA(true);
      addToast('Iniciando proceso de vinculación con 2FAS...', 'info');
    }
  };

  // Handle 2FA activation
  const handleActivate2FA = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.trim().length !== 6) {
      addToast('Por favor, ingresa el código de 6 dígitos de tu app 2FAS', 'error');
      return;
    }

    if (isNaN(Number(verificationCode))) {
      addToast('El código de verificación debe ser numérico', 'error');
      return;
    }

    setIsActivating2FA(true);

    // Simulate validation and activation
    setTimeout(() => {
      updateUserProfile({
        twoFactorEnabled: true,
        twoFactorSecret: simulatedSecretKey
      });
      setVerificationCode('');
      setIsActivating2FA(false);
      setIsSettingUp2FA(false);
      addToast('¡Verificación en dos pasos (2FA) activada correctamente!', 'success');
    }, 1000);
  };

  // Handle 2FA deactivation
  const handleDeactivate2FA = () => {
    if (confirm('¿Estás seguro de que deseas desactivar la verificación en dos pasos con 2FAS? Esto reducirá la seguridad de tu cuenta.')) {
      updateUserProfile({
        twoFactorEnabled: false
      });
      setIsSettingUp2FA(false);
      addToast('Verificación en dos pasos (2FA) desactivada correctamente.', 'info');
    }
  };

  const isToggleOn = !!user?.twoFactorEnabled || isSettingUp2FA;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left text-white bg-brand-bg select-none">
      
      {/* Columna izquierda: Cambio de Contraseña */}
      <div className="lg:col-span-5 space-y-6">
        <form onSubmit={handlePasswordChange} className="bg-[#13131F] border border-brand-border/25 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-brand-border/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Lock size={16} className="text-[#7F77DD]" /> Cambio de Contraseña
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Actualiza periódicamente tu contraseña para proteger tu catálogo, transferencias e información.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-[#7F77DD] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-[#7F77DD] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-[#7F77DD] transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold text-xs shadow-md py-2.5 flex items-center justify-center gap-2"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Key size={13} />
                  Actualizar Contraseña
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="bg-[#13131F]/40 border border-brand-border/20 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#7F77DD] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-white">Requisitos de contraseña</span>
            <p className="text-[10.5px] text-gray-400 leading-relaxed">
              Te recomendamos utilizar una combinación de letras mayúsculas, minúsculas, números y caracteres especiales (como @, #, $, etc.) que no utilices en otros servicios web.
            </p>
          </div>
        </div>
      </div>

      {/* Columna derecha: Verificación en 2 pasos con 2FAS */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#13131F] border border-brand-border/25 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-brand-border/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#7F77DD]" /> Verificación en dos pasos (2FA) con 2FAS
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Protege tu cuenta activando o desactivando la autenticación de doble factor.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center bg-[#0C0C14] px-3 py-1.5 rounded-xl border border-white/5">
              <span className={`text-xs font-bold ${user?.twoFactorEnabled ? 'text-emerald-400' : isSettingUp2FA ? 'text-indigo-300' : 'text-gray-400'}`}>
                {user?.twoFactorEnabled ? 'Habilitado' : isSettingUp2FA ? 'En Configuración' : 'Deshabilitado'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isToggleOn}
                onClick={handleToggle2FA}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7F77DD] focus:ring-offset-2 focus:ring-offset-[#13131F] ${
                  isToggleOn ? 'bg-[#534AB7]' : 'bg-gray-700'
                }`}
                title={isToggleOn ? 'Desactivar / Cancelar 2FA' : 'Activar 2FA'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isToggleOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {user?.twoFactorEnabled ? (
            /* STATE 1: 2FA ACTIVATED - GREEN PROTECTED BANNER */
            <div className="space-y-5">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white">Tu cuenta está blindada y protegida</h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                    La verificación en dos pasos con <strong>2FAS</strong> está activa. Cada vez que inicies sesión en un nuevo navegador o dispositivo, se solicitará un código único temporal para garantizar que solo tú puedas acceder.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Códigos de Respaldo de Emergencia</h4>
                <p className="text-[10.5px] text-gray-400 leading-normal">
                  Guarda estos códigos de recuperación en un lugar seguro. Podrás usarlos si pierdes acceso a tu dispositivo móvil o a la aplicación 2FAS:
                </p>
                <div className="bg-[#1C1C2E] border border-brand-border/40 rounded-xl p-3 grid grid-cols-2 gap-2 text-center font-mono text-xs text-indigo-400 font-bold select-all">
                  <span>DCB-4819-2049</span>
                  <span>DCB-9921-5021</span>
                  <span>DCB-3829-1192</span>
                  <span>DCB-7341-8840</span>
                </div>
              </div>

              <div className="border-t border-brand-border/10 pt-4 flex justify-between items-center">
                <span className="text-[10.5px] text-gray-500">Configurado con éxito el {new Date().toLocaleDateString('es-ES')}</span>
                <Button 
                  onClick={handleDeactivate2FA}
                  variant="ghost" 
                  size="sm"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-bold shrink-0 border border-rose-500/20 px-3.5 rounded-xl cursor-pointer"
                >
                  Desactivar 2FA
                </Button>
              </div>
            </div>
          ) : isSettingUp2FA ? (
            /* STATE 2: TOGGLE ENABLED - SHOW SETUP FLOW */
            <div className="space-y-6">
              
              {/* Step 1: Download 2FAS App */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#534AB7]/20 border border-[#7F77DD]/35 text-[#7F77DD] text-[10px] font-black flex items-center justify-center font-mono shrink-0">1</span>
                  <span>Instala la aplicación oficial de 2FAS</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed pl-7">
                  Descarga <strong>2FAS Authenticator</strong> de forma gratuita en tu dispositivo móvil desde las tiendas oficiales:
                </p>
                <div className="flex gap-2.5 pl-7 flex-wrap">
                  <a 
                    href="https://apps.apple.com/app/2fas-auth-2-factor-authenticator/id1217793794" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-border/20 hover:bg-brand-border/40 text-gray-200 text-[10px] font-bold rounded-xl border border-brand-border/30 transition-all cursor-pointer"
                  >
                    <Smartphone size={12} />
                    App Store (iOS)
                  </a>
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.twofasapp" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-border/20 hover:bg-brand-border/40 text-gray-200 text-[10px] font-bold rounded-xl border border-brand-border/30 transition-all cursor-pointer"
                  >
                    <Smartphone size={12} />
                    Google Play Store (Android)
                  </a>
                </div>
              </div>

              {/* Step 2: Scan QR or copy Secret Key */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#534AB7]/20 border border-[#7F77DD]/35 text-[#7F77DD] text-[10px] font-black flex items-center justify-center font-mono shrink-0">2</span>
                  <span>Escanea el código QR o introduce la clave secreta</span>
                </div>
                
                <div className="pl-7 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Custom Simulated QR Code */}
                  <div className="md:col-span-4 bg-white p-2.5 rounded-2xl w-32 h-32 mx-auto flex flex-col items-center justify-center shadow-lg relative border-4 border-indigo-950/20 shrink-0">
                    {/* Simulated vector grid design */}
                    <div className="grid grid-cols-5 gap-1.5 w-full h-full text-indigo-950 opacity-90">
                      <div className="border-[3px] border-indigo-950 rounded bg-indigo-950 w-full h-full" />
                      <div className="bg-indigo-950/30 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/10 rounded w-full h-full" />
                      <div className="border-[3px] border-indigo-950 rounded bg-indigo-950 w-full h-full" />
                      
                      <div className="bg-indigo-950/20 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/40 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/30 rounded w-full h-full" />
                      
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/50 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/20 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />

                      <div className="bg-indigo-950/30 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/10 rounded w-full h-full" />
                      <div className="bg-indigo-950/40 rounded w-full h-full" />
                      <div className="bg-indigo-950/20 rounded w-full h-full" />

                      <div className="border-[3px] border-indigo-950 rounded bg-indigo-950 w-full h-full" />
                      <div className="bg-indigo-950/20 rounded w-full h-full" />
                      <div className="bg-indigo-950 rounded w-full h-full" />
                      <div className="bg-indigo-950/10 rounded w-full h-full" />
                      <div className="bg-indigo-950/30 rounded w-full h-full" />
                    </div>
                    {/* Badge 2FAS icon inside the QR code */}
                    <div className="absolute inset-0 m-auto w-8 h-8 bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] rounded-xl flex items-center justify-center text-white text-[9px] font-black border-2 border-white shadow shadow-indigo-600/50">
                      2F
                    </div>
                  </div>

                  {/* Manual Secret Key */}
                  <div className="md:col-span-8 space-y-2">
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Abre la app 2FAS en tu teléfono, pulsa sobre el icono de añadir (<strong>+</strong>) y escanea el código de arriba. O copia e introduce manualmente la siguiente clave:
                    </p>
                    <div className="flex gap-1.5 items-center bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-1.5 pl-3.5 pr-2.5">
                      <span className="text-[10px] text-indigo-300 font-mono font-bold truncate flex-1 block select-all">{simulatedSecretKey}</span>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="p-1.5 text-gray-400 hover:text-white bg-brand-surface border border-brand-border/25 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Copiar Clave"
                      >
                        {copiedKey === 'copied' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Enter 6 digit code */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#534AB7]/20 border border-[#7F77DD]/35 text-[#7F77DD] text-[10px] font-black flex items-center justify-center font-mono shrink-0">3</span>
                  <span>Introduce el código de verificación</span>
                </div>
                
                <form onSubmit={handleActivate2FA} className="pl-7 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Código de 6 dígitos generado por 2FAS</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2 px-3 text-sm text-center font-mono font-black text-[#7F77DD] placeholder-gray-600 outline-none focus:border-[#7F77DD] transition-all tracking-[0.25em]"
                      placeholder="000000"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full font-bold text-xs shadow-md py-2 px-3 h-[38px] flex items-center justify-center gap-1.5 shrink-0"
                      disabled={isActivating2FA}
                    >
                      {isActivating2FA ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Validando...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={13} />
                          Activar 2FA
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            /* STATE 3: TOGGLE DISABLED - NO SETUP FLOW VISIBLE */
            <div className="p-6 bg-[#0C0C14]/60 border border-brand-border/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 py-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-white/5 flex items-center justify-center text-gray-400">
                <ShieldAlert size={24} />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verificación en 2 pasos desactivada</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Tu cuenta no cuenta con la protección adicional de doble factor. Haz clic en el interruptor superior para iniciar el proceso de vinculación con la aplicación <strong>2FAS</strong>.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
