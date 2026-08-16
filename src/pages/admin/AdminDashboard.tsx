import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { 
  Users, Music, Receipt, Activity, ShieldCheck, Landmark, Check, 
  Trash2, XCircle, AlertCircle, Eye, RefreshCw,
  CreditCard, Globe, MessageSquare, Headset, ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    beats, orders, verifiedProducersTask, approveProducer, rejectProducer, addToast, user,
    isMaintenanceMode, setMaintenanceMode, navigateTo
  } = useApp();

  const [selectedVerificationProducer, setSelectedVerificationProducer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filter producers awaiting verification (where verified: false)
  const pendingProducers = useMemo(() => {
    return verifiedProducersTask.filter(p => !p.verified);
  }, [verifiedProducersTask]);

  // Filter approved producers
  const approvedProducersCount = useMemo(() => {
    return verifiedProducersTask.filter(p => p.verified).length;
  }, [verifiedProducersTask]);

  const salesCUP = useMemo(() => {
    const fromOrders = orders
      .filter(o => o.status === 'approved' && o.currency === 'CUP')
      .reduce((acc, o) => acc + o.amount, 0);
    return fromOrders + 420000;
  }, [orders]);

  const salesMLC = useMemo(() => {
    const fromOrders = orders
      .filter(o => o.status === 'approved' && o.currency === 'MLC')
      .reduce((acc, o) => acc + o.amount, 0);
    return fromOrders + 12500;
  }, [orders]);

  const salesSQP = useMemo(() => {
    const fromOrders = orders
      .filter(o => o.status === 'approved' && (o.currency === 'USDT' || o.currency === 'SQP' || o.method === 'QvaPay'))
      .reduce((acc, o) => acc + o.amount, 0);
    return fromOrders + 8450;
  }, [orders]);

  const salesClasica = useMemo(() => {
    const fromOrders = orders
      .filter(o => o.status === 'approved' && (o.currency === 'CLASICA' || o.currency === 'CLÁSICA' || o.method === 'Tarjeta Clásica'))
      .reduce((acc, o) => acc + o.amount, 0);
    return fromOrders + 15200;
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending').length;
  }, [orders]);

  const handleOpenKycDocDetail = (producer: any) => {
    setSelectedVerificationProducer(producer);
  };

  const handleQuickApprove = (pId: string) => {
    approveProducer(pId);
    setSelectedVerificationProducer(null);
  };

  const handleQuickReject = (pId: string) => {
    rejectProducer(pId);
    setSelectedVerificationProducer(null);
  };

  if (isLoading) {
    return <DashboardSkeleton variant="admin" />;
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-brand-border/25 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#7F77DD]" /> Panel Administrativo D'Cuban Beats
          </h2>
          <p className="text-xs text-gray-400">Métricas y cola de aprobación de seguridad para productores cubanos.</p>
        </div>

        <button 
          onClick={() => addToast('Métricas actualizadas en tiempo real', 'info')}
          className="p-2 bg-[#534AB7]/20 text-[#7F77DD] rounded-xl hover:bg-[#534AB7]/30 cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw size={14} />
          Refrescar Datos
        </button>
      </div>

      {/* KPI blocks global */}
      {user?.isCollaborator ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1 - Approved Producers */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl transition-all group-hover:bg-emerald-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Productores Verificados</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-emerald-400">
                  {verifiedProducersTask.filter(u => u.role === 'producer' && u.verified).length} Activos
                </h3>
              </div>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-emerald-400 font-semibold block">● Verificación KYC completa</span>
          </div>

          {/* Metric 2 - Total Beats */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl transition-all group-hover:bg-blue-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Catálogo de Beats</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-blue-400">{beats.length} Instrumentales</h3>
              </div>
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Music size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-blue-400 font-semibold block">● Obras musicales registradas</span>
          </div>

          {/* Metric 3 - Registered Clients */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl transition-all group-hover:bg-purple-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Artistas Compradores</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-purple-400">
                  {verifiedProducersTask.filter(u => u.role === 'client').length} Clientes
                </h3>
              </div>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-purple-400 font-semibold block">● Compradores registrados</span>
          </div>

          {/* Metric 4 - Pending KYC */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl transition-all group-hover:bg-amber-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Cola de Acreditación</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-amber-400">{pendingProducers.length} Pendientes</h3>
              </div>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-amber-400 font-semibold block">● Esperando aprobación ID</span>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1 - CUP */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl transition-all group-hover:bg-emerald-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Facturación Global (CUP)</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-emerald-400">${salesCUP.toLocaleString()} CUP</h3>
              </div>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Landmark size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-emerald-400 font-semibold block">● Pasarelas Transfermóvil / EnZona</span>
          </div>

          {/* Metric 2 - MLC */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl transition-all group-hover:bg-blue-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Facturación Global (MLC)</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-blue-400">${salesMLC.toLocaleString()} MLC</h3>
              </div>
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-blue-400 font-semibold block">● Tarjetas MLC Autorizadas</span>
          </div>

          {/* Metric 3 - SQP(USD) */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl transition-all group-hover:bg-purple-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Facturación Global SQP(USD)</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-purple-400">${salesSQP.toLocaleString()} SQP</h3>
              </div>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Globe size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-purple-400 font-semibold block">● Pasarela QvaPay (Crypto/USDT)</span>
          </div>

          {/* Metric 4 - Clásica (USD) */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl transition-all group-hover:bg-amber-500/10" />
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Facturación Clásica (USD)</span>
                <h3 className="text-lg md:text-xl font-extrabold font-mono text-amber-400">${salesClasica.toLocaleString()} USD</h3>
              </div>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard size={16} />
              </span>
            </div>
            <span className="text-[10.5px] text-amber-400 font-semibold block">● Tarjetas Internacionales Clásica</span>
          </div>

        </div>
      )}

      {/* MODO MANTENIMIENTO GLOBAL */}
      <div id="status-simulation-console" className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-brand-border/20 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Control del Estado de la Plataforma</h3>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Panel de Control General</span>
        </div>

        <div className="bg-[#0D0D14]/50 border border-white/5 rounded-xl p-5 space-y-4 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle size={14} />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Modo Mantenimiento General</span>
          </div>
          
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Al activar el modo mantenimiento, todos los usuarios de la plataforma que no tengan privilegios de administrador verán la pantalla de mantenimiento con el fader master y el contador regresivo.
          </p>

          <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg border border-white/5">
            <span className="text-xs font-semibold text-gray-300">
              Estado: {isMaintenanceMode ? (
                <span className="text-amber-400 font-black animate-pulse">● ACTIVO</span>
              ) : (
                <span className="text-gray-500">○ INACTIVO</span>
              )}
            </span>
            
            <button
              id="toggle-maintenance-mode-btn"
              onClick={() => {
                setMaintenanceMode(!isMaintenanceMode);
                addToast(isMaintenanceMode ? 'Modo mantenimiento desactivado globalmente' : 'Modo mantenimiento activado globalmente. ¡Los faders de producción están apagados!', isMaintenanceMode ? 'info' : 'success');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isMaintenanceMode 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10' 
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
              }`}
            >
              {isMaintenanceMode ? 'Desactivar' : 'Activar Modo'}
            </button>
          </div>
        </div>
      </div>

      {/* COLA DE APROBACIÓN PRODUCTORES KYC */}
      <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border/20 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Cola de Verificación de Identidad (KYC)</h3>
        </div>

        {pendingProducers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-xs">No hay solicitudes KYC pendientes de revisión actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border/20 text-gray-400 font-semibold uppercase">
                  <th className="py-2.5">Productor</th>
                  <th className="py-2.5">Contacto</th>
                  <th className="py-2.5">Membresía</th>
                  <th className="py-2.5 text-center">Estatuto</th>
                  <th className="py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/10 text-gray-300">
                {pendingProducers.map((prod) => (
                  <tr key={prod.id} className="hover:bg-brand-card/25 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#534AB7]/20 flex items-center justify-center text-[#7F77DD] font-bold">
                          {prod.artistName?.[0] || prod.name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{prod.artistName || prod.name}</span>
                          <span className="text-[10px] text-gray-500">{prod.instagram || '@sinstudio'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono text-gray-400">{prod.email}</td>

                    <td className="py-3.5">
                      <Badge variant="purple" className="text-[9px] bg-brand-bg/50 text-[#7F77DD]">Plan {prod.plan}</Badge>
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="text-amber-500 font-bold text-[11px] animate-pulse">● Pendiente de Firma ID</span>
                    </td>

                    <td className="py-3.5 text-right whitespace-nowrap space-x-1">
                      <button 
                        onClick={() => handleOpenKycDocDetail(prod)}
                        className="p-1 px-2.5 bg-[#534AB7] text-white rounded-lg font-bold text-[11px] hover:bg-[#433A9B] cursor-pointer transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Revisar Exp.
                      </button>
                      <button 
                        onClick={() => handleQuickApprove(prod.id)}
                        className="p-1 px-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        title="Verificar al instante"
                      >
                        <Check size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACCESO RÁPIDO AL NUEVO SISTEMA DE TICKETS Y SOPORTE */}
      <div className="bg-gradient-to-r from-[#1C1C2E] via-[#232042] to-[#1C1C2E] p-6 rounded-2xl border border-[#7F77DD]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#534AB7]/20 rounded-2xl text-[#7F77DD] border border-[#7F77DD]/30">
            <Headset size={26} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Centro de Soporte Técnico y Tickets
              <span className="text-[10px] bg-[#7F77DD]/20 text-[#7F77DD] px-2 py-0.5 rounded-full font-bold border border-[#7F77DD]/30">
                Nuevo Sistema
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Gestiona tickets en tiempo real, bot de respuestas automáticas y asignación de agentes en cola.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('/admin/support')}
          className="px-5 py-2.5 bg-[#534AB7] hover:bg-[#433A9B] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 group"
          id="admin-dashboard-go-to-support-btn"
        >
          <span>Ir a Soporte</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* DETAIL MODAL FOR ADMIN TO VERIFY DOCUMENTS */}
      <Modal
        isOpen={!!selectedVerificationProducer}
        onClose={() => setSelectedVerificationProducer(null)}
        title="Expediente KYC de Titularidad"
        themeMode="dark"
        maxWidth="max-w-lg"
      >
        {selectedVerificationProducer && (
          <div className="space-y-5 text-left pt-2 text-xs">
            <div className="space-y-0.5 border-b border-brand-border/20 pb-3">
              <span className="font-bold text-sm block text-white">{selectedVerificationProducer.name}</span>
              <span className="text-gray-400">Solicitado para artistName: {selectedVerificationProducer.artistName || 'Flow'}</span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Documentación Presentada</span>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Front ID mock visual box */}
                <div className="bg-brand-bg border border-brand-border/30 rounded-xl p-4 text-center space-y-1.5 select-none">
                  <span className="font-bold text-gray-300 block text-[10px]">Identidad (Delantera)</span>
                  <div className="w-full h-20 bg-brand-surface/50 rounded-lg flex items-center justify-center text-gray-400 font-mono text-[9px] border border-brand-border/20">
                    [Carné de Identidad]
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Cargado</span>
                </div>

                {/* Back ID mock visual box */}
                <div className="bg-brand-bg border border-brand-border/30 rounded-xl p-4 text-center space-y-1.5 select-none">
                  <span className="font-bold text-gray-300 block text-[10px]">Selfie con ID</span>
                  <div className="w-full h-20 bg-brand-surface/50 rounded-lg flex items-center justify-center text-gray-400 font-mono text-[9px] border border-brand-border/20">
                    [Retrato Rostro]
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Validado</span>
                </div>
              </div>
            </div>

            {/* Actions for Admin on the dossier */}
            <div className="flex gap-2 justify-end pt-4 border-t border-brand-border/20">
              <button
                onClick={() => handleQuickReject(selectedVerificationProducer.id)}
                className="px-4 py-2 border border-brand-accent-red/40 text-brand-accent-red hover:bg-brand-accent-red/5 font-bold rounded-xl cursor-pointer"
              >
                Rechazar Exp.
              </button>
              <button
                onClick={() => handleQuickApprove(selectedVerificationProducer.id)}
                className="px-5 py-2 bg-gradient-to-r from-[#534AB7] to-[#7F77DD] hover:opacity-90 text-white font-bold rounded-xl cursor-pointer shadow-md"
              >
                Aprobar y Verificar Productor
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
