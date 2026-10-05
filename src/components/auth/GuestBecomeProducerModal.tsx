import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { User, Sparkles, Check, X, ShieldCheck, CreditCard, Landmark, ArrowRight, ArrowLeft, Upload, CheckCircle2, Copy, Maximize2, Wallet, QrCode, AlertTriangle } from 'lucide-react';

interface GuestBecomeProducerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
  initialStep?: 1 | 2 | 3;
}

export const GuestBecomeProducerModal: React.FC<GuestBecomeProducerModalProps> = ({ 
  isOpen, 
  onClose,
  initialPlanId = 'p_free',
  initialStep = 2
}) => {
  const { plans, convertPrice, setUser, createPlanRequest, addToast, addAdminNotification, adminPaymentMethods, exchangeRates } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  
  // Selected Plan
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);

  // Active Admin payment methods
  const activeMethods = (adminPaymentMethods || []).filter(m => m.active !== false);
  const hasBankMethods = activeMethods.some(m => m.type === 'bancos' || (m.type as string) === 'transfermovil');
  const hasQvaPayMethods = activeMethods.some(m => m.type === 'qvapay');

  const [paymentType, setPaymentType] = useState<'bancos' | 'qvapay'>(() => {
    if (hasBankMethods) return 'bancos';
    if (hasQvaPayMethods) return 'qvapay';
    return 'bancos';
  });

  const [enlargedQrUrl, setEnlargedQrUrl] = useState<string | null>(null);

  // Sync state when modal is opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialPlanId) setSelectedPlanId(initialPlanId);
      setStep(initialStep);
      if (hasBankMethods) {
        setPaymentType('bancos');
      } else if (hasQvaPayMethods) {
        setPaymentType('qvapay');
      }
    }
  }, [isOpen, initialPlanId, initialStep]);

  // Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment (if paid plan)
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const isPaidPlan = currentPlan.price > 0;

  const renderCopyButton = (text: string, labelName?: string) => {
    return (
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(text);
          addToast(`${labelName || 'Dato'} copiado al portapapeles`, 'success');
        }}
        className="p-1 px-2 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
        title="Copiar dato"
      >
        <Copy size={11} />
        <span>Copiar</span>
      </button>
    );
  };

  const handleNextFromInfo = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'El nombre completo es requerido';
    if (!email.trim()) {
      tempErrors.email = 'El correo electrónico es requerido';
    } else if (!email.includes('@')) {
      tempErrors.email = 'Correo electrónico inválido';
    }
    if (!password.trim()) {
      tempErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      tempErrors.password = 'Mínimo 6 caracteres';
    }
    if (!artistName.trim()) tempErrors.artistName = 'El nombre de productor es requerido';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      addToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    setErrors({});
    if (isPaidPlan) {
      setStep(3);
    } else {
      handleSubmitFinal();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitFinal = () => {
    if (isPaidPlan) {
      if (!transactionId.trim()) {
        addToast('Debes ingresar el número de transacción / comprobante', 'error');
        return;
      }
    }

    const newUserId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isFree = currentPlan.price === 0;

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: 'producer' as const,
      artistName: artistName.trim(),
      instagram: instagram.trim() || undefined,
      plan: currentPlan.name as 'Gratis' | 'Pro' | 'Elite',
      planId: currentPlan.id,
      verified: false,
      producerApprovalStatus: isFree ? ('approved' as const) : ('pending' as const)
    };

    if (isPaidPlan) {
      const usdRate = exchangeRates?.USD || exchangeRates?.CUP || 385.0;
      const mlcRate = exchangeRates?.MLC || 280.0;
      let finalCurrency = 'CUP';
      let finalAmountConverted = currentPlan.price;
      let rateUsed = usdRate;

      if (paymentType === 'qvapay') {
        finalCurrency = 'USD';
        finalAmountConverted = currentPlan.price;
        rateUsed = 1.0;
      } else {
        const bankMethods = activeMethods.filter(m => m.type === 'bancos' || (m.type as string) === 'transfermovil');
        const firstMethod = bankMethods[0];
        const rawCurr = (firstMethod?.currencyType || 'CUP').trim().toUpperCase();
        if (rawCurr === 'MLC') {
          finalCurrency = 'MLC';
          rateUsed = Number((usdRate / mlcRate).toFixed(4));
          const conv = convertPrice(currentPlan.price, 'MLC');
          finalAmountConverted = parseFloat(conv.amount.replace(/[^0-9.]/g, '')) || Number((currentPlan.price * rateUsed).toFixed(2));
        } else {
          finalCurrency = 'CUP';
          rateUsed = usdRate;
          const conv = convertPrice(currentPlan.price, 'CUP');
          finalAmountConverted = parseFloat(conv.amount.replace(/[^0-9.]/g, '')) || Math.round(currentPlan.price * rateUsed);
        }
      }

      const frozenAt = new Date().toISOString();

      createPlanRequest({
        producerId: newUserId,
        producerName: artistName.trim() || name.trim(),
        planId: currentPlan.id,
        planName: currentPlan.name,
        amount: currentPlan.price,
        currency: finalCurrency,
        amountUSD: currentPlan.price,
        amountConverted: finalAmountConverted,
        exchangeRateUsed: rateUsed,
        rateFrozenAt: frozenAt,
        paymentMethodType: paymentType,
        transactionId: transactionId.trim(),
        receiptImage: receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop'
      });

      addAdminNotification(
        'plan_purchased',
        'Nueva Solicitud de Membresía de Productor',
        `El nuevo productor "${artistName.trim()}" (${email}) ha solicitado el Plan ${currentPlan.name} (${finalAmountConverted} ${finalCurrency}). Ref: ${transactionId.trim()}`
      );

      addToast('Solicitud enviada con éxito. Un administrador revisará tu pago.', 'success');
      onClose();
      setUser(newUser); // Navigation to /producer/pending-approval will trigger inside setUser
    } else {
      addAdminNotification(
        'user_registered',
        'Nuevo Productor Registrado (Plan Gratis)',
        `El productor "${artistName.trim()}" (${email}) se ha registrado con el Plan Gratis.`
      );

      addToast('¡Registro exitoso! Por favor completa tu verificación de identidad (KYC).', 'success');
      onClose();
      setUser(newUser); // Navigation to /kyc will trigger inside setUser
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#13131F] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hazte Vendedor en D'Cuban Beats</h2>
              <p className="text-xs text-white/50">Paso {step} de {isPaidPlan ? 3 : 2}: {step === 1 ? 'Selecciona tu Plan' : step === 2 ? 'Datos de Cuenta' : 'Confirmación de Pago'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: SELECT PLAN */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-white/70">Elige la membresía que mejor se adapte a tu volumen de producción musical:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-[#534AB7]/15 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                        : 'bg-[#0D0D14] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        {isSelected && <Check size={14} className="text-amber-400" />}
                      </div>
                      <div className="text-base font-extrabold text-amber-400 font-mono">
                        {p.price === 0 ? 'Gratis' : convertPrice(p.price).formatted}
                      </div>
                      <p className="text-[11px] text-white/50 leading-normal">{p.support}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[10px] text-white/60 space-y-1 font-mono">
                      <div>• {p.limit === 999 ? 'Beats Ilimitados' : `Hasta ${p.limit} Beats`}</div>
                      <div>• Formatos: {p.allowedFormats || 'MP3'}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs cursor-pointer"
              >
                <span>Continuar con Plan {currentPlan.name}</span>
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: USER REGISTRATION INFO */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected Plan Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-[#534AB7]/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block">
                    Plan Seleccionado
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {currentPlan.name} — <span className="text-amber-400 font-mono">{currentPlan.price === 0 ? 'Gratis' : convertPrice(currentPlan.price).formatted}</span>
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                Cambiar plan
              </button>
            </div>

            {isPaidPlan && activeMethods.length === 0 && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs">
                <AlertTriangle size={20} className="flex-shrink-0 text-amber-400" />
                <p className="leading-snug">
                  <strong>Aviso de pagos:</strong> No hay métodos de pago activos configurados por la administración actualmente.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre Completo *"
                placeholder="Ej. Carlos Santana"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                error={errors.name}
              />

              <Input
                label="Correo Electrónico *"
                type="email"
                placeholder="correo@ejemplo.cu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contraseña *"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                error={errors.password}
              />

              <Input
                label="Nombre Artístico / Productor *"
                placeholder="Ej. Prod. Beatmaker"
                value={artistName}
                onChange={(e) => {
                  setArtistName(e.target.value);
                  if (errors.artistName) setErrors(prev => ({ ...prev, artistName: '' }));
                }}
                error={errors.artistName}
              />
            </div>

            <Input
              label="Usuario de Instagram (Opcional)"
              placeholder="@tu_usuario_instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />

            <div className="pt-3 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="text-xs"
              >
                <ArrowLeft size={14} className="mr-1.5" />
                Cambiar Plan
              </Button>

              <Button
                variant="primary"
                onClick={handleNextFromInfo}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs cursor-pointer"
              >
                {isPaidPlan ? (
                  <>
                    <span>Ir al Pago de Membresía</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </>
                ) : (
                  <span>Completar Registro Gratis ✓</span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT FOR PAID PLAN */}
        {step === 3 && isPaidPlan && (
          <div className="space-y-5">
            <div className="p-4 bg-[#0D0D14] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-white/40 block">Plan Seleccionado</span>
                <span className="font-bold text-white text-sm">Plan {currentPlan.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-white/40 block">Total a Pagar</span>
                <span className="font-mono text-amber-400 font-extrabold text-base">
                  {convertPrice(currentPlan.price).formatted} / mes
                </span>
              </div>
            </div>

            {activeMethods.length === 0 ? (
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-3 my-4">
                <AlertTriangle size={32} className="mx-auto text-amber-400" />
                <h4 className="text-white font-bold text-sm">No hay métodos de pago disponibles por el momento</h4>
                <p className="text-gray-300 text-xs max-w-md mx-auto">
                  Actualmente la administración no tiene cuentas ni métodos de pago activos configurados. Por favor intenta nuevamente más tarde o contacta con soporte.
                </p>
              </div>
            ) : (
              <>
                {/* Payment Type Selector */}
                {(hasBankMethods && hasQvaPayMethods) && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">Selecciona Vía de Pago:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentType('bancos')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          paymentType === 'bancos'
                            ? 'bg-[#534AB7]/20 border-amber-500 text-white font-bold shadow-md'
                            : 'bg-[#0D0D14] border-white/5 text-white/60 hover:border-white/10'
                        }`}
                      >
                        <Landmark size={18} className={paymentType === 'bancos' ? 'text-amber-400' : 'text-white/40'} />
                        <div>
                          <span className="text-xs block font-bold">Transferencia Bancaria / Transfermóvil</span>
                          <span className="text-[10px] text-white/40 block font-normal">Tarjetas CUP / MLC / BPA / BANDEC</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentType('qvapay')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          paymentType === 'qvapay'
                            ? 'bg-[#534AB7]/20 border-amber-500 text-white font-bold shadow-md'
                            : 'bg-[#0D0D14] border-white/5 text-white/60 hover:border-white/10'
                        }`}
                      >
                        <Wallet size={18} className={paymentType === 'qvapay' ? 'text-amber-400' : 'text-white/40'} />
                        <div>
                          <span className="text-xs block font-bold">QvaPay</span>
                          <span className="text-[10px] text-white/40 block font-normal">Pago Digital en USD / SQP</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Configured Accounts */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-white">Datos de Pago de la Administración:</p>

                  {paymentType === 'bancos' && (
                    <div className="space-y-3">
                      {activeMethods.filter(m => m.type === 'bancos' || (m.type as string) === 'transfermovil').length === 0 ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 text-center">
                          No hay cuentas bancarias activas configuradas por el administrador.
                        </div>
                      ) : (
                        activeMethods
                          .filter(m => m.type === 'bancos' || (m.type as string) === 'transfermovil')
                          .map((method) => {
                            const cardCurr = (method.currencyType === 'MLC' ? 'MLC' : 'CUP') as 'CUP' | 'MLC';
                            const convertedCard = convertPrice(currentPlan.price, cardCurr);
                            const usdVal = exchangeRates?.USD || 385;
                            const mlcVal = exchangeRates?.MLC || 280;
                            const rateSubText = cardCurr === 'MLC'
                              ? `Tasa El Toque: 1 USD ≈ ${(usdVal / mlcVal).toFixed(2)} MLC`
                              : `Tasa El Toque: 1 USD = ${usdVal} CUP`;

                            return (
                              <div key={method.id} className="bg-[#0D0D14] border border-[#7F77DD]/30 p-4 rounded-2xl space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <Landmark size={15} className="text-amber-400" />
                                    <span className="font-bold text-white text-sm">
                                      {method.bankName || 'Banco Cubano'} ({cardCurr})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {method.acceptsTransfermovil && (
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                        Transfermóvil
                                      </span>
                                    )}
                                    {method.acceptsEnzona && (
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                        EnZona
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {/* Monto Fijo a Transferir según la moneda de la tarjeta */}
                                  <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent rounded-xl border border-amber-500/30">
                                    <div className="text-left">
                                      <span className="text-white/80 text-[11px] font-bold block">
                                        Monto Fijo a Transferir ({cardCurr}):
                                      </span>
                                      <span className="text-[10px] text-amber-300/80 font-mono block">
                                        {rateSubText}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-amber-400 font-mono text-sm font-extrabold">{convertedCard.formatted}</strong>
                                      {renderCopyButton(convertedCard.amount, `Monto ${method.currencyType || 'CUP'}`)}
                                    </div>
                                  </div>

                                  {method.cardHolder && (
                                    <div className="flex items-center justify-between p-2 bg-[#13131F] rounded-xl border border-white/5">
                                      <span className="text-white/50 text-[11px]">Titular de la cuenta:</span>
                                      <div className="flex items-center gap-2">
                                        <strong className="text-white font-mono">{method.cardHolder}</strong>
                                        {renderCopyButton(method.cardHolder, 'Titular')}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between p-2 bg-[#13131F] rounded-xl border border-white/5">
                                    <span className="text-white/50 text-[11px]">Tarjeta / Nro. Cuenta:</span>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-amber-400 font-mono text-sm">{method.cardNumber}</strong>
                                      {renderCopyButton(method.cardNumber || '', 'Tarjeta')}
                                    </div>
                                  </div>

                                  {method.phoneConfirm && (
                                    <div className="flex items-center justify-between p-2 bg-[#13131F] rounded-xl border border-white/5">
                                      <span className="text-white/50 text-[11px]">Teléfono SMS Confirmación:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-mono">{method.phoneConfirm}</span>
                                        {renderCopyButton(method.phoneConfirm || '', 'Teléfono')}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {method.qrScreenshot && (
                                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 bg-[#13131F] p-2.5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2.5">
                                      <div 
                                        onClick={() => setEnlargedQrUrl(method.qrScreenshot || null)}
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-amber-500/40 bg-white p-1 hover:border-amber-400 transition-all shadow-md flex-shrink-0"
                                      >
                                        <img 
                                          src={method.qrScreenshot} 
                                          alt="QR de Pago" 
                                          className="w-12 h-12 object-contain"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                          <Maximize2 size={14} className="text-white" />
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-white block">Código QR de Cobro</span>
                                        <span className="text-[10px] text-white/50 block">Toca la imagen para ampliar</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEnlargedQrUrl(method.qrScreenshot || null)}
                                      className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Maximize2 size={12} />
                                      <span>Ampliar</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}

                  {paymentType === 'qvapay' && (
                    <div className="space-y-3">
                      {activeMethods.filter(m => m.type === 'qvapay').length === 0 ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 text-center">
                          No hay cuentas QvaPay activas configuradas por el administrador.
                        </div>
                      ) : (
                        activeMethods
                          .filter(m => m.type === 'qvapay')
                          .map((method) => (
                            <div key={method.id} className="bg-[#0D0D14] border border-[#7F77DD]/30 p-4 rounded-2xl space-y-3 text-xs">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <span className="font-bold text-white text-sm flex items-center gap-2">
                                  <Wallet size={15} className="text-amber-400" />
                                  Cuenta QvaPay
                                </span>
                              </div>

                              <div className="space-y-2">
                                {method.qvapayEmail && (
                                  <div className="flex items-center justify-between p-2 bg-[#13131F] rounded-xl border border-white/5">
                                    <span className="text-white/50 text-[11px]">Correo QvaPay:</span>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-white font-mono">{method.qvapayEmail}</strong>
                                      {renderCopyButton(method.qvapayEmail || '', 'Correo QvaPay')}
                                    </div>
                                  </div>
                                )}

                                {method.qvapayUser && (
                                  <div className="flex items-center justify-between p-2 bg-[#13131F] rounded-xl border border-white/5">
                                    <span className="text-white/50 text-[11px]">Usuario QvaPay:</span>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-amber-400 font-mono">@{method.qvapayUser}</strong>
                                      {renderCopyButton(method.qvapayUser || '', 'Usuario QvaPay')}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent rounded-xl border border-emerald-500/30">
                                  <div className="text-left">
                                    <span className="text-white/80 text-[11px] font-bold block">
                                      Monto Fijo en QvaPay (USD):
                                    </span>
                                    <span className="text-[10px] text-emerald-400/80 font-mono block">
                                      Moneda Fija USD (no varía con El Toque)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-emerald-400 font-mono text-sm font-extrabold">${currentPlan.price.toFixed(2)} USD / SQP</strong>
                                    {renderCopyButton(`${currentPlan.price.toFixed(2)}`, 'Monto USD')}
                                  </div>
                                </div>
                              </div>

                              {method.qrQvapayScreenshot && (
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 bg-[#13131F] p-2.5 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2.5">
                                    <div 
                                      onClick={() => setEnlargedQrUrl(method.qrQvapayScreenshot || null)}
                                      className="relative group cursor-pointer overflow-hidden rounded-lg border border-amber-500/40 bg-white p-1 hover:border-amber-400 transition-all shadow-md flex-shrink-0"
                                    >
                                      <img 
                                        src={method.qrQvapayScreenshot} 
                                        alt="QR QvaPay" 
                                        className="w-12 h-12 object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                        <Maximize2 size={14} className="text-white" />
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-white block">Código QR QvaPay</span>
                                      <span className="text-[10px] text-white/50 block">Toca la imagen para ampliar</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEnlargedQrUrl(method.qrQvapayScreenshot || null)}
                                    className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Maximize2 size={12} />
                                    <span>Ampliar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Modal de QR Ampliado */}
            {enlargedQrUrl && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
                onClick={() => setEnlargedQrUrl(null)}
              >
                <div 
                  className="bg-[#13131F] border border-amber-500/50 p-6 rounded-3xl max-w-sm w-full space-y-4 text-center relative shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    type="button"
                    onClick={() => setEnlargedQrUrl(null)}
                    className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    <QrCode size={18} className="text-amber-400" />
                    Escanea el Código QR para Pagar
                  </h4>
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-xl">
                    <img 
                      src={enlargedQrUrl} 
                      alt="QR Ampliado" 
                      className="w-56 h-56 object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[11px] text-white/60">
                    Abre tu aplicación bancaria o QvaPay y escanea este código.
                  </p>
                </div>
              </div>
            )}

            {/* Inputs for Payment Verification */}
            {activeMethods.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Input
                  label="Nº de Transacción / Comprobante *"
                  placeholder="Ej. TX-9928114"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Captura de Comprobante (Opcional)</label>
                  <label className="flex items-center gap-2 p-2.5 bg-[#0D0D14] border border-white/10 hover:border-white/20 rounded-xl text-xs text-white/70 cursor-pointer">
                    <Upload size={14} className="text-amber-400" />
                    <span className="truncate">{receiptImage ? 'Comprobante Adjuntado ✓' : 'Subir Imagen...'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                className="text-xs"
              >
                <ArrowLeft size={14} className="mr-1.5" />
                Atrás
              </Button>

              <Button
                variant="primary"
                onClick={handleSubmitFinal}
                disabled={activeMethods.length === 0}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-amber-500/10 disabled:opacity-50"
              >
                <span>Confirmar y Enviar Solicitud ✓</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
