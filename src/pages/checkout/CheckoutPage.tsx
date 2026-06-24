import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  CreditCard, Landmark, Check, Phone, ArrowLeft, 
  Send, ShieldAlert, Upload, ArrowRight, Wallet, CheckCircle2,
  Copy, X
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, clearCart, navigateTo, addToast, user, convertPrice, exchangeRates, getProducerPaymentMethods, addProducerNotification } = useApp();
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  // Find all producer payment configurations for the producers of the beats in the cart
  const producerIds = useMemo(() => {
    return Array.from(new Set(cart.map(item => item.beat.producerId)));
  }, [cart]);

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
    // Deduplicate by a unique combination of type, currencyType (for transfermovil), and id
    const seen = new Set();
    return list.filter(m => {
      const key = m.type === 'transfermovil' 
        ? `${m.type}_${m.currencyType || 'CUP'}_${m.id}` 
        : `${m.type}_${m.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [producerIds, getProducerPaymentMethods]);

  const selectedMethodDetail = useMemo(() => {
    if (availableProducerMethods.length === 0) return null;
    return availableProducerMethods.find(m => m.id === selectedMethodId) || availableProducerMethods[0];
  }, [availableProducerMethods, selectedMethodId]);

  const selectMethod = useMemo(() => {
    return selectedMethodDetail ? selectedMethodDetail.type : 'transfermovil';
  }, [selectedMethodDetail]);

  const activePaymentTypes = useMemo(() => {
    if (availableProducerMethods.length === 0) {
      return ['transfermovil', 'enzona', 'qvapay'] as const;
    }
    const types = new Set(availableProducerMethods.map(m => m.type));
    return Array.from(types);
  }, [availableProducerMethods]);

  // Input States
  const [smsConfirmation, setSmsConfirmation] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [qvapayEmail, setQvapayEmail] = useState(user?.email || '');
  const [isSimulatingWallet, setIsSimulatingWallet] = useState(false);
  const [walletStep, setWalletStep] = useState(1);

  useEffect(() => {
    if (user?.email && !qvapayEmail) {
      setQvapayEmail(user.email);
    }
  }, [user?.email, qvapayEmail]);

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
        setTimeout(() => {
          setCopiedField(null);
        }, 2000);
      }
    } catch (e) {
      // Access to navigator.clipboard is blocked by a permissions policy in iframe
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
          setTimeout(() => {
            setCopiedField(null);
          }, 2000);
        } else {
          addToast('No se pudo copiar de forma automática. Por favor selecciónalo manualmente.', 'error');
        }
      } catch (err) {
        addToast('No se pudo copiar de forma automática. Por favor selecciónalo manualmente.', 'error');
      }
    }
  };

  const totalAmountUSD = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);
  const totalAmountCUP = useMemo(() => totalAmountUSD * (exchangeRates?.USD || 360), [totalAmountUSD, exchangeRates]);

  // Check if authenticated
  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-red-500/25 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-250">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Inicio de Sesión Requerido</h3>
          <p className="text-xs text-gray-300 leading-relaxed md:px-6">
            Debes estar autenticado para poder proceder con el pago y la compra de beats. Inicia sesión como Comprador o Artista para continuar.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/')}>
            Volver al Catálogo
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/login')}>
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
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Acceso No Autorizado</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Solo las cuentas de Comprador/Artista pueden proceder al pago de beats y adquirir licencias en la plataforma.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/')}>
            Volver al Catálogo
          </Button>
        </div>
      </div>
    );
  }

  // Check if unverified client
  const isUnverifiedClient = user.role === 'client' && !user.verified;

  if (isUnverifiedClient) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-red-500/25 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-250">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Verificación de Identidad Requerida</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Como artista, debes verificar tu identidad (KYC) antes de poder realizar compras de beats en D'Cuban Beats. Esto garantiza la total conformidad legal de las licencias.
          </p>
        </div>
        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-left text-[11px] text-red-400 font-mono">
          • Compliance Check: "USER_UNVERIFIED_COMPLIANCE"
          <br />
          • Requisito legal: Presentar Carné de Identidad o Pasaporte Oficial junto a Selfie
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigateTo('/')}>
            Volver al Catálogo
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigateTo('/artist/dashboard')}>
            Iniciar Verificación KYC
          </Button>
        </div>
      </div>
    );
  }
  
  // QvaPay rate simulation: 1 USD is already computed at top-level as totalAmountUSD

  const handleUploadReceipt = () => {
    // Mock upload set
    setReceiptImage('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==');
    addToast('Captura de recibo cargada correctamente', 'success');
  };

  const handleConfirmOfflinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (selectMethod === 'transfermovil') {
      if (!transactionId.trim()) {
        addToast('El Número de ID de Transacción es obligatorio para pagos por Transfermóvil.', 'error');
        return;
      }
      if (!receiptImage) {
        addToast('Debe subir la captura del comprobante de SMS para validar su pago por Transfermóvil.', 'error');
        return;
      }
    } else {
      // EnZona and general offline payments
      if (!smsConfirmation && !transactionId) {
        addToast('Por favor, ingresa el SMS de confirmación o el ID de transacción', 'error');
        return;
      }
    }

    // Create an order for species inside CART
    cart.forEach((item, index) => {
      createOrder({
        id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
        beatId: item.beat.id,
        beatTitle: item.beat.title,
        buyerName: user?.artistName || user?.name || user?.username || 'Comprador',
        producerId: item.beat.producerId,
        producerName: item.beat.producerName,
        amount: item.price,
        currency: selectMethod === 'qvapay' ? 'USDT' : (selectedMethodDetail?.currencyType || 'CUP'),
        method: selectMethod === 'transfermovil' 
          ? `Transfermóvil ${selectedMethodDetail?.currencyType || 'CUP'}` 
          : selectMethod === 'enzona' 
            ? 'EnZona' 
            : 'QvaPay',
        status: 'pending', // All offline orders are pending producer verification
        date: 'Hace un momento',
        transactionId: transactionId || `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        verificationSMS: smsConfirmation || undefined,
        receiptUrl: receiptImage || undefined
      });

      // Trigger a notification for the producer in their panel!
      const methodLabel = selectMethod === 'transfermovil' ? 'Transfermóvil' : 'EnZona';
      addProducerNotification(
        'beat_sold',
        `Nuevo Pago ${methodLabel} por Validar`,
        `El artista ${user?.artistName || user?.name || 'Comprador'} ha registrado un pago con ${methodLabel} de ${convertPrice(item.price, selectedMethodDetail?.currencyType as any || 'CUP').formatted} por el beat "${item.beat.title}". ID de Operación: ${transactionId}. Por favor verifica el comprobante en tu sección de ventas y aprueba el pago para liberar el beat.`,
        item.beat.id
      );
    });

    clearCart();
    addToast('Tu comprobante ha sido enviado al productor. Se verificará en pocos minutos.', 'success');
    
    // Switch to root or producer portfolio
    navigateTo('/');
  };

  const handleSimulateQvapayCheckout = () => {
    setIsSimulatingWallet(true);
    setWalletStep(1);
  };

  const executeQvaPayWalletPayment = () => {
    if (!qvapayEmail) {
      addToast('Por favor ingrese su correo electrónico de QvaPay', 'error');
      return;
    }
    setWalletStep(2); // Loading spinner (API is doing its job)
    setTimeout(() => {
      setWalletStep(3); // Success banner
      setTimeout(() => {
        setIsSimulatingWallet(false);
        // Place orders as pending for producer verification
        cart.forEach((item) => {
          const orderId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
          createOrder({
            id: orderId,
            beatId: item.beat.id,
            beatTitle: item.beat.title,
            buyerName: user?.artistName || user?.name || 'Comprador QvaPay',
            producerId: item.beat.producerId,
            producerName: item.beat.producerName,
            amount: item.price,
            currency: 'USDT',
            method: 'QvaPay',
            status: 'pending', // Now pending producer approval
            date: 'Hace un momento',
            transactionId: `QP-${Math.floor(100000 + Math.random() * 900000)}`,
            verificationSMS: `Pago realizado mediante Billetera QvaPay desde la cuenta del cliente (${qvapayEmail}) hacia la cuenta del productor (@${selectedMethodDetail?.qvapayUser || 'carlitos_flow'}). Por favor, valida tu cuenta de QvaPay y aprueba la liberación.`
          });

          // Trigger a notification for the producer in their panel!
          addProducerNotification(
            'beat_sold',
            'Nuevo Pago QvaPay por Validar',
            `El artista ${user?.artistName || user?.name || 'Comprador'} ha realizado un pago por QvaPay de $${item.price} USDT por el beat "${item.beat.title}". Por favor, verifica tu saldo y aprueba el pedido para generar el enlace.`,
            item.beat.id
          );
        });
        clearCart();
        addToast('Pago registrado por QvaPay API. Esperando aprobación final del productor.', 'success');
        navigateTo('/');
      }, 1800);
    }, 2200);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-8 text-left">
      
      {/* Title */}
      <button 
        onClick={() => navigateTo('/cart')}
        className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white cursor-pointer bg-transparent border-none mt-2"
      >
        <ArrowLeft size={14} />
        Volver al Carrito
      </button>

      <div className="border-b border-white/5 pb-3">
        <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <CreditCard size={20} className="text-[#7F77DD]" /> Pagar Instrumentales
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Option selector & Account boards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Payment Pill selectors */}
          <div className="bg-[#13131F] border border-[rgba(127,119,221,0.15)] rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest block">Canal de Pago Local</span>
            
            <div className={`grid gap-2 ${
              availableProducerMethods.length >= 3 ? 'grid-cols-3' :
              availableProducerMethods.length === 2 ? 'grid-cols-2' :
              'grid-cols-1'
            }`}>
              {availableProducerMethods.map((m) => {
                const isSelected = selectedMethodDetail?.id === m.id;
                let title = '';
                let IconComponent = Landmark;
                
                if (m.type === 'transfermovil') {
                  title = `Transfermóvil ${m.currencyType || 'CUP'}`;
                  IconComponent = Landmark;
                } else if (m.type === 'enzona') {
                  title = 'EnZona';
                  IconComponent = CreditCard;
                } else if (m.type === 'qvapay') {
                  title = 'QvaPay Wallet';
                  IconComponent = Wallet;
                }

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethodId(m.id)}
                    className={`py-3.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-primary/15 text-[#7F77DD] border border-[#7F77DD]'
                        : 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    <IconComponent size={16} />
                    {title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account credentials display */}
          <div className="bg-[#13131F] border border-[rgba(127,119,221,0.15)] rounded-2xl p-6 space-y-5">
            {selectMethod === 'transfermovil' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="purple" className="mb-2">Transfermóvil {selectedMethodDetail?.currencyType || 'CUP'}</Badge>
                    <h4 className="text-sm font-bold text-white">Instrucciones de Transferencia</h4>
                  </div>
                  <Phone size={18} className="text-[#7F77DD]" />
                </div>
                
                <p className="text-xs text-white/50 leading-relaxed font-normal">
                  Realiza un Pago Electrónico o Transferencia a través de **Transfermóvil** (servicio de BANDEC, BPA o BANMET) con la tarjeta de destino a continuación:
                </p>

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Tarjeta ({selectedMethodDetail?.currencyType || 'CUP'}):</span>
                      <div className="flex items-center gap-1.5 animate-pulse-once">
                        <span className="font-mono text-white font-bold select-all">{selectedMethodDetail?.cardNumber || '9224 8129 0019 4021'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedMethodDetail?.cardNumber || '9224 8129 0019 4021', 'cardNumber')}
                          className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                          title="Copiar Tarjeta"
                        >
                          {copiedField === 'cardNumber' ? <Check size={11} className="text-[#3CD288]" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Teléfono destinatario:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white font-bold select-all">{selectedMethodDetail?.phoneConfirm || '+53 52839401'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedMethodDetail?.phoneConfirm || '+53 52839401', 'phoneConfirm')}
                          className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                          title="Copiar Teléfono"
                        >
                          {copiedField === 'phoneConfirm' ? <Check size={11} className="text-[#3CD288]" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Productor / Titular:</span>
                      <span className="text-white font-bold">{selectedMethodDetail?.titularName || 'Carlos Santana Valdés'}</span>
                    </div>
                  </div>
                  {(selectedMethodDetail?.qrScreenshot || selectedMethodDetail?.qrQvapayScreenshot) && (
                    <div className="flex-shrink-0 flex justify-center">
                      <div className="group relative cursor-pointer" onClick={() => setExpandedQrImage(selectedMethodDetail.qrScreenshot || selectedMethodDetail.qrQvapayScreenshot)}>
                        <img 
                          src={selectedMethodDetail.qrScreenshot || selectedMethodDetail.qrQvapayScreenshot} 
                          alt="QR Transfermovil" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-xl border border-white/10 group-hover:border-[#7F77DD] group-hover:scale-105 transition-all duration-200" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-[9px] text-white font-semibold">
                          Ampliar
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4">
                  <span className="text-xs font-bold text-white/70 block mb-2">Comprobación del Pago Electrónico:</span>
                  <p className="text-[10px] text-white/40 mb-3 block">
                    Copia y pega el SMS completo de confirmación enviado por el banco (ej: "Pago por Transferencia..."), o escribe el número de transacción único.
                  </p>
                </div>
              </div>
            )}

            {selectMethod === 'enzona' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="purple" className="mb-2">EnZona CUP / MLC</Badge>
                    <h4 className="text-sm font-bold text-white">Escaneo o Transferencia EnZona</h4>
                  </div>
                  <CreditCard size={18} className="text-[#7F77DD]" />
                </div>

                <p className="text-xs text-white/50 leading-relaxed font-normal">
                  Transfiere mediante la aplicación oficial **EnZona** escaneando el código QR del comercio o transfiriendo a la cuenta ID de abajo:
                </p>

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="text-xs flex justify-between items-center">
                      <span className="text-white/40">ID de Usuario EnZona:</span>
                      <div className="flex items-center gap-1.5 animate-pulse-once">
                        <span className="font-mono text-white font-bold select-all">{selectedMethodDetail?.enzonaUser || 'carlitoflow'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedMethodDetail?.enzonaUser || 'carlitoflow', 'enzonaUser')}
                          className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                          title="Copiar ID EnZona"
                        >
                          {copiedField === 'enzonaUser' ? <Check size={11} className="text-[#3CD288]" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-white/40">Productor / Titular:</span>
                      <span className="text-white font-bold">{selectedMethodDetail?.titularName || 'Carlos J. Santana'}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex justify-center">
                    <div className="group relative cursor-pointer" onClick={() => setExpandedQrImage(selectedMethodDetail?.qrScreenshot || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop')}>
                      <img 
                        src={selectedMethodDetail?.qrScreenshot || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop'} 
                        alt="QR EnZona" 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg border border-white/10 group-hover:border-[#7F77DD] group-hover:scale-105 transition-all duration-200" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-[9px] text-white font-semibold">
                        Ampliar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectMethod === 'qvapay' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-indigo-500/15 rounded-full flex items-center justify-center text-brand-primary-light mx-auto">
                  <Wallet size={24} />
                </div>
                
                <h4 className="text-sm font-bold text-white">Pago Directo Integrado por QvaPay API</h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  QvaPay te permite pagar de forma automatizada mediante criptomonedas, saldo virtual cubano, o tarjetas magnéticas MLC. El beat se habilitará instantáneamente al pagar.
                </p>

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-2xl max-w-xs mx-auto mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">Total CUP:</span>
                    <span className="font-mono font-bold">${Math.round(totalAmountCUP).toLocaleString()} CUP</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/70">Equivalencia QvaPay:</span>
                    <span className="font-mono text-brand-primary-light">${totalAmountUSD} USD</span>
                  </div>
                </div>

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-2 max-w-xs mx-auto text-left mb-3">
                  <div className="text-xs flex justify-between items-center">
                    <span className="text-white/40">Correo QvaPay:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-white font-bold select-all">{selectedMethodDetail?.qvapayEmail || 'carlos.beats@gmail.com'}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedMethodDetail?.qvapayEmail || 'carlos.beats@gmail.com', 'qvapayEmail')}
                        className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                        title="Copiar Correo"
                      >
                        {copiedField === 'qvapayEmail' ? <Check size={11} className="text-[#3CD288]" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs flex justify-between items-center">
                    <span className="text-white/40">Usuario QvaPay:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#7F77DD] font-bold select-all">@{selectedMethodDetail?.qvapayUser || 'carlitos_flow'}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedMethodDetail?.qvapayUser || 'carlitos_flow', 'qvapayUser')}
                        className="text-white/40 hover:text-[#7F77DD] p-1 rounded hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center animate-pulse-once"
                        title="Copiar Usuario"
                      >
                        {copiedField === 'qvapayUser' ? <Check size={11} className="text-[#3CD288]" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedMethodDetail?.qrQvapayScreenshot && (
                  <div className="flex justify-center mt-2 mb-3">
                    <div className="group relative cursor-pointer" onClick={() => setExpandedQrImage(selectedMethodDetail.qrQvapayScreenshot)}>
                      <img 
                        src={selectedMethodDetail.qrQvapayScreenshot} 
                        alt="QR QvaPay" 
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 object-cover rounded-lg border border-white/10 group-hover:border-[#7F77DD] group-hover:scale-105 transition-all duration-200" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-[9px] text-white font-semibold">
                        Ampliar
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="primary" onClick={handleSimulateQvapayCheckout} className="mx-auto text-xs px-6">
                    Pagar Seguro con QvaPay Wallet
                    <ArrowRight size={13} className="ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary details & receipt uploads triggers */}
        <div className="lg:col-span-5 space-y-6">
          
          {selectMethod !== 'qvapay' ? (
            <form onSubmit={handleConfirmOfflinePayment} className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/5">Declaración de Pago</h3>
              
              <div className="space-y-4">
                {/* ID Transaccion */}
                <Input
                  label={selectMethod === 'transfermovil' ? "Número de ID Transacción (Obligatorio)" : "Número de Transacción / ID de Operación"}
                  placeholder={selectMethod === 'transfermovil' ? "Ej. 99421290 (Requerido)" : "Introduce el código de operación"}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />

                {/* Textarea for SMS pasting */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Contenido SMS de Confirmación {selectMethod === 'transfermovil' && '(Opcional)'}
                  </label>
                  <textarea
                    value={smsConfirmation}
                    onChange={(e) => setSmsConfirmation(e.target.value)}
                    placeholder={selectMethod === 'transfermovil' ? "Opcional: Pega el mensaje SMS recibido del banco..." : "Pega el mensaje SMS recibido del banco..."}
                    rows={3}
                    className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl p-3 text-xs text-white outline-none focus:border-brand-primary-light"
                  />
                </div>

                {/* Capture/Screenshot uploader */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Subir Captura del Comprobante SMS {selectMethod === 'transfermovil' ? '(Obligatorio)' : '(Opcional)'}
                  </label>
                  
                  {receiptImage ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-medium">Recibo adjuntado con éxito</span>
                      <button type="button" onClick={() => setReceiptImage(null)} className="text-red-400 font-semibold hover:underline cursor-pointer">Eliminar</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUploadReceipt}
                      className="w-full py-4 border border-dashed border-white/10 hover:border-brand-primary-light rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload size={16} className="text-white/30" />
                      <span className="text-[10px] uppercase font-bold text-white/50">Cargar captura de comprobante</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Total display */}
              <div className="border-t border-white/5 pt-4 flex justify-between text-sm items-center">
                <span className="font-bold text-white/70">Monto para transferir:</span>
                <span className="font-mono text-brand-primary-light font-bold text-base">
                  {(() => {
                    const currencyToConvert = selectedMethodDetail?.type === 'qvapay' 
                      ? 'USD' 
                      : (selectedMethodDetail?.currencyType === 'MLC' 
                        ? 'MLC' 
                        : selectedMethodDetail?.currencyType === 'Clasica' 
                          ? 'CLASICA' 
                          : 'CUP');
                    return convertPrice(totalAmountUSD, currencyToConvert as any).formatted;
                  })()}
                </span>
              </div>

              <Button variant="primary" fullWidth type="submit" className="mt-2">
                Enviar Comprobante de Pago
                <Send size={13} className="ml-1.5" />
              </Button>
            </form>
          ) : (
            <div className="bg-[#13131F] border border-white/5 rounded-3xl p-6 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7F77DD]">Pago Seguro con QvaPay</span>
              <p className="text-xs text-white/50">
                Al usar QvaPay la transacción se pre-valida de forma automática y se envía la solicitud al productor para su aprobación final inmediata.
              </p>
              
              <div className="p-4 bg-[#0D0D14] rounded-2xl text-left text-xs font-mono border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-white/40 block text-[9px]">Tasa de cambio:</span>
                  <span>1 USD = {exchangeRates?.USD || 360} CUP</span>
                </div>
                <div>
                  <span className="text-[#7F77DD] font-bold block">${totalAmountUSD} USD</span>
                </div>
              </div>
            </div>
          )}
          
        </div>

      </div>

      {/* 4. QBAPAY DIGITAL CHECKOUT GATEWAY SIMULATION */}
      {isSimulatingWallet && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-55 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-gray-100 overflow-hidden text-left animate-in zoom-in-95">
            
            {/* Header blue representing QvaPay colors */}
            <div className="bg-indigo-600 text-white -mx-6 -mt-6 p-5 pb-6 text-center relative">
              <button 
                onClick={() => setIsSimulatingWallet(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
              <h3 className="text-sm font-bold uppercase tracking-wider">Checkout Seguro QvaPay</h3>
              <p className="text-[10px] text-white/70">La pasarela de pago alternativa para Cuba</p>
            </div>

            {walletStep === 1 && (
              <div className="space-y-4 pt-6">
                <span className="text-xs font-bold uppercase tracking-wide block text-gray-500">Autoriza el Pago de tu Billetera</span>
                
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs items-center gap-2">
                    <span className="text-gray-500">Destinatario:</span>
                    <span className="font-bold text-gray-900 truncate" title={selectedMethodDetail?.titularName || 'Flow Habano'}>
                      {selectedMethodDetail?.titularName || 'Flow Habano'} (@{selectedMethodDetail?.qvapayUser || 'carlitos_flow'})
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Monto a pagar:</span>
                    <span className="font-bold text-indigo-600 text-sm font-mono">${totalAmountUSD} USDT</span>
                  </div>
                </div>

                <Input
                  label="Correo Electrónico de QvaPay del Cliente"
                  placeholder="ejemplo@qvapay.com"
                  themeMode="light"
                  value={qvapayEmail}
                  onChange={(e) => setQvapayEmail(e.target.value)}
                />

                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={executeQvaPayWalletPayment}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white mt-2 cursor-pointer py-3 rounded-xl text-xs font-bold"
                >
                  Confirmar Pago con QvaPay
                </Button>
              </div>
            )}

            {walletStep === 2 && (
              <div className="py-12 text-center space-y-4">
                {/* Spinner */}
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">Conectando con la API de QvaPay...</p>
                  <p className="text-[10px] text-gray-400">Validando credenciales y transfiriendo fondos al productor.</p>
                </div>
              </div>
            )}

            {walletStep === 3 && (
              <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} fill="currentColor" className="text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-600">¡API de QvaPay Confirmada!</p>
                  <p className="text-[10px] text-gray-500 mb-1">Transacción procesada correctamente.</p>
                  <p className="text-[10px] text-gray-400">La orden ha sido enviada al productor para su liberación final.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. EXPANDED QR DISPLAY LIGHTBOX */}
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
              <p className="text-[10px] text-white/40 mt-1">Escanea este código QR con la cámara de tu teléfono móvil</p>
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
