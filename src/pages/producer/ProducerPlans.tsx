import React, { useState } from 'react';
import { useApp, resolveUserPlan } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ExchangeRateBadge } from '../../components/ui/ExchangeRateBadge';
import { 
  Radio, Check, Sparkles, CreditCard, Landmark, 
  HelpCircle, AlertCircle, ArrowUpRight, ArrowLeftRight, X, Table, ShieldCheck, Copy, QrCode, Wallet, Camera, Maximize2
} from 'lucide-react';
import { Plan, AdminPaymentMethod } from '../../types';

export const ProducerPlans: React.FC = () => {
  const { user, updateUserProfile, plans, beats, addToast, addAdminNotification, convertPrice, createPlanRequest, exchangeRates, adminPaymentMethods } = useApp();
  
  // Modal states for subscribing
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<Plan | null>(null);
  const [enlargedQrUrl, setEnlargedQrUrl] = useState<string | null>(null);
  
  // Payment channel selection (Bancos vs QvaPay)
  const [paymentType, setPaymentType] = useState<'bancos' | 'qvapay'>('bancos');
  const [senderCardNum, setSenderCardNum] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptScreenshot, setReceiptScreenshot] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Active Admin payment methods
  const activeMethods = (adminPaymentMethods || []).filter(m => m.active !== false);

  // Copy button helper
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

  // Stats computation
  const myBeatsCount = beats.filter(b => b.producerId === user?.id).length;
  const currentPlan = resolveUserPlan(user, plans);
  const currentPlanName = currentPlan.name;

  // List of plans that the user is NOT currently subscribed to
  const alternativePlans = plans.filter(p => p.id !== currentPlan.id);

  const handleOpenPlanModal = (planToSub: Plan) => {
    if (!user?.verified && planToSub.price > 0) {
      addToast('Verificación de Identidad KYC obligatoria: Debes acreditar tu identidad en Mi Perfil para poder pagar y adquirir planes.', 'error');
      return;
    }
    setSelectedPlanToBuy(planToSub);
    setFormErrors({});
    
    const hasBank = activeMethods.some(m => m.type === 'bancos' || (m.type as string) === 'transfermovil');
    const hasQp = activeMethods.some(m => m.type === 'qvapay');
    if (hasBank) {
      setPaymentType('bancos');
    } else if (hasQp) {
      setPaymentType('qvapay');
    } else {
      setPaymentType('bancos');
    }

    setIsSubscribeModalOpen(true);
  };

  const handleConfirmPlanChange = (targetPlan: Plan) => {
    // If selecting a free plan, change immediately without payment prompt
    if (targetPlan.price === 0) {
      updateUserProfile({ plan: targetPlan.name as 'Gratis' | 'Pro' | 'Elite', planId: targetPlan.id });
      addToast(`Tu cuenta se ha rebajado al plan ${targetPlan.name} correctamente.`, 'info');
      
      addAdminNotification(
        'plan_purchased',
        'Membresía Modificada (Downgrade)',
        `El productor "${user?.artistName || user?.name}" cambió su membresía al plan Gratis.`
      );
      
      setIsSubscribeModalOpen(false);
      return;
    }

    if (activeMethods.length === 0) {
      addToast('No hay métodos de pago disponibles por el momento. La administración no tiene cuentas activas configuradas.', 'error');
      return;
    }

    // Validation
    const errors: Record<string, string> = {};
    if (paymentType === 'bancos') {
      if (!senderCardNum.trim()) {
        errors.senderCardNum = 'La tarjeta o titular emisor es obligatorio';
      }
    }
    if (!transactionId.trim()) {
      errors.transactionId = 'El número o ID de transacción es obligatorio';
    }
    if (!receiptScreenshot) {
      errors.receiptScreenshot = 'Es obligatorio subir una captura del comprobante de pago';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Por favor completa todos los campos requeridos, incluyendo el comprobante de pago.', 'error');
      return;
    }

    // Calculate rate snapshot based on payment channel and active payment method
    const usdRate = exchangeRates?.USD || exchangeRates?.CUP || 385.0;
    const mlcRate = exchangeRates?.MLC || 280.0;
    const amountUSD = targetPlan.price;
    
    let effectiveCurrency = 'USD';
    let rateUsed = 1.0;
    let amountConverted = amountUSD;

    if (paymentType === 'bancos') {
      const activeBankMethods = activeMethods.filter(m => m.type === 'bancos' || (m.type as string) === 'transfermovil');
      const rawCurr = (activeBankMethods[0]?.currencyType || 'CUP').trim().toUpperCase();
      effectiveCurrency = rawCurr === 'MLC' ? 'MLC' : 'CUP';

      if (effectiveCurrency === 'MLC') {
        rateUsed = Number((usdRate / mlcRate).toFixed(4));
        const conv = convertPrice(amountUSD, 'MLC');
        amountConverted = parseFloat(conv.amount.replace(/[^0-9.]/g, '')) || Number((amountUSD * rateUsed).toFixed(2));
      } else {
        effectiveCurrency = 'CUP';
        rateUsed = usdRate;
        const conv = convertPrice(amountUSD, 'CUP');
        amountConverted = parseFloat(conv.amount.replace(/[^0-9.]/g, '')) || Math.round(amountUSD * rateUsed);
      }
    } else {
      effectiveCurrency = 'USD';
      rateUsed = 1.0;
      amountConverted = amountUSD;
    }

    const frozenAt = new Date().toISOString();

    // Submit plan subscription request for admin review
    const success = createPlanRequest({
      producerId: user?.id || 'p_unknown',
      producerName: user?.artistName || user?.name || 'Productor',
      planId: targetPlan.id,
      planName: `Plan ${targetPlan.name}`,
      amount: targetPlan.price,
      currency: effectiveCurrency,
      transactionId: transactionId,
      receiptUrl: receiptScreenshot,
      exchangeRateUsed: rateUsed,
      amountUSD: amountUSD,
      amountConverted: Number(amountConverted.toFixed(2)),
      rateFrozenAt: frozenAt,
      paymentMethodType: paymentType,
      verificationSMS: `Emisor: ${senderCardNum || 'N/D'}`
    });

    if (success) {
      setIsSubscribeModalOpen(false);
      // Clear state
      setSenderCardNum('');
      setTransactionId('');
      setReceiptScreenshot('');
    }
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg pb-10">
      
      {/* Header title toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="text-[#7F77DD] animate-pulse" size={22} /> Mis Planes de Membresía
          </h2>
          <p className="text-xs text-gray-400">
            Revisa tu suscripción actual, los límites de cargas, comisiones por transacción y actualiza para vender más Beats sin límites.
          </p>
        </div>
      </div>

      {/* Tasa de cambio oficial El Toque */}
      <ExchangeRateBadge variant="banner" />

      {/* KYC Alert Block if not verified */}
      {!user?.verified && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3.5 text-rose-400">
          <div className="p-2 bg-rose-500/10 rounded-xl flex-shrink-0 text-rose-400">
            <AlertCircle size={18} />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider block text-white font-mono">
              Verificación de Identidad (KYC) Requerida para Suscripciones
            </span>
            <p className="text-[11.5px] text-gray-300 leading-relaxed font-sans">
              Para garantizar la idoneidad legal y seguridad en el cobro de planes de D'Cuban Beats, <strong>no está permitido pagar ni adquirir ningún plan de membresía</strong> hasta que hayas acreditado tu identidad mediante la verificación de documentos KYC en la pestaña <strong className="text-white">Mi Perfil</strong>. Una vez aprobado, tus opciones de suscripción se activarán en tiempo real.
            </p>
          </div>
        </div>
      )}

      {/* Admin Payment Methods Unavailable Notice */}
      {activeMethods.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3.5 text-amber-300">
          <div className="p-2 bg-amber-500/10 rounded-xl flex-shrink-0 text-amber-400">
            <AlertCircle size={18} />
          </div>
          <div className="space-y-1 text-left">
            <span className="text-xs font-black uppercase tracking-wider block text-white font-mono">
              Aviso de recepción de pagos de la administración
            </span>
            <p className="text-[11.5px] text-amber-200/90 leading-relaxed font-sans">
              No hay métodos de pago disponibles por el momento. La administración no tiene cuentas activas configuradas.
            </p>
          </div>
        </div>
      )}

      {/* 1. TOP FULL-WIDTH DASHBOARD SUMMARY CARD (PERFECTLY EVEN MARGINS AND SIZES) */}
      <div className="bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#7F77DD] opacity-5 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Active plan status */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#7F77DD] tracking-widest bg-[#534AB7]/10 px-2.5 py-1 rounded-full border border-[#534AB7]/25">
                Membresía Activa
              </span>
              <Badge variant="purple">Vigente</Badge>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{currentPlan?.name}</h3>
              <p className="text-sm font-semibold text-gray-400 mt-1">
                Precio de suscripción: {currentPlan?.price === 0 ? 'Gratuito de por vida' : `${convertPrice(currentPlan?.price || 0).formatted} / mes`}
              </p>
            </div>
          </div>

          {/* Limits Progress section */}
          <div className="flex-1 space-y-3 bg-[#0C0C14]/60 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Uso de Catálogo de Beats:</span>
              <span className="font-bold text-white">
                {myBeatsCount} / {currentPlan?.limit === 999 ? 'Ilimitados' : `${currentPlan?.limit} Beats`}
              </span>
            </div>
            
            {currentPlan?.limit !== 999 ? (
              <div className="w-full bg-[#1C1C2E] h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-primary-light rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (myBeatsCount / currentPlan?.limit) * 100)}%` }}
                />
              </div>
            ) : (
              <div className="h-2 bg-[#1C1C2E] rounded-full border border-white/5 flex items-center px-1.5">
                <div className="h-1 w-full bg-emerald-500/80 rounded-full animate-pulse" />
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
              <span>Soporte: <strong className="text-white font-normal">{currentPlan?.support}</strong></span>
              <span>Comisión de Venta: <strong className="text-emerald-400 font-normal">0% (Sin comisiones)</strong></span>
            </div>
          </div>

          {/* Compare Benefits Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch sm:items-center lg:items-stretch min-w-[200px]">
            <Button 
              onClick={() => setIsCompareModalOpen(true)}
              variant="secondary"
              size="sm"
              className="font-bold text-xs flex items-center justify-center gap-1.5 border border-[#7F77DD]/30 bg-[#7F77DD]/5 hover:bg-[#7F77DD]/10 text-white transition-all py-2.5"
            >
              <Table size={14} className="text-[#7F77DD]" />
              Comparar Ventajas
            </Button>
            <p className="text-[10px] text-gray-500 text-center leading-relaxed max-w-[200px] mx-auto">
              Compara todas las ventajas y límites en tiempo real.
            </p>
          </div>

        </div>

        {myBeatsCount >= (currentPlan?.limit || 0) && currentPlan?.limit !== 999 && (
          <div className="flex items-center gap-2 text-xs text-amber-400 mt-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>Has alcanzado el límite máximo de Beats para tu plan actual. Actualiza tu plan a continuación para seguir cargando y vendiendo tus pistas musicales cubanas.</span>
          </div>
        )}
      </div>

      {/* 2. PLANS CARDS GRID (Symmetric Cards: same margins, same padding, same heights) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-brand-accent-amber" />
            Membresías de Productor Disponibles
          </h3>
          <p className="text-xs text-gray-400">
            Escoge la membresía adecuada para potenciar tus lanzamientos. Cambia de plan cuando desees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((pl) => {
            const isActive = pl.name.toLowerCase() === currentPlanName.toLowerCase();
            return (
              <div 
                key={pl.id}
                className={`flex flex-col justify-between h-full rounded-2xl p-6 transition-all relative ${
                  isActive 
                    ? 'bg-gradient-to-b from-[#13131F] to-[#1C1C2E] border-2 border-[#7F77DD] shadow-xl shadow-[#7F77DD]/10' 
                    : 'bg-[#13131F]/50 border border-white/5 hover:border-brand-primary/30'
                }`}
              >
                {/* Active Plan Tag Ribbon */}
                {isActive && (
                  <span className="absolute top-0 right-6 transform -translate-y-1/2 bg-[#7F77DD] text-black font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-[#7F77DD]/20 flex items-center gap-1">
                    <Check size={10} className="stroke-[3]" /> Plan Activo
                  </span>
                )}

                {/* Card Header */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="text-xl font-bold text-white">{pl.name}</h4>
                    {pl.featured && !isActive && (
                      <Badge variant="purple" className="flex items-center gap-1 text-[9px] tracking-wide font-black">
                        <Sparkles size={10} /> RECOMENDADO
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <span className="text-2xl font-black text-white font-sans">
                      {pl.price === 0 ? 'Gratis' : convertPrice(pl.price).formatted}
                    </span>
                    {pl.price > 0 && <span className="text-xs text-gray-400 font-medium"> / mes</span>}
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      {pl.price === 0 
                        ? `Ideal para comenzar de forma gratuita, subiendo hasta ${pl.limit} beats sin comisión alguna.` 
                        : `Sube hasta ${pl.limit === 999 ? 'beats ilimitados' : `${pl.limit} beats`} con todas las herramientas profesionales.`}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/5 my-2" />

                  {/* Benefits checklist */}
                  <div className="space-y-2.5 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Beneficios del Plan</span>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Límite: <strong className="text-white">{pl.limit} Beats Publicados</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        {pl.limitLibrariesCount && pl.limitLibrariesCount > 0 ? (
                          <>
                            <Check size={13} className="text-emerald-400 flex-shrink-0" />
                            <span>Librerías: <strong className="text-white">{pl.limitLibrariesCount} Sample Packs</strong> ({pl.maxLibrarySizeEach} MB c/u)</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500 text-xs font-semibold select-none flex-shrink-0">❌</span>
                            <span className="text-gray-400">Sin subida de librerías de sonido</span>
                          </>
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        {pl.analyticsAccess ? (
                          <>
                            <Check size={13} className="text-emerald-400 flex-shrink-0" />
                            <span>Módulo de Analytics y Estadísticas Completo</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500 text-xs font-semibold select-none flex-shrink-0">❌</span>
                            <span className="text-gray-400">Sin acceso a estadísticas</span>
                          </>
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Mensajería: <strong className="text-white">{pl.directMessaging || (pl.name.toLowerCase() === 'gratis' ? 'Bloqueada' : 'Ilimitada')}</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Soporte: <strong className="text-white">{pl.support}</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        {(pl.stemsAllowed ?? (pl.name.toLowerCase() !== 'gratis')) ? (
                          <>
                            <Check size={13} className="text-emerald-400 flex-shrink-0" />
                            <span>Soporte de Stems: <strong className="text-white">Sí (Multitracks)</strong></span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500 text-xs font-semibold select-none flex-shrink-0">❌</span>
                            <span className="text-gray-400">Soporte de Stems: No permitido</span>
                          </>
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Formatos: <strong className="text-white">{pl.allowedFormats || (pl.name.toLowerCase() === 'gratis' ? 'MP3' : 'WAV')}</strong></span>
                      </li>
                      {pl.badgeType && pl.badgeType !== 'Ninguno' && (
                        <li className="flex items-center gap-2">
                          <Check size={13} className="text-emerald-400 flex-shrink-0" />
                          <span>Insignia: <strong className="text-brand-primary-light">Badge "{pl.badgeType}"</strong> en perfil</span>
                        </li>
                      )}
                      {pl.benefits?.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Button Footer */}
                <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
                  {isActive ? (
                    <Button 
                      disabled
                      variant="secondary"
                      size="sm"
                      fullWidth
                      className="cursor-not-allowed bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} className="stroke-[3]" />
                      Tu Membresía Actual
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleOpenPlanModal(pl)}
                      variant={!user?.verified && pl.price > 0 ? "secondary" : (pl.featured ? "primary" : "secondary")}
                      size="sm"
                      fullWidth
                      className={`font-extrabold text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer transition-transform ${
                        !user?.verified && pl.price > 0 
                          ? 'border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10' 
                          : 'hover:scale-[1.01]'
                      }`}
                    >
                      {!user?.verified && pl.price > 0 ? 'KYC Requerido' : (pl.price === 0 ? 'Volver a Gratis' : 'Suscribirse Ahora')}
                      <ArrowUpRight size={13} />
                    </Button>
                  )}
                  <span className="text-[10px] text-gray-500 block text-center font-mono">
                    {pl.price === 0 ? 'Membresía básica' : 'Activación inmediata'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Help Block */}
      <div className="p-4 bg-[#0D0D14]/80 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <HelpCircle size={20} className="text-[#7F77DD] flex-shrink-0" />
        <div className="space-y-0.5 flex-grow text-left">
          <h4 className="text-xs font-bold text-white">¿Cómo funcionan los pagos y activaciones?</h4>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Realiza la transferencia por Transfermóvil o saldo QvaPay. Al colocar los datos del comprobante y confirmar la simulación, nuestro sistema registra la membresía y notifica a los administradores para la aprobación. Todo es inmediato y transparente.
          </p>
        </div>
      </div>

      {/* COMPARATOR OF PLANS MODAL (DYNAMIC REAL-TIME ACCORDING TO ADMIN PLANS) */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Tabla Comparativa de Ventajas y Funciones"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 py-1 text-left">
          <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/25 text-gray-300 rounded-xl text-xs leading-relaxed flex gap-2">
            <Sparkles size={16} className="text-brand-accent-amber flex-shrink-0 mt-0.5" />
            <p>
              Esta tabla se actualiza en <strong>tiempo real</strong>. Si la administración del portal redefine el costo, límites de almacenamiento o soporte de algún plan, los cambios se reflejan inmediatamente a continuación.
            </p>
          </div>

          <div className="overflow-x-auto border border-white/10 rounded-xl bg-[#0C0C14]">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 bg-[#13131F]">
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Función o Ventaja</th>
                  {plans.map(p => {
                    const isActive = p.name.toLowerCase() === currentPlanName.toLowerCase();
                    return (
                      <th key={p.id} className="py-3 px-4 text-xs font-black text-white text-center uppercase tracking-widest relative">
                        <div className="flex flex-col items-center justify-center">
                          <span>{p.name}</span>
                          {isActive && (
                            <span className="text-[9px] text-[#7F77DD] font-semibold tracking-normal lowercase bg-[#7F77DD]/10 px-2 py-0.5 rounded-full mt-1 border border-[#7F77DD]/20">
                              activo
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {/* Price Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Precio Mensual</td>
                  {plans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center font-mono font-bold text-[#7F77DD]">
                      {p.price === 0 ? 'Gratis' : convertPrice(p.price).formatted}
                    </td>
                  ))}
                </tr>

                {/* Sales Commission */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Comisión sobre ventas</td>
                  {plans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center text-emerald-400 font-bold">
                      0% <span className="text-[9px] text-gray-500 font-normal">(Sin comisiones)</span>
                    </td>
                  ))}
                </tr>

                {/* Beats Limit Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Límite de Beats Publicados</td>
                  {plans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center font-semibold text-white">
                      {p.limit} Beats
                    </td>
                  ))}
                </tr>

                {/* Action on Expiry of plan validity */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Acción al vencer vigencia del plan</td>
                  {plans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center text-amber-400 font-medium text-[11px]">
                      {p.onPlanExpiryAction || 'Bloqueo total de venta hasta actualizar de plan'}
                    </td>
                  ))}
                </tr>

                {/* Sound Libraries Count Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Librerías de sonido (sample packs)</td>
                  {plans.map(p => {
                    const count = p.limitLibrariesCount;
                    return (
                      <td key={p.id} className="py-3 px-4 text-center font-medium">
                        {count && count > 0 ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                            <Check size={14} className="stroke-[3]" />
                            {count} Librerías
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-center gap-1.5">
                            <X size={14} />
                            No puede subir
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Sound Libraries Max Size Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Tamaño de librerías de sonido</td>
                  {plans.map(p => {
                    const count = p.limitLibrariesCount;
                    const size = p.maxLibrarySizeEach;
                    return (
                      <td key={p.id} className="py-3 px-4 text-center font-medium">
                        {count && count > 0 && size && size > 0 ? (
                          <span className="text-emerald-400 font-semibold">
                            {size} MB por cada una
                          </span>
                        ) : (
                          <span className="text-gray-500 font-normal">❌ No puede subir</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Direct Messaging Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Mensajería directa con clientes</td>
                  {plans.map(p => {
                    return (
                      <td key={p.id} className="py-3 px-4 text-center">
                        {p.directMessaging || (p.name.toLowerCase() === 'gratis' ? '❌ Bloqueada' : '✅ Ilimitada')}
                      </td>
                    );
                  })}
                </tr>

                {/* Analytics Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Analytics / estadísticas de desempeño</td>
                  {plans.map(p => {
                    const isAllowed = p.analyticsAccess;
                    return (
                      <td key={p.id} className="py-3 px-4 text-center text-gray-300">
                        {isAllowed ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                            <Check size={14} className="stroke-[3]" /> Acceso Completo
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-center gap-1">
                            <X size={14} /> Sin acceso al módulo
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Support Level Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Nivel de soporte</td>
                  {plans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center text-gray-300">
                      {p.support}
                    </td>
                  ))}
                </tr>

                {/* Stems Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Soporte de Stems (Multitracks)</td>
                  {plans.map(p => {
                    const allowed = p.stemsAllowed ?? (p.name.toLowerCase() !== 'gratis');
                    return (
                      <td key={p.id} className="py-3 px-4 text-center">
                        {allowed ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                            <Check size={14} className="stroke-[3]" /> Sí
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-center gap-1">
                            <X size={14} /> No
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Allowed Formats Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Formatos Permitidos</td>
                  {plans.map(p => {
                    const formats = p.allowedFormats || (p.name.toLowerCase() === 'gratis' ? 'MP3' : 'WAV');
                    return (
                      <td key={p.id} className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                        {formats}
                      </td>
                    );
                  })}
                </tr>

                {/* Featured Landing Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Destacado en Landing Page</td>
                  {plans.map(p => {
                    const isFeat = p.featured;
                    return (
                      <td key={p.id} className="py-3 px-4 text-center">
                        {isFeat ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                            <Check size={14} className="stroke-[3]" /> Sí
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-center gap-1">
                            No
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Profile Badge Row */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Badge de perfil</td>
                  {plans.map(p => {
                    const bType = p.badgeType;
                    return (
                      <td key={p.id} className="py-3 px-4 text-center">
                        {bType && bType !== 'Ninguno' ? (
                          <span className="text-[#8D84F7] font-bold bg-[#534AB7]/15 px-2.5 py-1 rounded-full border border-[#534AB7]/30 inline-flex items-center gap-1 text-[10px]">
                            <ShieldCheck size={12} className="text-[#7F77DD]" /> Badge "{bType}"
                          </span>
                        ) : (
                          <span className="text-gray-500">Ninguno</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <Button variant="primary" size="sm" onClick={() => setIsCompareModalOpen(false)}>
              Cerrar Comparativa
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. SUBSCRIPTION PAYMENT & SIMULATION MODAL */}
      <Modal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        title={`Adquirir Membresía: Plan ${selectedPlanToBuy?.name}`}
        maxWidth="max-w-4xl"
      >
        {selectedPlanToBuy && (
          <div className="space-y-6 text-left py-1">
            
            {/* Header info with Currency Toggle */}
            <div className="p-5 bg-[#0D0D14] border border-white/10 rounded-2xl space-y-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-white/50 block font-bold uppercase tracking-wider">Plan Seleccionado</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-black text-[#8D84F7]">{selectedPlanToBuy.name}</span>
                    <span className="text-xs bg-[#534AB7]/30 text-[#8D84F7] font-bold px-2.5 py-0.5 rounded-full border border-[#534AB7]/40">
                      Acceso Total
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-white/50 block font-bold uppercase tracking-wider">Precio Base</span>
                  <span className="text-base font-mono font-extrabold text-[#E5E5E5]">
                    {selectedPlanToBuy.price === 0 ? 'Gratis / Mes' : `$${selectedPlanToBuy.price} USD / mes`}
                  </span>
                </div>
              </div>
            </div>

            {/* If plan is free, describe downgrade implications */}
            {selectedPlanToBuy.price === 0 ? (
              <div className="space-y-4">
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-xs leading-relaxed flex gap-3.5">
                  <AlertCircle size={22} className="flex-shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-sm block text-white mb-1">¡Aviso de Cambio a Plan Gratuito!</span>
                    Al cambiar al plan gratuito, tu límite de beats permitidos bajará automáticamente a <strong>5 beats</strong> en catálogo. Si tienes más de 5 beats activos, el sistema los conservará pero no podrás cargar pistas nuevas hasta liberar espacio o adquirir un plan superior.
                  </div>
                </div>
                
                <div className="flex gap-2.5 justify-end border-t border-white/5 pt-4">
                  <Button variant="ghost" size="sm" onClick={() => setIsSubscribeModalOpen(false)}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={() => handleConfirmPlanChange(selectedPlanToBuy)}>
                    Confirmar Cambio Gratis
                  </Button>
                </div>
              </div>
            ) : activeMethods.length === 0 ? (
              /* NOTICE IF NO ADMIN PAYMENT METHODS CONFIGURED */
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl space-y-3 text-left">
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <AlertCircle size={24} className="flex-shrink-0" />
                    <h4 className="text-base font-bold text-white">No hay métodos de pago disponibles por el momento</h4>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                    Actualmente la administración no tiene cuentas ni métodos de pago activos configurados. Por favor intenta nuevamente más tarde o contacta con soporte.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsSubscribeModalOpen(false)}>
                    Entendido / Cerrar
                  </Button>
                </div>
              </div>
            ) : (
              /* 2-COLUMN SPACIOUS LAYOUT FOR ACCOUNTS & FORM */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Payment Methods & Details (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70 tracking-wider uppercase flex items-center gap-1.5">
                      <CreditCard size={14} className="text-[#8D84F7]" /> 1. Elige Canal y Realiza el Pago
                    </span>
                  </div>

                  {/* Channel Tab selector */}
                  <div className="grid grid-cols-2 gap-2 bg-[#0C0C14] p-1.5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => { setPaymentType('bancos'); setFormErrors({}); }}
                      className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        paymentType === 'bancos' 
                          ? 'bg-[#1C1C2E] text-white border border-white/10 shadow-md' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Landmark size={15} />
                      Bancos (TM / EnZona)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentType('qvapay'); setFormErrors({}); }}
                      className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        paymentType === 'qvapay' 
                          ? 'bg-[#1C1C2E] text-white border border-white/10 shadow-md' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Wallet size={15} />
                      QvaPay
                    </button>
                  </div>

                  {/* Accounts Details List */}
                  {paymentType === 'bancos' ? (
                    <div className="space-y-3">
                      {activeMethods.filter(m => m.type === 'bancos' || (m.type as string) === 'transfermovil').length === 0 ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 text-center">
                          No hay cuentas bancarias activas configuradas por el administrador en este momento.
                        </div>
                      ) : (
                        activeMethods
                          .filter(m => m.type === 'bancos' || (m.type as string) === 'transfermovil')
                          .map((method) => {
                            const planPrice = selectedPlanToBuy ? selectedPlanToBuy.price : 0;
                            const cardCurr = (method.currencyType === 'MLC' ? 'MLC' : 'CUP') as 'CUP' | 'MLC';
                            const convertedCard = convertPrice(planPrice, cardCurr);
                            const usdVal = exchangeRates?.USD || 385;
                            const mlcVal = exchangeRates?.MLC || 280;
                            const rateSubText = cardCurr === 'MLC'
                              ? `Tasa El Toque: 1 USD ≈ ${(usdVal / mlcVal).toFixed(2)} MLC`
                              : `Tasa El Toque: 1 USD = ${usdVal} CUP`;

                            return (
                              <div key={method.id} className="bg-[#13131F] border border-brand-primary/25 p-4 rounded-xl space-y-3 shadow-sm hover:border-brand-primary/40 transition-colors">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[11px] bg-[#534AB7]/30 text-[#8D84F7] font-black px-3 py-1 rounded-full border border-[#534AB7]/40 inline-flex items-center gap-1.5">
                                    <Landmark size={12} /> {method.bankName || 'BANCO'} ({cardCurr})
                                  </span>
                                  <div className="flex gap-1.5">
                                    {method.acceptsTransfermovil !== false && (
                                      <span className="px-2.5 py-0.5 text-[10.5px] font-bold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1">
                                        <Landmark size={10} /> Transfermóvil
                                      </span>
                                    )}
                                    {method.acceptsEnzona !== false && (
                                      <span className="px-2.5 py-0.5 text-[10.5px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                                        <ShieldCheck size={10} /> EnZona
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs text-left">
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
                                    <div className="flex items-center justify-between p-2 bg-[#0C0C14] rounded-lg border border-white/5">
                                      <span className="text-white/50 text-[11px] font-medium">Titular de la cuenta:</span>
                                      <div className="flex items-center gap-2">
                                        <strong className="text-white font-mono">{method.cardHolder}</strong>
                                        {renderCopyButton(method.cardHolder, 'Titular')}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between p-2 bg-[#0C0C14] rounded-lg border border-white/5">
                                    <span className="text-white/50 text-[11px] font-medium">Tarjeta / Nro. Cuenta:</span>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-white font-mono text-sm">{method.cardNumber}</strong>
                                      {renderCopyButton(method.cardNumber || '', 'Tarjeta')}
                                    </div>
                                  </div>

                                  {method.phoneConfirm && (
                                    <div className="flex items-center justify-between p-2 bg-[#0C0C14] rounded-lg border border-white/5">
                                      <span className="text-white/50 text-[11px] font-medium">Teléfono Confirmación SMS:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-mono">{method.phoneConfirm}</span>
                                        {renderCopyButton(method.phoneConfirm || '', 'Teléfono')}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {method.qrScreenshot && (
                                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-3 bg-[#0C0C14] p-2.5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2.5">
                                      <div 
                                        onClick={() => setEnlargedQrUrl(method.qrScreenshot || null)}
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#8D84F7]/40 bg-white p-1 hover:border-[#8D84F7] transition-all shadow-md flex-shrink-0"
                                        title="Haz clic para ampliar QR"
                                      >
                                        <img 
                                          src={method.qrScreenshot} 
                                          alt="QR de Pago" 
                                          className="w-14 h-14 object-contain"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                          <Maximize2 size={16} className="text-white" />
                                        </div>
                                      </div>
                                      <div className="text-left">
                                        <span className="text-xs font-bold text-white block">Código QR de Cobro</span>
                                        <span className="text-[10.5px] text-gray-400 block">Toca la imagen para ampliar</span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setEnlargedQrUrl(method.qrScreenshot || null)}
                                      className="px-2.5 py-1.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/40 text-[#8D84F7] hover:text-white border border-[#534AB7]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
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
                  ) : (
                    <div className="space-y-3">
                      {activeMethods.filter(m => m.type === 'qvapay').length === 0 ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 text-center">
                          No hay cuentas QvaPay activas configuradas por el administrador en este momento.
                        </div>
                      ) : (
                        activeMethods
                          .filter(m => m.type === 'qvapay')
                          .map((method) => (
                            <div key={method.id} className="bg-[#13131F] border border-brand-primary/25 p-4 rounded-xl space-y-3 shadow-sm hover:border-brand-primary/40 transition-colors">
                              <span className="text-[11px] bg-[#534AB7]/30 text-[#8D84F7] font-black px-3 py-1 rounded-full border border-[#534AB7]/40 inline-flex items-center gap-1.5">
                                <Wallet size={12} /> QvaPay
                              </span>

                              <div className="space-y-2 text-xs text-left">
                                <div className="flex items-center justify-between p-2 bg-[#0C0C14] rounded-lg border border-white/5">
                                  <span className="text-white/50 text-[11px] font-medium">Correo QvaPay:</span>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-white font-mono">{method.qvapayEmail}</strong>
                                    {renderCopyButton(method.qvapayEmail || '', 'Correo QvaPay')}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between p-2 bg-[#0C0C14] rounded-lg border border-white/5">
                                  <span className="text-white/50 text-[11px] font-medium">Usuario QvaPay:</span>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-white font-mono">@{method.qvapayUser}</strong>
                                    {renderCopyButton(method.qvapayUser || '', 'Usuario QvaPay')}
                                  </div>
                                </div>

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
                                    <strong className="text-emerald-400 font-mono text-sm font-extrabold">${selectedPlanToBuy ? selectedPlanToBuy.price.toFixed(2) : '0.00'} USD / SQP</strong>
                                    {renderCopyButton(`${selectedPlanToBuy ? selectedPlanToBuy.price.toFixed(2) : '0'}`, 'Monto USD')}
                                  </div>
                                </div>
                              </div>

                              {method.qrQvapayScreenshot && (
                                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-3 bg-[#0C0C14] p-2.5 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2.5">
                                    <div 
                                      onClick={() => setEnlargedQrUrl(method.qrQvapayScreenshot || null)}
                                      className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#8D84F7]/40 bg-white p-1 hover:border-[#8D84F7] transition-all shadow-md flex-shrink-0"
                                      title="Haz clic para ampliar QR"
                                    >
                                      <img 
                                        src={method.qrQvapayScreenshot} 
                                        alt="QR QvaPay" 
                                        className="w-14 h-14 object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                        <Maximize2 size={16} className="text-white" />
                                      </div>
                                    </div>
                                    <div className="text-left">
                                      <span className="text-xs font-bold text-white block">Código QR QvaPay</span>
                                      <span className="text-[10.5px] text-gray-400 block">Toca la imagen para ampliar</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setEnlargedQrUrl(method.qrQvapayScreenshot || null)}
                                    className="px-2.5 py-1.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/40 text-[#8D84F7] hover:text-white border border-[#534AB7]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
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

                {/* RIGHT COLUMN: Form Simulation Inputs (5 cols) */}
                <div className="md:col-span-5 bg-[#0C0C14] border border-white/10 p-5 rounded-2xl space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-white/10 pb-2.5">
                      <span className="text-xs font-extrabold text-white tracking-wider uppercase block">
                        2. Reportar Comprobante
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Ingresa los datos para la verificación inmediata por el administrador.
                      </p>
                    </div>

                    {paymentType === 'bancos' && (
                      <Input
                        label="Titular / Nombre Emisor *"
                        placeholder="Ej. Juan Pérez"
                        value={senderCardNum}
                        onChange={(e) => {
                          setSenderCardNum(e.target.value);
                          if (formErrors.senderCardNum) {
                            setFormErrors(prev => {
                              const next = { ...prev };
                              delete next.senderCardNum;
                              return next;
                            });
                          }
                        }}
                        error={formErrors.senderCardNum}
                      />
                    )}

                    <Input
                      label="ID de Transacción / Referencia *"
                      placeholder="Ej. FT26129302 o ID Tx QvaPay"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        if (formErrors.transactionId) {
                          setFormErrors(prev => {
                            const next = { ...prev };
                            delete next.transactionId;
                            return next;
                          });
                        }
                      }}
                      error={formErrors.transactionId}
                    />

                    {/* Screenshot Upload */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">
                        Comprobante de pago (Captura) *
                      </label>
                      
                      {receiptScreenshot ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/15 bg-white/5 p-2 flex flex-col items-center">
                          <img 
                            src={receiptScreenshot} 
                            alt="Comprobante" 
                            className="max-h-36 rounded object-contain w-full"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setReceiptScreenshot('')}
                            className="absolute top-3 right-3 bg-black/80 hover:bg-black text-white p-1 rounded-full transition-colors cursor-pointer"
                            title="Eliminar captura"
                          >
                            <X size={14} />
                          </button>
                          <span className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                            <Check size={11} className="text-emerald-400" /> Imagen cargada
                          </span>
                        </div>
                      ) : (
                        <div 
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                addToast('Por favor, selecciona un archivo de tipo imagen (.png, .jpg)', 'error');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setReceiptScreenshot(event.target.result as string);
                                  if (formErrors.receiptScreenshot) {
                                    setFormErrors(prev => {
                                      const next = { ...prev };
                                      delete next.receiptScreenshot;
                                      return next;
                                    });
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            formErrors.receiptScreenshot 
                              ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10' 
                              : 'border-white/15 hover:border-[#8D84F7] bg-white/[0.02] hover:bg-white/[0.04]'
                          }`}
                          onClick={() => {
                            const fileInput = document.getElementById('receipt-upload-input');
                            if (fileInput) fileInput.click();
                          }}
                        >
                          <input
                            id="receipt-upload-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!file.type.startsWith('image/')) {
                                  addToast('Por favor, selecciona un archivo de tipo imagen (.png, .jpg)', 'error');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setReceiptScreenshot(event.target.result as string);
                                    if (formErrors.receiptScreenshot) {
                                      setFormErrors(prev => {
                                        const next = { ...prev };
                                        delete next.receiptScreenshot;
                                        return next;
                                      });
                                    }
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div className="p-2 bg-white/5 rounded-full text-white/50">
                            <Camera size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white/90 block">
                              Cargar comprobante
                            </span>
                            <span className="text-[10px] text-white/40 block mt-0.5">
                              Clic o arrastra imagen PNG / JPG
                            </span>
                          </div>
                        </div>
                      )}
                      {formErrors.receiptScreenshot && (
                        <p className="text-[11px] text-red-500 font-medium">{formErrors.receiptScreenshot}</p>
                      )}
                    </div>
                  </div>

                  {/* Footer submit action */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setIsSubscribeModalOpen(false)}>Cancelar</Button>
                    <Button variant="primary" size="sm" onClick={() => handleConfirmPlanChange(selectedPlanToBuy)}>
                      Confirmar Pago
                    </Button>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </Modal>

      {/* MODAL FOR ENLARGED QR CODE OVERLAY */}
      <Modal
        isOpen={!!enlargedQrUrl}
        onClose={() => setEnlargedQrUrl(null)}
        title="Código QR de Pago"
        maxWidth="max-w-md"
      >
        {enlargedQrUrl && (
          <div className="flex flex-col items-center justify-center p-3 space-y-4 text-center">
            <div className="p-4 bg-white rounded-2xl border-2 border-[#8D84F7]/40 shadow-2xl inline-block max-w-full">
              <img 
                src={enlargedQrUrl} 
                alt="Código QR Ampliado" 
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-gray-300 font-medium leading-relaxed max-w-xs">
              Escanea este código directamente desde tu aplicación bancaria o billetera electrónica para realizar la transferencia.
            </p>
            <div className="pt-2 border-t border-white/10 w-full flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setEnlargedQrUrl(null)}>
                Cerrar Vista Previa
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
