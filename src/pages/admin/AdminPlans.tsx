import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Radio, Settings, Sparkles, Check, RefreshCw, Plus, Trash2, 
  Edit, Info, X, ShieldCheck, AlertCircle, Landmark, Wallet
} from 'lucide-react';
import { Plan } from '../../types';

export const AdminPlans: React.FC = () => {
  const { plans, updatePlans, addToast, convertPrice } = useApp();

  // Load local state variables for plans
  const [plansList, setPlansList] = useState<Plan[]>(plans);

  // Sync state if global plans change
  useEffect(() => {
    setPlansList(plans);
  }, [plans]);

  // --- PLAN FORM MODAL STATES ---
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pPriceYearly, setPPriceYearly] = useState(0);
  const [pBillingCycle, setPBillingCycle] = useState<'monthly' | 'yearly' | 'both'>('monthly');
  const [pLimit, setPLimit] = useState(10);
  const [pCommission, setPCommission] = useState(0);
  const [pMaxSoundLibrarySize, setPMaxSoundLibrarySize] = useState<number>(5);
  const [pSupport, setPSupport] = useState<string>('Soporte Estándar');
  const [pFeatured, setPFeatured] = useState(false);
  
  // New comparative restrictions states
  const [pLimitLibrariesCount, setPLimitLibrariesCount] = useState<number>(0);
  const [pMaxLibrarySizeEach, setPMaxLibrarySizeEach] = useState<number>(0);
  const [pDirectMessaging, setPDirectMessaging] = useState<string>('blocked');
  const [pAnalyticsAccess, setPAnalyticsAccess] = useState<boolean>(false);
  const [pBadgeType, setPBadgeType] = useState<string>('none');
  const [pOnPlanExpiryAction, setPOnPlanExpiryAction] = useState<string>('Bloqueo total de venta hasta actualizar de plan');
  const [pStemsAllowed, setPStemsAllowed] = useState<boolean>(false);
  const [pAllowedFormats, setPAllowedFormats] = useState<string>('MP3');
  
  // Benefits point list builder
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Payment methods limit checkbox targets
  const [allowTransfermovil, setAllowTransfermovil] = useState(true);
  const [allowQvapay, setAllowQvapay] = useState(true);

  // --- HANDLERS FOR PLANS ---
  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setPName('');
    setPPrice(0);
    setPPriceYearly(0);
    setPBillingCycle('monthly');
    setPLimit(10);
    setPCommission(0);
    setPMaxSoundLibrarySize(5);
    setPSupport('Soporte Estándar');
    setPFeatured(false);
    setBenefitsList(['Acceso completo', 'Soporte técnico']);
    setNewBenefitInput('');
    setAllowTransfermovil(true);
    setAllowQvapay(true);
    
    // reset new states
    setPLimitLibrariesCount(0);
    setPMaxLibrarySizeEach(0);
    setPDirectMessaging('blocked');
    setPAnalyticsAccess(false);
    setPBadgeType('none');
    setPOnPlanExpiryAction('Bloqueo total de venta hasta actualizar de plan');
    setPStemsAllowed(false);
    setPAllowedFormats('MP3');

    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPName(plan.name);
    setPPrice(plan.price);
    setPPriceYearly(plan.priceYearly || plan.price * 10); // fallback default
    setPBillingCycle(plan.billingCycleType || 'monthly');
    setPLimit(plan.limit);
    setPCommission(0);
    setPMaxSoundLibrarySize(plan.maxSoundLibrarySize || 1000);
    setPSupport(plan.support);
    setPFeatured(plan.featured || false);
    setBenefitsList(plan.benefits || []);
    setNewBenefitInput('');
    
    // Set payment checkboxes
    const allowed = plan.allowedPaymentMethods || ['transfermovil', 'qvapay'];
    setAllowTransfermovil(allowed.includes('transfermovil'));
    setAllowQvapay(allowed.includes('qvapay'));

    // load new states
    setPLimitLibrariesCount(plan.limitLibrariesCount || 0);
    setPMaxLibrarySizeEach(plan.maxLibrarySizeEach || 0);
    setPDirectMessaging(plan.directMessaging || 'blocked');
    setPAnalyticsAccess(plan.analyticsAccess || false);
    setPBadgeType(plan.badgeType || 'none');
    setPOnPlanExpiryAction(plan.onPlanExpiryAction || 'Bloqueo total de venta hasta actualizar de plan');
    setPStemsAllowed(plan.stemsAllowed ?? false);
    setPAllowedFormats(plan.allowedFormats || 'MP3');

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

    const isFreePlan = pName.toLowerCase() === 'gratis' || pPrice === 0;

    const updatedPlan: Plan = {
      id: editingPlan ? editingPlan.id : `plan_${Date.now()}`,
      name: pName,
      price: pPrice,
      priceYearly: pPriceYearly,
      billingCycleType: pBillingCycle,
      limit: pLimit,
      commission: 0,
      support: pSupport,
      featured: pFeatured,
      benefits: benefitsList,
      allowedPaymentMethods: payloadMethods,
      maxSoundLibrarySize: isFreePlan ? undefined : pMaxSoundLibrarySize,
      limitLibrariesCount: pLimitLibrariesCount,
      maxLibrarySizeEach: pMaxLibrarySizeEach,
      directMessaging: pDirectMessaging,
      analyticsAccess: pAnalyticsAccess,
      badgeType: pBadgeType,
      onPlanExpiryAction: pOnPlanExpiryAction,
      stemsAllowed: pStemsAllowed,
      allowedFormats: pAllowedFormats
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

  const handleToggleFeatured = (planId: string, currentFeatured: boolean) => {
    const nextPlans = plansList.map(p => p.id === planId ? { ...p, featured: !currentFeatured } : p);
    setPlansList(nextPlans);
    updatePlans(nextPlans);
    addToast(
      `Plan "${plansList.find(p => p.id === planId)?.name}" ${!currentFeatured ? 'marcado como Destacado (ahora con borde resaltado)' : 'desmarcado de Destacado'}`,
      'success'
    );
  };

  return (
    <div className="space-y-12 text-left animate-in fade-in duration-300">
      
      {/* SECTION I: MEMBERSHIP PLAN CONFIGURATION */}
      <div className="space-y-6">
        
        {/* Decorative dashboard hero message */}
        <div className="bg-gradient-[#13131F] bg-opacity-65 border border-white/5 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7F77DD] opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="space-y-1 z-10 max-w-2xl text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#534AB7]/20 border border-[#534AB7]/30 text-[#8D84F7] text-[10px] font-bold uppercase tracking-wider">
                Consola General de Membresías
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-gray-500">Sincronizado con Base de Datos</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Radio className="text-[#8D84F7]" size={22} /> Configurar Planes & Membresías
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Define los costos mensuales y anuales que abonan los productores en Cuba. Configura de forma ávida los límites máximos de beats activos en catálogo, limites de tamaño para librerías de sonido, y beneficios exclusivos.
            </p>
          </div>

          <div className="z-10 flex-shrink-0 self-start md:self-center">
            <Button 
              variant="primary" 
              onClick={handleOpenAddPlan} 
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-[#8D84F7] text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-primary/15 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus size={16} />
              Agregar Nuevo Plan
            </Button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plansList.map((plan) => {
            const isFeatured = plan.featured;
            return (
              <div 
                key={plan.id}
                className={`flex flex-col justify-between rounded-2xl transition-all duration-300 relative group overflow-hidden border ${
                  isFeatured 
                    ? 'bg-gradient-to-b from-[#18182E] to-[#121220] border-2 border-[#7F77DD] shadow-xl shadow-[#7F77DD]/25' 
                    : 'bg-[#121220] border border-white/5 hover:border-white/10 shadow-md'
                }`}
              >
                {/* Glowing top neon line decoration for featured plans */}
                {isFeatured && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-[#7F77DD] to-purple-500" />
                )}

                <div className="p-6 space-y-5">
                  {/* Interactive Destacado toggle checkbox */}
                  <div className="flex items-center gap-2.5 bg-[#0C0C14]/65 p-2.5 rounded-xl border border-white/5 hover:border-[#7F77DD]/35 transition-all select-none">
                    <input 
                      type="checkbox" 
                      id={`chk-feat-${plan.id}`}
                      checked={isFeatured || false}
                      onChange={() => handleToggleFeatured(plan.id, isFeatured || false)}
                      className="w-4 h-4 rounded text-[#7F77DD] bg-[#16162a] border-white/15 focus:ring-[#7F77DD] focus:ring-offset-0 cursor-pointer accent-[#7F77DD]"
                    />
                    <label 
                      htmlFor={`chk-feat-${plan.id}`}
                      className="text-xs font-bold text-gray-300 hover:text-white cursor-pointer flex items-center gap-1.5 w-full"
                    >
                      {isFeatured ? (
                        <>
                          <Sparkles size={11} className="text-yellow-300 animate-pulse" />
                          <span className="text-white font-extrabold text-[11px] tracking-wide">Fijado como Plan Destacado</span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Fijar como Plan Destacado</span>
                      )}
                    </label>
                  </div>

                  {/* Top Header Card Info */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Productor Plan</span>
                      <h3 className="text-lg font-black text-white group-hover:text-brand-primary-light transition-colors">{plan.name}</h3>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button 
                        onClick={() => handleOpenEditPlan(plan)}
                        className="p-2 text-gray-400 hover:text-[#8D84F7] hover:bg-white/5 rounded-xl border border-white/5 hover:border-[#7F77DD]/35 transition-all cursor-pointer"
                        title="Modificar propiedades del Plan"
                      >
                        <Edit size={13} />
                      </button>

                      <button 
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
                        title="Eliminar este plan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Values Display Block */}
                  <div className="bg-[#0A0A12]/80 rounded-xl p-3 border border-white/5 flex flex-col justify-center gap-2">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-extrabold block">Costos de Membresía</span>
                    <div className="grid grid-cols-2 gap-2 divide-x divide-white/5">
                      {/* Monthly billing rate info */}
                      {(!plan.billingCycleType || plan.billingCycleType === 'monthly' || plan.billingCycleType === 'both') ? (
                        <div className="text-left pl-1">
                          <span className="text-[9px] text-gray-400 block font-medium">Bajo Fact. Mensual</span>
                          <span className="font-mono text-base font-black text-white block">
                            {convertPrice(plan.price).formatted}
                          </span>
                        </div>
                      ) : (
                        <div className="text-left pl-1 opacity-25">
                          <span className="text-[9px] text-gray-500 block font-medium">Fact. Mensual</span>
                          <span className="text-xs font-mono text-gray-400 block italic">N/D</span>
                        </div>
                      )}

                      {/* Yearly billing rate info */}
                      {(plan.billingCycleType === 'yearly' || plan.billingCycleType === 'both') ? (
                        <div className="text-left pl-3">
                          <span className="text-[9px] text-emerald-400 block font-semibold">Bajo Fact. Anual</span>
                          <span className="font-mono text-base font-black text-emerald-400 block">
                            {convertPrice(plan.priceYearly || plan.price * 10).formatted}
                          </span>
                        </div>
                      ) : (
                        <div className="text-left pl-3 opacity-25">
                          <span className="text-[9px] text-gray-500 block font-medium font-sans">Fact. Anual</span>
                          <span className="text-xs font-mono text-gray-400 block italic">N/D</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Properties table parameters bento layout */}
                  <div className="space-y-2 text-xs text-gray-300 bg-[#1C1C2E]/30 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Insignia de Perfil:</span>
                      <strong className="text-[#8D84F7] font-semibold text-[11px]">
                        {plan.badgeType && plan.badgeType !== 'Ninguno' ? `Badge "${plan.badgeType}"` : 'Ninguna'}
                      </strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Límite Beats Publicados:</span>
                      <strong className="text-white text-[11px]">{plan.limit} beats</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Acción al Vencer Vigencia:</span>
                      <strong className="text-amber-400 text-[10px] text-right max-w-[130px] leading-tight font-medium" title={plan.onPlanExpiryAction || 'Bloqueo total'}>
                        {plan.onPlanExpiryAction || 'Bloqueo de venta'}
                      </strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Librerías de Sonido:</span>
                      <strong className="text-emerald-400 text-[11px]">
                        {plan.limitLibrariesCount && plan.limitLibrariesCount > 0 
                          ? `${plan.limitLibrariesCount} (${plan.maxLibrarySizeEach} MB c/u)`
                          : '❌ No puede subir'}
                      </strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Mensajería Directa:</span>
                      <strong className="text-white text-[11px]">{plan.directMessaging || '❌ Bloqueada'}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Soporte de Stems:</span>
                      <strong className="text-white text-[11px]">{plan.stemsAllowed ? '✅ Permitido (Sí)' : '❌ No permitido'}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Formatos Permitidos:</span>
                      <strong className="text-emerald-400 font-mono text-[11px]">{plan.allowedFormats || 'MP3'}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-white/5">
                      <span className="text-white/50 text-[11px]">Analytics / Estadísticas:</span>
                      <strong className="text-white text-[11px]">{plan.analyticsAccess ? '✅ Acceso Completo' : '❌ Sin Acceso'}</strong>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-white/50 text-[11px]">Soporte Técnico:</span>
                      <strong className="text-[#8D84F7] text-[11px] truncate max-w-[124px] font-semibold">{plan.support}</strong>
                    </div>
                  </div>

                  {/* Sub-section for payment channels permitted */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-black block">Cobranza Autorizada Por:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(!plan.allowedPaymentMethods || plan.allowedPaymentMethods.includes('transfermovil')) && (
                        <span className="text-[10px] select-none font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-md flex items-center gap-1">
                          <Landmark size={11} /> Transfermóvil
                        </span>
                      )}
                      {(!plan.allowedPaymentMethods || plan.allowedPaymentMethods.includes('qvapay')) && (
                        <span className="text-[10px] select-none font-bold px-2 py-0.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/15 rounded-md flex items-center gap-1">
                          <Wallet size={11} /> QvaPay
                        </span>
                      )}
                      {plan.allowedPaymentMethods && plan.allowedPaymentMethods.length === 0 && (
                        <span className="text-[10px] text-red-400 italic font-semibold py-0.5 flex items-center gap-1.5">
                          <AlertCircle size={11} /> Requiere fijar canal adm.
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer system details info bar */}
                <div className="bg-[#0B0B13] px-6 py-3 border-t border-white/5 text-[9px] text-gray-500 flex justify-between items-center">
                  <span>Código UUID Plan</span>
                  <span className="font-mono text-gray-400 select-all">{plan.id}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL FOR PLANS (ADD / EDIT) --- */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? `Editar Plan de Membresía` : `Crear Nuevo Plan de Membresía`}
        themeMode="dark"
        maxWidth="max-w-5xl"
      >
        <form onSubmit={handlePlanFormSubmit} className="space-y-6 pt-2 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Identity & Billing */}
            <div className="space-y-5 pr-1">
              <h3 className="text-xs font-bold uppercase text-[#8D84F7] tracking-wider border-b border-white/10 pb-2 flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD]"></span>
                Identidad y Facturación
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Nombre del Plan"
                  placeholder="Ej. Gratis, Pro, Elite"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  themeMode="dark"
                  required
                />

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Insignia de Perfil</label>
                  <select
                    value={pBadgeType}
                    onChange={(e) => setPBadgeType(e.target.value)}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Pro">Badge "Pro"</option>
                    <option value="Elite">Badge "Elite"</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold uppercase text-gray-405 tracking-wider block">Ciclo de Facturación Admitido</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPBillingCycle('monthly')}
                    className={`py-2 px-1 border rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
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
                    className={`py-2 px-1 border rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
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
                    className={`py-2 px-1 border rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                      pBillingCycle === 'both'
                        ? 'border-[#7F77DD] bg-[#534AB7]/20 text-[#8D84F7]'
                        : 'border-brand-border/30 bg-[#1C1C2E] text-gray-400 hover:bg-brand-card'
                    }`}
                  >
                    Ambos Ciclos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Show monthly input if monthly or both */}
                {(pBillingCycle === 'monthly' || pBillingCycle === 'both') ? (
                  <Input 
                    label="Precio por Mes ($)"
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
                    label="Precio al Año ($)"
                    type="number"
                    min="0"
                    value={pPriceYearly}
                    onChange={(e) => setPPriceYearly(Number(e.target.value))}
                    themeMode="dark"
                    required
                  />
                ) : <div className="hidden" />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Límite Beats Publicados"
                  type="number"
                  min="1"
                  value={pLimit}
                  onChange={(e) => setPLimit(Number(e.target.value))}
                  themeMode="dark"
                  required
                />

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Comisión sobre ventas (%)</label>
                  <input
                    type="number"
                    value={0}
                    disabled
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/20 bg-[#1C1C2E]/50 text-gray-500 text-xs rounded-xl cursor-not-allowed"
                  />
                  <span className="text-[9px] text-emerald-400 block font-medium mt-0.5">0% de comisión garantizada</span>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <Input 
                  label="Acción al Vencer la Vigencia del Plan"
                  placeholder="Ej. Bloqueo total de venta hasta renovar o actualizar de plan"
                  value={pOnPlanExpiryAction}
                  onChange={(e) => setPOnPlanExpiryAction(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>

              {/* Payment Methods Checkbox Allowances */}
              <div className="space-y-2 p-4 bg-[#1C1C2E]/40 rounded-xl border border-brand-border/25 text-left">
                <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Canales de Pago Habilitados</label>
                <div className="flex gap-6 mt-1.5">
                  <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none text-gray-300">
                    <input
                      type="checkbox"
                      checked={allowTransfermovil}
                      onChange={(e) => setAllowTransfermovil(e.target.checked)}
                      className="rounded text-[#534AB7] focus:ring-[#7F77DD] w-4.5 h-4.5 bg-[#1C1C2E] border-brand-border/40"
                    />
                    Transfermóvil
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none text-gray-300">
                    <input
                      type="checkbox"
                      checked={allowQvapay}
                      onChange={(e) => setAllowQvapay(e.target.checked)}
                      className="rounded text-[#534AB7] focus:ring-[#7F77DD] w-4.5 h-4.5 bg-[#1C1C2E] border-brand-border/40"
                    />
                    QvaPay
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Limits & Advanced Settings */}
            <div className="space-y-5 pl-1">
              <h3 className="text-xs font-bold uppercase text-[#8D84F7] tracking-wider border-b border-white/10 pb-2 flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD]"></span>
                Restricciones y Entrega
              </h3>

              {/* Stems & Allowed Formats row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">¿Permitir Stems (Tracks)?</label>
                  <select
                    value={pStemsAllowed ? 'true' : 'false'}
                    onChange={(e) => setPStemsAllowed(e.target.value === 'true')}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="false">❌ No permitido</option>
                    <option value="true">✅ Permitido (Sí)</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Formatos Permitidos</label>
                  <select
                    value={pAllowedFormats}
                    onChange={(e) => setPAllowedFormats(e.target.value)}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="MP3">MP3</option>
                    <option value="WAV">WAV</option>
                    <option value="WAV + MP3">WAV + MP3</option>
                    <option value="Todos (WAV, MP3, Stems)">Todos (WAV, MP3, Stems)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Librerías Permitidas (Cant.)"
                  type="number"
                  min="0"
                  value={pLimitLibrariesCount}
                  onChange={(e) => setPLimitLibrariesCount(Number(e.target.value))}
                  themeMode="dark"
                  required
                />

                <Input 
                  label="Tamaño máx de c/u (MB)"
                  type="number"
                  min="0"
                  value={pMaxLibrarySizeEach}
                  onChange={(e) => setPMaxLibrarySizeEach(Number(e.target.value))}
                  themeMode="dark"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Mensajería Directa</label>
                  <select
                    value={pDirectMessaging}
                    onChange={(e) => setPDirectMessaging(e.target.value)}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="❌ Bloqueada">❌ Bloqueada</option>
                    <option value="✅ Ilimitada">✅ Ilimitada</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Estadísticas / Analytics</label>
                  <select
                    value={pAnalyticsAccess ? 'true' : 'false'}
                    onChange={(e) => setPAnalyticsAccess(e.target.value === 'true')}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="false">❌ Sin acceso</option>
                    <option value="true">✅ Acceso completo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Destacado en Landing Page</label>
                  <select
                    value={pFeatured ? 'true' : 'false'}
                    onChange={(e) => setPFeatured(e.target.value === 'true')}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="false">❌ No destacado</option>
                    <option value="true">⭐ Destacado (Sí)</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">Servicio de Soporte</label>
                  <select
                    value={pSupport}
                    onChange={(e) => setPSupport(e.target.value)}
                    className="w-full h-[38px] px-3 py-2 border border-brand-border/40 bg-[#1C1C2E] text-white text-xs rounded-xl outline-none focus:border-[#7F77DD] transition-all"
                  >
                    <option value="Soporte Estándar">Soporte Estándar</option>
                    <option value="Soporte Prioritario">Soporte Prioritario</option>
                    <option value="Soporte 24/7">Soporte 24/7</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#534AB7]/5 border border-[#534AB7]/10 rounded-xl space-y-2 mt-4 text-left">
                <h4 className="text-[11px] font-bold uppercase text-[#8D84F7] tracking-wider">Acerca del Plan de Membresía</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Las restricciones y accesos configurados arriba se aplicarán automáticamente a los productores suscritos a este plan de manera inmediata.
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-border/20">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsPlanModalOpen(false)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingPlan ? 'Guardar Cambios' : 'Crear Plan de Membresía'}
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
