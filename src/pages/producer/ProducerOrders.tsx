import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  CheckCheck, AlertCircle, Phone, Landmark, Mail, ClipboardCopy, 
  DollarSign, Receipt, Info, ThumbsUp, ThumbsDown, Share2, Send, Clock,
  MessageSquare, Copy, ExternalLink, ShieldCheck, Filter, RefreshCw, Eye,
  Search
} from 'lucide-react';

export const ProducerOrders: React.FC = () => {
  const { orders, updateOrder, addToast } = useApp();

  // Filter orders for Producer Carlos/Flow Habano
  const myOrders = useMemo(() => {
    return orders.filter(o => o.producerId === 'p2' || o.producerId === 'carlos_producer');
  }, [orders]);

  // Tab Selection state for order status tracking filters
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const counts = useMemo(() => {
    return {
      pending: myOrders.filter(o => o.status === 'pending' || o.status === 'verified').length,
      approved: myOrders.filter(o => o.status === 'approved').length,
      rejected: myOrders.filter(o => o.status === 'rejected').length,
    };
  }, [myOrders]);

  const [searchOrderId, setSearchOrderId] = useState('');

  const filteredOrders = useMemo(() => {
    let list = myOrders;
    if (activeTab === 'pending') {
      list = myOrders.filter(o => o.status === 'pending' || o.status === 'verified');
    } else {
      list = myOrders.filter(o => o.status === activeTab);
    }
    
    if (searchOrderId.trim()) {
      list = list.filter(o => o.id.toLowerCase().includes(searchOrderId.trim().toLowerCase()));
    }
    return list;
  }, [myOrders, activeTab, searchOrderId]);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const liveSelectedOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find(o => o.id === selectedOrder.id) || selectedOrder;
  }, [orders, selectedOrder]);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [expirationHours, setExpirationHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);
  const [expandedReceiptImage, setExpandedReceiptImage] = useState<string | null>(null);

  const handleApproveInitiate = (order: any) => {
    setSelectedOrder(order);
    setIsReleaseModalOpen(true);
    setGeneratedLink(order.downloadUrl || '');
    setIsLinkGenerated(!!order.downloadUrl);
  };

  const handleGenerateSecureLink = () => {
    if (!liveSelectedOrder) return;
    const randomToken = Math.random().toString(36).substring(2, 11);
    const secureUrl = `https://dcubanbeats.cu/downloads/secure_token_${randomToken}_${liveSelectedOrder.id}`;
    setGeneratedLink(secureUrl);
    setIsLinkGenerated(true);
    addToast('¡Enlace seguro generado exitosamente!', 'success');
  };

  const handleRegenerateSecureLink = () => {
    if (!liveSelectedOrder) return;
    const randomToken = Math.random().toString(36).substring(2, 11);
    const secureUrl = `https://dcubanbeats.cu/downloads/secure_token_${randomToken}_${liveSelectedOrder.id}`;
    setGeneratedLink(secureUrl);
    setIsLinkGenerated(true);
    updateOrder(liveSelectedOrder.id, 'approved', undefined, secureUrl);
    addToast('¡Nuevo enlace seguro generado y actualizado!', 'success');
  };

  const handleConfirmFullApproval = () => {
    if (!liveSelectedOrder) return;
    updateOrder(liveSelectedOrder.id, 'approved', undefined, generatedLink);
    addToast('Orden liberada y completada con éxito. El enlace queda expuesto en este panel.', 'success');
  };

  const safeCopyText = (text: string, successMessage: string) => {
    let copiedWithClipboard = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        copiedWithClipboard = true;
        addToast(successMessage, 'success');
      }
    } catch (e) {
      // Access to navigator.clipboard is blocked by a permissions policy in iframe
    }

    if (!copiedWithClipboard) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          addToast(successMessage, 'success');
        } else {
          addToast('No se pudo copiar de forma automática. Por favor selecciónalo manualmente.', 'error');
        }
      } catch (err) {
        addToast('No se pudo copiar de forma automática. Por favor selecciónalo manualmente.', 'error');
      }
    }
  };

  const handleCopyGeneratedLink = () => {
    safeCopyText(generatedLink, 'Enlace de descarga copiado al portapapeles');
  };

  const handleVerify = (orderId: string) => {
    updateOrder(orderId, 'verified');
  };

  const handleRevertToPending = (orderId: string) => {
    updateOrder(orderId, 'pending');
  };

  const handleRevertToVerified = (orderId: string) => {
    updateOrder(orderId, 'verified');
  };

  const handleReject = (orderId: string) => {
    updateOrder(orderId, 'rejected');
  };

  const handleCopySMS = (text: string) => {
    safeCopyText(text, 'SMS copiado al portapapeles');
  };

  return (
    <div className="space-y-8 text-left text-white bg-brand-bg">
      
      {/* Header section */}
      <div className="border-b border-brand-border/40 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="text-[#7F77DD]" /> Sistema de Pedidos y Trazabilidad de Pagos
          </h2>
          <p className="text-xs text-gray-400">
            Controla y haz el seguimiento de cada transacción desde que se registra hasta la liberación final de los beats.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'pending' 
              ? 'bg-[#1C1C2E] border-amber-500 shadow-lg shadow-amber-500/5' 
              : 'bg-brand-surface border-brand-border/40 hover:border-gray-600'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Pendientes</span>
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xl font-bold font-mono text-white block mt-1">{counts.pending}</span>
        </button>

        <button 
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'approved' 
              ? 'bg-[#1C1C2E] border-emerald-500 shadow-lg shadow-emerald-500/5' 
              : 'bg-brand-surface border-brand-border/40 hover:border-gray-600'
          }`}
        >
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Entregados</span>
          <span className="text-xl font-bold font-mono text-white block mt-1">{counts.approved}</span>
        </button>

        <button 
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'rejected' 
              ? 'bg-[#1C1C2E] border-red-500 shadow-lg shadow-red-500/5' 
              : 'bg-brand-surface border-brand-border/40 hover:border-gray-600'
          }`}
        >
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Rechazados</span>
          <span className="text-xl font-bold font-mono text-white block mt-1">{counts.rejected}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#131322]/40 border border-brand-border/30 rounded-xl p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Buscar pedido por ID..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0C0C14] border border-brand-border/55 rounded-lg text-xs text-white focus:border-[#7F77DD] focus:outline-none placeholder:text-gray-500 font-mono"
          />
        </div>
        <div className="text-[11px] text-gray-400">
          {searchOrderId.trim() ? (
            <span>Filtrando pedidos que contienen ID <strong className="text-indigo-300 font-mono">"{searchOrderId}"</strong></span>
          ) : (
            <span>Usa el buscador para localizar un ID de pedido específico</span>
          )}
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left col: list of filtered validations */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs header for status filtering */}
          <div className="flex border-b border-brand-border/40 overflow-x-auto gap-2 pb-0.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'pending' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Pendientes ({counts.pending})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'approved' 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Entregados ({counts.approved})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'rejected' 
                  ? 'border-red-500 text-red-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Rechazados ({counts.rejected})
            </button>
          </div>

          {/* List orders */}
          {filteredOrders.length === 0 ? (
            <div className="py-16 bg-brand-surface text-center rounded-2xl border border-brand-border/40 text-gray-400 space-y-2">
              <Info className="mx-auto text-gray-550" size={32} />
              <p className="text-xs font-medium">No se encontraron transacciones en esta categoría.</p>
              <p className="text-[10px] text-gray-500">Usa las pestañas de arriba para cambiar el filtro de estado.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((ord) => (
                <div 
                  key={ord.id}
                  className="bg-brand-surface border border-brand-border/40 rounded-2xl p-6 shadow-sm space-y-4 hover:border-indigo-500/30 transition-all duration-200"
                >
                  {/* Top order summary header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-brand-border/30">
                    <div>
                      <span className="font-mono font-bold text-white block text-xs">Pedido ID: {ord.id}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Comprador: {ord.buyerName} • {ord.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="px-2.5 py-0.5 bg-[#534AB7]/20 border border-[#534AB7]/30 text-[#7F77DD] rounded-full text-[10px] font-bold">
                        {ord.method}
                      </span>
                      
                      {ord.status === 'pending' && (
                        <span className="px-2.5 py-0.5 bg-amber-950/20 text-[#EF9F27] border border-[#EF9F27]/30 rounded-full text-[10px] font-bold animate-pulse">
                          Pendiente Verificación
                        </span>
                      )}
                      {ord.status === 'verified' && (
                        <span className="px-2.5 py-0.5 bg-[#534AB7]/20 text-[#7F77DD] border border-[#7F77DD]/30 rounded-full text-[10px] font-bold">
                          Pago Verificado
                        </span>
                      )}
                      {ord.status === 'approved' && (
                        <span className="px-2.5 py-0.5 bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                          Entregado ✓
                        </span>
                      )}
                      {ord.status === 'rejected' && (
                        <span className="px-2.5 py-0.5 bg-red-950/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold">
                          Rechazado ✕
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Beat details & cost */}
                  <div className="flex justify-between items-center bg-brand-card/40 p-3.5 rounded-xl border border-brand-border/20">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs text-indigo-300 block uppercase font-bold text-[9px] tracking-wider">Pista Musical</span>
                      <span className="text-xs font-bold text-white block">{ord.beatTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-450 block uppercase font-bold text-[9px] tracking-wider">Monto</span>
                      <span className="font-mono text-xs font-bold text-[#7F77DD]">${ord.amount} {ord.currency}</span>
                    </div>
                  </div>

                  {/* Progress Tracker / Trazabilidad */}
                  <div className="py-4 border-t border-b border-brand-border/20 my-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider">
                      <span>Progreso de Operación</span>
                      <span className="text-indigo-300">
                        {ord.status === 'pending' && 'Paso 1: En Espera de Verificación'}
                        {ord.status === 'verified' && 'Paso 2: Fondos Confirmados en Cuenta'}
                        {ord.status === 'approved' && 'Paso 3: Archivos Entregados al Artista'}
                        {ord.status === 'rejected' && 'Operación Cancelada'}
                      </span>
                    </div>
                    
                    <div className="relative mt-3 px-6">
                      {/* Background Line */}
                      <div className="absolute top-[8px] left-[34px] right-[34px] h-[3px] bg-[#16162A] rounded-full" />
                      
                      {/* Filled Line */}
                      <div 
                        className="absolute top-[8px] left-[34px] h-[3px] rounded-full transition-all duration-500"
                        style={{
                          right: ord.status === 'pending'
                            ? 'calc(100% - 34px)'
                            : ord.status === 'verified'
                              ? '50%'
                              : '34px',
                          backgroundColor: ord.status === 'rejected'
                            ? '#EF4444' // red-500
                            : ord.status === 'pending'
                              ? '#F59E0B' // amber-500
                              : ord.status === 'verified'
                                ? '#7F77DD' // brand-purple
                                : '#10B981' // emerald-500
                        }}
                      />
                      
                      {/* Steps dots */}
                      <div className="relative flex justify-between z-10">
                        {/* Step 1: Registered */}
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                            ord.status === 'rejected'
                              ? 'bg-red-950 border-red-500 text-red-400'
                              : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                          }`}>
                            {ord.status === 'rejected' ? '✕' : '1'}
                          </div>
                          <span className="text-[9px] mt-1 font-bold uppercase tracking-wide">Recibido</span>
                        </div>

                        {/* Step 2: Verified */}
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                            ord.status === 'rejected'
                              ? 'bg-red-950 border-red-500 text-red-400'
                              : ord.status === 'approved' || ord.status === 'verified'
                                ? 'bg-indigo-950 border-[#7F77DD] text-indigo-300'
                                : 'bg-brand-surface border-brand-border/60 text-gray-500'
                          }`}>
                            2
                          </div>
                          <span className="text-[9px] mt-1 font-bold uppercase tracking-wide">Verificado</span>
                        </div>

                        {/* Step 3: Completed */}
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                            ord.status === 'approved'
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                              : ord.status === 'rejected'
                                ? 'bg-red-950 border-red-500 text-red-400'
                                : 'bg-brand-surface border-brand-border/60 text-gray-500'
                          }`}>
                            3
                          </div>
                          <span className="text-[9px] mt-1 font-bold uppercase tracking-wide">Entregado</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buyer confirmation fields */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      {ord.method?.toLowerCase().includes('qvapay') 
                        ? 'Detalles de la transacción digital QvaPay:' 
                        : 'Comprobante SMS pegado por el cliente:'}
                    </span>
                    {ord.verificationSMS ? (
                      <div className="relative bg-[#0F172A] text-slate-300 font-mono text-[11px] p-4 rounded-xl border border-slate-800 leading-relaxed group">
                        <p className="pr-10 whitespace-pre-wrap">{ord.verificationSMS}</p>
                        <button 
                          onClick={() => handleCopySMS(ord.verificationSMS!)}
                          className="absolute right-3 top-3 p-1 bg-white/5 hover:bg-white/10 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Copiar comprobante completo"
                        >
                          <ClipboardCopy size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-950/20 text-red-400 border border-red-900/30 rounded-xl flex items-center gap-2 text-xs">
                        <AlertCircle size={14} />
                        <span>El comprador no especificó SMS completo. Solo ID de Transacción.</span>
                      </div>
                    )}

                    {ord.receiptUrl && (
                      <div className="space-y-1.5 text-left mt-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Captura del comprobante adjuntado:</span>
                        <div 
                          className="relative bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden max-w-xs group cursor-pointer transition-all hover:border-[#7F77DD]/50" 
                          onClick={() => setExpandedReceiptImage(ord.receiptUrl)}
                        >
                          <img 
                            src={ord.receiptUrl} 
                            alt="Comprobante de pago" 
                            className="max-h-28 object-contain w-full bg-black/40 group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                            Click para ampliar comprobante
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 text-[11px]">
                      <span className="text-gray-400">ID Operación: <strong className="font-mono text-indigo-200">{ord.transactionId || 'No especificado'}</strong></span>
                    </div>

                    {/* Show saved download URL if the order is approved/completed */}
                    {ord.status === 'approved' && ord.downloadUrl && (
                      <div className="bg-[#101B2B] border border-indigo-950 p-4 rounded-xl space-y-2 text-left">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase block tracking-wider">Contrato y Archivos de descarga Liberados:</span>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={ord.downloadUrl}
                            className="flex-grow bg-[#0A0F1D] border border-slate-800 text-[11px] font-mono p-2.5 rounded-lg text-white outline-none" 
                          />
                          <button 
                            onClick={() => safeCopyText(ord.downloadUrl!, 'Enlace de descarga copiado con éxito')}
                            className="px-3 bg-[#534AB7] hover:bg-[#433A9B] text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="Copiar Enlace"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verification action choices buttons based on dynamic status transitions */}
                  <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-brand-border/10">
                    
                    {/* IF PENDING OR VERIFIED */}
                    {(ord.status === 'pending' || ord.status === 'verified') && (
                      <>
                        <button
                          onClick={() => handleReject(ord.id)}
                          className="px-3 py-1.5 border border-red-900/40 text-red-400 bg-transparent hover:bg-red-950/20 text-[11px] font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5"
                        >
                          <ThumbsDown size={12} />
                          Rechazar Pago
                        </button>
                        
                        <button
                          disabled={ord.status === 'verified'}
                          onClick={() => handleVerify(ord.id)}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-xl inline-flex items-center gap-1.5 transition-all border ${
                            ord.status === 'verified'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-60 cursor-not-allowed'
                              : 'bg-[#534AB7]/20 border-[#534AB7]/40 text-[#7F77DD] hover:bg-[#534AB7]/30 cursor-pointer'
                          }`}
                        >
                          <CheckCheck size={12} />
                          {ord.status === 'verified' ? 'Fondos Verificados ✓' : 'Verificar Fondos'}
                        </button>

                        <button
                          onClick={() => handleApproveInitiate(ord)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
                        >
                          <ThumbsUp size={12} />
                          Liberar Descarga
                        </button>
                      </>
                    )}

                    {/* IF APPROVED (COMPLETED) */}
                    {ord.status === 'approved' && (
                      <button
                        onClick={() => handleApproveInitiate(ord)}
                        className="px-3 py-1.5 bg-brand-card hover:bg-brand-card/80 border border-brand-border/50 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye size={12} />
                        Ver / Editar Enlace
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col: checklist summary instruction guidelines */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress system guide explanation */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 border-b border-brand-border/20 pb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Guía del Trazado de Pedidos
            </h4>
            
            <div className="text-xs text-gray-400 space-y-4 leading-relaxed font-sans text-left">
              <p>D'Cuban Beats posee un sistema robusto de trazabilidad en 3 pasos para asegurar transacciones seguras en Cuba:</p>
              
              <div className="space-y-3.5">
                <div className="flex gap-2">
                  <span className="w-5 h-5 bg-amber-500/10 text-amber-400 font-mono text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold border border-amber-500/20">1</span>
                  <div>
                    <strong className="text-gray-200 text-[11px] block">Pendiente de Validación</strong>
                    <span>El cliente sube su comprobante e ID. Debes revisar tu cuenta bancaria o Transfermóvil.</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 bg-[#534AB7]/10 text-[#7F77DD] font-mono text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold border border-[#534AB7]/20">2</span>
                  <div>
                    <strong className="text-gray-200 text-[11px] block">Pago Verificado (Fondos a Salvo)</strong>
                    <span>Marcas el pago como Verificado cuando el importe está asegurado en tu saldo. Esto notifica al artista brindándole tranquilidad.</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold border border-emerald-500/20">3</span>
                  <div>
                    <strong className="text-gray-200 text-[11px] block">Entregado / Liberado</strong>
                    <span>Generas el enlace seguro de descarga y confirmas la liberación. Se envía el correo electrónico, SMS e in-app con los STEMS de alta calidad.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-brand-border/20 pb-2">Manual de Cobro Seguro</h4>
            
            <ul className="text-xs text-gray-400 space-y-3.5 leading-relaxed font-sans">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#534AB7]/20 text-[#7F77DD] font-mono text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</span>
                <span>Abre la app de tu banco o revisa los SMS del número de origen oficial de Transfermóvil (+5305 o similar).</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#534AB7]/20 text-[#7F77DD] font-mono text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</span>
                <span>Compara el **Número de Transacción** y el **Importe** con el texto provisto por el comprador a la izquierda.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#534AB7]/20 text-[#7F77DD] font-mono text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</span>
                <span>Si coinciden plenamente, clica **Aprobar**. Esto liberará los archivos originales MP3/WAV listos para descargar al cliente.</span>
              </li>
            </ul>

            <div className="bg-amber-955/20 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2 animate-pulse mt-2">
              <Info size={14} className="text-[#EF9F27] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-200 leading-normal">
                No apruebes transferencias parciales o con firmas del banco dudosas digitales para evitar estafas.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: EXCLUSIVITY / BEAT RELEASE & LINK GENERATION */}
      <Modal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        title={liveSelectedOrder?.status === 'approved' ? "Gestión de Licencia y Descarga Activa" : "Validar Pago y Generar Licencia de Descarga"}
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left pt-2 text-white bg-brand-surface">
          {liveSelectedOrder?.status === 'approved' ? (
            <div className="p-3 bg-emerald-950/20 text-emerald-300 border border-emerald-900/30 rounded-xl text-xs space-y-1">
              <span className="font-bold block text-emerald-400">✓ Pedido Entregado</span>
              <p className="text-gray-300">Este pedido de la instrumental <strong className="text-emerald-200">{liveSelectedOrder?.beatTitle}</strong> ha sido completado y entregado con éxito.</p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/20 text-emerald-300 border border-emerald-900/30 rounded-xl text-xs space-y-1">
              <span className="font-bold block text-emerald-400">✓ Pago Verificado</span>
              <p className="text-gray-300">Al aprobar este pedido de la instrumental <strong className="text-emerald-200">{liveSelectedOrder?.beatTitle}</strong>, se generará una licencia temporal de descarga.</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider flex items-center gap-1">
              <Clock size={13} />
              Duración del Enlace de Descarga
            </label>
            <select
              value={expirationHours}
              onChange={(e) => setExpirationHours(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7]/10 text-xs outline-none"
            >
              <option value="12" className="bg-brand-surface">12 Horas de disponibilidad</option>
              <option value="24" className="bg-brand-surface">24 Horas de disponibilidad</option>
              <option value="48" className="bg-brand-surface">48 Horas de disponibilidad</option>
              <option value="168" className="bg-brand-surface">7 Días de disponibilidad</option>
            </select>
            <p className="text-[10px] text-gray-400">Pasado este tiempo, el enlace expirará automáticamente por motivos de seguridad anti-piratería musical.</p>
          </div>

          {/* Generate action */}
          {!isLinkGenerated ? (
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleGenerateSecureLink} 
              className="w-full text-xs font-bold gap-1.5"
            >
              <ShieldCheck size={14} />
              Generar Enlace Seguro de Descarga
            </Button>
          ) : (
            <div className="space-y-3 p-3 bg-brand-card/40 border border-brand-border/30 rounded-xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-300 block">Enlace de Descarga de Alta Definición:</span>
                  {liveSelectedOrder?.status === 'approved' && (
                    <button
                      type="button"
                      onClick={handleRegenerateSecureLink}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer outline-none bg-transparent border-none"
                    >
                      Regenerar Nuevo Enlace
                    </button>
                  )}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-grow bg-brand-surface border border-brand-border/40 p-2 text-[10.5px] rounded-lg font-mono outline-none text-white"
                  />
                  <button 
                    onClick={handleCopyGeneratedLink}
                    className="p-2 bg-[#534AB7] text-white hover:bg-[#433A9B] rounded-lg transition-colors cursor-pointer"
                    title="Copiar enlace"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Instant messenger share options */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Enviar directamente por:</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent('🎹 ¡Hola! Tu pago ha sido validado en CubaBeats. Aquí tienes tu enlace de descarga seguro (disponible por ' + expirationHours + 'h): ' + generatedLink)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 bg-[#25D366] hover:opacity-90 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-opacity"
                  >
                    <MessageSquare size={12} />
                    WhatsApp
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=${encodeURIComponent('🎹 Tu pago ha sido validado en CubaBeats. Aquí tienes tu descarga por ' + expirationHours + 'h: ' + generatedLink)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 bg-[#0088cc] hover:opacity-90 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-opacity"
                  >
                    <Send size={11} className="-rotate-12" />
                    Telegram
                  </a>

                  <button
                    onClick={() => {
                      safeCopyText(generatedLink, 'Enlace de descarga copiado. Compártelo con el cliente por tu vía preferente.');
                    }}
                    className="px-2 py-1.5 bg-brand-surface hover:bg-brand-card border border-brand-border/50 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <Mail size={12} />
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex gap-2 justify-end pt-3 border-t border-brand-border/30">
            <Button variant="ghost" size="sm" onClick={() => setIsReleaseModalOpen(false)}>
              {liveSelectedOrder?.status === 'approved' ? "Cerrar" : "Descartar"}
            </Button>
            {liveSelectedOrder?.status !== 'approved' && (
              <Button 
                variant="primary" 
                size="sm" 
                disabled={!isLinkGenerated}
                onClick={handleConfirmFullApproval}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:opacity-50"
              >
                Aprobar y Completar Pedido ✓
              </Button>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Expanded Receipt Image Modal Overlay */}
      {expandedReceiptImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setExpandedReceiptImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <img 
              src={expandedReceiptImage} 
              alt="Comprobante de pago ampliado" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <p className="text-xs text-white/60 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md">
              Haga clic en cualquier lugar para cerrar la vista previa
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
