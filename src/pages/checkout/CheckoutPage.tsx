import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ExchangeRateBadge } from '../../components/ui/ExchangeRateBadge';
import { 
  CreditCard, Landmark, Check, ArrowLeft, 
  Send, ShieldAlert, Upload, Wallet, Copy, X, Camera, ChevronRight, ChevronLeft
} from 'lucide-react';

// Estructura para agrupar ítems e información de pago por productor individual
interface ProducerGroup {
  producerId: string;
  producerName: string;
  items: any[];
  subtotalUSD: number;
  bankMethods: any[];
  qvapayMethods: any[];
  hasBankMethods: boolean;
  hasQvapayMethods: boolean;
}

// Estado de comprobante e id de transacción por productor
interface ProducerProofState {
  channel: 'bancos' | 'qvapay';
  selectedBankCardId: string;
  transactionId: string;
  smsConfirmation: string;
  receiptImage: string | null;
}

export const CheckoutPage: React.FC = () => {
  const { 
    cart, createOrder, removeFromCart, navigateTo, addToast, user, 
    convertPrice, exchangeRates, getProducerPaymentMethods, addProducerNotification, isTransactionIdUnique 
  } = useApp();

  const payableCart = useMemo(() => cart.filter(item => item.selected !== false), [cart]);

  // CAMBIO CLAVE 1: Agrupar los ítems del carrito por producerId
  // Cada productor tiene su propio subtotal y sus propios métodos de cobro
  const producerGroups = useMemo<ProducerGroup[]>(() => {
    const map = new Map<string, { items: typeof payableCart; producerName: string }>();

    payableCart.forEach(item => {
      const pId = item.beat.producerId;
      if (!map.has(pId)) {
        map.set(pId, { items: [], producerName: item.beat.producerName || 'Productor' });
      }
      map.get(pId)!.items.push(item);
    });

    const groups: ProducerGroup[] = [];
    map.forEach((value, pId) => {
      const pMethods = getProducerPaymentMethods(pId).filter((m: any) => m.active !== false);
      const bankMethods = pMethods.filter((m: any) => m.type === 'transfermovil' || m.type === 'enzona' || !!m.cardNumber);
      const qvapayMethods = pMethods.filter((m: any) => m.type === 'qvapay');

      groups.push({
        producerId: pId,
        producerName: value.producerName,
        items: value.items,
        subtotalUSD: value.items.reduce((sum, item) => sum + item.price, 0),
        bankMethods,
        qvapayMethods,
        hasBankMethods: bankMethods.length > 0,
        hasQvapayMethods: qvapayMethods.length > 0,
      });
    });

    return groups;
  }, [payableCart, getProducerPaymentMethods]);

  // CAMBIO CLAVE 2: Estado indexado por producerId para almacenar transactionId, receiptImage, smsConfirmation y canal por productor
  const [proofByProducer, setProofByProducer] = useState<Record<string, ProducerProofState>>({});

  // Paso actual para el wizard multi-productor (0-indexed)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Inicializar estado de comprobante para cada productor de forma independiente
  useEffect(() => {
    setProofByProducer(prev => {
      const next = { ...prev };
      let updated = false;

      producerGroups.forEach(group => {
        if (!next[group.producerId]) {
          updated = true;
          const initialChannel = group.hasBankMethods ? 'bancos' : group.hasQvapayMethods ? 'qvapay' : 'bancos';
          const initialCardId = group.bankMethods.length > 0 ? group.bankMethods[0].id : '';
          next[group.producerId] = {
            channel: initialChannel,
            selectedBankCardId: initialCardId,
            transactionId: '',
            smsConfirmation: '',
            receiptImage: null,
          };
        }
      });

      return updated ? next : prev;
    });
  }, [producerGroups]);

  // Asegurar que el paso actual esté dentro del rango disponible
  const activeStep = Math.min(currentStepIndex, Math.max(0, producerGroups.length - 1));
  const currentGroup = producerGroups[activeStep] || producerGroups[0];

  // Helper para actualizar los datos de comprobante del productor actual
  const updateCurrentProducerProof = (updates: Partial<ProducerProofState>) => {
    if (!currentGroup) return;
    setProofByProducer(prev => {
      const pId = currentGroup.producerId;
      const current = prev[pId] || {
        channel: currentGroup.hasBankMethods ? 'bancos' : 'qvapay',
        selectedBankCardId: currentGroup.bankMethods[0]?.id || '',
        transactionId: '',
        smsConfirmation: '',
        receiptImage: null,
      };
      return {
        ...prev,
        [pId]: { ...current, ...updates }
      };
    });
  };

  const currentProof = (currentGroup && proofByProducer[currentGroup.producerId]) || {
    channel: currentGroup?.hasBankMethods ? 'bancos' : 'qvapay',
    selectedBankCardId: currentGroup?.bankMethods[0]?.id || '',
    transactionId: '',
    smsConfirmation: '',
    receiptImage: null,
  };

  // Método de tarjeta bancaria seleccionado para el grupo actual
  const currentSelectedBankCard = useMemo(() => {
    if (!currentGroup || currentGroup.bankMethods.length === 0) return null;
    return currentGroup.bankMethods.find((m: any) => m.id === currentProof.selectedBankCardId) || currentGroup.bankMethods[0];
  }, [currentGroup, currentProof.selectedBankCardId]);

  // Método QvaPay para el grupo actual
  const currentSelectedQvapayMethod = useMemo(() => {
    if (!currentGroup || currentGroup.qvapayMethods.length === 0) return null;
    return currentGroup.qvapayMethods[0];
  }, [currentGroup]);

  // Estados auxiliares UI
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedQrImage, setExpandedQrImage] = useState<string | null>(null);

  const handleCopyText = (text: string, fieldKey: string) => {
    let copiedWithClipboard = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        copiedWithClipboard = true;
        setCopiedField(fieldKey);
        addToast('¡Copiado al portapapeles con éxito!', 'success');
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch (e) {
      // Fallback
    }

    if (!copiedWithClipboard) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setCopiedField(fieldKey);
          addToast('¡Copiado al portapapeles con éxito!', 'success');
          setTimeout(() => setCopiedField(null), 2000);
        } else {
          addToast('No se pudo copiar automáticamente. Por favor selecciónalo manualmente.', 'error');
        }
      } catch (err) {
        addToast('No se pudo copiar automáticamente. Por favor selecciónalo manualmente.', 'error');
      }
    }
  };

  const totalCartAmountUSD = useMemo(() => payableCart.reduce((acc, item) => acc + item.price, 0), [payableCart]);

  // Carga de captura de pantalla para el grupo actual
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentGroup) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateCurrentProducerProof({ receiptImage: event.target.result as string });
          addToast('Captura de comprobante cargada con éxito', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateReceiptUpload = () => {
    if (!currentGroup) return;
    updateCurrentProducerProof({
      receiptImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg=='
    });
    addToast('Captura de recibo adjuntada correctamente', 'success');
  };

  // Validar datos de un productor específico antes de avanzar o finalizar
  const validateProducerProof = (group: ProducerGroup, proof: ProducerProofState): boolean => {
    const txId = proof.transactionId.trim();
    if (!txId) {
      addToast(`El Número de ID de Transacción para "${group.producerName}" es obligatorio.`, 'error');
      return false;
    }

    if (!proof.receiptImage) {
      addToast(`Debe subir la captura del comprobante de pago para "${group.producerName}".`, 'error');
      return false;
    }

    if (!isTransactionIdUnique(txId)) {
      addToast(`El ID de transacción "${txId}" para "${group.producerName}" ya fue registrado en la plataforma.`, 'error');
      return false;
    }

    return true;
  };

  // Avanzar al siguiente paso del wizard multi-productor
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGroup) return;

    if (!validateProducerProof(currentGroup, currentProof)) {
      return;
    }

    // Verificar que el ID de transacción de este paso no coincida con los de otros pasos en el mismo formulario
    const otherDuplicate = Object.entries(proofByProducer).some(([pId, proof]: [string, ProducerProofState]) => {
      return pId !== currentGroup.producerId && proof.transactionId.trim() === currentProof.transactionId.trim();
    });

    if (otherDuplicate) {
      addToast(`Cada productor requiere un ID de transferencia diferente. Has usado "${currentProof.transactionId}" en otro paso.`, 'error');
      return;
    }

    if (activeStep < producerGroups.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // CAMBIO CLAVE 3: Procesamiento final de pagos orden por orden y por grupo de productor
  const handleConfirmAllPayments = (e: React.FormEvent) => {
    e.preventDefault();
    if (payableCart.length === 0 || producerGroups.length === 0) return;

    // Validar absolutamente todos los grupos de productores antes de crear cualquier orden
    const txIdsUsed = new Set<string>();
    for (const group of producerGroups) {
      const proof = proofByProducer[group.producerId];
      if (!proof || !validateProducerProof(group, proof)) {
        // Redirigir al paso no completado
        const targetIndex = producerGroups.findIndex(g => g.producerId === group.producerId);
        if (targetIndex !== -1) setCurrentStepIndex(targetIndex);
        return;
      }

      const cleanTx = proof.transactionId.trim();
      if (txIdsUsed.has(cleanTx)) {
        addToast(`El ID de transacción "${cleanTx}" se repite entre productores. Cada transferencia a un productor debe tener un ID único.`, 'error');
        const targetIndex = producerGroups.findIndex(g => g.producerId === group.producerId);
        if (targetIndex !== -1) setCurrentStepIndex(targetIndex);
        return;
      }
      txIdsUsed.add(cleanTx);
    }

    let allSuccessful = true;
    const usdRate = exchangeRates?.USD || exchangeRates?.CUP || 385.0;
    const mlcRate = exchangeRates?.MLC || 280.0;
    const frozenAt = new Date().toISOString();

    // Recorrer cada grupo de productor y generar sus órdenes correspondientes con sus propios datos de pago
    for (const group of producerGroups) {
      const proof = proofByProducer[group.producerId];
      if (!proof) continue;

      const groupBankCard = group.bankMethods.find((m: any) => m.id === proof.selectedBankCardId) || group.bankMethods[0];

      for (const item of group.items) {
        if (proof.channel === 'bancos') {
          const targetCurrency = groupBankCard?.currencyType || 'CUP';
          let rateForMethod = usdRate;
          let convertedAmount = Math.round(item.price * usdRate);

          if (targetCurrency === 'MLC') {
            rateForMethod = Number((usdRate / mlcRate).toFixed(4));
            convertedAmount = Number((item.price * rateForMethod).toFixed(2));
          }

          const created = createOrder({
            id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
            beatId: item.beat.id,
            beatTitle: item.beat.title,
            buyerName: user?.artistName || user?.name || user?.username || 'Comprador',
            buyerEmail: user?.email || 'cliente@dcubanbeats.com',
            producerId: item.beat.producerId,
            producerName: item.beat.producerName,
            amount: convertedAmount,
            currency: targetCurrency,
            method: groupBankCard?.acceptsTransfermovil ? 'Transfermovil' : 'EnZona',
            status: 'pending',
            date: 'Hace un momento',
            transactionId: proof.transactionId.trim(),
            verificationSMS: proof.smsConfirmation || undefined,
            receiptUrl: proof.receiptImage || '',
            exchangeRateUsed: rateForMethod,
            amountUSD: item.price,
            amountConverted: convertedAmount,
            rateFrozenAt: frozenAt
          });

          if (!created) {
            allSuccessful = false;
            break;
          }

          addProducerNotification(
            'beat_sold',
            'Nuevo Pago Bancario por Validar',
            `El artista ${user?.artistName || user?.name || 'Comprador'} ha registrado un pago bancario de ${convertPrice(item.price, targetCurrency as any).formatted} por el beat "${item.beat.title}". ID de Operación: ${proof.transactionId}. Por favor verifica el comprobante.`,
            item.beat.id
          );

          removeFromCart(item.id);
        } else {
          // QvaPay channel
          const created = createOrder({
            id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
            beatId: item.beat.id,
            beatTitle: item.beat.title,
            buyerName: user?.artistName || user?.name || user?.username || 'Comprador',
            buyerEmail: user?.email || 'cliente@dcubanbeats.com',
            producerId: item.beat.producerId,
            producerName: item.beat.producerName,
            amount: item.price,
            currency: 'USDT',
            method: 'QvaPay',
            status: 'pending',
            date: 'Hace un momento',
            transactionId: proof.transactionId.trim(),
            verificationSMS: proof.smsConfirmation || undefined,
            receiptUrl: proof.receiptImage || '',
            exchangeRateUsed: 1,
            amountUSD: item.price,
            amountConverted: item.price,
            rateFrozenAt: frozenAt
          });

          if (!created) {
            allSuccessful = false;
            break;
          }

          addProducerNotification(
            'beat_sold',
            'Nuevo Pago QvaPay por Validar',
            `El artista ${user?.artistName || user?.name || 'Comprador'} ha registrado un pago QvaPay de $${item.price} USD por el beat "${item.beat.title}". ID de Operación: ${proof.transactionId}. Por favor verifica tu saldo en QvaPay y aprueba el pago.`,
            item.beat.id
          );

          removeFromCart(item.id);
        }
      }

      if (!allSuccessful) break;
    }

    if (allSuccessful) {
      addToast('Comprobantes de pago enviados correctamente a los productores. Se verificarán en breve.', 'success');
      navigateTo('/');
    }
  };

  // Validaciones de sesión e identidad
  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-red-500/25 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-250">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-white uppercase tracking-tight">Inicio de Sesión Requerido</h1>
          <p className="text-[14px] font-normal text-gray-300 leading-relaxed md:px-6">
            Debes estar autenticado para poder proceder con el pago y la compra de beats. Inicia sesión como Comprador o Artista para continuar.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/')} className="text-[14px] font-medium">
            Volver al Catálogo
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/login')} className="text-[14px] font-semibold">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== 'client') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-red-500/25 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-250">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-white uppercase tracking-tight">Acceso No Autorizado</h1>
          <p className="text-[14px] font-normal text-gray-300 leading-relaxed">
            Solo las cuentas de Comprador/Artista pueden proceder al pago de beats y adquirir licencias en la plataforma.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/')} className="text-[14px] font-medium">
            Volver al Catálogo
          </Button>
        </div>
      </div>
    );
  }

  const isUnverifiedClient = user.role === 'client' && !user.verified;
  if (isUnverifiedClient) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-red-500/25 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-250">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-white uppercase tracking-tight">Verificación de Identidad Requerida</h1>
          <p className="text-[14px] font-normal text-gray-300 leading-relaxed">
            Como artista, debes verificar tu identidad (KYC) antes de poder realizar compras de beats en D'Cuban Beats. Esto garantiza la total conformidad legal de las licencias.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/')} className="text-[14px] font-medium">
            Volver al Catálogo
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/artist/dashboard')} className="text-[14px] font-semibold">
            Iniciar Verificación KYC
          </Button>
        </div>
      </div>
    );
  }

  if (producerGroups.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-white/10 rounded-3xl p-8 text-center space-y-6">
        <h2 className="text-xl font-bold text-white">Tu Carrito está Vacío</h2>
        <Button variant="primary" size="sm" onClick={() => navigateTo('/cart')}>
          Volver al Carrito
        </Button>
      </div>
    );
  }

  const isMultiProducer = producerGroups.length > 1;

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-6 text-left">
      
      {/* Title Header with Volver al Carrito */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight text-white uppercase flex items-center gap-2.5">
            <CreditCard size={22} className="text-[#7F77DD]" />
            <span>Pagar Instrumentales</span>
          </h1>
          {isMultiProducer && (
            <p className="text-xs text-amber-300 font-medium mt-1">
              Tu carrito incluye beats de {producerGroups.length} productores distintos. Debes realizar y comprobar el pago correspondiente a cada uno.
            </p>
          )}
        </div>

        <button 
          onClick={() => navigateTo('/cart')}
          className="px-3.5 py-1.5 bg-[#1C1C2E] hover:bg-white/10 border border-white/10 hover:border-[#7F77DD]/50 text-white/80 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={14} className="text-[#7F77DD]" />
          <span>Volver al Carrito</span>
        </button>
      </div>

      {/* Exchange Rate Transparency Banner */}
      <ExchangeRateBadge variant="banner" />

      {/* CAMBIO CLAVE 4: Visualizador de pasos cuando hay múltiples productores */}
      {isMultiProducer && (
        <div className="bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#534AB7] text-white font-bold text-xs px-3 py-1 rounded-lg">
              Paso {activeStep + 1} de {producerGroups.length}
            </span>
            <span className="text-white text-sm font-bold">
              Pago para Productor: <span className="text-[#7F77DD]">{currentGroup.producerName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {producerGroups.map((group, idx) => {
              const pProof = proofByProducer[group.producerId];
              const isDone = !!pProof?.transactionId?.trim() && !!pProof?.receiptImage;
              const isCurrent = idx === activeStep;

              return (
                <button
                  key={group.producerId}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#534AB7] text-white border border-[#7F77DD] shadow-md'
                      : isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#1C1C2E] text-white/50 border border-white/5 hover:text-white'
                  }`}
                >
                  {isDone && !isCurrent ? <Check size={12} className="text-emerald-400" /> : null}
                  <span>{group.producerName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!currentGroup.hasBankMethods && !currentGroup.hasQvapayMethods ? (
        <div className="py-12 px-6 bg-[#13131F] rounded-3xl border border-red-500/30 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-white font-bold text-[18px]">Método de Pago No Configurado</h3>
            <p className="text-white/70 text-[14px] leading-relaxed">
              El productor <strong className="text-white">{currentGroup.producerName}</strong> no ha configurado ningún método de pago (Bancos o QvaPay). Por favor vuelve al carrito o ponte en contacto con el productor.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigateTo('/cart')} className="text-xs font-bold mx-auto">
            <ArrowLeft size={16} className="mr-2" />
            Volver al Carrito
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Beats of this producer & Channel selector & Target payment details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Resumen de Beats del Productor Actual */}
            <div className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                  Beats a pagar a {currentGroup.producerName}
                </span>
                <span className="font-mono text-sm font-bold text-[#7F77DD]">
                  Subtotal: ${currentGroup.subtotalUSD} USD
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentGroup.items.map(item => (
                  <span key={item.id} className="text-xs bg-[#1C1C2E] text-white/90 px-3 py-1.5 rounded-xl border border-white/10 font-medium">
                    🎵 {item.beat.title} — <strong className="text-[#7F77DD]">${item.price} USD</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Selector de Canal de Pago (Bancos vs QvaPay) para este productor */}
            <div className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-2xl p-5 space-y-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest block">
                Canal de Pago para {currentGroup.producerName}
              </span>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* BANCOS BUTTON */}
                <button
                  type="button"
                  disabled={!currentGroup.hasBankMethods}
                  onClick={() => updateCurrentProducerProof({ channel: 'bancos' })}
                  className={`py-3.5 px-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentProof.channel === 'bancos'
                      ? 'bg-[#534AB7]/25 text-[#7F77DD] border border-[#7F77DD] shadow-sm'
                      : currentGroup.hasBankMethods
                        ? 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/70 hover:text-white'
                        : 'bg-[#1C1C2E]/40 border border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Landmark size={18} />
                    <span>Bancos</span>
                  </div>
                  {!currentGroup.hasBankMethods && (
                    <span className="text-[10px] font-normal text-red-400">No habilitado por el productor</span>
                  )}
                </button>

                {/* QVAPAY BUTTON */}
                <button
                  type="button"
                  disabled={!currentGroup.hasQvapayMethods}
                  onClick={() => updateCurrentProducerProof({ channel: 'qvapay' })}
                  className={`py-3.5 px-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentProof.channel === 'qvapay'
                      ? 'bg-[#534AB7]/25 text-[#7F77DD] border border-[#7F77DD] shadow-sm'
                      : currentGroup.hasQvapayMethods
                        ? 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/70 hover:text-white'
                        : 'bg-[#1C1C2E]/40 border border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Wallet size={18} />
                    <span>QvaPay</span>
                  </div>
                  {!currentGroup.hasQvapayMethods && (
                    <span className="text-[10px] font-normal text-red-400">No habilitado por el productor</span>
                  )}
                </button>
              </div>
            </div>

            {/* DETALLES DE CUENTA DEL PRODUCTOR SEGÚN EL CANAL */}
            <div className="bg-[#13131F] border border-[rgba(127,119,221,0.15)] rounded-2xl p-6 space-y-5">
              
              {/* 1. BANCOS DETAILS */}
              {currentProof.channel === 'bancos' && currentSelectedBankCard && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Landmark size={16} className="text-[#7F77DD]" /> 
                        Cuenta Bancaria de {currentGroup.producerName}
                      </h4>
                      <p className="text-xs text-white/50">Canales habilitados para este pago:</p>
                    </div>

                    <div className="flex gap-1.5">
                      {(currentSelectedBankCard.acceptsTransfermovil !== false) && (
                        <span className="bg-[#534AB7]/30 text-[#7F77DD] text-[10px] px-2 py-0.5 rounded font-bold border border-[#534AB7]/40">
                          Transfermóvil
                        </span>
                      )}
                      {(currentSelectedBankCard.acceptsEnzona !== false || currentSelectedBankCard.type === 'enzona') && (
                        <span className="bg-emerald-950/50 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-900/40">
                          EnZona
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Múltiples tarjetas si este productor tiene más de una */}
                  {currentGroup.bankMethods.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Selecciona la Tarjeta de Destino:</span>
                      <div className="flex flex-wrap gap-2">
                        {currentGroup.bankMethods.map((m: any) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateCurrentProducerProof({ selectedBankCardId: m.id })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              (currentSelectedBankCard?.id === m.id)
                                ? 'bg-[#534AB7] text-white'
                                : 'bg-brand-card text-gray-400 border border-brand-border/40 hover:text-white'
                            }`}
                          >
                            Tarjeta {m.currencyType || 'CUP'} ({m.cardNumber ? m.cardNumber.slice(-4) : '...' })
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Datos de la Tarjeta */}
                  <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-grow text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Número de Tarjeta:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-white font-bold text-sm select-all">{currentSelectedBankCard.cardNumber || '9224 8129 0019 4021'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentSelectedBankCard.cardNumber || '', 'cardNumber')}
                            className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                            title="Copiar Tarjeta"
                          >
                            {copiedField === 'cardNumber' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Tipo de Moneda:</span>
                        <span className="font-bold text-[#7F77DD] uppercase">{currentSelectedBankCard.currencyType || 'CUP'}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Titular de la Tarjeta:</span>
                        <span className="text-white font-semibold">{currentSelectedBankCard.titularName || currentGroup.producerName}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Teléfono a Confirmar:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-indigo-200 font-bold select-all">{currentSelectedBankCard.phoneConfirm || '+53 50000000'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentSelectedBankCard.phoneConfirm || '', 'phoneConfirm')}
                            className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                            title="Copiar Teléfono"
                          >
                            {copiedField === 'phoneConfirm' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {currentSelectedBankCard.qrScreenshot && (
                      <div className="flex-shrink-0 flex justify-center">
                        <div 
                          className="group relative cursor-pointer" 
                          onClick={() => setExpandedQrImage(currentSelectedBankCard.qrScreenshot || null)}
                        >
                          <img 
                            src={currentSelectedBankCard.qrScreenshot} 
                            alt="QR Banco" 
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded-xl border border-white/10 group-hover:border-[#7F77DD] group-hover:scale-105 transition-all duration-200" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-[9px] text-white font-semibold">
                            Ampliar
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* 2. QVAPAY DETAILS */}
              {currentProof.channel === 'qvapay' && currentSelectedQvapayMethod && (
                <div className="space-y-4">
                  
                  <div className="pb-3 border-b border-white/5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wallet size={16} className="text-[#7F77DD]" /> 
                      Cuenta QvaPay de {currentGroup.producerName}
                    </h4>
                    <p className="text-xs text-white/50">Transfiere la suma exacta a la cuenta QvaPay del productor.</p>
                  </div>

                  <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-3">
                    
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                      <span className="text-white/50 font-medium">Subtotal a Pagar a {currentGroup.producerName}:</span>
                      <span className="font-mono text-base font-bold text-[#7F77DD]">${currentGroup.subtotalUSD} USD</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Correo Cuenta QvaPay:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white font-bold select-all">{currentSelectedQvapayMethod.qvapayEmail || 'correo@qvapay.com'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(currentSelectedQvapayMethod.qvapayEmail || '', 'qvapayEmail')}
                          className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Copiar Correo"
                        >
                          {copiedField === 'qvapayEmail' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Nombre de Usuario QvaPay:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#7F77DD] font-bold select-all">@{currentSelectedQvapayMethod.qvapayUser || 'productor'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(`@${currentSelectedQvapayMethod.qvapayUser || 'productor'}`, 'qvapayUser')}
                          className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Copiar Usuario"
                        >
                          {copiedField === 'qvapayUser' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {currentSelectedQvapayMethod.qrQvapayScreenshot && (
                      <div className="pt-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-medium">Código QR de la Cuenta QvaPay:</span>
                        <div 
                          className="group relative cursor-pointer" 
                          onClick={() => setExpandedQrImage(currentSelectedQvapayMethod.qrQvapayScreenshot || null)}
                        >
                          <img 
                            src={currentSelectedQvapayMethod.qrQvapayScreenshot} 
                            alt="QR QvaPay" 
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 object-cover rounded-xl border border-white/10 group-hover:border-[#7F77DD] group-hover:scale-105 transition-all duration-200" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-[9px] text-white font-semibold">
                            Ampliar
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Right Column: Declaración de Pago para este Productor Específico */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={activeStep < producerGroups.length - 1 ? handleNextStep : handleConfirmAllPayments} className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 space-y-5">
              
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Declaración de Pago ({currentGroup.producerName})
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ingresa los datos del pago realizado a {currentGroup.producerName}.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* ID Transacción por Productor */}
                <Input
                  label="Número de ID Transacción (Obligatorio)"
                  placeholder={currentProof.channel === 'bancos' ? "Ej. 99421290" : "Ej. QP-882194"}
                  value={currentProof.transactionId}
                  onChange={(e) => updateCurrentProducerProof({ transactionId: e.target.value })}
                  required
                />

                {/* Textarea para SMS de confirmación */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Contenido SMS / Nota de Confirmación (Opcional)
                  </label>
                  <textarea
                    value={currentProof.smsConfirmation}
                    onChange={(e) => updateCurrentProducerProof({ smsConfirmation: e.target.value })}
                    placeholder="Pega el mensaje SMS recibido o notas adicionales para el productor..."
                    rows={3}
                    className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl p-3 text-xs text-white outline-none focus:border-brand-primary-light"
                  />
                </div>

                {/* Subir Captura del Comprobante por Productor */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Subir Captura del Comprobante (Obligatorio)
                  </label>
                  
                  {currentProof.receiptImage ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={currentProof.receiptImage} alt="Receipt preview" className="w-8 h-8 object-cover rounded border border-emerald-500/30" />
                        <span className="text-emerald-400 font-medium">Recibo adjuntado</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => updateCurrentProducerProof({ receiptImage: null })} 
                        className="text-red-400 font-semibold hover:underline cursor-pointer text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id={`receipt-file-picker-${currentGroup.producerId}`}
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <label
                          htmlFor={`receipt-file-picker-${currentGroup.producerId}`}
                          className="flex-1 py-3 px-3 bg-[#1C1C2E] hover:bg-[#1C1C2E]/80 border border-dashed border-white/20 hover:border-[#7F77DD] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-semibold text-white/80"
                        >
                          <Camera size={16} className="text-[#7F77DD]" />
                          <span>Adjuntar Captura</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleSimulateReceiptUpload}
                          className="py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
                          title="Simular carga de comprobante"
                        >
                          <Upload size={14} className="mr-1 text-gray-400" />
                          Simular
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtotal del productor actual */}
              <div className="border-t border-white/5 pt-4 flex justify-between text-sm items-center">
                <span className="font-bold text-white/70">Monto para {currentGroup.producerName}:</span>
                <span className="font-mono text-[#7F77DD] font-bold text-base">
                  {currentProof.channel === 'qvapay'
                    ? `$${currentGroup.subtotalUSD} USD`
                    : convertPrice(currentGroup.subtotalUSD, (currentSelectedBankCard?.currencyType as any) || 'CUP').formatted
                  }
                </span>
              </div>

              {/* Total acumulado del carrito */}
              {isMultiProducer && (
                <div className="flex justify-between text-xs text-white/50 border-t border-white/5 pt-2">
                  <span>Total General de Todo el Carrito:</span>
                  <span className="font-mono text-white font-bold">${totalCartAmountUSD} USD</span>
                </div>
              )}

              {/* Botones de navegación del Wizard */}
              <div className="space-y-2 pt-2">
                {activeStep < producerGroups.length - 1 ? (
                  <Button 
                    variant="primary" 
                    fullWidth 
                    type="submit" 
                    className="text-xs font-bold py-3"
                  >
                    <span>Siguiente Productor</span>
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    fullWidth 
                    type="submit" 
                    className="text-xs font-bold py-3"
                  >
                    <span>{isMultiProducer ? 'Confirmar Todos los Pagos' : 'Enviar Comprobante de Pago'}</span>
                    <Send size={14} className="ml-1.5" />
                  </Button>
                )}

                {activeStep > 0 && (
                  <Button 
                    variant="secondary" 
                    fullWidth 
                    type="button" 
                    onClick={() => setCurrentStepIndex(prev => prev - 1)}
                    className="text-xs font-medium py-2 text-white/70"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    <span>Volver al Productor Anterior</span>
                  </Button>
                )}
              </div>

            </form>
          </div>

        </div>
      )}

      {/* LIGHTBOX CÓDIGO QR */}
      {expandedQrImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-zoom-out" 
          onClick={() => setExpandedQrImage(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-[#13112A] border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-2xl animate-in zoom-in-95 cursor-default" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={() => setExpandedQrImage(null)} 
              className="absolute top-3 right-3 text-white/50 hover:text-white p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="text-center">
              <p className="text-xs font-bold text-[#7F77DD] uppercase tracking-widest">Código QR de Pago</p>
              <p className="text-[10px] text-white/40 mt-1">Escanea este código QR con la app correspondiente</p>
            </div>
            
            <div className="overflow-hidden bg-white p-4 rounded-xl shadow-inner flex items-center justify-center w-64 h-64">
              <img 
                src={expandedQrImage} 
                alt="QR Ampliado" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
            
            <Button variant="secondary" size="xs" onClick={() => setExpandedQrImage(null)} className="w-full text-xs font-semibold">
              Cerrar Vista
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
