import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Radio, Check, Sparkles, CreditCard, Landmark, 
  HelpCircle, AlertCircle, ArrowUpRight, ArrowLeftRight
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

export const ProducerPlans: React.FC = () => {
  const { user, updateUserProfile, plans, beats, addToast, addAdminNotification, convertPrice } = useApp();
  
  // Modal states for subscribing
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<Plan | null>(null);
  
  // Payment simulation form
  const [paymentType, setPaymentType] = useState<'transfermovil' | 'qvapay'>('transfermovil');
  const [senderCardNum, setSenderCardNum] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fallback / Admin configured payment methods
  const adminMethods: AdminPaymentMethod[] = (() => {
    const cached = localStorage.getItem('cb_admin_payment_methods');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
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
        qvapayEmail: 'cobros.admin@dcubanbeats.com',
        qvapayUser: 'admin_dcubanbeats',
        qrQvapayScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true
      }
    ];
  })();

  const activeMethods = adminMethods.filter(m => m.active);

  // Stats computation
  const myBeatsCount = beats.filter(b => b.producerId === user?.id).length;
  const currentPlanName = user?.plan || 'Gratis';
  const currentPlan = plans.find(p => p.name.toLowerCase() === currentPlanName.toLowerCase()) || plans[0];

  // List of plans that the user is NOT currently subscribed to
  const alternativePlans = plans.filter(p => p.name.toLowerCase() !== currentPlanName.toLowerCase());

  const handleOpenPlanModal = (planToSub: Plan) => {
    setSelectedPlanToBuy(planToSub);
    setFormErrors({});
    setIsSubscribeModalOpen(true);
    // Auto toggle tab to first active method
    const firstActive = activeMethods[0];
    if (firstActive) {
      setPaymentType(firstActive.type);
    }
  };

  const handleConfirmPlanChange = (targetPlan: Plan) => {
    // If selecting a free plan, change immediately without payment prompt
    if (targetPlan.price === 0) {
      updateUserProfile({ plan: targetPlan.name as 'Gratis' | 'Pro' | 'Elite' });
      addToast(`Tu cuenta se ha rebajado al plan ${targetPlan.name} correctamente.`, 'info');
      
      addAdminNotification(
        'plan_purchased',
        'Membresía Modificada (Downgrade)',
        `El productor "${user?.artistName || user?.name}" cambió su membresía al plan Gratis.`
      );
      
      setIsSubscribeModalOpen(false);
      return;
    }

    // Validation
    const errors: Record<string, string> = {};
    if (paymentType === 'transfermovil') {
      if (!senderCardNum.trim()) {
        errors.senderCardNum = 'La tarjeta emisora es obligatoria';
      }
    }
    if (!transactionId.trim()) {
      errors.transactionId = 'El número o ID de transacción es obligatorio';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Por favor completa los campos requeridos para simular la transferencia.', 'error');
      return;
    }

    // Update locally in context
    updateUserProfile({ plan: targetPlan.name as 'Gratis' | 'Pro' | 'Elite' });
    addToast(`¡Membresía ${targetPlan.name} adquirida con éxito! Ya puedes disfrutar de tus nuevos beneficios.`, 'success');

    // Notify administrators
    addAdminNotification(
      'plan_purchased',
      'Nueva Membresía Adquirida',
      `El productor "${user?.artistName || user?.name}" pagó y se suscribió al plan ${targetPlan.name} ($${targetPlan.price} CUP/mes). Referencia: ${transactionId}. Canal: ${paymentType.toUpperCase()}.`
    );

    setIsSubscribeModalOpen(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* 2. Left side: Current Active Plan Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7F77DD] opacity-5 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest block">Suscripción Activa</span>
              <Badge variant={currentPlan.price === 0 ? "orange" : "purple"}>Vigente</Badge>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-white font-sans">{currentPlan?.name}</h2>
              <span className="text-sm font-semibold text-[#7F77DD] block">
                {currentPlan?.price === 0 ? 'Gratuito de por vida' : `${convertPrice(currentPlan?.price || 0).formatted} / mes`}
              </span>
            </div>

            <div className="border-t border-white/5 my-5 pt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/50">Límite de Beats Cargados:</span>
                  <span className="font-bold text-white">
                    {myBeatsCount} / {currentPlan?.limit === 999 ? 'Ilimitados' : currentPlan?.limit}
                  </span>
                </div>
                {currentPlan?.limit !== 999 && (
                  <div className="w-full bg-[#1C1C2E] h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-primary-light rounded-full"
                      style={{ width: `${Math.min(100, (myBeatsCount / currentPlan?.limit) * 100)}%` }}
                    />
                  </div>
                )}
                {myBeatsCount >= (currentPlan?.limit || 0) && currentPlan?.limit !== 999 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 mt-2 font-medium">
                    <AlertCircle size={12} />
                    <span>Has alcanzado el límite de beats para tu plan actual. Mejora tu plan para continuar publicando.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Comisión por beat vendido:</span>
                <span className="font-semibold text-emerald-400">
                  0% <span className="text-[10px] text-white/40">(Sin comisiones)</span>
                </span>
              </div>

              {currentPlan?.maxSoundLibrarySize !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Capacidad para Librerías de Sonidos:</span>
                  <span className="font-mono font-bold text-[#7F77DD]">
                    {currentPlan.maxSoundLibrarySize} GB
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Soporte técnico integrado:</span>
                <span className="font-bold text-white text-right">
                  {currentPlan?.support || 'Sin soporte prioritario'}
                </span>
              </div>
            </div>

            <div className="bg-[#0C0C14] mt-4 p-4 rounded-xl space-y-2 border border-white/5">
              <span className="text-[10px] font-bold text-white/40 block tracking-wider uppercase">Beneficios Actuales</span>
              <ul className="text-xs space-y-1.5 text-white/70">
                {currentPlan?.benefits?.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-[#0D0D14] border border-white/5 rounded-xl flex items-start gap-3">
            <HelpCircle size={18} className="text-[#7F77DD] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">¿Cómo funcionan los pagos?</h4>
              <p className="text-[10.5px] text-white/40 leading-relaxed">
                Nuestros administradores de D'Cuban Beats verifican las suscripciones en base a la referencia o SMS de Transfermóvil/QvaPay enviado. Podrás actualizar inmediatamente cargando tu número comprobante.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Right side: Change to Alternate Plans list */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#13131F]/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1 tracking-tight flex items-center gap-2">
              <ArrowLeftRight size={16} className="text-[#7F77DD]" />
              Cambiar a otro plan de membresía
            </h3>
            <p className="text-xs text-white/40 mb-6">
              Selecciona uno de los siguientes planes para expandir tus límites de producción en D'Cuban Beats.
            </p>

            <div className="space-y-4">
              {alternativePlans.map((pl) => (
                <div 
                  key={pl.id}
                  className="bg-[#13131F] border border-white/5 p-5 rounded-2xl hover:border-brand-primary/40 transition-all relative group"
                >
                  <div className="space-y-3 text-left w-full font-sans">
                    {/* Header: Title on the left, Price & Featured badge on the right at the same height */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <h4 className="text-lg font-bold text-white group-hover:text-brand-primary-light transition-colors">
                        {pl.name}
                      </h4>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-extrabold text-brand-primary-light">
                          {pl.price === 0 ? 'Gratis' : `${convertPrice(pl.price).formatted} / mes`}
                        </span>
                        {pl.featured && (
                          <Badge variant="purple" className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] tracking-wide font-black">
                            <Sparkles size={11} className="text-yellow-300" /> RECOMENDADO
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 pt-1">
                      <div className="flex-grow space-y-2">
                        <p className="text-xs text-white/50 leading-relaxed">
                          {pl.price === 0 ? (
                            `Ideal para comenzar de forma gratuita, subiendo hasta ${pl.limit} beats sin comisión alguna en tus ventas.`
                          ) : (
                            `Sube hasta ${pl.limit === 999 ? 'beats ilimitados' : `${pl.limit} beats`} y obtén hasta ${pl.maxSoundLibrarySize || 5} GB de capacidad de almacenamiento para subir tus librerías de sonido, con 0% comisiones.`
                          )}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
                          {pl.benefits?.slice(0, 3).map((ben, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-white/70">
                              <Check size={11} className="text-brand-primary-light flex-shrink-0" />
                              <span>{ben}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-stretch md:items-end justify-center gap-2 w-full md:w-auto">
                        <Button 
                          onClick={() => handleOpenPlanModal(pl)}
                          variant={pl.featured ? "primary" : "secondary"}
                          size="sm"
                          className="whitespace-nowrap flex items-center justify-center gap-1 cursor-pointer font-extrabold text-xs"
                        >
                          {pl.price === 0 ? 'Hacer Gratis' : 'Suscribirse Ahora'}
                          <ArrowUpRight size={14} />
                        </Button>
                        <span className="text-[10.5px] text-white/30 text-center md:text-right font-mono">
                          {pl.price === 0 ? 'Bajar membresía' : 'Activación simulación SMS'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. SUBSCRIPTION PAYMENT & SIMULATION MODAL */}
      <Modal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        title={`Adquirir Membresía: Plan ${selectedPlanToBuy?.name}`}
      >
        {selectedPlanToBuy && (
          <div className="space-y-5 text-left py-1">
            
            {/* Header info */}
            <div className="p-4 bg-[#0D0D14] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Plan Elegido</span>
                <span className="text-base font-extrabold text-[#7F77DD]">{selectedPlanToBuy.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Costo Mensual</span>
                <span className="text-sm font-mono font-bold text-[#E5E5E5]">
                  {selectedPlanToBuy.price === 0 ? 'Gratis' : `${convertPrice(selectedPlanToBuy.price).formatted} / mes`}
                </span>
              </div>
            </div>

            {/* If plan is free, describe downgrade implications */}
            {selectedPlanToBuy.price === 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs leading-relaxed flex gap-3">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <span className="font-bold block text-white mb-1">¡Aviso de Downgrade!</span>
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
            ) : (
              <div className="space-y-4">
                
                {/* Method selector tabs */}
                <span className="text-xs font-bold text-white/50 block tracking-wider uppercase">Selecciona Canal de Pago</span>
                <div className="grid grid-cols-2 gap-2 bg-[#0C0C14] p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => { setPaymentType('transfermovil'); setFormErrors({}); }}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentType === 'transfermovil' 
                        ? 'bg-[#1C1C2E] text-white border border-white/10' 
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Landmark size={14} />
                    Transfermóvil
                  </button>
                  <button
                    onClick={() => { setPaymentType('qvapay'); setFormErrors({}); }}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentType === 'qvapay' 
                        ? 'bg-[#1C1C2E] text-white border border-white/10' 
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <CreditCard size={14} />
                    QvaPay
                  </button>
                </div>

                {/* Method credentials instruction block */}
                {paymentType === 'transfermovil' ? (
                  <div className="bg-[#13131F] border border-brand-primary/10 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] bg-[#534AB7]/30 text-[#7F77DD] font-extrabold px-2 py-0.5 rounded-full inline-block">
                      Cuenta de la Administración
                    </span>
                    <div className="space-y-1.5 text-xs text-left">
                      <div className="flex justify-between">
                        <span className="text-white/40">Tarjeta CUP BANDEC:</span>
                        <strong className="text-white font-mono select-all">9211 4483 1290 8378</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Monto CUP a enviar:</span>
                        <strong className="text-[#7F77DD] font-mono">{convertPrice(selectedPlanToBuy.price).formatted}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Móvil de confirmación:</span>
                        <span className="text-white font-mono">+53 52930211</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#7F77DD] leading-relaxed border-t border-white/5 pt-2">
                      Realiza una transferencia a través de Transfermóvil por la cantidad mensual y escribe la información de tu transferencia en el formulario de abajo para el registro instantáneo.
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#13131F] border border-brand-primary/10 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] bg-[#534AB7]/30 text-[#7F77DD] font-extrabold px-2 py-0.5 rounded-full inline-block">
                      Billetera QvaPay Cuba
                    </span>
                    <div className="space-y-1.5 text-xs text-left">
                      <div className="flex justify-between">
                        <span className="text-white/40">Email QvaPay:</span>
                        <strong className="text-white font-mono select-all">cobros.admin@dcubanbeats.com</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Usuario QvaPay:</span>
                        <strong className="text-white font-mono">admin_dcubanbeats</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Monto aproximado:</span>
                        <strong className="text-[#7F77DD] font-mono">${selectedPlanToBuy.price} USD / SQP</strong>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#7F77DD] leading-relaxed border-t border-white/5 pt-2">
                      Transfiere el monto correspondiente al saldo QvaPay de la administración. Ingresa el ID de la transacción a continuación para activar tu plan.
                    </div>
                  </div>
                )}

                {/* Form Simulation Inputs */}
                <div className="space-y-3.5 pt-3 border-t border-white/5">
                  <span className="text-xs font-bold text-white/50 block tracking-wider uppercase">Datos del Comprobante</span>
                  
                  {paymentType === 'transfermovil' && (
                    <Input
                      label="Titular / Propietario de la tarjeta emisora *"
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
                    label="Id de Transacción / Referencia del Pago *"
                    placeholder="Ej. FT26129302 (Para Transfermóvil) o ID Tx QvaPay"
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
                </div>

                {/* Footer submit action */}
                <div className="flex gap-2.5 justify-end border-t border-white/5 pt-4">
                  <Button variant="ghost" size="sm" onClick={() => setIsSubscribeModalOpen(false)}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={() => handleConfirmPlanChange(selectedPlanToBuy)}>
                    Confirmar Transferencia y Activar Plan
                  </Button>
                </div>

              </div>
            )}

          </div>
        )}
      </Modal>

    </div>
  );
};
