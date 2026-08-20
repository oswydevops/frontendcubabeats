import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Badge } from '../../components/ui/Badge';
import { SupportTicket, SupportMessage, STAFF_PERMISSIONS } from '../../types';
import { formatRelativeTime } from '../../utils/date';
import { 
  Headset, MessageSquare, CheckCircle2, Clock, Bot, User, 
  Send, Trash2, Search, Filter, AlertCircle, ShieldCheck, 
  Sparkles, CheckCircle, Radio, PhoneCall, RefreshCw, AlertTriangle
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const { 
    user, 
    supportTickets, 
    supportMessages, 
    toggleSupportOnline, 
    sendSupportMessage, 
    claimTicket, 
    resolveTicket, 
    deleteSupportChat,
    markSupportAsReadBySupport,
    verifiedProducersTask
  } = useApp();

  const [activeTab, setActiveTab] = useState<'esperando' | 'mias' | 'todas'>('esperando');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'bot' | 'esperando' | 'en_vivo' | 'resuelto'>('todos');
  const [replyText, setReplyText] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const isCurrentAdminOnline = !!user?.isSupportOnline;

  // List of all online admins with canManageSupport permission
  const onlineAdmins = useMemo(() => {
    return verifiedProducersTask.filter(u => {
      if (u.role !== 'admin' || !u.isSupportOnline) return false;
      if (u.customPermissions && Array.isArray(u.customPermissions)) {
        return u.customPermissions.includes('canManageSupport');
      }
      const staffRole = u.staffRole || 'super_admin';
      return STAFF_PERMISSIONS[staffRole]?.includes('canManageSupport');
    });
  }, [verifiedProducersTask]);

  // Filter & Sort tickets by tab, search query, priority and SLA waiting time
  const filteredTickets = useMemo(() => {
    const list = supportTickets.filter((ticket) => {
      // Search match
      const matchesSearch = 
        ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.category && ticket.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab match
      if (activeTab === 'esperando') {
        return ticket.status === 'esperando';
      }
      if (activeTab === 'mias') {
        return ticket.assignedAdminId === user?.id && ticket.status !== 'resuelto';
      }
      if (activeTab === 'todas') {
        if (statusFilter === 'todos') return true;
        return ticket.status === statusFilter;
      }
      return true;
    });

    return list.sort((a, b) => {
      // 1. Urgent priority tickets always go first
      if (a.priority === 'urgente' && b.priority !== 'urgente') return -1;
      if (b.priority === 'urgente' && a.priority !== 'urgente') return 1;

      // 2. In waiting queue: oldest first (longest waiting time at top)
      if (activeTab === 'esperando') {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeA - timeB;
      }

      // 3. In other tabs: most recently updated first
      const timeA = new Date(a.updatedAt || a.createdAt).getTime() || 0;
      const timeB = new Date(b.updatedAt || b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  }, [supportTickets, activeTab, searchQuery, statusFilter, user?.id]);

  // Selected ticket object
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) {
      return filteredTickets[0] || null;
    }
    return supportTickets.find(t => t.id === selectedTicketId) || null;
  }, [supportTickets, selectedTicketId, filteredTickets]);

  // Active messages for selected ticket
  const selectedTicketMessages = useMemo(() => {
    if (!selectedTicket) return [];
    return supportMessages.filter(m => m.ticketId === selectedTicket.id || (m.userId === selectedTicket.userId && !m.ticketId));
  }, [supportMessages, selectedTicket]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (selectedTicket) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.id, selectedTicketMessages.length]);

  // Mark as read when selected
  useEffect(() => {
    if (selectedTicket?.id) {
      markSupportAsReadBySupport(selectedTicket.id);
    }
  }, [selectedTicket?.id, selectedTicketMessages.length, markSupportAsReadBySupport]);

  // Helper counts
  const waitingCount = useMemo(() => supportTickets.filter(t => t.status === 'esperando').length, [supportTickets]);
  const myActiveCount = useMemo(() => supportTickets.filter(t => t.assignedAdminId === user?.id && t.status !== 'resuelto').length, [supportTickets, user?.id]);
  const resolvedCount = useMemo(() => supportTickets.filter(t => t.status === 'resuelto').length, [supportTickets]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    sendSupportMessage(
      selectedTicket.id,
      selectedTicket.userId,
      user?.name ? `${user.name} (Soporte)` : 'Soporte D\'Cuban Beats',
      selectedTicket.userRole,
      'support',
      replyText.trim(),
      false
    );

    setReplyText('');
  };

  const handleClaim = (ticketId: string) => {
    if (!user) return;
    claimTicket(ticketId, user.id);
    setSelectedTicketId(ticketId);
  };

  const handleResolve = (ticketId: string) => {
    resolveTicket(ticketId);
  };

  const handleDelete = (ticketId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ticket y su historial de mensajes?')) {
      deleteSupportChat(ticketId);
      if (selectedTicketId === ticketId) {
        setSelectedTicketId(null);
      }
    }
  };

  const getPriorityBadge = (priority?: SupportTicket['priority']) => {
    if (priority === 'urgente') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 animate-pulse shadow-sm">
          <AlertCircle size={10} /> SLA URGENTE
        </span>
      );
    }
    return null;
  };

  const getCategoryBadge = (category?: SupportTicket['category']) => {
    switch (category) {
      case 'pagos':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">💳 Pagos</span>;
      case 'kyc':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#7F77DD]/15 text-[#7F77DD] border border-[#7F77DD]/30">🪪 KYC</span>;
      case 'cuenta':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">👤 Cuenta / Planes</span>;
      case 'otro':
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">❓ Dudas / General</span>;
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'esperando':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock size={10} /> Esperando</span>;
      case 'en_vivo':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En Vivo</span>;
      case 'bot':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1"><Bot size={10} /> Bot</span>;
      case 'resuelto':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-500/15 text-gray-400 border border-gray-500/30 flex items-center gap-1"><CheckCircle2 size={10} /> Resuelto</span>;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto font-sans" id="admin-support-page">
      
      {/* 1. Page Header & Status Presence Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-surface p-5 sm:p-6 rounded-2xl border border-brand-border/40 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-[#534AB7]/15 rounded-xl text-[#7F77DD]">
              <Headset size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Soporte Técnico y Tickets
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Atención al cliente en tiempo real, derivación por bot de preguntas frecuentes y asignación de casos.
          </p>
        </div>

        {/* Presence switch */}
        <div className="flex items-center gap-3 bg-[#13131F] p-2 sm:p-2.5 rounded-2xl border border-brand-border/40">
          <div className="text-right">
            <span className="text-xs font-bold block text-white">
              {isCurrentAdminOnline ? 'Disponible para Soporte' : 'Desconectado de Soporte'}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
              {isCurrentAdminOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Recibiendo chats en vivo
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  Casos irán a cola de espera
                </>
              )}
            </span>
          </div>

          <button
            onClick={toggleSupportOnline}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
              isCurrentAdminOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-[#534AB7] hover:bg-[#433A9B] text-white'
            }`}
            id="toggle-support-presence-btn"
          >
            <Radio size={14} className={isCurrentAdminOnline ? 'animate-spin' : ''} />
            {isCurrentAdminOnline ? 'Ponerse Desconectado' : 'Conectarse Ahora'}
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/40 flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{waitingCount}</span>
            <span className="text-[11px] text-gray-400 font-medium">Tickets en Espera</span>
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/40 flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <Headset size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{myActiveCount}</span>
            <span className="text-[11px] text-gray-400 font-medium">Mis Casos Activos</span>
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/40 flex items-center gap-3.5">
          <div className="p-3 bg-[#534AB7]/15 text-[#7F77DD] rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{resolvedCount}</span>
            <span className="text-[11px] text-gray-400 font-medium">Casos Resueltos</span>
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border/40 flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-xl">
            <User size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{onlineAdmins.length}</span>
            <span className="text-[11px] text-gray-400 font-medium">Admins en Línea</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Tabs + Ticket List + Interactive Chat */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border/40 overflow-hidden shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="border-b border-brand-border/20 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1C1C2E]/40">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('esperando'); setSelectedTicketId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'esperando'
                  ? 'bg-[#534AB7] text-white shadow-md'
                  : 'bg-[#13131F] text-gray-400 hover:text-white'
              }`}
            >
              <Clock size={14} />
              Esperando ({waitingCount})
            </button>

            <button
              onClick={() => { setActiveTab('mias'); setSelectedTicketId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'mias'
                  ? 'bg-[#534AB7] text-white shadow-md'
                  : 'bg-[#13131F] text-gray-400 hover:text-white'
              }`}
            >
              <Headset size={14} />
              Mías ({myActiveCount})
            </button>

            <button
              onClick={() => { setActiveTab('todas'); setSelectedTicketId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'todas'
                  ? 'bg-[#534AB7] text-white shadow-md'
                  : 'bg-[#13131F] text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              Todas ({supportTickets.length})
            </button>
          </div>

          {/* Search bar & status filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input
                type="text"
                placeholder="Buscar por usuario o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#13131F] border border-brand-border/40 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#7F77DD] transition-all"
              />
            </div>

            {activeTab === 'todas' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#13131F] border border-brand-border/40 rounded-xl py-1.5 px-3 text-xs text-gray-300 outline-none focus:border-[#7F77DD]"
              >
                <option value="todos">Todos los Estados</option>
                <option value="esperando">Esperando</option>
                <option value="en_vivo">En Vivo</option>
                <option value="bot">Bot</option>
                <option value="resuelto">Resuelto</option>
              </select>
            )}
          </div>
        </div>

        {/* 2-Column Split: List + Chat Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          
          {/* Left Column: Tickets List (5 cols) */}
          <div className="lg:col-span-5 border-r border-brand-border/20 flex flex-col bg-[#13131F]/50">
            <div className="p-3 border-b border-brand-border/20 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
              <span>Lista de Tickets ({filteredTickets.length})</span>
              <span className="text-[10px] text-gray-500 lowercase">
                {activeTab === 'esperando' ? 'ordenados por antigüedad (SLA)' : 'ordenados por actividad'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-brand-border/10 scrollbar-thin">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <MessageSquare size={28} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-300">No hay tickets en esta sección</p>
                  <p className="text-[11px] text-gray-500">
                    {activeTab === 'esperando' && 'Excelente, no hay usuarios esperando respuesta actualmente.'}
                    {activeTab === 'mias' && 'No tienes tickets asignados activos. Puedes tomar uno de la pestaña "Esperando".'}
                    {activeTab === 'todas' && 'No se encontraron tickets con los filtros actuales.'}
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const ticketMsgs = supportMessages.filter(m => m.ticketId === t.id || (m.userId === t.userId && !m.ticketId));
                  const lastMsg = ticketMsgs[ticketMsgs.length - 1];
                  const hasUnread = ticketMsgs.some(m => m.senderType === 'user' && !m.readBySupport);
                  const isUrgent = t.priority === 'urgente';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-4 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected 
                          ? isUrgent
                            ? 'bg-[#2A1820] border-l-4 border-l-red-500'
                            : 'bg-[#1C1C2E] border-l-4 border-l-[#7F77DD]' 
                          : isUrgent
                          ? 'bg-red-950/15 hover:bg-red-950/25 border-l-2 border-l-red-500/60'
                          : 'hover:bg-[#181828] bg-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-white">{t.userName}</span>
                            <Badge variant={t.userRole === 'producer' ? 'purple' : 'emerald'} className="text-[8.5px] py-0 px-1.5">
                              {t.userRole === 'producer' ? 'PRODUCTOR' : 'ARTISTA'}
                            </Badge>
                            {isUrgent && getPriorityBadge(t.priority)}
                            {hasUnread && (
                              <span className="w-2 h-2 rounded-full bg-brand-accent-red animate-pulse" title="Nuevo mensaje sin leer" />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">ID: {t.id}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {getStatusBadge(t.status)}
                          <span className="text-[9px] text-gray-400 font-medium">
                            {formatRelativeTime(t.updatedAt || t.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Last message preview */}
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed bg-[#0D0D14]/40 p-2 rounded-lg border border-brand-border/10">
                        {lastMsg ? lastMsg.text : 'Sin mensajes aún'}
                      </p>

                      {/* Category tag & Claim button if waiting */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {getCategoryBadge(t.category)}
                          {t.status === 'esperando' && (
                            <span className="text-[9.5px] text-gray-500 font-medium">
                              En cola: {formatRelativeTime(t.createdAt)}
                            </span>
                          )}
                        </div>

                        {t.status === 'esperando' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaim(t.id);
                            }}
                            className={`py-1 px-3 text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                              isUrgent 
                                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                                : 'bg-[#534AB7] hover:bg-[#433A9B]'
                            }`}
                          >
                            <Headset size={12} />
                            Tomar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Interactive Chat & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-brand-surface">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                
                {/* Chat Top Header */}
                <div className="p-4 border-b border-brand-border/20 bg-[#1C1C2E]/40 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      selectedTicket.priority === 'urgente'
                        ? 'bg-gradient-to-tr from-red-600 to-amber-600 shadow-md'
                        : 'bg-gradient-to-tr from-[#534AB7] to-[#7F77DD]'
                    }`}>
                      {selectedTicket.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{selectedTicket.userName}</span>
                        <Badge variant={selectedTicket.userRole === 'producer' ? 'purple' : 'emerald'} className="text-[9px]">
                          {selectedTicket.userRole === 'producer' ? 'PRODUCTOR' : 'ARTISTA'}
                        </Badge>
                        {selectedTicket.priority === 'urgente' && getPriorityBadge(selectedTicket.priority)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-gray-400">
                          {selectedTicket.assignedAdminId 
                            ? `Asignado a: ${verifiedProducersTask.find(u => u.id === selectedTicket.assignedAdminId)?.name || 'Admin'}` 
                            : 'Sin agente asignado'}
                        </span>
                        <span>•</span>
                        {getCategoryBadge(selectedTicket.category)}
                        <span>•</span>
                        <span className="text-[10px] text-gray-500">
                          Creado: {formatRelativeTime(selectedTicket.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Resolve / Delete) */}
                  <div className="flex items-center gap-2">
                    {selectedTicket.status !== 'resuelto' && (
                      <button
                        onClick={() => handleResolve(selectedTicket.id)}
                        className="py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        Marcar Resuelto
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selectedTicket.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                      title="Eliminar ticket e historial"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0D0D14]/70 max-h-[440px] scrollbar-thin text-xs">
                  {selectedTicketMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Inicia la conversación escribiendo un mensaje abajo.
                    </div>
                  ) : (
                    selectedTicketMessages.map((msg) => {
                      const isSupportMsg = msg.senderType === 'support';
                      const isBotMsg = msg.isBot;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            isSupportMsg && !isBotMsg
                              ? 'self-end items-end ml-auto'
                              : isBotMsg
                              ? 'self-center items-center max-w-[90%]'
                              : 'self-start items-start'
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1 px-1">
                            <span className="text-[9px] text-gray-400 font-medium">
                              {isBotMsg ? '🤖 Mensaje del Sistema' : isSupportMsg ? `🛡️ ${msg.userName}` : `👤 ${msg.userName}`}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                              isBotMsg
                                ? 'bg-[#1C1C2E] border border-[#7F77DD]/30 text-indigo-200 text-center rounded-xl'
                                : isSupportMsg
                                ? 'bg-[#534AB7] text-white rounded-tr-none'
                                : 'bg-[#1C1C2E] border border-brand-border/40 text-gray-200 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[8.5px] text-gray-500 mt-1 px-1">
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Quick Reply Presets */}
                <div className="p-2.5 px-4 bg-[#13131F] border-t border-brand-border/20 flex gap-2 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setReplyText('Hola, hemos verificado tu cuenta correctamente. Ya puedes acceder a todas las funciones.')}
                    className="px-2.5 py-1 bg-[#1C1C2E] hover:bg-[#28283E] text-gray-300 rounded-lg text-[10px] font-semibold cursor-pointer shrink-0 transition-all border border-brand-border/30"
                  >
                    🚀 Aprobación KYC
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText('Estimado(a), ¿podrías enviarnos una foto más nítida de tu documento de identidad para validar tu expediente?')}
                    className="px-2.5 py-1 bg-[#1C1C2E] hover:bg-[#28283E] text-gray-300 rounded-lg text-[10px] font-semibold cursor-pointer shrink-0 transition-all border border-brand-border/30"
                  >
                    📸 Foto Borrosa
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText('Hola, estamos procesando tu comprobante de transferencia. Se reflejará en un plazo máximo de 24 horas.')}
                    className="px-2.5 py-1 bg-[#1C1C2E] hover:bg-[#28283E] text-gray-300 rounded-lg text-[10px] font-semibold cursor-pointer shrink-0 transition-all border border-brand-border/30"
                  >
                    💰 Confirmación Pago
                  </button>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-brand-border/20 bg-[#1C1C2E]/40 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe una respuesta para el usuario..."
                    className="flex-1 bg-[#13131F] border border-brand-border/40 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-[#7F77DD] transition-all"
                  />
                  <button
                    type="submit"
                    className="p-2.5 px-5 bg-[#534AB7] hover:bg-[#433A9B] text-white rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 font-bold text-xs shadow-md"
                  >
                    <Send size={13} />
                    Enviar
                  </button>
                </form>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-bg/10">
                <div className="p-4 bg-[#534AB7]/10 rounded-2xl text-[#7F77DD] mb-3">
                  <MessageSquare size={32} />
                </div>
                <h4 className="text-sm font-bold text-white">Sin Ticket Seleccionado</h4>
                <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                  Selecciona uno de los tickets de la lista para ver el historial de mensajes, atender al usuario en tiempo real o marcarlo como resuelto.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
