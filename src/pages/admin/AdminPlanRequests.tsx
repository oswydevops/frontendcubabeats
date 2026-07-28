import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  CreditCard, Search, Check, X, AlertCircle, Eye, 
  User, Calendar, DollarSign, ExternalLink, RefreshCw, FileText,
  MoreVertical
} from 'lucide-react';
import { PlanRequest } from '../../types';

export const AdminPlanRequests: React.FC = () => {
  const { planRequests, updatePlanRequestStatus, convertPrice, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Modal states for zoom image
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [selectedRequestForZoom, setSelectedRequestForZoom] = useState<PlanRequest | null>(null);

  // Filter requests
  const filteredRequests = planRequests.filter(req => {
    const matchesSearch = 
      req.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.planName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count stats
  const totalCount = planRequests.length;
  const pendingCount = planRequests.filter(r => r.status === 'pending').length;
  const approvedCount = planRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = planRequests.filter(r => r.status === 'rejected').length;

  const handleOpenZoom = (req: PlanRequest) => {
    setSelectedRequestForZoom(req);
    setIsZoomModalOpen(true);
  };

  const handleApprove = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas confirmar este pago y activar el plan solicitado?')) {
      updatePlanRequestStatus(id, 'approved');
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta solicitud de plan? Se enviará un correo explicativo al productor.')) {
      updatePlanRequestStatus(id, 'rejected');
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300 pb-10">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-[#18182E] to-[#121220] border border-white/5 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7F77DD] opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="space-y-1 z-10 max-w-2xl text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#534AB7]/20 border border-[#534AB7]/30 text-[#8D84F7] text-[10px] font-bold uppercase tracking-wider">
              Control de Ingresos de Membresías
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-medium text-gray-400">Verificación Administrativa Manual</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="text-[#8D84F7]" size={22} /> Solicitudes de Planes
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Consulta y valida los pagos de suscripciones realizados por los productores vía transferencia bancaria o QvaPay. Al confirmar el pago, el plan premium solicitado se asignará automáticamente al productor.
          </p>
        </div>
      </div>

      {/* METRIC COUNTER CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#121220] border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/40 block">Total Recibidas</span>
            <span className="text-xl font-bold text-white font-mono mt-1 block">{totalCount}</span>
          </div>
          <div className="p-2 bg-white/5 rounded-lg text-white/50">
            <FileText size={18} />
          </div>
        </div>

        <div className="bg-[#121220] border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Pendientes</span>
            <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">{pendingCount}</span>
          </div>
          <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="bg-[#121220] border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Aprobadas</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{approvedCount}</span>
          </div>
          <div className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400">
            <Check size={18} />
          </div>
        </div>

        <div className="bg-[#121220] border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Rechazadas</span>
            <span className="text-xl font-bold text-rose-400 font-mono mt-1 block">{rejectedCount}</span>
          </div>
          <div className="p-2 bg-rose-400/10 rounded-lg text-rose-400">
            <X size={18} />
          </div>
        </div>

      </div>

      {/* FILTERS AND SEARCH */}
      <div className="bg-[#121220] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Buscar productor o referencia..."
            className="w-full pl-9 pr-4 py-2 bg-brand-surface rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-[#7F77DD] placeholder-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-1 bg-brand-surface p-1 rounded-xl border border-white/10 w-full md:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`py-1.5 px-3 rounded-lg font-semibold text-[11px] uppercase tracking-wider flex-1 md:flex-none transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#1C1C2E] text-[#8D84F7] border border-white/5 font-bold shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobados' : 'Rechazados'}
            </button>
          ))}
        </div>

      </div>

      {/* REQUESTS TABLE */}
      <div className="bg-[#121220] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-white/80">
            <thead className="bg-[#18182E] text-white/50 text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Productor</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4 text-center">Comprobante</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Producer profile info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#534AB7]/20 border border-[#534AB7]/30 text-[#8D84F7] flex items-center justify-center font-bold">
                          <User size={14} />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{req.producerName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Plan Name */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="font-bold text-[#8D84F7] block">{req.planName}</span>
                      </div>
                    </td>

                    {/* Payment details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-white/40 font-medium">Ref ID:</span>
                        <span className="text-amber-300 font-mono select-all bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {req.transactionId}
                        </span>
                      </div>
                    </td>

                    {/* Receipt image thumb */}
                    <td className="px-6 py-4 text-center">
                      {req.receiptUrl ? (
                        <div className="inline-block relative group">
                          <img
                            src={req.receiptUrl}
                            alt="Receipt thumb"
                            className="w-12 h-12 object-cover rounded-lg border border-white/10 hover:border-[#8D84F7] cursor-pointer transition-all hover:scale-105"
                            onClick={() => handleOpenZoom(req)}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Eye size={12} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/30 italic">Sin captura</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-white/60 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-white/40" />
                        {req.date}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      {req.status === 'pending' && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Pendiente
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Aprobado
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Rechazado
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      {req.status === 'pending' ? (
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === req.id ? null : req.id);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                            title="Acciones"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeDropdown === req.id && (
                            <>
                              {/* Overlay/backdrop click listener to close dropdown */}
                              <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setActiveDropdown(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#18182E] border border-white/10 shadow-2xl z-40 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    handleApprove(req.id);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                >
                                  <Check size={14} className="text-emerald-400" />
                                  Confirmar Pago
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    handleReject(req.id);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer text-left border-t border-white/5"
                                >
                                  <X size={14} className="text-rose-400" />
                                  Rechazar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/30 italic text-[11px]">Procesado</span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/30 italic">
                    No se encontraron solicitudes de planes que coincidan con la búsqueda o filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SYSTEM DOCUMENTATION INFORMATION */}
      <div className="bg-[#121220] border border-white/5 p-4 rounded-xl space-y-2">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <AlertCircle size={14} className="text-[#8D84F7]" /> Políticas de Gestión Administrativa
        </h4>
        <div className="text-[11px] text-gray-400 leading-normal space-y-1">
          <p>
            1. <strong>Confirmación obligatoria:</strong> Compara siempre el ID de transacción y el monto recibido con el estado real de tu cuenta bancaria o billetera QvaPay antes de confirmar un pago.
          </p>
          <p>
            2. <strong>Efecto inmediato:</strong> Cuando apruebas una solicitud, el sistema actualiza automáticamente el estado de membresía del productor y envía notificaciones instantáneas a su buzón y panel.
          </p>
          <p>
            3. <strong>Soporte al rechazar:</strong> Si rechazas un pago, se simulará el envío de un correo electrónico notificando el motivo para que el productor pueda verificar su transferencia.
          </p>
        </div>
      </div>

      {/* ZOOM MODAL FOR RECEIPT COMPROBANTE SCREENSHOT */}
      <Modal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        title={`Ver Comprobante: ${selectedRequestForZoom?.producerName}`}
      >
        {selectedRequestForZoom && (
          <div className="space-y-4 text-left py-2">
            
            <div className="grid grid-cols-2 gap-4 p-3 bg-[#0D0D14] rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-white/40 block">Productor Solicitante:</span>
                <strong className="text-white font-sans">{selectedRequestForZoom.producerName}</strong>
              </div>
              <div>
                <span className="text-white/40 block">Plan Requerido:</span>
                <strong className="text-[#8D84F7] font-sans">{selectedRequestForZoom.planName}</strong>
              </div>
              <div>
                <span className="text-white/40 block">Monto total pagado:</span>
                <strong className="text-white font-mono text-xs">
                  {selectedRequestForZoom.currency === 'CUP' ? `${selectedRequestForZoom.amount} CUP` : `$${selectedRequestForZoom.amount} USD`}
                </strong>
              </div>
              <div>
                <span className="text-white/40 block">Referencia Bancaria:</span>
                <strong className="text-amber-300 font-mono text-xs">{selectedRequestForZoom.transactionId}</strong>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center p-2">
              <img
                src={selectedRequestForZoom.receiptUrl}
                alt="Comprobante completo"
                className="max-h-[60vh] object-contain rounded w-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
              <Button variant="ghost" size="sm" onClick={() => setIsZoomModalOpen(false)}>
                Cerrar Vista
              </Button>
              {selectedRequestForZoom.status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 text-rose-400 font-semibold cursor-pointer"
                    onClick={() => {
                      setIsZoomModalOpen(false);
                      handleReject(selectedRequestForZoom.id);
                    }}
                  >
                    Rechazar Pago
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    onClick={() => {
                      setIsZoomModalOpen(false);
                      handleApprove(selectedRequestForZoom.id);
                    }}
                  >
                    Confirmar Pago y Activar Plan
                  </Button>
                </>
              )}
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
