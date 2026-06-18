import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { KeyRound, ShieldAlert, ArrowLeft } from 'lucide-react';

export const TwoFactorPage: React.FC = () => {
  const { setUser, navigateTo, set2FAUsed, addToast } = useApp();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  const handleInputChange = (index: number, val: string) => {
    if (isNaN(Number(val)) && val !== '') return;
    const newCode = [...code];
    newCode[index] = val.slice(-1); // Only allow 1 char
    setCode(newCode);

    // Auto focus next box
    if (val !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOTP = () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      addToast('Ingresa el código completo de 6 dígitos', 'error');
      return;
    }

    if (simulatedCode && fullCode !== simulatedCode) {
      addToast('El código OTP introducido es incorrecto', 'error');
      return;
    }

    set2FAUsed(true);
    addToast('Doble factor verificado con éxito', 'success');
    
    // Auto login as Producer Carlos Santana
    setUser({
      id: 'carlos_producer',
      name: 'Carlos',
      email: 'carlitos.flow@gmail.com',
      role: 'producer' as const,
      artistName: 'Flow Habano',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      plan: 'Elite' as const,
      verified: true,
      beatsCount: 124,
      salesCount: 1892,
      totalEarningsCUP: 14250
    });
    navigateTo('/producer/dashboard');
  };

  const handleSimulateSMS = () => {
    const genCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(genCode);
    // Auto inject for comfort
    setCode(genCode.split(''));
    addToast(`SMS Recibido: "CubaBeats: Tu código de acceso 2FA es ${genCode}. No lo compartas con nadie."`, 'info');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-8 shadow-2xl text-left relative">
      <div className="space-y-6">
        
        {/* Back Link */}
        <button 
          onClick={() => navigateTo('/login')}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={14} />
          Volver al Login
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-500/10 text-brand-primary-light rounded-xl flex items-center justify-center mx-auto border border-brand-primary-light/10">
            <KeyRound size={22} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Verificación de Doble Factor</h2>
          <p className="text-white/40 text-xs">Hemos enviado un código SMS de 6 dígitos a tu teléfono configurado.</p>
        </div>

        {/* SMS Simulation Button */}
        <div className="bg-indigo-950/20 border border-indigo-500/10 p-3.5 rounded-xl space-y-2 text-center">
          <p className="text-[10px] text-white/60 font-medium">¿Evaluando la aplicación? Genera el SMS simulado:</p>
          <button
            type="button"
            onClick={handleSimulateSMS}
            className="w-full py-1.5 text-xs font-semibold bg-brand-primary hover:bg-brand-primary-light text-white rounded-lg transition-colors cursor-pointer"
          >
            Simular recepción de SMS OTP
          </button>
        </div>

        {/* Inputs list */}
        <div className="flex justify-between gap-2.5">
          {code.map((num, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={num}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-full aspect-square text-center font-mono font-bold text-lg bg-[#1C1C2E] border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary-light focus:ring-1 focus:ring-indigo-500/20"
            />
          ))}
        </div>

        {/* Verification Check button */}
        <Button variant="primary" fullWidth onClick={verifyOTP}>
          Verificar Acceso Seguro
        </Button>

        {/* Resend status simulation */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-white/30">¿No recibiste el código? Se puede reenviar en 45s</p>
          <button 
            type="button"
            onClick={() => addToast('SMS reenviado con éxito', 'info')}
            className="text-[11px] text-[#7F77DD] hover:underline bg-transparent border-none cursor-pointer font-semibold"
          >
            Reenviar Código OTP
          </button>
        </div>

      </div>
    </div>
  );
};
