import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GuestBecomeProducerModal } from '../../components/auth/GuestBecomeProducerModal';
import { 
  Sparkles, CheckCircle2, XCircle, 
  Check, X, ArrowRight, Star, ChevronDown
} from 'lucide-react';

export const BecomeProducerPage: React.FC = () => {
  const { user, plans, convertPrice, navigateTo, addToast, updateUserProfile, adminPaymentMethods } = useApp();

  // Modal for guests / unauthenticated users
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedPlanIdForGuest, setSelectedPlanIdForGuest] = useState(plans[0]?.id || 'p_free');

  // Currently focused/selected plan card
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    plans.find(p => p.featured)?.id || plans[0]?.id || null
  );

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Current user's active plan name
  const userPlanName = user?.plan || 'Gratis';

  // Handle plan selection click
  const handleSelectPlan = (planId: string) => {
    const chosenPlan = plans.find(p => p.id === planId) || plans[0];

    if (!user) {
      setSelectedPlanIdForGuest(planId);
      setShowGuestModal(true);
    } else if (user.role === 'producer') {
      // User is already a producer, take them to producer plans manager
      navigateTo('/producer/plans');
      addToast(`Redirigiendo a tu panel de gestión de membresías (${chosenPlan.name})`, 'info');
    } else {
      // User is an artist/client, convert them or open plan activation
      if (chosenPlan.price === 0) {
        updateUserProfile({
          role: 'producer',
          plan: 'Gratis',
          producerApprovalStatus: 'approved'
        });
        addToast('¡Felicidades! Tu cuenta ha sido convertida a Productor con el Plan Gratis.', 'success');
        navigateTo('/producer/dashboard');
      } else {
        const activeAdminMethods = (adminPaymentMethods || []).filter(m => m.active !== false);
        if (activeAdminMethods.length === 0) {
          addToast('No hay métodos de pago disponibles por el momento. La administración no tiene cuentas activas configuradas.', 'error');
          return;
        }
        // Upgrade role to producer and go to producer plans to handle payment
        updateUserProfile({
          role: 'producer',
          plan: 'Gratis', // initial status before payment approval
          producerApprovalStatus: 'pending'
        });
        navigateTo('/producer/plans');
        addToast(`Seleccionaste el Plan ${chosenPlan.name}. Redirigiendo a la pantalla de confirmación de pago...`, 'info');
      }
    }
  };

  const faqList = [
    {
      q: '¿Cómo cobro el dinero de mis ventas de beats en Cuba?',
      a: 'Recibirás los fondos de tus ventas de forma directa en tu tarjeta de banco cubano (BANMET, BPA, BANDEC) a través de Transfermóvil o Enzona, o en tu billetera digital QvaPay. Las liquidaciones se procesan inmediatamente tras la validación de cada transacción.'
    },
    {
      q: '¿Qué diferencia hay entre los límites de cada plan?',
      a: 'Cada plan define la cantidad de beats activos permitidos en catálogo, la posibilidad de subir librerías de sonido/sample packs, el acceso al módulo de analíticas, soporte de stems (multitracks) y nivel de asistencia técnica.'
    },
    {
      q: '¿Las licencias PDF tienen validez legal?',
      a: 'Sí. D\'Cuban Beats genera certificados digitales e individuales de licencias en formato PDF firmado por la plataforma y el productor, garantizando los derechos de uso comercial, no exclusivo o exclusivo según la licencia comprada.'
    },
    {
      q: '¿Puedo cambiar o cancelar mi plan en cualquier momento?',
      a: 'Absolutamente. Puedes subir o bajar de plan cuando lo desees desde tu panel de control de productor sin ningún compromiso a largo plazo ni penalizaciones.'
    },
    {
      q: '¿Es obligatoria la verificación de identidad (KYC)?',
      a: 'Para publicar en el Plan Gratis no requieres verificación inicial. Para activar cobros directos en cuentas bancarias cubanas y suscribirte a planes de pago, se solicita la verificación de tus documentos nacionales para garantizar la transparencia legal.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070C] text-white selection:bg-[#7F77DD]/30 selection:text-white font-sans relative overflow-x-hidden text-left pb-16">
      
      {/* Background Glow Accents */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full bg-[#534AB7]/15 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 60, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-96 right-10 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px]"
        />
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-500/5">
          <Sparkles size={14} className="animate-pulse" />
          <span>Membresías de Vendedor de Beats</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Elige tu Plan y Monetiza tu <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-[#7F77DD] bg-clip-text text-transparent">Música en Cuba</span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/60 leading-relaxed font-normal">
          Publica tus instrumentales, vende licencias musicales automatizadas y cobra de manera instantánea a través de Transfermóvil, bancos cubanos y QvaPay.
        </p>

        {/* Feature Highlights Grid */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          {[
            { title: 'Planes a Medida', desc: 'Configurados directamente para ti' },
            { title: 'Cobro Instantáneo', desc: 'Transfermóvil, BANMET, BPA, BANDEC' },
            { title: 'Licencias PDF', desc: 'Contratos formales automáticos' },
            { title: 'Soporte Cubano', desc: 'Asistencia y legalidad local' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-[#13131F]/80 border border-white/5 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS CARDS SECTION WITH ADVANTAGES & DISADVANTAGES */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center space-y-2 mb-10">
          <Badge variant="purple">Membresías Oficiales</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Planes Disponibles con sus Ventajas y Desventajas
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-xl mx-auto">
            A continuación se muestran todos los planes configurados oficialmente. Revisa cada detalle antes de suscribirte.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((pl) => {
            const isFree = pl.price === 0;
            const isUserCurrent = user?.role === 'producer' && userPlanName.toLowerCase() === pl.name.toLowerCase();
            const isSelected = selectedPlanId === pl.id;
            const formattedPrice = isFree ? 'Gratis' : convertPrice(pl.price).formatted;

            return (
              <motion.div 
                key={pl.id}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                onClick={() => setSelectedPlanId(pl.id)}
                className={`group rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all duration-300 relative cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-2 border-amber-400 bg-gradient-to-b from-[#1C1C2E] via-[#151525] to-[#121220] shadow-2xl shadow-amber-500/25 ring-2 ring-amber-400/40 z-20'
                    : pl.featured
                      ? 'border-2 border-amber-500/70 bg-[#13131F] shadow-xl shadow-amber-500/10 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20'
                      : 'border border-white/10 hover:border-amber-500/50 bg-[#13131F] hover:bg-[#161626] hover:shadow-xl hover:shadow-amber-500/15'
                }`}
              >
                {/* Ambient Subtle Glow Overlay on Hover */}
                <div className={`absolute -inset-px rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none transition-opacity duration-300 z-0 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  {pl.featured && (
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-extrabold uppercase font-mono rounded-full shadow-md flex items-center gap-1">
                      <Star size={11} className="fill-black" />
                      <span>Recomendado</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="ml-auto px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-extrabold uppercase font-mono rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                      <Check size={11} className="stroke-[3]" />
                      <span>Seleccionado</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold block group-hover:text-amber-300 transition-colors">
                        {isFree ? 'Plan Inicial' : pl.featured ? 'Plan Popular' : 'Membresía'}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">{pl.name}</h3>
                    </div>
                    {pl.badgeType && pl.badgeType !== 'Ninguno' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#534AB7]/30 border border-[#7F77DD]/50 text-[#9B95E8] text-[10px] font-extrabold uppercase font-mono shadow-sm">
                        Badge {pl.badgeType}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <span className="text-3xl font-extrabold text-white font-mono group-hover:text-amber-300 transition-colors">{formattedPrice}</span>
                    {!isFree && <span className="text-xs text-white/40 ml-1"> / mes</span>}
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {pl.support}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    
                    {/* VENTAJAS / PROS */}
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1 font-mono">
                        <CheckCircle2 size={13} /> Ventajas / Pros
                      </span>
                      <ul className="space-y-1.5 text-xs text-white/80 font-sans">
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Límite de <strong>{pl.limit === 999 ? 'Beats Ilimitados' : `${pl.limit} Beats`}</strong> publicados</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>
                            {pl.limitLibrariesCount && pl.limitLibrariesCount > 0 
                              ? `Hasta ${pl.limitLibrariesCount} Librerías/Sample Packs (${pl.maxLibrarySizeEach} MB)`
                              : 'Registro de perfil de productor oficial'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Mensajería Directa: <strong>{pl.directMessaging || (isFree ? 'Bloqueada' : 'Ilimitada')}</strong></span>
                        </li>
                        {pl.analyticsAccess && (
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>Acceso completo a <strong>Analytics y Estadísticas</strong></span>
                          </li>
                        )}
                        {pl.stemsAllowed && (
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>Soporte de <strong>Stems (Multitracks WAV)</strong></span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Formatos admitidos: <strong>{pl.allowedFormats || 'MP3'}</strong></span>
                        </li>
                        {pl.benefits?.map((benefit, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* DESVENTAJAS / LÍMITES */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1 font-mono">
                        <XCircle size={13} /> Desventajas / Límites
                      </span>
                      <ul className="space-y-1.5 text-xs text-white/60 font-sans">
                        {!isFree ? (
                          <li className="flex items-start gap-2 text-rose-300/80">
                            <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                            <span>Requiere pago recurrente de <strong>{formattedPrice}/mes</strong></span>
                          </li>
                        ) : (
                          <li className="flex items-start gap-2 text-rose-300/80">
                            <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                            <span>Restringido estrictamente a <strong>{pl.limit} beats</strong> en catálogo</span>
                          </li>
                        )}
                        {pl.limit !== 999 && !isFree && (
                          <li className="flex items-start gap-2 text-rose-300/80">
                            <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                            <span>Límite máximo de <strong>{pl.limit} beats</strong> publicados</span>
                          </li>
                        )}
                        {(!pl.limitLibrariesCount || pl.limitLibrariesCount === 0) && (
                          <li className="flex items-start gap-2 text-rose-300/80">
                            <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                            <span>No incluye subida de Librerías de sonido</span>
                          </li>
                        )}
                        {!pl.analyticsAccess && (
                          <li className="flex items-start gap-2 text-rose-300/80">
                            <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                            <span>Sin acceso a módulo de estadísticas</span>
                          </li>
                        )}
                        {!pl.stemsAllowed && (
                          <li className="flex items-start gap-2 text-rose-300/80">
                            <X size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                            <span>No permite adjuntar archivos Stems/Multitrack</span>
                          </li>
                        )}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Card Button */}
                <div className="relative z-10 pt-2">
                  {isUserCurrent ? (
                    <Button 
                      disabled
                      variant="secondary"
                      fullWidth
                      className="cursor-not-allowed bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} className="stroke-[3]" />
                      Tu Membresía Actual
                    </Button>
                  ) : (
                    <Button
                      variant={isSelected || pl.featured ? 'primary' : 'secondary'}
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(pl.id);
                        handleSelectPlan(pl.id);
                      }}
                      className={`text-xs font-extrabold py-3 cursor-pointer shadow-lg transition-all duration-200 active:scale-95 ${
                        isSelected || pl.featured 
                          ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 hover:shadow-amber-500/35'
                          : 'bg-white/10 hover:bg-amber-500 hover:text-black text-white'
                      }`}
                    >
                      <span>{isFree ? 'Comenzar con Plan Gratis' : `Elegir Plan ${pl.name}`}</span>
                      <ArrowRight size={14} className="ml-1.5 inline transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* DETAILED COMPARISON MATRIX TABLE */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-8">
          <Badge variant="purple">Tabla Matriz</Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tabla Comparativa de Funcionalidades
          </h2>
        </div>

        <div className="bg-[#13131F]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white min-w-[600px]">
              <thead className="bg-[#0D0D14] border-b border-white/10 text-white/50 uppercase font-mono font-bold">
                <tr>
                  <th className="py-3.5 px-4">Característica / Función</th>
                  {plans.map((p) => (
                    <th key={p.id} className="py-3.5 px-4 text-center font-bold text-white">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Límite de Beats en Catálogo</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center text-white/80 font-mono">
                      {p.limit === 999 ? 'Ilimitados ∞' : `${p.limit} Beats`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Precio Mensual</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                      {p.price === 0 ? 'Gratis' : convertPrice(p.price).formatted}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Venta de Sound Kits / Muestras</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center text-white/80">
                      {p.limitLibrariesCount && p.limitLibrariesCount > 0 
                        ? `${p.limitLibrariesCount} Packs (${p.maxLibrarySizeEach}MB)` 
                        : '❌ No Incluido'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Mensajería Directa</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center text-white/80">
                      {p.directMessaging || (p.price === 0 ? '❌ Bloqueada' : '✅ Ilimitada')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Módulo de Analíticas & Stats</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center">
                      {p.analyticsAccess ? (
                        <span className="text-emerald-400 font-bold">✓ Acceso Completo</span>
                      ) : (
                        <span className="text-rose-400/80">❌ No Incluido</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Archivos Stems / Multitracks</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center">
                      {p.stemsAllowed ? (
                        <span className="text-emerald-400 font-bold">✓ Permitido</span>
                      ) : (
                        <span className="text-rose-400/80">❌ No Permitido</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Formatos de Audio Admitidos</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center text-white/80 font-mono">
                      {p.allowedFormats || 'MP3'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Insignia de Perfil (Badge)</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center text-white/80">
                      {p.badgeType && p.badgeType !== 'Ninguno' ? `Badge "${p.badgeType}"` : 'Ninguna'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white/90">Asistencia / Soporte Técnico</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-center text-white/80">
                      {p.support}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="purple">Dudas Frecuentes</Badge>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Preguntas Frecuentes de Vendedores
          </h2>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-[#13131F] border border-white/5 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-white hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 text-white/40 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-white/60 leading-relaxed font-sans border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER CTA BANNER */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-gradient-to-r from-[#13131F] via-[#1C1C2E] to-[#13131F] border border-amber-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-bold text-white">¿Listo para comenzar a vender tus beats?</h3>
            <p className="text-xs text-white/60 max-w-lg mx-auto">
              Únete a cientos de productores cubanos que ya están distribuyendo y vendiendo su música legalmente.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => handleSelectPlan(plans[0]?.id || 'p_free')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs px-6 py-3 cursor-pointer shadow-xl shadow-amber-500/10"
            >
              <span>Registrarme como Vendedor Gratis</span>
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Guest Become Producer Registration Modal */}
      <GuestBecomeProducerModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        initialPlanId={selectedPlanIdForGuest}
        initialStep={2}
      />

    </div>
  );
};
