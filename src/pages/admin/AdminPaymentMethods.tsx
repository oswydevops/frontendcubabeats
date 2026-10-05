import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  CreditCard, Landmark, Wallet, Plus, Trash2, QrCode, Camera, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { AdminPaymentMethod } from '../../types';

export const AdminPaymentMethods: React.FC = () => {
  const { adminPaymentMethods, setAdminPaymentMethods, addToast } = useApp();

  const adminMethods = adminPaymentMethods || [];

  const saveAdminMethods = (newMethods: AdminPaymentMethod[]) => {
    setAdminPaymentMethods(newMethods);
  };

  // --- ADMIN PAYMENT METHOD MODAL STATES ---
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payType, setPayType] = useState<'bancos' | 'qvapay'>('bancos');
  
  // Bancos form states
  const [tmBankName, setTmBankName] = useState('BANDEC');
  const [tmCardHolder, setTmCardHolder] = useState("D'Cuban Beats S.A.");
  const [tmCardNumber, setTmCardNumber] = useState('');
  const [tmCurrency, setTmCurrency] = useState<'CUP' | 'MLC'>('CUP');
  const [tmPhone, setTmPhone] = useState('');
  const [tmQrUrl, setTmQrUrl] = useState('');
  const [tmAcceptsTransfermovil, setTmAcceptsTransfermovil] = useState(true);
  const [tmAcceptsEnzona, setTmAcceptsEnzona] = useState(true);

  // QvaPay form states
  const [qpEmail, setQpEmail] = useState('');
  const [qpUser, setQpUser] = useState('');
  const [qpQrUrl, setQpQrUrl] = useState('');

  const handleOpenAddPay = () => {
    setPayType('bancos');
    setTmBankName('BANDEC');
    setTmCardHolder("D'Cuban Beats S.A.");
    setTmCardNumber('');
    setTmCurrency('CUP');
    setTmPhone('');
    setTmQrUrl('');
    setTmAcceptsTransfermovil(true);
    setTmAcceptsEnzona(true);

    setQpEmail('');
    setQpUser('');
    setQpQrUrl('');

    setIsPayModalOpen(true);
  };

  const handleLocalFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('La imagen excede el límite de 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newMethod: AdminPaymentMethod;

    if (payType === 'bancos' || (payType as string) === 'transfermovil') {
      if (!tmCardNumber.trim() || !tmPhone.trim()) {
        addToast('Por favor completa el número de cuenta y el teléfono móvil de confirmación', 'error');
        return;
      }
      newMethod = {
        id: `adm_meth_${Date.now()}`,
        type: 'transfermovil',
        bankName: tmBankName.trim() || 'BANDEC',
        cardHolder: tmCardHolder.trim() || "D'Cuban Beats S.A.",
        cardNumber: tmCardNumber.trim(),
        currencyType: tmCurrency,
        phoneConfirm: tmPhone.trim(),
        qrScreenshot: tmQrUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
        acceptsTransfermovil: tmAcceptsTransfermovil,
        acceptsEnzona: tmAcceptsEnzona,
        active: true
      };
    } else {
      if (!qpEmail.trim() || !qpUser.trim()) {
        addToast('Por favor completa el email y el usuario de QvaPay', 'error');
        return;
      }
      newMethod = {
        id: `adm_meth_${Date.now()}`,
        type: 'qvapay',
        qvapayEmail: qpEmail.trim(),
        qvapayUser: qpUser.trim(),
        qrQvapayScreenshot: qpQrUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      };
    }

    const updated = [...adminMethods, newMethod];
    saveAdminMethods(updated);
    setIsPayModalOpen(false);
    addToast('Método de recaudo para suscripciones agregado con éxito', 'success');
  };

  const handleDeletePay = (id: string) => {
    const updated = adminMethods.filter(m => m.id !== id);
    saveAdminMethods(updated);
    addToast('Método de recaudo eliminado', 'info');
  };

  const handleTogglePayActive = (id: string, active: boolean) => {
    const updated = adminMethods.map(m => m.id === id ? { ...m, active: !active } : m);
    saveAdminMethods(updated);
    addToast('Estado de cobranza de suscripción actualizado', 'success');
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* Header Toolbar */}
      <div className="bg-gradient-[#13131F] bg-opacity-65 border border-white/5 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="space-y-1 z-10 max-w-2xl text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
              Cuentas de Cobro Admin
            </span>
            <span className="text-[10px] font-medium text-gray-500">• Pasarelas de Recaudación de Membresías</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="text-cyan-400" size={22} /> Métodos de Pago de la Administración
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Registra y gestiona las cuentas de banco cubanas (Transfermóvil, EnZona) y wallets digitales (QvaPay) de la administración. A través de ellas, los productores realizarán las transferencias para abonar sus planes de suscripción Pro o Elite.
          </p>
        </div>

        <div className="z-10 flex-shrink-0 self-start md:self-center">
          <Button 
            variant="outline" 
            onClick={handleOpenAddPay}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C2E] text-white hover:bg-[#25253D] font-bold text-xs rounded-xl border border-white/10 hover:border-white/20 cursor-pointer shadow-md"
          >
            <Plus size={16} />
            Agregar Canal de Cobro
          </Button>
        </div>
      </div>

      {/* Platform Payment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminMethods.length === 0 ? (
          <div className="md:col-span-2 py-14 text-center bg-[#131124]/40 rounded-2xl border border-dashed border-white/10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <CreditCard size={26} />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="font-bold text-white text-sm">No has configurado cuentas de cobro de membresías</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Actualmente no hay ninguna cuenta o canal de pago activo. Mientras no exista ningún método configurado, los productores no podrán realizar solicitudes de pago para planes Pro/Elite.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleOpenAddPay} className="text-xs text-[#8D84F7] hover:text-white font-bold cursor-pointer">
              + Configurar Primera Cuenta de Recaudo
            </Button>
          </div>
        ) : (
          adminMethods.map((meth) => {
            const isTM = meth.type === 'transfermovil';
            return (
              <div 
                key={meth.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  meth.active 
                    ? isTM 
                      ? 'bg-gradient-to-br from-[#1b1935] to-[#121221] border-[#534AB7]/40 shadow-lg shadow-indigo-500/5'
                      : 'bg-gradient-to-br from-[#121e2c] to-[#0d1420] border-cyan-500/30'
                    : 'bg-[#121220] border-white/5 opacity-55'
                }`}
              >
                {/* Decorative background logo icon */}
                <div className="absolute -right-6 -bottom-6 text-white/5 opacity-[0.03] select-none pointer-events-none transform -rotate-12">
                  {isTM ? <Landmark size={140} /> : <Wallet size={140} />}
                </div>

                <div className="p-6 space-y-5 text-left z-10">
                  {/* Card Header row wrapper */}
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      {isTM ? (
                        <div className="p-2.5 bg-[#534AB7]/10 text-[#8D84F7] rounded-xl border border-[#534AB7]/25 w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <Landmark size={20} />
                        </div>
                      ) : (
                        <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-400/25 w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <Wallet size={20} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white block leading-tight">
                          {isTM ? `Transfermóvil / Banco (${meth.currencyType})` : 'QvaPay'}
                        </h4>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mt-0.5">
                          {isTM ? 'Transferencia Directa Cuba' : 'Pasarela Digital / Cripto'}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border select-none ${
                      meth.active 
                        ? isTM 
                          ? 'bg-[#534AB7]/20 text-[#8D84F7] border-[#534AB7]/30'
                          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
                        : 'bg-white/5 text-gray-500 border-white/5'
                    }`}>
                      {meth.active ? 'Canal Activo' : 'Pausado'}
                    </span>
                  </div>

                  {/* Monetary details values formatted */}
                  {isTM ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-[#07070F]/50 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-450 block text-[10px]">Tarjeta {meth.currencyType || 'CUP'} ({meth.bankName || 'BANDEC'}):</span>
                        <strong className="font-mono text-white text-xs select-all bg-[#121221] px-2 py-1 rounded border border-white/5 shadow-inner leading-none tracking-wider">
                          {meth.cardNumber}
                        </strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col justify-center bg-[#07070F]/50 p-2 rounded-lg border border-white/5">
                          <span className="text-gray-450 text-[9px]">Titular de Cuenta</span>
                          <strong className="text-indigo-300 font-bold mt-0.5 text-xs truncate">{meth.cardHolder || "D'Cuban Beats"}</strong>
                        </div>
                        <div className="flex flex-col justify-center bg-[#07070F]/50 p-2 rounded-lg border border-white/5">
                          <span className="text-gray-450 text-[9px]">Móvil de Confirmación</span>
                          <strong className="font-mono text-white mt-0.5 text-[11px] truncate">{meth.phoneConfirm}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-[#07070F]/50 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-450 text-[10px]">Cuenta Email QvaPay:</span>
                        <strong className="font-sans text-white text-xs select-all bg-[#121221] px-2 py-1 rounded border border-white/5 font-semibold">
                          {meth.qvapayEmail}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center bg-[#07070F]/50 p-2 rounded-lg border border-white/5">
                        <span className="text-gray-450 text-[10px]">Username QvaPay:</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">@{meth.qvapayUser}</span>
                      </div>
                    </div>
                  )}

                  {/* QR Code thumbnail visualization block */}
                  <div className="flex items-center gap-3 p-2.5 bg-[#07070F]/65 border border-white/5 rounded-xl">
                    <QrCode size={18} className="text-gray-500 flex-shrink-0" />
                    <div className="flex-grow text-left">
                      <span className="text-[10px] font-bold text-white block leading-tight">Código QR de Cobro</span>
                      <span className="text-[9px] text-gray-500 block">Visualizable para el productor al pagar el plan</span>
                    </div>
                    {(meth.qrScreenshot || meth.qrQvapayScreenshot) && (
                      <div className="relative group/qr">
                        <img 
                          src={meth.qrScreenshot || meth.qrQvapayScreenshot} 
                          alt="Mini QR preview" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-md border border-white/10 shadow-sm" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Controls Footer Block */}
                <div className="bg-[#0B0B13] px-6 py-3.5 border-t border-white/5 mt-auto flex justify-between items-center">
                  <button
                    onClick={() => handleTogglePayActive(meth.id, meth.active)}
                    className={`text-xs font-bold transition-colors cursor-pointer bg-none border-none p-0 ${
                      meth.active 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    {meth.active ? 'Pausar este canal' : 'Reactivar este canal'}
                  </button>

                  <button
                    onClick={() => handleDeletePay(meth.id)}
                    className="text-xs text-red-400/80 hover:text-red-400 font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-none border-none p-0"
                  >
                    <Trash2 size={12} />
                    Desvincular
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL FOR ADDING ADMIN PAYMENT METHOD --- */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Agregar Cuenta / Canal de Cobro de la Plataforma"
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddPaySubmit} className="space-y-4 pt-2 text-white">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">Tipo de Pasarela</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayType('bancos')}
                className={`py-2.5 px-3 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  payType === 'bancos' || (payType as string) === 'transfermovil'
                    ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                    : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                }`}
              >
                <Landmark size={15} />
                Banco / Transfermóvil
              </button>
              <button
                type="button"
                onClick={() => setPayType('qvapay')}
                className={`py-2.5 px-3 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  payType === 'qvapay'
                    ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                    : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                }`}
              >
                <Wallet size={15} />
                QvaPay
              </button>
            </div>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO TYPE */}
          {payType === 'bancos' || (payType as string) === 'transfermovil' ? (
            <div className="space-y-3.5 animate-in fade-in duration-150 text-left">
              <div className="grid grid-cols-2 gap-3.5">
                <Input
                  label="Banco de Emisión"
                  placeholder="ej. BANDEC, BPA, BANMET"
                  value={tmBankName}
                  onChange={(e) => setTmBankName(e.target.value)}
                  themeMode="dark"
                  required
                />
                <Input
                  label="Nombre del Titular"
                  placeholder="ej. D'Cuban Beats S.A."
                  value={tmCardHolder}
                  onChange={(e) => setTmCardHolder(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>

              <Input
                label="Número de Cuenta / Tarjeta (16 dígitos)"
                placeholder="9224 5501 ...."
                value={tmCardNumber}
                onChange={(e) => setTmCardNumber(e.target.value)}
                themeMode="dark"
                required
              />

              <div className="grid grid-cols-2 gap-3.5 items-end">
                <div className="w-full text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Tipo de Moneda</label>
                  <select
                    value={tmCurrency}
                    onChange={(e) => setTmCurrency(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(127,119,221,0.2)] bg-[#1C1C2E] text-white text-sm outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]/35 transition-all duration-200 h-[42px]"
                  >
                    <option value="CUP" className="bg-[#1C1C2E]">CUP</option>
                    <option value="MLC" className="bg-[#1C1C2E]">MLC</option>
                  </select>
                </div>

                <Input
                  label="Teléfono Móvil a Confirmar"
                  placeholder="+53 52930211"
                  value={tmPhone}
                  onChange={(e) => setTmPhone(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>

              {/* Gateway Checkboxes: Transfermovil & EnZona */}
              <div className="space-y-1.5 p-3 bg-[#11111E] rounded-xl border border-white/5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Pasarelas Autorizadas para esta Tarjeta:
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                    <input
                      type="checkbox"
                      checked={tmAcceptsTransfermovil}
                      onChange={(e) => setTmAcceptsTransfermovil(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-500 bg-[#1C1C2E] border-white/20 accent-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold text-blue-400">Transfermóvil</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                    <input
                      type="checkbox"
                      checked={tmAcceptsEnzona}
                      onChange={(e) => setTmAcceptsEnzona(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-[#1C1C2E] border-white/20 accent-emerald-500 cursor-pointer"
                    />
                    <span className="font-semibold text-emerald-400">EnZona</span>
                  </label>
                </div>
              </div>

              {/* QR Upload Section */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Código QR de Cobro (URL o Archivo)</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <Input
                      placeholder="Dirección URL de la captura..."
                      value={tmQrUrl}
                      onChange={(e) => setTmQrUrl(e.target.value)}
                      themeMode="dark"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      id="adm-tm-qr-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setTmQrUrl)}
                    />
                    <label
                      htmlFor="adm-tm-qr-picker"
                      className="h-[42px] px-3.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/35 text-[#8D84F7] border border-[#534AB7]/40 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition-all shadow-sm flex-shrink-0 whitespace-nowrap"
                    >
                      <Camera size={15} />
                      <span>Subir QR</span>
                    </label>
                  </div>
                </div>
                {tmQrUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Captura cargada:</span>
                    <img src={tmQrUrl} alt="TM Admin QR preview" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded-lg border border-white/10" />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-3.5 animate-in fade-in duration-150 text-left">
              <Input
                label="Dirección de correo electrónico QvaPay"
                placeholder="ej. admin.pagos@dcubanbeats.com"
                type="email"
                value={qpEmail}
                onChange={(e) => setQpEmail(e.target.value)}
                themeMode="dark"
                required
              />

              <Input
                label="Usuario de la Cuenta QvaPay (Sin @)"
                placeholder="ej. admin_dcubanbeats"
                value={qpUser}
                onChange={(e) => setQpUser(e.target.value)}
                themeMode="dark"
                required
              />

              {/* QR Upload Section for QvaPay */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Código QR QvaPay (Opcional)</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <Input
                      placeholder="Dirección URL de la captura..."
                      value={qpQrUrl}
                      onChange={(e) => setQpQrUrl(e.target.value)}
                      themeMode="dark"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      id="adm-qp-qr-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setQpQrUrl)}
                    />
                    <label
                      htmlFor="adm-qp-qr-picker"
                      className="h-[42px] px-3.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/35 text-[#8D84F7] border border-[#534AB7]/40 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition-all shadow-sm flex-shrink-0 whitespace-nowrap"
                    >
                      <Camera size={15} />
                      <span>Subir QR</span>
                    </label>
                  </div>
                </div>
                {qpQrUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Captura cargada:</span>
                    <img src={qpQrUrl} alt="QP Admin QR preview" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded-lg border border-white/10" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t border-brand-border/20 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsPayModalOpen(false)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Vincular Cuenta de Cobro Administrador
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
