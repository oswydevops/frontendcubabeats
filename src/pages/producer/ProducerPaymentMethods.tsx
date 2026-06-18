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

interface PaymentMethodItem {
  id: string;
  type: 'transfermovil' | 'qvapay';
  // transfermovil fields
  cardNumber?: string;
  currencyType?: 'Clasica' | 'CUP' | 'MLC';
  phoneConfirm?: string;
  qrScreenshot?: string;
  // qvapay fields
  qvapayEmail?: string;
  qvapayUser?: string;
  qrQvapayScreenshot?: string;
  active: boolean;
}

export const ProducerPaymentMethods: React.FC = () => {
  const { addToast } = useApp();

  // Load beautiful initial state methods conform with requirements
  const [methods, setMethods] = useState<PaymentMethodItem[]>([
    {
      id: 'meth_1',
      type: 'transfermovil',
      cardNumber: '9225 1204 8839 2101',
      currencyType: 'CUP',
      phoneConfirm: '+53 58349202',
      qrScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
      active: true
    },
    {
      id: 'meth_2',
      type: 'qvapay',
      qvapayEmail: 'carlos.beats@gmail.com',
      qvapayUser: 'carlitos_flow',
      qrQvapayScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
      active: true
    }
  ]);

  // Modal control states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'transfermovil' | 'qvapay'>('transfermovil');

  // Form states for Transfermovil
  const [tmCardNumber, setTmCardNumber] = useState('');
  const [tmCurrencyType, setTmCurrencyType] = useState<'Clasica' | 'CUP' | 'MLC'>('CUP');
  const [tmPhoneConfirm, setTmPhoneConfirm] = useState('');
  const [tmQrUrl, setTmQrUrl] = useState('');

  // Form states for Qvapay
  const [qpEmail, setQpEmail] = useState('');
  const [qpUsername, setQpUsername] = useState('');
  const [qpQrUrl, setQpQrUrl] = useState('');

  const handleOpenAddModal = () => {
    // Reset Form Fields
    setTmCardNumber('');
    setTmCurrencyType('CUP');
    setTmPhoneConfirm('');
    setTmQrUrl('');
    setQpEmail('');
    setQpUsername('');
    setQpQrUrl('');
    
    setIsAddModalOpen(true);
  };

  const handleAddMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedType === 'transfermovil') {
      if (!tmCardNumber || !tmPhoneConfirm) {
        addToast('Por favor, ingresa los campos requeridos para Transfermóvil', 'error');
        return;
      }
      const newMethod: PaymentMethodItem = {
        id: `meth_${Date.now()}`,
        type: 'transfermovil',
        cardNumber: tmCardNumber,
        currencyType: tmCurrencyType,
        phoneConfirm: tmPhoneConfirm,
        qrScreenshot: tmQrUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      };
      setMethods([...methods, newMethod]);
      addToast('Método Transfermóvil agregado correctamente', 'success');
    } else {
      if (!qpEmail || !qpUsername) {
        addToast('Por favor, ingresa los campos requeridos para QvaPay', 'error');
        return;
      }
      const newMethod: PaymentMethodItem = {
        id: `meth_${Date.now()}`,
        type: 'qvapay',
        qvapayEmail: qpEmail,
        qvapayUser: qpUsername,
        qrQvapayScreenshot: qpQrUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      };
      setMethods([...methods, newMethod]);
      addToast('Cuenta de QvaPay registrada correctamente', 'success');
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
    addToast('Método de pago eliminado de CubaBeats', 'info');
  };

  const handleToggleActive = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, active: !m.active } : m));
    addToast('Estado del método de pago actualizado', 'success');
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      fieldSetter(tempUrl);
      addToast('Captura de pantalla QR cargada temporalmente', 'success');
    }
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg">
      
      {/* Header title toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="text-[#7F77DD] animate-spin-slow" /> Métodos de Pago Locales
          </h2>
          <p className="text-xs text-gray-400">
            Cuentas habilitadas de cobro directo para procesar Transfermóvil, EnZona y QvaPay.
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
              Necesitas registrar al menos una tarjeta de Transfermóvil o cuenta QvaPay para habilitar la compra de tus beats.
            </p>
            <Button variant="ghost" size="sm" onClick={handleOpenAddModal}>
              Configurar Mi Primer Método Now
            </Button>
          </div>
        ) : (
          methods.map((meth) => (
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
                    {meth.type === 'transfermovil' ? (
                      <>
                        <div className="p-2 bg-[#534AB7]/20 text-[#7F77DD] rounded-xl">
                          <Landmark size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-none">Transfermóvil ({meth.currencyType})</span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Tarjeta de Débito Cuba</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-cyan-950/20 text-cyan-400 rounded-xl">
                          <Wallet size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-none">QvaPay Checkout</span>
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
                {meth.type === 'transfermovil' ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Tarjeta:</span>
                      <strong className="font-mono text-white">{meth.cardNumber}</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Moneda admisible:</span>
                      <strong className="text-white font-bold uppercase">{meth.currencyType}</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Móvil SMS Confirmación:</span>
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
                    <span className="text-[9px] text-gray-450 font-medium">Verificada para visualización directa del intérprete.</span>
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
          ))
        )}
      </div>

      {/* Manual FAQ checklist banner */}
      <div className="bg-amber-955/10 rounded-2xl p-4 border border-amber-500/20 flex gap-3 text-left">
        <Info size={18} className="text-[#EF9F27] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-200 block">¿Cómo funcionan los pagos directos en CubaBeats?</span>
          <p className="text-[11px] text-amber-300 leading-relaxed font-sans">
            Cuando un cantante adquiere tu beat, recibirá en su pantalla tu número de tarjeta, tipo de moneda y el código QR de cobro que configures aquí. La transferencia llega directa a tu cuenta bancaria y liberas el archivo validando el SMS de confirmación. Todo sin intermediarios.
          </p>
        </div>
      </div>

      {/* ADD PAYMENT WAY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Configurar Nuevo Método de Cobro Local"
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMethodSubmit} className="space-y-4 text-left pt-2 text-white bg-brand-surface">
          
          {/* Method Selector Option Toggle */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Tipo de Pasarela / Canal de Cobro</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('transfermovil')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedType === 'transfermovil'
                    ? 'border-[#534AB7] bg-[#534AB7]/20 text-[#7F77DD]'
                    : 'border-brand-border bg-brand-card text-gray-400 hover:bg-brand-surface'
                }`}
              >
                <Landmark size={18} />
                Transfermóvil CUP/MLC
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('qvapay')}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedType === 'qvapay'
                    ? 'border-[#534AB7] bg-[#534AB7]/20 text-[#7F77DD]'
                    : 'border-brand-border bg-brand-card text-gray-400 hover:bg-brand-surface'
                }`}
              >
                <Wallet size={18} />
                QvaPay Checkout
              </button>
            </div>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO TYPE */}
          {selectedType === 'transfermovil' ? (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              <Input
                label="Número de la Tarjeta de Débito (16 Dígitos)"
                placeholder="9225 1204 ...."
                value={tmCardNumber}
                onChange={(e) => setTmCardNumber(e.target.value)}
                themeMode="dark"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Tipo de Moneda</label>
                  <select
                    value={tmCurrencyType}
                    onChange={(e) => setTmCurrencyType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7]/20 text-xs outline-none"
                  >
                    <option value="CUP" className="bg-brand-surface">CUP (Pesos Cubanos)</option>
                    <option value="MLC" className="bg-brand-surface">MLC (Moneda Libre Convert.)</option>
                    <option value="Clasica" className="bg-brand-surface">Clásica (Internacional)</option>
                  </select>
                </div>

                <Input
                  label="Teléfono a Confirmar SMS"
                  placeholder="+53 52839401"
                  value={tmPhoneConfirm}
                  onChange={(e) => setTmPhoneConfirm(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>

              {/* QR Upload Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider block">Captura de Pantalla del QR de la Tarjeta (Opcional)</label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <Input
                      placeholder="Dirección URL de la captura si ya la tienes..."
                      value={tmQrUrl}
                      onChange={(e) => setTmQrUrl(e.target.value)}
                      themeMode="dark"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="tm-qr-file-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setTmQrUrl)}
                    />
                    <label
                      htmlFor="tm-qr-file-picker"
                      className="px-3.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/30 text-[#7F77DD] border border-[#534AB7]/35 rounded-xl flex items-center justify-center cursor-pointer h-[42px] mt-0.5"
                    >
                      <Camera size={14} />
                    </label>
                  </div>
                </div>
                {tmQrUrl && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-450 font-bold">✓ Captura cargada:</span>
                    <img src={tmQrUrl} alt="TM QR preview" referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded border border-brand-border/40" />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              <Input
                label="Correo de Cuenta QvaPay"
                placeholder="ejemplo@qvapay.com"
                type="email"
                value={qpEmail}
                onChange={(e) => setQpEmail(e.target.value)}
                themeMode="dark"
                required
              />

              <Input
                label="Usuario de la Cuenta QvaPay (Sin @)"
                placeholder="ej. carlitos_flow"
                value={qpUsername}
                onChange={(e) => setQpUsername(e.target.value)}
                themeMode="dark"
                required
              />

              {/* QR Upload Section for QvaPay */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider block">Captura de QR de tu Cuenta QvaPay (Opcional)</label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <Input
                      placeholder="Dirección URL de la captura si ya la tienes..."
                      value={qpQrUrl}
                      onChange={(e) => setQpQrUrl(e.target.value)}
                      themeMode="dark"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="qp-qr-file-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setQpQrUrl)}
                    />
                    <label
                      htmlFor="qp-qr-file-picker"
                      className="px-3.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/30 text-[#7F77DD] border border-[#534AB7]/35 rounded-xl flex items-center justify-center cursor-pointer h-[42px] mt-0.5"
                    >
                      <Camera size={14} />
                    </label>
                  </div>
                </div>
                {qpQrUrl && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-450 font-bold">✓ Captura cargada:</span>
                    <img src={qpQrUrl} alt="QP QR preview" referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded border border-brand-border/40" />
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
