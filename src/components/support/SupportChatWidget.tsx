import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  MessageSquare, Send, X, Headset, Bot, User, CheckCircle2, 
  Clock, AlertCircle, Sparkles, ChevronRight, ArrowLeft, RefreshCw, HelpCircle
} from 'lucide-react';
import { SupportTicket } from '../../types';

interface BotFAQ {
  id: string;
  question: string;
  answer: string;
}

interface BotCategory {
  id: 'pagos' | 'kyc' | 'cuenta' | 'otro';
  title: string;
  icon: string;
  description: string;
  faqs: BotFAQ[];
}

const BOT_CATEGORIES: BotCategory[] = [
  {
    id: 'pagos',
    title: 'Pagos y Monedas',
    icon: '💳',
    description: 'Transfermóvil, EnZona, MLC/CUP, tasas y comprobantes',
    faqs: [
      {
        id: 'p_1',
        question: '¿Cómo subo mi comprobante de pago por Transfermóvil o EnZona?',
        answer: 'Al adquirir un beat o un plan, selecciona el método de pago por transferencia. Realiza el envío a la cuenta/teléfono indicado y luego sube la captura del comprobante o escribe el ID de transacción en la pantalla de verificación. Nuestro equipo lo valida en pocos minutos.'
      },
      {
        id: 'p_2',
        question: '¿Cómo funcionan las tasas de cambio (CUP / MLC / NLC)?',
        answer: 'Nuestras tasas de cambio se calculan y sincronizan automáticamente según las referencias del mercado cambiario. El importe en la moneda de tu método de pago seleccionado se muestra de forma exacta sin comisiones ocultas.'
      },
      {
        id: 'p_3',
        question: '¿Por qué no se ha acreditado mi compra de beats?',
        answer: 'Si pagaste directo al productor mediante transferencia, el comprobante requiere confirmación del productor o soporte. Tan pronto se verifique, tus descargas de archivos WAV, MP3 y licencias se activarán en tu perfil de artista.'
      }
    ]
  },
  {
    id: 'kyc',
    title: 'Verificación KYC',
    icon: '🪪',
    description: 'Requisitos, carné de identidad, tiempos y validación',
    faqs: [
      {
        id: 'k_1',
        question: '¿Por qué es obligatoria la verificación de identidad (KYC)?',
        answer: 'El KYC garantiza la protección de derechos de autor y combate el fraude en la venta de producciones musicales. Además, es un requisito indispensable para que los productores puedan activar sus cuentas de cobro directo.'
      },
      {
        id: 'k_2',
        question: '¿Qué documentos son válidos para verificar mi cuenta?',
        answer: 'Aceptamos Carné de Identidad cubano legible (anverso y reverso) o Pasaporte oficial vigente, junto con una fotografía selfie nítida sosteniendo tu documento.'
      },
      {
        id: 'k_3',
        question: '¿Cuánto tiempo tarda la aprobación de mi KYC?',
        answer: 'El equipo de administración procesa las solicitudes KYC en un plazo habitual de 1 a 6 horas hábiles. Recibirás una notificación y el estado de tu cuenta se actualizará a Verificado.'
      }
    ]
  },
  {
    id: 'cuenta',
    title: 'Cuenta y Planes',
    icon: '👤',
    description: 'Planes Pro/Elite, 2FA, periodo de gracia y perfil',
    faqs: [
      {
        id: 'c_1',
        question: '¿Qué diferencias existen entre los Planes Gratis, Pro y Elite?',
        answer: 'El Plan Gratis permite subir hasta 3 beats. Los planes Pro y Elite amplían los límites de subida de beats y librerías de sonido, reducen comisiones de venta al 0% y otorgan soporte técnico prioritario.'
      },
      {
        id: 'c_2',
        question: '¿Cómo funciona el período de gracia de 30 días?',
        answer: 'Si tu suscripción premium vence, dispones de 30 días de gracia con tus ventas activas para renovar tu plan. Si no renuevas antes de agotarse los 30 días de gracia, tus ventas se pausarán temporalmente.'
      },
      {
        id: 'c_3',
        question: '¿Cómo activo la autenticación en dos pasos (2FA)?',
        answer: 'Ve a tu perfil de usuario, activa la casilla de Verificación en 2 Pasos (2FA) y guarda tu código de seguridad. Se te solicitará para proteger tus inicios de sesión.'
      }
    ]
  },
  {
    id: 'otro',
    title: 'Dudas Generales / Otro',
    icon: '❓',
    description: 'Licencias, descargas, contacto con productores y soporte',
    faqs: [
      {
        id: 'o_1',
        question: '¿Qué diferencia hay entre Licencia Básica y Exclusiva?',
        answer: 'La Licencia Básica te da derechos de streaming limitados (no exclusivos). La Licencia Exclusiva retira el beat del catálogo público y te transfiere los derechos totales de explotación comercial.'
      },
      {
        id: 'o_2',
        question: '¿Cómo puedo contactar a un productor directamente?',
        answer: 'Puedes ingresar al perfil público del productor o en la ficha de cualquiera de sus beats y presionar el botón de Mensaje Directo para chatear.'
      },
      {
        id: 'o_3',
        question: '¿Qué hacer si un archivo WAV o Stems falla en la descarga?',
        answer: 'Si experimentas problemas con un enlace de descarga, pulsa en "Quiero hablar con soporte" para que un agente regenere tus enlaces de descarga de manera inmediata.'
      }
    ]
  }
];

export const SupportChatWidget: React.FC = () => {
  const { 
    user, 
    supportTickets, 
    supportMessages, 
    sendSupportMessage, 
    escalateTicket,
    markSupportAsReadByUser,
    verifiedProducersTask
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<'pagos' | 'kyc' | 'cuenta' | 'otro' | null>(null);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Find active ticket for this user
  const activeTicket = useMemo(() => {
    if (!user) return undefined;
    // Prefer non-resolved ticket, or latest
    const userTickets = supportTickets.filter(t => t.userId === user.id);
    return userTickets.find(t => t.status !== 'resuelto') || userTickets[0];
  }, [supportTickets, user?.id]);

  // Messages for active ticket or for this user
  const myMessages = useMemo(() => {
    if (!user) return [];
    if (activeTicket) {
      return supportMessages.filter(m => m.ticketId === activeTicket.id || (m.userId === user.id && !m.ticketId));
    }
    return supportMessages.filter(m => m.userId === user.id);
  }, [supportMessages, activeTicket, user?.id]);

  // Check if any admin is currently online
  const isAnyAdminOnline = useMemo(() => {
    return (
      verifiedProducersTask.some(u => u.role === 'admin' && u.isSupportOnline) ||
      (user?.role === 'admin' && user?.isSupportOnline)
    );
  }, [verifiedProducersTask, user]);

  // Admin assigned name if live
  const assignedAdminName = useMemo(() => {
    if (!activeTicket?.assignedAdminId) return 'Gestor de Soporte';
    const admin = verifiedProducersTask.find(u => u.id === activeTicket.assignedAdminId);
    return admin?.name || 'Gestor de Soporte';
  }, [activeTicket?.assignedAdminId, verifiedProducersTask]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return myMessages.filter(m => m.senderType === 'support' && !m.readByUser).length;
  }, [myMessages]);

  // Auto-scroll on message updates
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, myMessages.length, activeFaqId, selectedCategoryId, activeTicket?.status]);

  // Mark as read when opened
  useEffect(() => {
    if (isOpen && unreadCount > 0 && markSupportAsReadByUser && user) {
      markSupportAsReadByUser(activeTicket?.id || user.id);
    }
  }, [isOpen, unreadCount, user?.id, activeTicket?.id, markSupportAsReadByUser]);

  // Only artists (client) and producers see this widget
  if (!user || (user.role !== 'client' && user.role !== 'producer')) {
    return null;
  }

  const currentTicketId = activeTicket?.id || `ticket_${user.id}_${Date.now()}`;
  const isBotPhase = !activeTicket || activeTicket.status === 'bot';
  const isWaitingPhase = activeTicket?.status === 'esperando';
  const isLivePhase = activeTicket?.status === 'en_vivo';
  const isResolvedPhase = activeTicket?.status === 'resuelto';

  const handleSelectCategory = (catId: 'pagos' | 'kyc' | 'cuenta' | 'otro') => {
    setSelectedCategoryId(catId);
    setActiveFaqId(null);
  };

  const handleSelectFaq = (faq: BotFAQ) => {
    setActiveFaqId(faq.id);
  };

  const handleEscalate = (category?: SupportTicket['category']) => {
    const chosenCategory = category || selectedCategoryId || 'otro';
    escalateTicket(currentTicketId, chosenCategory);
    setSelectedCategoryId(null);
    setActiveFaqId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isBotPhase || isResolvedPhase) return;

    sendSupportMessage(
      currentTicketId,
      user.id,
      user.artistName || user.name,
      user.role as 'client' | 'producer',
      'user',
      inputText.trim(),
      false
    );

    setInputText('');
  };

  const selectedCategoryObj = BOT_CATEGORIES.find(c => c.id === selectedCategoryId);

  return (
    <div className="fixed bottom-6 right-6 z-50 text-left select-none font-sans" id="support-chat-widget">
      {isOpen ? (
        <div className="bg-[#13131F] border border-[rgba(127,119,221,0.3)] rounded-2xl w-[340px] sm:w-[380px] h-[520px] shadow-2xl flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 duration-200">
          
          {/* 1. Header */}
          <div className="bg-gradient-to-r from-[#2B2663] via-[#3E388D] to-[#534AB7] p-3.5 text-white flex justify-between items-center shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/15">
                {isBotPhase ? <Bot size={16} /> : <Headset size={16} />}
              </div>
              <div>
                <span className="font-extrabold text-xs tracking-wide block text-white flex items-center gap-1.5">
                  Soporte D'Cuban Beats
                  {activeTicket?.category && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded-md font-mono uppercase font-semibold">
                      {activeTicket.category}
                    </span>
                  )}
                </span>
                
                {/* Status Subtitle */}
                <div className="text-[10px] flex items-center gap-1.5 mt-0.5">
                  {isBotPhase && (
                    <span className="text-indigo-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#7F77DD] rounded-full animate-pulse" />
                      Hablando con el bot asistente
                    </span>
                  )}
                  {isWaitingPhase && (
                    <span className="text-amber-300 flex items-center gap-1">
                      <Clock size={11} className="animate-spin text-amber-400" />
                      {isAnyAdminOnline ? 'Buscando un agente...' : 'En cola, te avisaremos'}
                    </span>
                  )}
                  {isLivePhase && (
                    <span className="text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      En línea con {assignedAdminName}
                    </span>
                  )}
                  {isResolvedPhase && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      Caso resuelto
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Cerrar soporte"
            >
              <X size={16} />
            </button>
          </div>

          {/* 2. Chat & Bot Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#0D0D14]/90 scrollbar-thin text-xs">
            
            {/* Bot Welcome Greeting */}
            <div className="flex items-start gap-2 max-w-[92%]">
              <div className="w-6 h-6 rounded-full bg-[#534AB7] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Bot size={12} />
              </div>
              <div className="space-y-1.5">
                <div className="p-3 bg-[#1C1C2E] border border-brand-border/40 text-gray-200 rounded-2xl rounded-tl-none leading-relaxed text-[11.5px] shadow-sm">
                  👋 ¡Hola <span className="font-semibold text-white">{user.artistName || user.name}</span>! 
                  {isBotPhase 
                    ? " Soy el asistente virtual. Selecciona el tema de tu consulta para resolverla al instante:"
                    : " Tu consulta está siendo gestionada por nuestro sistema de tickets."}
                </div>
              </div>
            </div>

            {/* BOT INTERACTIVE MENU (Only in bot phase) */}
            {isBotPhase && (
              <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                
                {/* Category Selection View */}
                {!selectedCategoryId ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
                      Categorías frecuentes:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {BOT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className="p-2.5 bg-[#181828] hover:bg-[#232338] border border-brand-border/40 hover:border-[#7F77DD]/60 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[64px]"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{cat.icon}</span>
                            <span className="font-bold text-white text-[11px] group-hover:text-brand-primary-light transition-colors">
                              {cat.title}
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-400 leading-tight line-clamp-2">
                            {cat.description}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Quick escalation directly without choosing category */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleEscalate('otro')}
                        className="w-full py-2 px-3 bg-[#534AB7]/15 hover:bg-[#534AB7]/30 border border-[#7F77DD]/30 text-indigo-300 hover:text-white rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Headset size={13} className="text-[#7F77DD]" />
                        Ninguna de estas, quiero hablar con soporte
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Sub-questions of the selected category */
                  <div className="space-y-2 bg-[#181828] p-3 rounded-xl border border-brand-border/40">
                    <div className="flex items-center justify-between border-b border-brand-border/20 pb-2">
                      <button
                        onClick={() => {
                          setSelectedCategoryId(null);
                          setActiveFaqId(null);
                        }}
                        className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors font-medium"
                      >
                        <ArrowLeft size={12} />
                        Volver a categorías
                      </button>
                      <span className="text-[10px] font-bold text-indigo-300">
                        {selectedCategoryObj?.icon} {selectedCategoryObj?.title}
                      </span>
                    </div>

                    {/* Questions list */}
                    <div className="space-y-1.5 pt-1">
                      {selectedCategoryObj?.faqs.map((faq) => {
                        const isSelected = activeFaqId === faq.id;
                        return (
                          <div key={faq.id} className="space-y-1.5">
                            <button
                              onClick={() => handleSelectFaq(faq)}
                              className={`w-full text-left p-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-[#534AB7] text-white'
                                  : 'bg-[#12121E] hover:bg-[#1E1E30] text-gray-200 border border-brand-border/30'
                              }`}
                            >
                              <span>{faq.question}</span>
                              <ChevronRight size={12} className={`shrink-0 transition-transform ${isSelected ? 'rotate-90 text-white' : 'text-gray-500'}`} />
                            </button>

                            {/* Bot Answer Dropdown / Bubble */}
                            {isSelected && (
                              <div className="p-3 bg-[#131320] border border-[#7F77DD]/40 rounded-xl text-gray-200 text-[11px] leading-relaxed animate-in fade-in duration-150 space-y-2 shadow-inner">
                                <p>{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Escalation button inside category */}
                    <div className="pt-2 border-t border-brand-border/20">
                      <button
                        onClick={() => handleEscalate(selectedCategoryId)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-[#534AB7] to-[#7F77DD] hover:from-[#433A9B] hover:to-[#6E66CE] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Headset size={13} />
                        Ninguna de estas, quiero hablar con soporte
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conversation Messages (Rendered if escalated or existing messages) */}
            {myMessages.map((msg) => {
              const isMe = msg.senderType === 'user';
              const isBotMsg = msg.isBot;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-0.5 px-1">
                    <span className="text-[9px] text-gray-400 font-medium">
                      {isMe ? 'Tú' : isBotMsg ? '🤖 Asistente' : `🎧 ${msg.userName || 'Soporte'}`}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 px-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[#534AB7] text-white rounded-tr-none'
                        : isBotMsg
                        ? 'bg-[#1C1C2E] border border-[#7F77DD]/30 text-indigo-100 rounded-tl-none'
                        : 'bg-[#181828] border border-brand-border/40 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-gray-500 mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              );
            })}

            {/* Resolved Ticket Prompt */}
            {isResolvedPhase && (
              <div className="p-3 bg-[#1C1C2E] border border-emerald-500/30 rounded-xl text-center space-y-2 mt-2 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 size={14} />
                  ¿Se resolvió tu problema?
                </div>
                <p className="text-[10px] text-gray-400">
                  Si tu duda fue aclarada, puedes cerrar el chat. Si aún requieres asistencia, podemos reabrir la consulta.
                </p>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    Sí, todo bien
                  </button>
                  <button
                    onClick={() => handleEscalate(activeTicket?.category || 'otro')}
                    className="py-1.5 px-3 bg-[#534AB7] hover:bg-[#433A9B] text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    No, necesito ayuda
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 3. Footer / Input Form */}
          <form onSubmit={handleSubmit} className="p-2.5 border-t border-white/5 bg-[#13131F] flex gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isBotPhase || isResolvedPhase}
              placeholder={
                isBotPhase 
                  ? "Selecciona una opción del bot arriba..." 
                  : isResolvedPhase
                  ? "Caso resuelto. Pulsa 'No, necesito ayuda' para reabrir..."
                  : isWaitingPhase
                  ? "Escribe detalles adicionales mientras se asigna un agente..."
                  : "Escribe tu respuesta para el gestor..."
              }
              className={`flex-1 bg-[#1A1A2A] border rounded-xl py-2 px-3 text-xs text-white outline-none transition-all ${
                isBotPhase || isResolvedPhase
                  ? 'border-brand-border/20 opacity-50 cursor-not-allowed text-gray-500'
                  : 'border-brand-border/40 focus:border-[#7F77DD] hover:border-brand-border/60'
              }`}
            />
            <button
              type="submit"
              disabled={isBotPhase || isResolvedPhase || !inputText.trim()}
              className={`p-2 rounded-xl transition-all inline-flex items-center justify-center ${
                isBotPhase || isResolvedPhase || !inputText.trim()
                  ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                  : 'bg-[#534AB7] hover:bg-[#433A9B] text-white cursor-pointer shadow-md'
              }`}
              aria-label="Enviar mensaje de soporte"
            >
              <Send size={14} className="m-0.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Trigger Button */
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all border border-[#7F77DD]/50 group"
          title="Abrir Asistente y Soporte Técnico"
          id="open-support-widget-btn"
        >
          <MessageSquare size={20} className="group-hover:rotate-6 transition-transform text-white" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-accent-red text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-[#0D0D14] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
