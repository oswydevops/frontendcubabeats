import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Radio, Settings, Sparkles, Check, RefreshCw, Plus, Trash2, 
  Edit, CreditCard, Landmark, Wallet, QrCode, Camera, Info, X, ShieldCheck
} from 'lucide-react';
import { Plan } from '../../types';

interface AdminPaymentMethod {
  id: string;
  type: 'transfermovil' | 'qvapay';
  cardNumber?: string;
  currencyType?: 'CUP' | 'MLC' | 'Clasica';
  phoneConfirm?: string;
  qrScreenshot?: string;
  qvapayEmail?: string;
  qvapayUser?: string;
  qrQvapayScreenshot?: string;
  active: boolean;
}

export const AdminPlans: React.FC = () => {
  const { plans, updatePlans, addToast } = useApp();

  // Load local state variables for plans
  const [plansList, setPlansList] = useState<Plan[]>(plans);

  // Sync state if global plans change
  useEffect(() => {
    setPlansList(plans);
  }, [plans]);

  // Load and persist Admin Payment Methods
  const [adminMethods, setAdminMethods] = useState<AdminPaymentMethod[]>(() => {
    const cached = localStorage.getItem('cb_admin_payment_methods');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    // Default system admin methods
    return [
      {
        id: 'adm_meth_1',
        type: 'transfermovil',
        cardNumber: '9211 4483 1290 8378',
        currencyType: 'CUP',
        phoneConfirm: '+53 52930211',
        qrScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      },
      {
        id: 'adm_meth_2',
        type: 'qvapay',
        qvapayEmail: 'cobros.admin@cubabeats.com',
        qvapayUser: 'admin_cubabeats',
        qrQvapayScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      }
    ];
  });

  // Save admin methods to localStorage
  const saveAdminMethods = (newMethods: AdminPaymentMethod[]) => {
    setAdminMethods(newMethods);
    localStorage.setItem('cb_admin_payment_methods', JSON.stringify(newMethods));
  };

  // --- PLAN FORM MODAL STATES ---
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pPriceYearly, setPPriceYearly] = useState(0);
  const [pBillingCycle, setPBillingCycle] = useState<'monthly' | 'yearly' | 'both'>('monthly');
  const [pLimit, setPLimit] = useState(10);
  const [pCommission, setPCommission] = useState(5);
  const [pSupport, setPSupport] = useState<'Soporte Estándar' | 'Soporte Prioritario' | 'Soporte Prioritario 24/7' | 'Sin Soporte'>('Soporte Estándar');
  const [pFeatured, setPFeatured] = useState(false);
  
  // Benefits point list builder
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Payment methods limit checkbox targets
  const [allowTransfermovil, setAllowTransfermovil] = useState(true);
  const [allowQvapay, setAllowQvapay] = useState(true);

  // --- ADMIN PAYMENT METHOD MODAL STATES ---
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payType, setPayType] = useState<'transfermovil' | 'qvapay'>('transfermovil');
  
  // Transfermóvil form states
  const [tmCardNumber, setTmCardNumber] = useState('');
  const [tmCurrency, setTmCurrency] = useState<'CUP' | 'MLC' | 'Clasica'>('CUP');
  const [tmPhone, setTmPhone] = useState('');
  const [tmQrUrl, setTmQrUrl] = useState('');

  // QvaPay form states
  const [qpEmail, setQpEmail] = useState('');
  const [qpUser, setQpUser] = useState('');
  const [qpQrUrl, setQpQrUrl] = useState('');


  // --- HANDLERS FOR PLANS ---
  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setPName('');
    setPPrice(0);
    setPPriceYearly(0);
    setPBillingCycle('monthly');
    setPLimit(10);
    setPCommission(5);
    setPSupport('Soporte Estándar');
    setPFeatured(false);
    setBenefitsList(['Acceso completo', 'Soporte técnico']);
    setNewBenefitInput('');
    setAllowTransfermovil(true);
    setAllowQvapay(true);

    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPName(plan.name);
    setPPrice(plan.price);
    setPPriceYearly(plan.priceYearly || plan.price * 10); // fallback default
    setPBillingCycle(plan.billingCycleType || 'monthly');
    setPLimit(plan.limit);
    setPCommission(plan.commission);
    setPSupport(plan.support);
    setPFeatured(plan.featured || false);
    setBenefitsList(plan.benefits || []);
    setNewBenefitInput('');
    
    // Set payment checkboxes
    const allowed = plan.allowedPaymentMethods || ['transfermovil', 'qvapay'];
    setAllowTransfermovil(allowed.includes('transfermovil'));
    setAllowQvapay(allowed.includes('qvapay'));

    setIsPlanModalOpen(true);
  };

  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setBenefitsList([...benefitsList, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList(benefitsList.filter((_, i) => i !== index));
  };

  const handlePlanFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      addToast('El nombre del plan es requerido', 'error');
      return;
    }

    const payloadMethods: string[] = [];
    if (allowTransfermovil) payloadMethods.push('transfermovil');
    if (allowQvapay) payloadMethods.push('qvapay');

    const updatedPlan: Plan = {
      id: editingPlan ? editingPlan.id : `plan_${Date.now()}`,
      name: pName,
      price: pPrice,
      priceYearly: pPriceYearly,
      billingCycleType: pBillingCycle,
      limit: pLimit,
      commission: pCommission,
      support: pSupport,
      featured: pFeatured,
      benefits: benefitsList,
      allowedPaymentMethods: payloadMethods
    };

    let nextPlans: Plan[];
    if (editingPlan) {
      nextPlans = plansList.map(p => p.id === editingPlan.id ? updatedPlan : p);
      addToast(`Plan "${pName}" actualizado con éxito`, 'success');
    } else {
      nextPlans = [...plansList, updatedPlan];
      addToast(`Plan "${pName}" creado con éxito`, 'success');
    }

    setPlansList(nextPlans);
    updatePlans(nextPlans);
    setIsPlanModalOpen(false);
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el plan de membresía "${name}"?`)) {
      const nextPlans = plansList.filter(p => p.id !== id);
      setPlansList(nextPlans);
      updatePlans(nextPlans);
      addToast(`Plan "${name}" eliminado`, 'info');
    }
  };


  // --- HANDLERS FOR ADMIN PAYMENTS ---
  const handleOpenAddPay = () => {
    setTmCardNumber('');
    setTmCurrency('CUP');
    setTmPhone('');
    setTmQrUrl('');
    setQpEmail('');
    setQpUser('');
    setQpQrUrl('');

    setIsPayModalOpen(true);
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
      addToast('Fotografía QR cargada al formulario', 'success');
    }
  };

  const handleAddPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newMethod: AdminPaymentMethod;

    if (payType === 'transfermovil') {
      if (!tmCardNumber.trim() || !tmPhone.trim()) {
        addToast('Completa los campos obligatorios de Transfermóvil', 'error');
        return;
      }
      newMethod = {
        id: `adm_meth_${Date.now()}`,
        type: 'transfermovil',
        cardNumber: tmCardNumber.trim(),
        currencyType: tmCurrency,
        phoneConfirm: tmPhone.trim(),
        qrScreenshot: tmQrUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      };
    } else {
      if (!qpEmail.trim() || !qpUser.trim()) {
        addToast('Completa los campos obligatorios de QvaPay', 'error');
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
    addToast('Método de recaudo para suscripciones agregado', 'success');
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
    <div className="space-y-12 text-left animate-in fade-in">
      
      {/* SECTION I: MEMBERSHIP PLAN CONFIGURATION */}
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/25 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Radio className="text-[#7F77DD]" /> Configurar Planes de Productores (Membresías)
            </h2>
            <p className="text-xs text-gray-400">Ajusta los precios de suscripción en CUP, los límites de cargas, comisiones y pasarelas de pago admitidas.</p>
          </div>

          <Button 
            variant="primary" 
            onClick={handleOpenAddPlan} 
            className="flex items-center gap-1.5 shadow-md hover:scale-102 transition-transform self-start sm:self-center"
          >
            <Plus size={16} />
            Agregar Nuevo Plan
          </Button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansList.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-brand-surface p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all relative ${
                plan.featured ? 'border-[#7F77DD] ring-2 ring-[#7F77DD]/10' : 'border-brand-border/40'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#534AB7] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles size={10} /> Destacado
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    
                    {/* Billing info */}
                    <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                      {(!plan.billingCycleType || plan.billingCycleType === 'monthly' || plan.billingCycleType === 'both') && (
                        <div className="text-xs text-[#8D84F7] bg-[#534AB7]/10 px-2 py-0.5 rounded border border-[#534AB7]/20">
                          <span className="font-mono font-bold">${plan.price}</span> CUP /mes
                        </div>
                      )}
                      {(plan.billingCycleType === 'yearly' || plan.billingCycleType === 'both') && (
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <span className="font-mono font-bold">${plan.priceYearly || plan.price * 10}</span> CUP /año
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditPlan(plan)}
                      className="p-1 px-2 text-[#7F77DD] hover:bg-brand-card border border-brand-border/30 rounded-lg transition-colors cursor-pointer"
                      title="Editar propiedades del Plan"
                    >
                      <Edit size={12} />
                    </button>

                    <button 
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      className="p-1 px-2 text-brand-accent-red hover:bg-brand-accent-red/10 border border-[#FF5C5C]/25 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este plan"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300 bg-[#1C1C2E]/60 p-3 rounded-xl border border-brand-border/20">
                  <div className="flex justify-between">
                    <span>Comisión sobre ventas:</span>
                    <strong className="text-white">{plan.commission}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Límite de audiciones/beats:</span>
                    <strong className="text-white">{plan.limit === 999 ? 'Ilimitados' : `${plan.limit} Beats`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Soporte Técnico:</span>
                    <strong className="text-[#8D84F7] font-medium">{plan.support}</strong>
                  </div>
                </div>

                {/* Sub-section for payment channels permitted */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Cobranza Permitida por:</span>
                  <div className="flex flex-wrap gap-1">
                    {(!plan.allowedPaymentMethods || plan.allowedPaymentMethods.includes('transfermovil')) && (
                      <Badge variant="blue" className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20">Transfermóvil</Badge>
                    )}
                    {(!plan.allowedPaymentMethods || plan.allowedPaymentMethods.includes('qvapay')) && (
                      <Badge variant="purple" className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20">QvaPay</Badge>
                    )}
                    {plan.allowedPaymentMethods && plan.allowedPaymentMethods.length === 0 && (
                      <span className="text-[10px] text-brand-accent-red italic font-medium">Ningún método de pago admitido</span>
                    )}
                  </div>
                </div>

                {/* Benefits Items List */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Beneficios del Plan:</span>
                  <ul className="space-y-1 text-xs text-gray-400">
                    {plan.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] flex-shrink-0" />
                        <span className="truncate">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/10 mt-4 text-[10px] text-gray-500 leading-tight">
                Plan ID: <span className="font-mono text-gray-400">{plan.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION II: PLATFORM PAYMENT METHODS FOR SUBSCRIPTION PAYMENTS */}
      <div className="border-t border-brand-border/20 pt-10 space-y-6">
        {/* Header and Add buttons toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="text-[#534AB7] animate-pulse" /> Métodos de Pago de la Plataforma
            </h2>
            <p className="text-xs text-gray-400">
              Registra las cuentas bancarias o billeteras de la administración donde los productores enviarán sus pagos para adquirir las membresías Pro/Elite.
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={handleOpenAddPay}
            className="flex items-center gap-1.5 border-brand-border/40 text-white hover:bg-brand-card bg-[#1C1C2E] self-start sm:self-center"
          >
            <Plus size={15} />
            Agregar Canal de Cobro Adm.
          </Button>
        </div>

        {/* Platform Payment Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminMethods.length === 0 ? (
            <div className="md:col-span-2 py-12 text-center bg-[#1C1C2E]/40 rounded-2xl border border-dashed border-brand-border/45">
              <CreditCard size={32} className="mx-auto text-gray-500 mb-2" />
              <h4 className="font-semibold text-white text-xs">No has configurado cuentas de cobro de membresías</h4>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto mb-3">
                Debes asociar al menos una cuenta para que los productores puedan ver a dónde transferir al ascender de plan.
              </p>
              <Button variant="ghost" size="sm" onClick={handleOpenAddPay} className="text-xs text-[#8D84F7] hover:text-white">
                Asociar Primera Cuenta
              </Button>
            </div>
          ) : (
            adminMethods.map((meth) => (
              <div 
                key={meth.id}
                className={`bg-brand-surface rounded-2xl border p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  meth.active ? 'border-brand-border/40' : 'border-brand-border/20 opacity-50'
                }`}
              >
                <div className="space-y-3">
                  {/* Account Type and active badge layout */}
                  <div className="flex justify-between items-center pb-2 border-b border-brand-border/15">
                    <div className="flex items-center gap-2">
                      {meth.type === 'transfermovil' ? (
                        <>
                          <div className="p-2 bg-[#534AB7]/20 text-[#8D84F7] rounded-xl border border-[#534AB7]/30">
                            <Landmark size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-none">Administración: Transfermóvil ({meth.currencyType})</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Transferencia Directa Bancaria</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                            <Wallet size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-none">Administración: QvaPay Wallet</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Cobros Cripto / Internac.</span>
                          </div>
                        </>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase select-none ${
                      meth.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#1C1C2E] text-gray-500'
                    }`}>
                      {meth.active ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  {/* Detail text values based on payment gateway */}
                  {meth.type === 'transfermovil' ? (
                    <div className="space-y-1.5 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Tarjeta Administrador (CUP):</span>
                        <strong className="font-mono text-white font-bold">{meth.cardNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Moneda admitida:</span>
                        <strong className="text-[#8D84F7] font-bold uppercase">{meth.currencyType}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Móvil SMS Recibo:</span>
                        <strong className="font-mono text-white">{meth.phoneConfirm}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Correo Cuenta QvaPay:</span>
                        <strong className="text-white font-medium">{meth.qvapayEmail}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Username QvaPay:</span>
                        <strong className="font-mono text-[#8D84F7]">@{meth.qvapayUser}</strong>
                      </div>
                    </div>
                  )}

                  {/* QR miniature block */}
                  <div className="flex items-center gap-2.5 p-2 bg-[#1C1C2E]/60 border border-brand-border/20 rounded-xl">
                    <QrCode size={16} className="text-gray-500" />
                    <div className="flex-grow">
                      <span className="text-[10px] font-bold text-white block">Fotografía QR Adjunta para transferencias</span>
                      <span className="text-[9px] text-gray-500 block">Facilita el escaneo ávido por la app bancaria.</span>
                    </div>
                    {(meth.qrScreenshot || meth.qrQvapayScreenshot) && (
                      <img 
                        src={meth.qrScreenshot || meth.qrQvapayScreenshot} 
                        alt="Mini QR preview" 
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 object-cover rounded-md border border-brand-border/25" 
                      />
                    )}
                  </div>
                </div>

                {/* Footer buttons direct billing actions */}
                <div className="flex justify-between items-center pt-3 border-t border-brand-border/10 mt-2">
                  <button
                    onClick={() => handleTogglePayActive(meth.id, meth.active)}
                    className="text-xs font-semibold text-[#8D84F7] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {meth.active ? 'Desactivar esta cuenta' : 'Activar cobros en esta cuenta'}
                  </button>

                  <button
                    onClick={() => handleDeletePay(meth.id)}
                    className="p-1 px-2 text-brand-accent-red hover:bg-brand-accent-red/10 border border-brand-accent-red/15 hover:text-brand-accent-red rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10.5px]"
                  >
                    <Trash2 size={11} />
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL FOR PLANS (ADD / EDIT) --- */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? `Editar Plan de Membresía` : `Crear Nuevo Plan de Membresía`}
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePlanFormSubmit} className="space-y-4 pt-2 text-white">
          
          <Input 
            label="Nombre del Plan de Membresía"
            placeholder="Ej. Pro Plus, Elite Flow, Platinum"
            value={pName}
            onChange={(e) => setPName(e.target.value)}
            themeMode="dark"
            required
          />

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold uppercase text-gray-450 tracking-wider">Ciclo de Facturación Admitido</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPBillingCycle('monthly')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  pBillingCycle === 'monthly'
                    ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                    : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                }`}
              >
                Solo Mensual
              </button>
              <button
                type="button"
                onClick={() => setPBillingCycle('yearly')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  pBillingCycle === 'yearly'
                    ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                    : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                }`}
              >
                Solo Anual
              </button>
              <button
                type="button"
                onClick={() => setPBillingCycle('both')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  pBillingCycle === 'both'
                    ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                    : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                }`}
              >
                Ambos Ciclos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Show monthly input if monthly or both */}
            {(pBillingCycle === 'monthly' || pBillingCycle === 'both') ? (
              <Input 
                label="Precio por Mes ($ CUP)"
                type="number"
                min="0"
                value={pPrice}
                onChange={(e) => setPPrice(Number(e.target.value))}
                themeMode="dark"
                required
              />
            ) : <div className="hidden" />}

            {/* Show yearly input if yearly or both */}
            {(pBillingCycle === 'yearly' || pBillingCycle === 'both') ? (
              <Input 
                label="Precio Total al Año ($ CUP)"
                type="number"
                min="0"
                value={pPriceYearly}
                onChange={(e) => setPPriceYearly(Number(e.target.value))}
                themeMode="dark"
                required
              />
            ) : <div className="hidden" />}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input 
              label="Comisión plataforma (%)"
              type="number"
              min="0"
              max="100"
              value={pCommission}
              onChange={(e) => setPCommission(Number(e.target.value))}
              themeMode="dark"
              required
            />

            <Input 
              label="Límite descargas/beats (O 999 para ilimitados)"
              type="number"
              min="1"
              value={pLimit}
              onChange={(e) => setPLimit(Number(e.target.value))}
              themeMode="dark"
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold uppercase text-gray-455 tracking-wider block">Servicio de Soporte</label>
            <select
              value={pSupport}
              onChange={(e) => setPSupport(e.target.value as any)}
              className="w-full px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD]"
            >
              <option value="Sin Soporte">Sin Soporte</option>
              <option value="Soporte Estándar">Soporte Estándar</option>
              <option value="Soporte Prioritario">Soporte Prioritario</option>
              <option value="Soporte Prioritario 24/7">Soporte Prioritario 24/7</option>
            </select>
          </div>

          {/* Payment Methods Checkbox Allowances */}
          <div className="space-y-1.5 p-3.5 bg-[#1C1C2E]/40 rounded-xl border border-brand-border/20 text-left">
            <label className="text-[11px] font-bold uppercase text-gray-450 tracking-wider block">Canales de Pago Habilitados para Adquirir este Plan</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-gray-300">
                <input
                  type="checkbox"
                  checked={allowTransfermovil}
                  onChange={(e) => setAllowTransfermovil(e.target.checked)}
                  className="rounded text-[#534AB7] focus:ring-[#7F77DD] w-4 h-4"
                />
                Transfermóvil CUP/MLC
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-gray-300">
                <input
                  type="checkbox"
                  checked={allowQvapay}
                  onChange={(e) => setAllowQvapay(e.target.checked)}
                  className="rounded text-[#534AB7] focus:ring-[#7F77DD] w-4 h-4"
                />
                QvaPay Checkout
              </label>
            </div>
          </div>

          {/* Dynamic Benefits Bullet Builder */}
          <div className="space-y-2 text-left">
            <label className="text-[11px] font-bold uppercase text-gray-450 tracking-wider block">Beneficios / Atributos del Plan (Por Puntos)</label>
            
            {/* Array Items display */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border border-brand-border/40 rounded-xl bg-[#1C1C2E]/40">
              {benefitsList.length === 0 ? (
                <span className="text-[10px] text-gray-500 italic m-auto">No hay beneficios cargados. Agrega uno abajo.</span>
              ) : (
                benefitsList.map((benefit, idx) => (
                  <span 
                    key={idx}
                    className="flex items-center gap-1 text-[10px] font-semibold bg-[#534AB7]/25 text-[#8D84F7] border border-[#534AB7]/30 rounded-lg px-2 py-0.5"
                  >
                    <span>{idx + 1}. {benefit}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveBenefit(idx)}
                      className="text-gray-400 hover:text-white cursor-pointer bg-transparent border-none p-0 flex items-center justify-center leading-none"
                    >
                      <X size={10} className="stroke-[3]" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add bullet inline control */}
            <div className="flex gap-1.5">
              <Input 
                placeholder="Ej. Descargas ilimitadas o Acceso VIP..."
                value={newBenefitInput}
                onChange={(e) => setNewBenefitInput(e.target.value)}
                themeMode="dark"
                className="flex-grow"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-3 bg-[#534AB7] text-white rounded-xl hover:bg-[#534AB7]/90 transition-colors flex items-center justify-center h-[38px] mt-0.5 shadow-sm text-xs font-bold gap-1 cursor-pointer"
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>
          </div>

          {/* Regular Featured Boolean Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-gray-300 p-1 text-left">
            <input 
              type="checkbox"
              checked={pFeatured}
              onChange={(e) => setPFeatured(e.target.checked)}
              className="rounded text-[#534AB7] focus:ring-[#7F77DD] w-4 h-4"
            />
            Destacar este plan en la portada (Badge de recomendación)
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-border/20">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsPlanModalOpen(false)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingPlan ? 'Aplicar Modificaciones' : 'Crear de Forma Activa'}
            </Button>
          </div>

        </form>
      </Modal>

      {/* --- MODAL FOR ADMIN PAYMENT ROUTE (ADD) --- */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Asociar Cuenta de Recaudo de Membresías"
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddPaySubmit} className="space-y-4 pt-2 text-white">
          
          {/* Selected billing type */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Tipo de Canal de Cobro</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayType('transfermovil')}
                className={`py-2.5 px-3 border rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  payType === 'transfermovil'
                    ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                    : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                }`}
              >
                <Landmark size={15} />
                Transfermóvil CUP/MLC
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
                QvaPay Checkout
              </button>
            </div>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO TYPE */}
          {payType === 'transfermovil' ? (
            <div className="space-y-3.5 animate-in fade-in duration-150 text-left">
              <Input
                label="Número de Cuenta / Tarjeta Administrador BCC/BPA (16 dígitos)"
                placeholder="9224 5501 ...."
                value={tmCardNumber}
                onChange={(e) => setTmCardNumber(e.target.value)}
                themeMode="dark"
                required
              />

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-505 tracking-wider">Tipo de Moneda</label>
                  <select
                    value={tmCurrency}
                    onChange={(e) => setTmCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD]"
                  >
                    <option value="CUP">CUP (Pesos Cubanos)</option>
                    <option value="MLC">MLC (Moneda Libre Conv.)</option>
                    <option value="Clasica">Clásica (Internacional)</option>
                  </select>
                </div>

                <Input
                  label="Teléfono Móvil de Recepción SMS"
                  placeholder="+53 52930211"
                  value={tmPhone}
                  onChange={(e) => setTmPhone(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>

              {/* QR Upload Section */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block">Código QR de Cobro Escor (URL o Archivo)</label>
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
                      id="adm-tm-qr-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setTmQrUrl)}
                    />
                    <label
                      htmlFor="adm-tm-qr-picker"
                      className="px-3 bg-[#534AB7]/20 text-[#7F77DD] border border-[#534AB7]/30 hover:bg-brand-card rounded-xl flex items-center justify-center cursor-pointer h-[38px] mt-0.5 shadow-sm"
                    >
                      <Camera size={14} />
                    </label>
                  </div>
                </div>
                {tmQrUrl && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Captura cargada:</span>
                    <img src={tmQrUrl} alt="TM Admin QR preview" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded border border-brand-border/30" />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-3.5 animate-in fade-in duration-150 text-left">
              <Input
                label="Dirección de correo electrónico QvaPay"
                placeholder="ej. admin.pagos@cubabeats.com"
                type="email"
                value={qpEmail}
                onChange={(e) => setQpEmail(e.target.value)}
                themeMode="dark"
                required
              />

              <Input
                label="Usuario de la Cuenta QvaPay (Sin @)"
                placeholder="ej. admin_cubabeats"
                value={qpUser}
                onChange={(e) => setQpUser(e.target.value)}
                themeMode="dark"
                required
              />

              {/* QR Upload Section for QvaPay */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block">Código QR QvaPay (Opcional)</label>
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
                      id="adm-qp-qr-picker"
                      className="hidden"
                      onChange={(e) => handleLocalFileSelect(e, setQpQrUrl)}
                    />
                    <label
                      htmlFor="adm-qp-qr-picker"
                      className="px-3 bg-[#534AB7]/20 text-[#7F77DD] border border-[#534AB7]/30 hover:bg-brand-card rounded-xl flex items-center justify-center cursor-pointer h-[38px] mt-0.5 shadow-sm"
                    >
                      <Camera size={14} />
                    </label>
                  </div>
                </div>
                {qpQrUrl && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Captura cargada:</span>
                    <img src={qpQrUrl} alt="QP Admin QR preview" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded border border-brand-border/30" />
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
