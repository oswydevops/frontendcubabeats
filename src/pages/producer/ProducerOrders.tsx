import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  CheckCheck, AlertCircle, Phone, Landmark, Mail, ClipboardCopy, 
  DollarSign, Receipt, Info, ThumbsUp, ThumbsDown, Share2, Send, Clock,
  MessageSquare, Copy, ExternalLink, ShieldCheck
} from 'lucide-react';

export const ProducerOrders: React.FC = () => {
  const { orders, updateOrder, addToast } = useApp();

  // Filter orders for Producer Carlos/Flow Habano
  const myOrders = useMemo(() => {
    return orders.filter(o => o.producerId === 'p2' || o.producerId === 'carlos_producer');
  }, [orders]);

  const [pendingOrders, completedOrders] = useMemo(() => {
    const pend = myOrders.filter(o => o.status === 'pending');
    const comp = myOrders.filter(o => o.status !== 'pending');
    return [pend, comp];
  }, [myOrders]);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [expirationHours, setExpirationHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);

  const handleApproveInitiate = (order: any) => {
    setSelectedOrder(order);
    setIsReleaseModalOpen(true);
    setGeneratedLink('');
    setIsLinkGenerated(false);
  };

  const handleGenerateSecureLink = () => {
    if (!selectedOrder) return;
    const randomToken = Math.random().toString(36).substring(2, 11);
    const secureUrl = `https://cubabeats.cu/downloads/secure_token_${randomToken}_${selectedOrder.id}`;
    setGeneratedLink(secureUrl);
    setIsLinkGenerated(true);
    addToast('¡Enlace seguro generado exitosamente!', 'success');
  };

  const handleConfirmFullApproval = () => {
    if (!selectedOrder) return;
    updateOrder(selectedOrder.id, 'approved');
    setIsReleaseModalOpen(false);
    setSelectedOrder(null);
    addToast('Orden liberada y completada con éxito', 'success');
  };

  const handleCopyGeneratedLink = () => {
    navigator.clipboard.writeText(generatedLink);
    addToast('Enlace de descarga copiado al portapapeles', 'success');
  };

  const handleReject = (orderId: string) => {
    updateOrder(orderId, 'rejected');
    addToast('Orden de pago rechazada con éxito', 'info');
  };

  const handleCopySMS = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('SMS copiado al portapapeles', 'success');
  };

  return (
    <div className="space-y-8 text-left text-white bg-brand-bg">
      
      {/* Header section */}
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Receipt className="text-[#7F77DD]" /> Pedidos de Venta & Validación SMS
        </h2>
        <p className="text-xs text-gray-400">
          Revisa y valida manualmente los pagos móviles de Transfermóvil o EnZona. Compara el SMS adjuntado por el cliente con tus notificaciones de transfermóvil.
        </p>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left col: list of pending validations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Pagos Pendientes de Aprobación ({pendingOrders.length})</h3>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="py-12 bg-brand-surface text-center rounded-2xl border border-brand-border/40 text-gray-400">
              <p className="text-xs">¡Excelente! No tienes transferencias pendientes de verificación.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {pendingOrders.map((ord) => (
                <div 
                  key={ord.id}
                  className="bg-brand-surface border border-brand-border/40 rounded-2xl p-6 shadow-sm space-y-4 hover:border-indigo-500/50 transition-colors"
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
                      <span className="px-2.5 py-0.5 bg-amber-955/20 text-[#EF9F27] border border-[#EF9F27]/30 rounded-full text-[10px] font-bold animate-pulse">
                        Esperando Verificación
                      </span>
                    </div>
                  </div>

                  {/* Beat details & cost */}
                  <div className="flex justify-between items-center bg-brand-card/40 p-3.5 rounded-xl border border-brand-border/20">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs text-indigo-300 block uppercase font-bold text-[9px] tracking-wider">Pista Musical</span>
                      <span className="text-xs font-bold text-white block">{ord.beatTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-450 block uppercase font-bold text-[9px] tracking-wider">A recibir</span>
                      <span className="font-mono text-xs font-bold text-[#7F77DD]">${ord.amount} {ord.currency}</span>
                    </div>
                  </div>

                  {/* Buyer confirmation fields */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Comprobante SMS pegado por el cliente:</span>
                    {ord.verificationSMS ? (
                      <div className="relative bg-[#0F172A] text-slate-300 font-mono text-[11px] p-4 rounded-xl border border-slate-800 leading-relaxed group">
                        <p className="pr-10">{ord.verificationSMS}</p>
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

                    <div className="flex gap-4 text-[11px]">
                      <span className="text-gray-400">ID Operación: <strong className="font-mono text-indigo-200">{ord.transactionId || 'No especificado'}</strong></span>
                    </div>
                  </div>

                  {/* Verification action choices buttons */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => handleReject(ord.id)}
                      className="px-4 py-2 border border-red-900/40 text-red-400 bg-transparent hover:bg-red-950/20 text-xs font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    >
                      <ThumbsDown size={13} />
                      Rechazar Pago
                    </button>
                    
                    <button
                      onClick={() => handleApproveInitiate(ord)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
                    >
                      <ThumbsUp size={13} />
                      Aprobar Liberación
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col: checklist summary instruction guidelines */}
        <div className="lg:col-span-4 space-y-6">
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

          {/* Completed Orders log summary */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Ventas Verificadas Históricas</h4>
            
            {completedOrders.length === 0 ? (
              <span className="text-xs text-gray-400 block pt-1">Ninguna orden completada actualmente.</span>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {completedOrders.map((cord) => (
                  <div key={cord.id} className="flex justify-between items-center text-xs py-1.5 border-b border-brand-border/20 last:border-none">
                    <div className="text-left">
                      <span className="font-semibold text-white block truncate max-w-[140px]">{cord.beatTitle}</span>
                      <span className="text-[10px] text-gray-400">{cord.id} • {cord.method}</span>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-mono text-[11px] font-bold block text-[#7F77DD]">${cord.amount} CUP</span>
                      {cord.status === 'approved' ? (
                        <span className="text-[9px] text-[#22c55e] font-bold uppercase">Aprobada</span>
                      ) : (
                        <span className="text-[9px] text-red-500 font-bold uppercase">Rechazada</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: EXCLUSIVITY / BEAT RELEASE & LINK GENERATION */}
      <Modal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        title="Validar Pago y Generar Licencia de Descarga"
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left pt-2 text-white bg-brand-surface">
          <div className="p-3 bg-emerald-950/20 text-emerald-300 border border-emerald-900/30 rounded-xl text-xs space-y-1">
            <span className="font-bold block text-emerald-400">✓ Pago Verificado</span>
            <p className="text-gray-300">Al aprobar este pedido de la instrumental <strong className="text-emerald-200">{selectedOrder?.beatTitle}</strong>, se generará una licencia temporal de descarga.</p>
          </div>

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
                <span className="text-[10px] font-bold uppercase text-indigo-300 block">Enlace de Descarga de Alta Definición:</span>
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
                      navigator.clipboard.writeText(generatedLink);
                      addToast('Enlace de descarga copiado. Compártelo con el cliente por tu vía preferente.', 'success');
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
              Descartar
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              disabled={!isLinkGenerated}
              onClick={handleConfirmFullApproval}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:opacity-50"
            >
              Aprobar y Completar Pedido ✓
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
