import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  CreditCard, Landmark, Check, Phone, ArrowLeft, 
  Send, ShieldAlert, Upload, ArrowRight, Wallet, CheckCircle2
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, clearCart, navigateTo, addToast, user } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'transfermovil' | 'enzona' | 'qvapay'>('transfermovil');

  // Input States
  const [smsConfirmation, setSmsConfirmation] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [qvapayEmail, setQvapayEmail] = useState('');
  const [isSimulatingWallet, setIsSimulatingWallet] = useState(false);
  const [walletStep, setWalletStep] = useState(1);

  const totalAmountCUP = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);

  // Check if unverified client
  const isUnverifiedClient = user?.role === 'client' && !user?.verified;

  if (isUnverifiedClient) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#13131F] border border-red-500/25 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-250">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Verificación de Identidad Requerida</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Como artista, debes verificar tu identidad (KYC) antes de poder realizar compras de beats en CubaBeats. Esto garantiza la total conformidad legal de las licencias.
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
  
  // QvaPay rate simulation: 1 USD = 350 CUP
  const totalAmountUSD = useMemo(() => Number((totalAmountCUP / 350).toFixed(2)), [totalAmountCUP]);

  const handleUploadReceipt = () => {
    // Mock upload set
    setReceiptImage('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==');
    addToast('Captura de recibo cargada correctamente', 'success');
  };

  const handleConfirmOfflinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod !== 'qvapay' && !smsConfirmation && !transactionId) {
      addToast('Por favor, ingresa el SMS de confirmación o el ID de transacción', 'error');
      return;
    }

    // Create an order for species inside CART
    cart.forEach((item, index) => {
      createOrder({
        id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
        beatId: item.beat.id,
        beatTitle: item.beat.title,
        buyerName: 'Comprador Invitado',
        producerId: item.beat.producerId,
        producerName: item.beat.producerName,
        amount: item.price,
        currency: paymentMethod === 'qvapay' ? 'USDT' : 'CUP',
        method: paymentMethod === 'transfermovil' ? 'Transfermovil' : paymentMethod === 'enzona' ? 'EnZona' : 'QvaPay',
        status: paymentMethod === 'qvapay' ? 'approved' : 'pending', // QvaPay is instant!
        date: 'Hace un momento',
        transactionId: transactionId || `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        verificationSMS: smsConfirmation || undefined
      });
    });

    clearCart();
    
    if (paymentMethod === 'qvapay') {
      addToast('Su pago por QvaPay ha sido procesado e instalado con éxito', 'success');
    } else {
      addToast('Tu comprobante ha sido enviado al productor. Se verificará en pocos minutos.', 'success');
    }
    
    // Switch to root or producer portfolio
    navigateTo('/');
  };

  const handleSimulateQvapayCheckout = () => {
    setIsSimulatingWallet(true);
    setWalletStep(1);
  };

  const executeQvaPayWalletPayment = () => {
    setWalletStep(2); // Loading spinner
    setTimeout(() => {
      setWalletStep(3); // Success banner
      setTimeout(() => {
        setIsSimulatingWallet(false);
        // Automatically place order
        cart.forEach((item) => {
          createOrder({
            id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
            beatId: item.beat.id,
            beatTitle: item.beat.title,
            buyerName: 'Comprador QvaPay',
            producerId: item.beat.producerId,
            producerName: item.beat.producerName,
            amount: item.price,
            currency: 'USDT',
            method: 'QvaPay',
            status: 'approved', // automatic instant verification!
            date: 'Hace un momento',
            transactionId: `QP-${Math.floor(100000 + Math.random() * 900000)}`
          });
        });
        clearCart();
        addToast('Pago certificado por QvaPay API API', 'success');
        navigateTo('/');
      }, 1500);
    }, 1200);
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
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('transfermovil')}
                className={`py-3.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'transfermovil'
                    ? 'bg-brand-primary/15 text-[#7F77DD] border border-[#7F77DD]'
                    : 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <Landmark size={16} />
                Transfermóvil
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('enzona')}
                className={`py-3.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'enzona'
                    ? 'bg-brand-primary/15 text-[#7F77DD] border border-[#7F77DD]'
                    : 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <CreditCard size={16} />
                EnZona
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qvapay')}
                className={`py-3.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'qvapay'
                    ? 'bg-brand-primary/15 text-[#7F77DD] border border-[#7F77DD]'
                    : 'bg-[#1C1C2E] border border-white/5 hover:bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <Wallet size={16} />
                QvaPay Wallet
              </button>
            </div>
          </div>

          {/* Account credentials display */}
          <div className="bg-[#13131F] border border-[rgba(127,119,221,0.15)] rounded-2xl p-6 space-y-5">
            {paymentMethod === 'transfermovil' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="purple" className="mb-2">Transfermóvil CUP</Badge>
                    <h4 className="text-sm font-bold text-white">Instrucciones de Transferencia</h4>
                  </div>
                  <Phone size={18} className="text-[#7F77DD]" />
                </div>
                
                <p className="text-xs text-white/50 leading-relaxed font-normal">
                  Realiza un Pago Electrónico o Transferencia a través de **Transfermóvil** (servicio de BANDEC, BPA o BANMET) con la tarjeta de destino a continuación:
                </p>

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Tarjeta BANDEC (CUP):</span>
                    <span className="font-mono text-white font-bold select-all">9224 8129 0019 4021</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Teléfono destinatario:</span>
                    <span className="font-mono text-white font-bold select-all">+53 52839401</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Nombre del Titular:</span>
                    <span className="text-white font-bold">Carlos Santana Valdés</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <span className="text-xs font-bold text-white/70 block mb-2">Comprobación del Pago Electrónico:</span>
                  <p className="text-[10px] text-white/40 mb-3 block">
                    Copia y pega el SMS completo de confirmación enviado por el banco (ej: "Pago por Transferencia..."), o escribe el número de transacción único.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'enzona' && (
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

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="text-xs flex justify-between">
                      <span className="text-white/40">ID de Usuario EnZona:</span>
                      <span className="font-mono text-white font-bold select-all">carlitoflow</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-white/40">Titular de cuenta:</span>
                      <span className="text-white font-bold">Carlos J. Santana</span>
                    </div>
                  </div>
                  
                  {/* Fake visual QR representations */}
                  <div className="w-16 h-16 bg-white p-1 rounded-lg flex flex-wrap gap-0.5 relative flex-shrink-0">
                    <div className="w-5 h-5 bg-black"></div>
                    <div className="w-5 h-5 bg-black"></div>
                    <div className="w-5 h-5 bg-white"></div>
                    <div className="w-5 h-5 bg-black"></div>
                    <div className="w-5 h-5 bg-white"></div>
                    <div className="w-5 h-5 bg-black"></div>
                    <div className="w-5 h-5 bg-black"></div>
                    <div className="w-5 h-5 bg-black"></div>
                    <div className="w-5 h-5 bg-white"></div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'qvapay' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-indigo-500/15 rounded-full flex items-center justify-center text-brand-primary-light mx-auto">
                  <Wallet size={24} />
                </div>
                
                <h4 className="text-sm font-bold text-white">Pago Directo Integrado por QvaPay API</h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  QvaPay te permite pagar de forma automatizada mediante criptomonedas, saldo virtual cubano, o tarjetas magnéticas MLC. El beat se habilitará instantáneamente al pagar.
                </p>

                <div className="bg-[#0C0C14] border border-white/5 p-4 rounded-2xl max-w-xs mx-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">Total CUP:</span>
                    <span className="font-mono font-bold">${totalAmountCUP.toLocaleString()} CUP</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/70">Equivalencia QvaPay:</span>
                    <span className="font-mono text-brand-primary-light">${totalAmountUSD} USDT</span>
                  </div>
                </div>

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
          
          {paymentMethod !== 'qvapay' ? (
            <form onSubmit={handleConfirmOfflinePayment} className="bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/5">Declaración de Pago</h3>
              
              <div className="space-y-4">
                {/* ID Transaccion */}
                <Input
                  label="Número de Transacción (Ej. 99421290)"
                  placeholder="Introduce el código de operación"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />

                {/* Textarea for SMS pasting */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">Contenido SMS de Confirmación</label>
                  <textarea
                    value={smsConfirmation}
                    onChange={(e) => setSmsConfirmation(e.target.value)}
                    placeholder="Pega el mensaje SMS recibido del banco..."
                    rows={3}
                    className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl p-3 text-xs text-white outline-none focus:border-brand-primary-light"
                  />
                </div>

                {/* Capture/Screenshot uploader */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">Subir Captura del Recibo (Opcional)</label>
                  
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
                      <span className="text-[10px] uppercase font-bold text-white/50">Cargar comprobante</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Total display */}
              <div className="border-t border-white/5 pt-4 flex justify-between text-sm items-center">
                <span className="font-bold text-white/70">Monto del pedido:</span>
                <span className="font-mono text-brand-primary-light font-bold text-base">${totalAmountCUP.toLocaleString()} CUP</span>
              </div>

              <Button variant="primary" fullWidth type="submit" className="mt-2">
                Enviar Comprobante de Pago
                <Send size={13} className="ml-1.5" />
              </Button>
            </form>
          ) : (
            <div className="bg-[#13131F] border border-white/5 rounded-3xl p-6 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7F77DD]">Pago Instantáneo</span>
              <p className="text-xs text-white/50">
                Al usar QvaPay la transacción se valida de forma automática y los beats se descargan de inmediato.
              </p>
              
              <div className="p-4 bg-[#0D0D14] rounded-2xl text-left text-xs font-mono border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-white/40 block text-[9px]">Tasa de cambio:</span>
                  <span>1 USDT = 350 CUP</span>
                </div>
                <div>
                  <span className="text-[#7F77DD] font-bold block">${totalAmountUSD} USDT</span>
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
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Destinatario:</span>
                    <span className="font-bold text-gray-900">CubaBeats Store</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Monto a pagar:</span>
                    <span className="font-bold text-indigo-600 text-sm font-mono">${totalAmountUSD} USDT</span>
                  </div>
                </div>

                <Input
                  label="Correo Electrónico de QvaPay"
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
                  <p className="text-xs font-bold text-gray-900">Validando saldo en blockchain...</p>
                  <p className="text-[10px] text-gray-400">Por favor, no recargues ni cierres la ventana.</p>
                </div>
              </div>
            )}

            {walletStep === 3 && (
              <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} fill="currentColor" className="text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-600">¡Pago Transacción Completado!</p>
                  <p className="text-[10px] text-gray-400">ID de transacción: QP-81923010</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
