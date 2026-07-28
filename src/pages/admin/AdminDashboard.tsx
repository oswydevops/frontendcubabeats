import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { 
  Users, Music, Receipt, Activity, ShieldCheck, Landmark, Check, 
  Trash2, XCircle, AlertCircle, Eye, RefreshCw,
  CreditCard, Globe, MessageSquare, Send
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    beats, orders, verifiedProducersTask, approveProducer, rejectProducer, addToast, user,
    supportMessages, sendSupportMessage, markSupportAsReadBySupport, deleteSupportChat,
    isMaintenanceMode, setMaintenanceMode, navigateTo
  } = useApp();

  const [selectedVerificationProducer, setSelectedVerificationProducer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSupportUserId, setActiveSupportUserId] = useState<string | null>(null);
  const [supportInput, setSupportInput] = useState('');

  // Group support messages to get list of conversations
  const uniqueConversations = useMemo(() => {
    const map = new Map<string, { userId: string; userName: string; userRole: 'client' | 'producer'; lastMessage: string; timestamp: string; unreadCount: number }>();
    
    supportMessages.forEach(msg => {
      const existing = map.get(msg.userId);
      const isUnread = !msg.readBySupport;
      
      if (!existing) {
        map.set(msg.userId, {
          userId: msg.userId,
          userName: msg.userName,
          userRole: msg.userRole,
          lastMessage: msg.text,
          timestamp: msg.timestamp,
          unreadCount: isUnread ? 1 : 0
        });
      } else {
        existing.lastMessage = msg.text;
        existing.timestamp = msg.timestamp;
        if (isUnread) {
          existing.unreadCount += 1;
        } else {
          // If read, reset unreadCount or let the messages flow
        }
      }
    });
    
    return Array.from(map.values());
  }, [supportMessages]);

  const activeSupportMessages = useMemo(() => {
    if (!activeSupportUserId) return [];
    return supportMessages.filter(m => m.userId === activeSupportUserId);
  }, [supportMessages, activeSupportUserId]);

  useEffect(() => {
    if (activeSupportUserId && markSupportAsReadBySupport) {
      markSupportAsReadBySupport(activeSupportUserId);
    }
  }, [activeSupportUserId, supportMessages, markSupportAsReadBySupport]);

  const handleSendSupportReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!supportInput.trim() || !activeSupportUserId) return;
    
    const activeMsg = activeSupportMessages[activeSupportMessages.length - 1] || uniqueConversations.find(c => c.userId === activeSupportUserId);
    if (activeMsg) {
      sendSupportMessage(
        activeMsg.userId,
        activeMsg.userName,
        activeMsg.userRole,
        'support',
        supportInput.trim()
      );
    }
    setSupportInput('');
  };

  const handleDeleteChat = (userId: string, userName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el chat con ${userName}?`)) {
      deleteSupportChat(userId);
      addToast(`Chat con ${userName} eliminado correctamente`, 'success');
      if (activeSupportUserId === userId) {
        setActiveSupportUserId(null);
      }
    }
  };

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

      {/* SECCIÓN DE CHAT DE SOPORTE - SOLO PARA GESTORES DE SOPORTE */}
      {user?.position === 'Gestor de Soporte' && (
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-sm space-y-4 text-left">
          <div className="flex items-center gap-2 border-b border-brand-border/10 pb-3">
            <div className="p-2 bg-[#534AB7]/10 rounded-xl text-[#7F77DD]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Centro de Soporte y Reporte de Incidencias</h3>
              <p className="text-xs text-gray-400 mt-0.5">Comunícate en tiempo real con los artistas y productores para resolver dudas y guiarlos en el uso de la plataforma.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[400px]">
            {/* Lista de Chats a la izquierda (4 cols) */}
            <div className="md:col-span-4 border-r border-brand-border/20 pr-4 flex flex-col h-full overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 block font-mono">Conversaciones Activas</span>
              <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                {uniqueConversations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-gray-500 leading-relaxed">No hay conversaciones de soporte por el momento.</p>
                  </div>
                ) : (
                  uniqueConversations.map((chat) => (
                    <div
                      key={chat.userId}
                      onClick={() => setActiveSupportUserId(chat.userId)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border cursor-pointer ${
                        activeSupportUserId === chat.userId
                          ? 'bg-[#534AB7]/20 border-[#7F77DD] text-white'
                          : 'bg-brand-surface border-brand-border/10 text-gray-400 hover:bg-brand-card/10 hover:text-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center font-bold text-xs text-[#7F77DD] border border-brand-border/40 shrink-0">
                        {chat.userName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center gap-1">
                          <span className="font-bold text-xs text-white truncate block">{chat.userName}</span>
                          <span className={`text-[8.5px] uppercase font-semibold shrink-0 px-1 rounded ${
                            chat.userRole === 'producer' ? 'bg-[#534AB7]/20 text-[#7F77DD]' : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {chat.userRole === 'producer' ? 'Prod' : 'Artista'}
                          </span>
                        </div>
                        <p className="text-[10.5px] truncate mt-0.5 text-gray-400 font-mono">{chat.lastMessage}</p>
                        <span className="text-[8.5px] text-gray-500 block mt-1">{chat.timestamp}</span>
                      </div>
                      <div className="flex flex-col items-end justify-between h-full self-stretch shrink-0">
                        {chat.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-brand-accent-red rounded-full animate-pulse mb-2" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(chat.userId, chat.userName, e)}
                          className="p-1.5 text-gray-400 hover:text-red-400 bg-transparent rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Eliminar Chat"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Panel de Conversación Activa a la derecha (8 cols) */}
            <div className="md:col-span-8 flex flex-col h-full overflow-hidden">
              {activeSupportUserId ? (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Cabecera */}
                  <div className="flex justify-between items-center bg-[#1C1C2E]/30 p-2.5 rounded-xl border border-brand-border/10 mb-2">
                    <div>
                      <span className="font-bold text-xs text-white">
                        {activeSupportMessages[0]?.userName || uniqueConversations.find(c => c.userId === activeSupportUserId)?.userName}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Conversación activa para resolver incidencias
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activeSupportMessages[0]?.userRole === 'producer' ? 'purple' : 'emerald'} className="text-[9px]">
                        {activeSupportMessages[0]?.userRole === 'producer' ? 'PRODUCTOR' : 'ARTISTA'}
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteChat(activeSupportUserId, activeSupportMessages[0]?.userName || uniqueConversations.find(c => c.userId === activeSupportUserId)?.userName || 'Usuario', e)}
                        className="p-1.5 text-gray-400 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[10px] px-2.5"
                        title="Eliminar Conversación"
                      >
                        <Trash2 size={12} />
                        Eliminar Chat
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo de Mensajes */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-brand-bg/40 rounded-xl border border-brand-border/20 mb-3 flex flex-col scrollbar-thin">
                    {activeSupportMessages.map((msg) => {
                      const isSupport = msg.senderType === 'support';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[75%] ${isSupport ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isSupport
                                ? 'bg-gradient-to-r from-[#534AB7] to-[#7F77DD] text-white rounded-tr-none'
                                : 'bg-[#1C1C2E] border border-brand-border/40 text-gray-300 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[8.5px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Formulario de Entrada */}
                  <form onSubmit={handleSendSupportReply} className="flex gap-2">
                    <input
                      type="text"
                      value={supportInput}
                      onChange={(e) => setSupportInput(e.target.value)}
                      placeholder="Escribe una respuesta para el usuario..."
                      className="flex-1 bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-[#7F77DD] transition-all"
                    />
                    <button
                      type="submit"
                      className="p-2.5 px-4 bg-[#534AB7] hover:bg-[#433A9B] text-white rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 font-bold text-xs"
                    >
                      <Send size={12} />
                      Enviar
                    </button>
                  </form>
                  
                  {/* Respuestas rápidas */}
                  <div className="flex gap-1.5 mt-2 overflow-x-auto py-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSupportInput('Hola, hemos verificado tu cuenta correctamente. Ya puedes acceder a todas las funciones.')}
                      className="px-2.5 py-1 bg-brand-border/20 hover:bg-brand-border/40 text-gray-300 rounded-lg text-[9px] font-bold cursor-pointer shrink-0 transition-all"
                    >
                      🚀 Aprobación KYC
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportInput('Estimado, ¿podrías enviarnos una foto más nítida de tu documento de identidad para completar la validación?')}
                      className="px-2.5 py-1 bg-brand-border/20 hover:bg-brand-border/40 text-gray-300 rounded-lg text-[9px] font-bold cursor-pointer shrink-0 transition-all"
                    >
                      📸 Foto Borrosa
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportInput('Hola, disculpa las molestias. Estamos procesando tu pago manual, se reflejará en un plazo máximo de 24 horas.')}
                      className="px-2.5 py-1 bg-brand-border/20 hover:bg-brand-border/40 text-gray-300 rounded-lg text-[9px] font-bold cursor-pointer shrink-0 transition-all"
                    >
                      💰 Retraso de Pago
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-brand-bg/10 rounded-xl border border-dashed border-brand-border/30">
                  <div className="p-3 bg-[#534AB7]/5 rounded-2xl text-[#7F77DD] mb-2.5">
                    <MessageSquare size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-white">Sin Conversación Seleccionada</h4>
                  <p className="text-[11px] text-gray-500 max-w-xs mt-1 leading-relaxed">
                    Selecciona una de las conversaciones activas de la lista para leer y responder los mensajes de soporte enviados por los usuarios.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
