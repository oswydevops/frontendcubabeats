import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  CreditCard, Landmark, Check, Phone, ArrowLeft, 
  Send, ShieldAlert, Upload, Wallet, Copy, X, Camera, Info
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, removeFromCart, navigateTo, addToast, user, convertPrice, exchangeRates, getProducerPaymentMethods, addProducerNotification } = useApp();

  const payableCart = useMemo(() => cart.filter(item => item.selected !== false), [cart]);

  // Find all producer payment configurations for the producers of the beats in the cart
  const producerIds = useMemo(() => {
    return Array.from(new Set(payableCart.map(item => item.beat.producerId)));
  }, [payableCart]);

  const availableProducerMethods = useMemo(() => {
    const list: any[] = [];
    producerIds.forEach(pId => {
      const pMethods = getProducerPaymentMethods(pId);
      pMethods.forEach(m => {
        if (m.active !== false) {
          list.push(m);
        }
      });
    });
    return list;
  }, [producerIds, getProducerPaymentMethods]);

  // Separate Bank methods and QvaPay methods
  const bankMethods = useMemo(() => {
    return availableProducerMethods.filter(m => m.type === 'transfermovil' || m.type === 'enzona' || !!m.cardNumber);
  }, [availableProducerMethods]);

  const qvapayMethods = useMemo(() => {
    return availableProducerMethods.filter(m => m.type === 'qvapay');
  }, [availableProducerMethods]);

  const hasBankMethods = bankMethods.length > 0;
  const hasQvapayMethods = qvapayMethods.length > 0;

  // Selected Channel State ('bancos' | 'qvapay')
  const [activeChannel, setActiveChannel] = useState<'bancos' | 'qvapay'>('bancos');

  useEffect(() => {
    if (!hasBankMethods && hasQvapayMethods) {
      setActiveChannel('qvapay');
    } else if (hasBankMethods) {
      setActiveChannel('bancos');
    }
  }, [hasBankMethods, hasQvapayMethods]);

  // Bank Card Selection (if multiple bank cards available)
  const [selectedBankCardId, setSelectedBankCardId] = useState<string>('');

  const selectedBankCard = useMemo(() => {
    if (bankMethods.length === 0) return null;
    return bankMethods.find(m => m.id === selectedBankCardId) || bankMethods[0];
  }, [bankMethods, selectedBankCardId]);

  const selectedQvapayMethod = useMemo(() => {
    if (qvapayMethods.length === 0) return null;
    return qvapayMethods[0];
  }, [qvapayMethods]);

  // Form Inputs
  const [transactionId, setTransactionId] = useState('');
  const [smsConfirmation, setSmsConfirmation] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Copy & Expand States
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

  const totalAmountUSD = useMemo(() => payableCart.reduce((acc, item) => acc + item.price, 0), [payableCart]);

  // Handle local file selection for payment proof
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptImage(event.target.result as string);
          addToast('Captura de comprobante cargada con éxito', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateReceiptUpload = () => {
    setReceiptImage('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==');
    addToast('Captura de recibo adjuntada correctamente', 'success');
  };

  // Submit payment declaration for either Bancos or QvaPay
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payableCart.length === 0) return;

    if (!transactionId.trim()) {
      addToast('El Número de ID de Transacción es obligatorio.', 'error');
      return;
    }

    if (!receiptImage) {
      addToast('Debe subir la captura del comprobante de pago para validar la transacción.', 'error');
      return;
    }

    let allSuccessful = true;
    const rateSnapshot = exchangeRates?.USD || 360;
    const frozenAt = new Date().toISOString();

    for (const item of payableCart) {
      if (activeChannel === 'bancos') {
        const targetCurrency = selectedBankCard?.currencyType || 'CUP';
        const convertedAmount = item.price * rateSnapshot;

        const created = createOrder({
          id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
          beatId: item.beat.id,
          beatTitle: item.beat.title,
          buyerName: user?.artistName || user?.name || user?.username || 'Comprador',
          buyerEmail: user?.email || 'cliente@dcubanbeats.com',
          producerId: item.beat.producerId,
          producerName: item.beat.producerName,
          amount: item.price,
          currency: targetCurrency,
          method: selectedBankCard?.acceptsTransfermovil ? 'Transfermovil' : 'EnZona',
          status: 'pending',
          date: 'Hace un momento',
          transactionId: transactionId.trim(),
          verificationSMS: smsConfirmation || undefined,
          receiptUrl: receiptImage,
          exchangeRateUsed: rateSnapshot,
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
          `El artista ${user?.artistName || user?.name || 'Comprador'} ha registrado un pago bancario de ${convertPrice(item.price, targetCurrency as any).formatted} por el beat "${item.beat.title}". ID de Operación: ${transactionId}. Por favor verifica el comprobante.`,
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
          transactionId: transactionId.trim(),
          verificationSMS: smsConfirmation || undefined,
          receiptUrl: receiptImage,
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
          `El artista ${user?.artistName || user?.name || 'Comprador'} ha registrado un pago QvaPay de $${item.price} USD por el beat "${item.beat.title}". ID de Operación: ${transactionId}. Por favor verifica tu saldo en QvaPay y aprueba el pago.`,
          item.beat.id
        );

        removeFromCart(item.id);
      }
    }

    if (allSuccessful) {
      addToast('Tu comprobante de pago ha sido enviado al productor. Se verificará en breve.', 'success');
      navigateTo('/');
    }
  };

  // Check authentication & verification
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

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-6 text-left">
      
      {/* Title Header with Volver al Carrito situated at the end */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5 flex-wrap gap-3">
        <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight text-white uppercase flex items-center gap-2.5">
          <CreditCard size={22} className="text-[#7F77DD]" />
          <span>Pagar Instrumentales</span>
        </h1>

        <button 
          onClick={() => navigateTo('/cart')}
          className="px-3.5 py-1.5 bg-[#1C1C2E] hover:bg-white/10 border border-white/10 hover:border-[#7F77DD]/50 text-white/80 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={14} className="text-[#7F77DD]" />
          <span>Volver al Carrito</span>
        </button>
      </div>

      {!hasBankMethods && !hasQvapayMethods ? (
        <div className="py-12 px-6 bg-[#13131F] rounded-3xl border border-red-500/30 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-white font-bold text-[18px]">Método de Pago No Configurado</h3>
            <p className="text-white/70 text-[14px] leading-relaxed">
              El productor no ha configurado ningún método de pago (Bancos o QvaPay) para solicitar la compra. Por favor vuelve al carrito o ponte en contacto con el productor.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigateTo('/cart')} className="text-xs font-bold mx-auto">
            <ArrowLeft size={16} className="mr-2" />
            Volver al Carrito
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Channel Selector & Details Container */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Channel Selector (Bancos vs QvaPay) */}
            <div className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-2xl p-5 space-y-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest block">Canal de Pago Local</span>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* BANCOS BUTTON */}
                <button
                  type="button"
                  disabled={!hasBankMethods}
                  onClick={() => setActiveChannel('bancos')}
                  className={`py-3.5 px-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'bancos'
                      ? 'bg-[#534AB7]/25 text-[#7F77DD] border border-[#7F77DD] shadow-sm'
                      : hasBankMethods
                        ? 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/70 hover:text-white'
                        : 'bg-[#1C1C2E]/40 border border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Landmark size={18} />
                    <span>Bancos</span>
                  </div>
                  {!hasBankMethods && (
                    <span className="text-[10px] font-normal text-red-400">No disponible por el productor</span>
                  )}
                </button>

                {/* QVAPAY BUTTON */}
                <button
                  type="button"
                  disabled={!hasQvapayMethods}
                  onClick={() => setActiveChannel('qvapay')}
                  className={`py-3.5 px-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'qvapay'
                      ? 'bg-[#534AB7]/25 text-[#7F77DD] border border-[#7F77DD] shadow-sm'
                      : hasQvapayMethods
                        ? 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/70 hover:text-white'
                        : 'bg-[#1C1C2E]/40 border border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Wallet size={18} />
                    <span>QvaPay</span>
                  </div>
                  {!hasQvapayMethods && (
                    <span className="text-[10px] font-normal text-red-400">No disponible por el productor</span>
                  )}
                </button>
              </div>
            </div>

            {/* DETAILS CONTAINER ACCORDING TO CHANNEL */}
            <div className="bg-[#13131F] border border-[rgba(127,119,221,0.15)] rounded-2xl p-6 space-y-5">
              
              {/* 1. BANCOS DETAILS */}
              {activeChannel === 'bancos' && selectedBankCard && (
                <div className="space-y-4">
                  
                  {/* Badges container for supported gateways */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Landmark size={16} className="text-[#7F77DD]" /> 
                        Pago por Transferencia Bancaria
                      </h4>
                      <p className="text-xs text-white/50">Canales habilitados para este pago:</p>
                    </div>

                    <div className="flex gap-1.5">
                      {(selectedBankCard.acceptsTransfermovil !== false) && (
                        <span className="bg-[#534AB7]/30 text-[#7F77DD] text-[10px] px-2 py-0.5 rounded font-bold border border-[#534AB7]/40">
                          Transfermóvil
                        </span>
                      )}
                      {(selectedBankCard.acceptsEnzona !== false || selectedBankCard.type === 'enzona') && (
                        <span className="bg-emerald-950/50 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-900/40">
                          EnZona
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multiple bank cards selector pills if producer has > 1 card */}
                  {bankMethods.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Selecciona la Tarjeta de Destino:</span>
                      <div className="flex flex-wrap gap-2">
                        {bankMethods.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedBankCardId(m.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              (selectedBankCard?.id === m.id)
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

                  {/* Card Credentials Box */}
                  <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-grow text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Número de Tarjeta:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-white font-bold text-sm select-all">{selectedBankCard.cardNumber || '9224 8129 0019 4021'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(selectedBankCard.cardNumber || '', 'cardNumber')}
                            className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                            title="Copiar Tarjeta"
                          >
                            {copiedField === 'cardNumber' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Tipo de Moneda:</span>
                        <span className="font-bold text-[#7F77DD] uppercase">{selectedBankCard.currencyType || 'CUP'}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Titular de la Tarjeta:</span>
                        <span className="text-white font-semibold">{selectedBankCard.titularName || 'Titular Oficial'}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Teléfono a Confirmar:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-indigo-200 font-bold select-all">{selectedBankCard.phoneConfirm || '+53 50000000'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(selectedBankCard.phoneConfirm || '', 'phoneConfirm')}
                            className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                            title="Copiar Teléfono"
                          >
                            {copiedField === 'phoneConfirm' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Screenshot thumbnail */}
                    {selectedBankCard.qrScreenshot && (
                      <div className="flex-shrink-0 flex justify-center">
                        <div 
                          className="group relative cursor-pointer" 
                          onClick={() => setExpandedQrImage(selectedBankCard.qrScreenshot || null)}
                        >
                          <img 
                            src={selectedBankCard.qrScreenshot} 
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
              {activeChannel === 'qvapay' && selectedQvapayMethod && (
                <div className="space-y-4">
                  
                  <div className="pb-3 border-b border-white/5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wallet size={16} className="text-[#7F77DD]" /> 
                      Pago Directo por QvaPay
                    </h4>
                    <p className="text-xs text-white/50">Transfiere directamente a la cuenta QvaPay asignada por el productor.</p>
                  </div>

                  {/* QvaPay Account Credentials Box */}
                  <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-3">
                    
                    {/* Amount USD Display */}
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                      <span className="text-white/50 font-medium">Monto Total a Pagar:</span>
                      <span className="font-mono text-base font-bold text-[#7F77DD]">${totalAmountUSD} USD</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Correo Cuenta QvaPay:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white font-bold select-all">{selectedQvapayMethod.qvapayEmail || 'correo@qvapay.com'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedQvapayMethod.qvapayEmail || '', 'qvapayEmail')}
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
                        <span className="font-mono text-[#7F77DD] font-bold select-all">@{selectedQvapayMethod.qvapayUser || 'productor'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(`@${selectedQvapayMethod.qvapayUser || 'productor'}`, 'qvapayUser')}
                          className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Copiar Usuario"
                        >
                          {copiedField === 'qvapayUser' ? <Check size={12} className="text-[#3CD288]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* QR Code Screenshot thumbnail for QvaPay */}
                    {selectedQvapayMethod.qrQvapayScreenshot && (
                      <div className="pt-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-medium">Código QR de la Cuenta QvaPay:</span>
                        <div 
                          className="group relative cursor-pointer" 
                          onClick={() => setExpandedQrImage(selectedQvapayMethod.qrQvapayScreenshot || null)}
                        >
                          <img 
                            src={selectedQvapayMethod.qrQvapayScreenshot} 
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

          {/* Right: Payment Declaration Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleConfirmPayment} className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 space-y-5">
              
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Declaración de Pago</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Ingresa los datos para que el productor verifique la transacción.</p>
              </div>
              
              <div className="space-y-4">
                {/* ID Transacción (Mandatory) */}
                <Input
                  label="Número de ID Transacción (Obligatorio)"
                  placeholder={activeChannel === 'bancos' ? "Ej. 99421290" : "Ej. QP-882194"}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />

                {/* Textarea for SMS pasting (Optional for both) */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Contenido SMS / Nota de Confirmación (Opcional)
                  </label>
                  <textarea
                    value={smsConfirmation}
                    onChange={(e) => setSmsConfirmation(e.target.value)}
                    placeholder="Pega el mensaje SMS recibido o notas adicionales para el productor..."
                    rows={3}
                    className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl p-3 text-xs text-white outline-none focus:border-brand-primary-light"
                  />
                </div>

                {/* Capture / Screenshot Uploader (Mandatory) */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Subir Captura del Comprobante (Obligatorio)
                  </label>
                  
                  {receiptImage ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={receiptImage} alt="Receipt preview" className="w-8 h-8 object-cover rounded border border-emerald-500/30" />
                        <span className="text-emerald-400 font-medium">Recibo adjuntado</span>
                      </div>
                      <button type="button" onClick={() => setReceiptImage(null)} className="text-red-400 font-semibold hover:underline cursor-pointer text-xs">Eliminar</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="receipt-file-picker"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <label
                          htmlFor="receipt-file-picker"
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

              {/* Total display */}
              <div className="border-t border-white/5 pt-4 flex justify-between text-sm items-center">
                <span className="font-bold text-white/70">Monto del Pago:</span>
                <span className="font-mono text-[#7F77DD] font-bold text-base">
                  {activeChannel === 'qvapay'
                    ? `$${totalAmountUSD} USD`
                    : convertPrice(totalAmountUSD, (selectedBankCard?.currencyType as any) || 'CUP').formatted
                  }
                </span>
              </div>

              <Button variant="primary" fullWidth type="submit" className="mt-2 text-xs font-bold py-3">
                {activeChannel === 'bancos' ? 'Enviar Comprobante Bancario' : 'Enviar Comprobante QvaPay'}
                <Send size={14} className="ml-1.5" />
              </Button>
            </form>
          </div>

        </div>
      )}

      {/* EXPANDED QR LIGHTBOX */}
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
