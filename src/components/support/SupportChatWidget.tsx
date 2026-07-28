import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { MessageSquare, Send, X, ChevronDown, Headset } from 'lucide-react';

export const SupportChatWidget: React.FC = () => {
  const { user, supportMessages, sendSupportMessage, markSupportAsReadByUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filter messages specifically for this logged-in user (safely guarded)
  const myMessages = useMemo(() => {
    if (!user) return [];
    return supportMessages.filter(m => m.userId === user.id);
  }, [supportMessages, user?.id]);

  // Calculate unread messages count from support
  const unreadCount = useMemo(() => {
    return myMessages.filter(m => m.senderType === 'support' && !m.readByUser).length;
  }, [myMessages]);

  // Scroll to bottom on new messages or when opened
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, myMessages]);

  // Mark as read when widget is open and has unread messages
  useEffect(() => {
    if (isOpen && unreadCount > 0 && markSupportAsReadByUser && user) {
      markSupportAsReadByUser(user.id);
    }
  }, [isOpen, unreadCount, user?.id, markSupportAsReadByUser]);

  // Guard: Only artists (client) and producers can see the support chat widget (placed after hooks!)
  if (!user || (user.role !== 'client' && user.role !== 'producer')) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendSupportMessage(
      user.id,
      user.artistName || user.name,
      user.role as 'client' | 'producer',
      'user',
      inputText.trim()
    );

    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 text-left select-none font-sans">
      {/* Expanded Chat Dialog */}
      {isOpen ? (
        <div className="bg-brand-surface border border-brand-border/50 rounded-2xl w-80 sm:w-85 h-[420px] shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#534AB7] to-[#7F77DD] p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Headset size={16} />
              </div>
              <div>
                <span className="font-extrabold text-xs uppercase tracking-wider block">Soporte Técnico</span>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Gestor de Soporte en Línea
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-bg/60 scrollbar-thin">
            {myMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 bg-[#534AB7]/10 rounded-full flex items-center justify-center text-[#7F77DD] mb-2.5">
                  <Headset size={18} />
                </div>
                <h4 className="text-xs font-bold text-white">¿Cómo podemos ayudarte hoy?</h4>
                <p className="text-[10.5px] text-gray-400 leading-relaxed max-w-[200px] mt-1">
                  Reporta cualquier incidencia de cobros, dudas sobre el KYC o inquietudes técnicas. Te responderemos de inmediato.
                </p>
              </div>
            ) : (
              myMessages.map((msg) => {
                const isMe = msg.senderType === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start'}`}
                  >
                    <div
                      className={`p-2.5 px-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#534AB7] text-white rounded-tr-none'
                          : 'bg-[#1C1C2E] border border-brand-border/40 text-gray-300 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-brand-border/20 bg-[#1C1C2E]/40 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Reportar incidencia o duda..."
              className="flex-1 bg-brand-bg border border-brand-border/40 rounded-xl py-2 px-3.5 text-xs text-white outline-none focus:border-[#7F77DD] transition-all"
            />
            <button
              type="submit"
              className="p-2 bg-[#534AB7] hover:bg-[#433A9B] text-white rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
            >
              <Send size={14} className="m-0.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button with Unread Badge */
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all border border-[#7F77DD]/40 group"
          title="Soporte Técnico flotante"
        >
          <MessageSquare size={20} className="group-hover:rotate-6 transition-transform" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-accent-red text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-brand-bg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
