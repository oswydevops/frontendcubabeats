import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  CreditCard, Landmark, Wallet, Check, Settings, ShieldCheck, 
  Trash2, Plus, QrCode, Camera, Info, HelpCircle
} from 'lucide-react';
import { ProducerPaymentMethod } from '../../types';

export const ProducerPaymentMethods: React.FC = () => {
  const { addToast, producerPaymentMethods, setProducerPaymentMethods, user } = useApp();

  const isAdmin = user?.role === 'admin';
  const producerId = user?.id || (isAdmin ? 'admin' : 'carlos_producer');
  const methods = producerPaymentMethods.filter(m => m.producerId === producerId);

  const setMethods = (newMethods: ProducerPaymentMethod[]) => {
    const otherMethods = producerPaymentMethods.filter(m => m.producerId !== producerId);
    setProducerPaymentMethods([...otherMethods, ...newMethods]);
  };

  // Modal control states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'bancos' | 'qvapay'>('bancos');

  // Form states for Bancos
  const [acceptsTransfermovil, setAcceptsTransfermovil] = useState(true);
  const [acceptsEnzona, setAcceptsEnzona] = useState(true);
  const [bankCardNumber, setBankCardNumber] = useState('');
  const [bankCurrencyType, setBankCurrencyType] = useState<'Clasica' | 'CUP' | 'MLC'>('CUP');
  const [bankPhoneConfirm, setBankPhoneConfirm] = useState('');
  const [bankTitularName, setBankTitularName] = useState('');
  const [bankQrUrl, setBankQrUrl] = useState('');

  // Form states for Qvapay
  const [qpEmail, setQpEmail] = useState('');
  const [qpUsername, setQpUsername] = useState('');
  const [qpQrUrl, setQpQrUrl] = useState('');

  const handleOpenAddModal = () => {
    // Reset Form Fields
    setSelectedGateway('bancos');
    setAcceptsTransfermovil(true);
    setAcceptsEnzona(true);
    setBankCardNumber('');
    setBankCurrencyType('CUP');
    setBankPhoneConfirm('');
    setBankTitularName('');
    setBankQrUrl('');
    setQpEmail('');
    setQpUsername('');
    setQpQrUrl('');
    
    setIsAddModalOpen(true);
  };

  const handleAddMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGateway === 'bancos') {
      if (!acceptsTransfermovil && !acceptsEnzona) {
        addToast('Debes seleccionar al menos un canal bancario (Transfermóvil o EnZona)', 'error');
        return;
      }
      if (!bankCardNumber || !bankPhoneConfirm || !bankTitularName) {
        addToast('Por favor, ingresa los campos requeridos de la tarjeta (Número, Titular y Teléfono)', 'error');
        return;
      }
      const newMethod: ProducerPaymentMethod = {
        id: `meth_${Date.now()}`,
        type: acceptsTransfermovil ? 'transfermovil' : 'enzona',
        cardNumber: bankCardNumber,
        currencyType: bankCurrencyType,
        phoneConfirm: bankPhoneConfirm,
        titularName: bankTitularName,
        qrScreenshot: bankQrUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        acceptsTransfermovil,
        acceptsEnzona,
        active: true,
        producerId
      };
      setMethods([...methods, newMethod]);
      addToast('Tarjeta bancaria agregada correctamente', 'success');
    } else {
      if (!qpEmail || !qpUsername) {
        addToast('Por favor, ingresa los campos requeridos para QvaPay (Correo y Usuario)', 'error');
        return;
      }
      const newMethod: ProducerPaymentMethod = {
        id: `meth_${Date.now()}`,
        type: 'qvapay',
        qvapayEmail: qpEmail,
        qvapayUser: qpUsername.replace(/^@/, ''),
        qrQvapayScreenshot: qpQrUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true,
        producerId
      };
      setMethods([...methods, newMethod]);
      addToast('Cuenta de QvaPay registrada correctamente', 'success');
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
    addToast('Método de pago eliminado', 'info');
  };

  const handleToggleActive = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, active: !m.active } : m));
    addToast('Estado del método de pago actualizado', 'success');
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          fieldSetter(event.target.result as string);
          addToast('Captura de pantalla QR cargada correctamente', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg">
      
      {/* Header title toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="text-[#7F77DD]" /> 
            {isAdmin ? 'Métodos de Cobro Oficiales (Admin)' : 'Métodos de Pago Locales (Productor)'}
          </h2>
          <p className="text-xs text-gray-400">
            {isAdmin 
              ? 'Cuentas bancarias y QvaPay donde los productores pagarán la suscripción de sus planes.' 
              : 'Cuentas habilitadas de cobro directo para procesar Transfermóvil, EnZona y QvaPay.'}
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} className="text-xs font-bold gap-1.5 self-start sm:self-center">
          <Plus size={16} />
          Agregar Método de Pago
        </Button>
      </div>

      {/* Grid of registered items container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center bg-brand-surface rounded-3xl border border-dashed border-brand-border/40 space-y-3">
            <CreditCard size={32} className="mx-auto text-gray-400" />
            <h4 className="font-bold text-white text-sm">No has configurado ningún método de cobro</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {isAdmin 
                ? 'Registra tus tarjetas o cuenta QvaPay para recibir los pagos de suscripción de los productores.'
                : 'Necesitas registrar al menos una tarjeta o cuenta QvaPay para habilitar la venta de tus beats.'}
            </p>
            <Button variant="ghost" size="sm" onClick={handleOpenAddModal}>
              Configurar Método de Cobro
            </Button>
          </div>
        ) : (
          methods.map((meth) => {
            const isBank = meth.type === 'transfermovil' || meth.type === 'enzona' || !!meth.cardNumber;

            return (
              <div 
                key={meth.id}
                className={`bg-brand-surface rounded-2xl border p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  meth.active ? 'border-brand-border/50' : 'border-brand-border/40 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Brand Row */}
                  <div className="flex justify-between items-center pb-2 border-b border-brand-border/20">
                    <div className="flex items-center gap-2">
                      {isBank ? (
                        <>
                          <div className="p-2 bg-[#534AB7]/20 text-[#7F77DD] rounded-xl">
                            <Landmark size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white block leading-none">Bancos</span>
                              <div className="flex gap-1">
                                {(meth.acceptsTransfermovil !== false) && (
                                  <span className="text-[9px] bg-[#534AB7]/30 text-[#7F77DD] px-1.5 py-0.5 rounded font-bold">Transfermóvil</span>
                                )}
                                {(meth.acceptsEnzona !== false || meth.type === 'enzona') && (
                                  <span className="text-[9px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded font-bold">EnZona</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mt-1">Tarjeta de Débito Cuba</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-cyan-950/20 text-cyan-400 rounded-xl">
                            <Wallet size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-none">QvaPay</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Monedas digitales globales</span>
                          </div>
                        </>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase select-none ${
                      meth.active ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-brand-card/40 text-gray-400'
                    }`}>
                      {meth.active ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  {/* Content body based on properties */}
                  {isBank ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Tarjeta:</span>
                        <strong className="font-mono text-white">{meth.cardNumber}</strong>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Moneda admisible:</span>
                        <strong className="text-white font-bold uppercase">{meth.currencyType}</strong>
                      </div>
                      {meth.titularName && (
                        <div className="flex justify-between text-gray-400">
                          <span>Titular:</span>
                          <strong className="text-white font-semibold">{meth.titularName}</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-400">
                        <span>Teléfono de Confirmación:</span>
                        <strong className="font-mono text-indigo-200">{meth.phoneConfirm}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Correo Cuenta QvaPay:</span>
                        <strong className="font-semibold text-white">{meth.qvapayEmail}</strong>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Nombre de Usuario QvaPay:</span>
                        <strong className="font-mono text-[#7F77DD]">@{meth.qvapayUser}</strong>
                      </div>
                    </div>
                  )}

                  {/* Cover attachment placeholder display */}
                  <div className="flex items-center gap-2.5 p-2 bg-brand-card/40 border border-brand-border/20 rounded-xl text-left">
                    <QrCode size={16} className="text-gray-400" />
                    <div className="flex-grow">
                      <span className="text-[10.5px] font-bold text-gray-200 block">Fotografía QR adjunta</span>
                      <span className="text-[9px] text-gray-450 font-medium">Verificada para visualización directa del pagador.</span>
                    </div>
                    {(meth.qrScreenshot || meth.qrQvapayScreenshot) && (
                      <img 
                        src={meth.qrScreenshot || meth.qrQvapayScreenshot} 
                        alt="Thumbnail mini" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-md border border-brand-border/40" 
                      />
                    )}
                  </div>
                </div>

                {/* Action buttons row */}
                <div className="flex justify-between items-center pt-3 border-t border-brand-border/20">
                  <button
                    onClick={() => handleToggleActive(meth.id)}
                    className="text-xs font-semibold text-gray-400 hover:text-[#7F77DD] transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {meth.active ? 'Desactivar cobranza' : 'Activar cobranza'}
                  </button>

                  <button
                    onClick={() => handleDeleteMethod(meth.id)}
                    className="p-1 px-2.5 text-red-400 border border-red-900/40 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px]"
                    title="Eliminar método"
                  >
                    <Trash2 size={12} />
                    Remover
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Manual FAQ checklist banner */}
      <div className="bg-amber-955/10 rounded-2xl p-4 border border-amber-500/20 flex gap-3 text-left">
        <Info size={18} className="text-[#EF9F27] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-200 block">¿Cómo funcionan los pagos directos en D'Cuban Beats?</span>
          <p className="text-[11px] text-amber-300 leading-relaxed font-sans">
            {isAdmin 
              ? 'Cuando un productor adquiere un plan de membresía, verá tu tarjeta bancaria o cuenta QvaPay. Al realizar la transferencia, subirá su comprobante e ID de transacción para tu verificación manual.'
              : 'Cuando un cantante adquiere tu beat, recibirá en su pantalla tu tarjeta bancaria o cuenta QvaPay. La transferencia llega directa a tu cuenta y liberas el archivo validando el SMS o comprobante de pago.'}
          </p>
        </div>
      </div>

      {/* ADD PAYMENT METHOD MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Configurar Nuevo Método de Cobro"
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMethodSubmit} className="space-y-4 text-left pt-2 text-white bg-brand-surface">
          
          {/* Gateway Selector Toggle - ONLY BANCOS & QVAPAY */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Tipo de Pasarela / Canal de Cobro</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGateway('bancos')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedGateway === 'bancos'
                    ? 'border-[#534AB7] bg-[#534AB7]/20 text-[#7F77DD]'
                    : 'border-brand-border bg-brand-card text-gray-400 hover:bg-brand-surface'
                }`}
              >
                <Landmark size={15} />
                Bancos
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('qvapay')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedGateway === 'qvapay'
                    ? 'border-[#534AB7] bg-[#534AB7]/20 text-[#7F77DD]'
                    : 'border-brand-border bg-brand-card text-gray-400 hover:bg-brand-surface'
                }`}
              >
                <Wallet size={15} />
                QvaPay
              </button>
            </div>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO SELECTION */}
          {selectedGateway === 'bancos' ? (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              {/* Checkboxes for Transfermovil / Enzona */}
              <div className="p-3 bg-brand-card/60 border border-brand-border/30 rounded-xl space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-white/60">Canales Habilitados para esta Tarjeta:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={acceptsTransfermovil}
                      onChange={(e) => setAcceptsTransfermovil(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-border accent-[#534AB7] cursor-pointer"
                    />
                    <span className="font-semibold text-blue-400">Transfermóvil</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={acceptsEnzona}
                      onChange={(e) => setAcceptsEnzona(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-border accent-[#534AB7] cursor-pointer"
                    />
                    <span className="font-semibold text-emerald-400">EnZona</span>
                  </label>
                </div>
              </div>

              {/* Number of Card */}
              <Input
                label="Número de la Tarjeta (Válida para Bandec, Metropolitano o BPA)"
                placeholder="ej. 9225 1204 8839 2101"
                value={bankCardNumber}
                onChange={(e) => setBankCardNumber(e.target.value)}
                themeMode="dark"
                required
              />

              <div className="grid grid-cols-2 gap-3.5 items-end">
                {/* Currency selector */}
                <div className="w-full text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Tipo de Moneda</label>
                  <select
                    value={bankCurrencyType}
                    onChange={(e) => setBankCurrencyType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(127,119,221,0.2)] bg-[#1C1C2E] text-white text-sm outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]/35 transition-all duration-200 h-[42px]"
                  >
                    <option value="CUP" className="bg-brand-surface">CUP</option>
                    <option value="MLC" className="bg-brand-surface">MLC</option>
                    <option value="Clasica" className="bg-brand-surface">Clasica</option>
                  </select>
                </div>

                {/* Phone Confirmation */}
                <Input
                  label="Teléfono Móvil a Confirmar"
                  placeholder="ej. +53 52839401"
                  value={bankPhoneConfirm}
                  onChange={(e) => setBankPhoneConfirm(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>

              {/* Name and two surnames */}
              <Input
                label="Nombre y Dos Apellidos del Titular"
                placeholder="ej. Carlos Juan Santana López"
                value={bankTitularName}
                onChange={(e) => setBankTitularName(e.target.value)}
                themeMode="dark"
                required
              />

              {/* QR Upload Section */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Captura de Pantalla del QR de la Tarjeta</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <Input
                      placeholder="URL de la captura o adjunta archivo..."
                      value={bankQrUrl}
                      onChange={(e) => setBankQrUrl(e.target.value)}
                      themeMode="dark"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      id="bank-qr-file-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setBankQrUrl)}
                    />
                    <label
                      htmlFor="bank-qr-file-picker"
                      className="h-[42px] px-3.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/35 text-[#8D84F7] border border-[#534AB7]/40 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs transition-all shadow-sm flex-shrink-0 whitespace-nowrap"
                    >
                      <Camera size={15} />
                      <span>Subir QR</span>
                    </label>
                  </div>
                </div>
                {bankQrUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Captura cargada:</span>
                    <img src={bankQrUrl} alt="Bank QR preview" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded-lg border border-brand-border/40" />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              <Input
                label="Correo de la Cuenta QvaPay"
                placeholder="ejemplo@qvapay.com"
                type="email"
                value={qpEmail}
                onChange={(e) => setQpEmail(e.target.value)}
                themeMode="dark"
                required
              />

              <Input
                label="Nombre de Usuario de la Cuenta QvaPay"
                placeholder="ej. carlitos_flow"
                value={qpUsername}
                onChange={(e) => setQpUsername(e.target.value)}
                themeMode="dark"
                required
              />

              {/* QR Upload Section for QvaPay */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Captura de Pantalla del QR de la Cuenta QvaPay</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <Input
                      placeholder="URL de la captura o adjunta archivo..."
                      value={qpQrUrl}
                      onChange={(e) => setQpQrUrl(e.target.value)}
                      themeMode="dark"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      id="qp-qr-file-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setQpQrUrl)}
                    />
                    <label
                      htmlFor="qp-qr-file-picker"
                      className="h-[42px] px-3.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/35 text-[#8D84F7] border border-[#534AB7]/40 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs transition-all shadow-sm flex-shrink-0 whitespace-nowrap"
                    >
                      <Camera size={15} />
                      <span>Subir QR</span>
                    </label>
                  </div>
                </div>
                {qpQrUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Captura cargada:</span>
                    <img src={qpQrUrl} alt="QP QR preview" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded-lg border border-brand-border/40" />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex gap-2 justify-end pt-3 border-t border-brand-border/30">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Habilitar Método de Cobro →
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
