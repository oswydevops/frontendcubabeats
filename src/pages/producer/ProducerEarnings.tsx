import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  DollarSign, TrendingUp, Landmark, FileText, Send, 
  HelpCircle, CheckCircle, Clock, ChevronRight, Trophy,
  Calendar, Search, SlidersHorizontal, Eye, Music, Radio
} from 'lucide-react';

export const ProducerEarnings: React.FC = () => {
  const { user, beats, orders, addToast } = useApp();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [cardNumber, setCardNumber] = useState('9224 1029 4810 2933');
  const [bankType, setBankType] = useState('BANDEC');

  // Static mock payout list
  const [payouts, setPayouts] = useState([
    { id: 'PAY-4029', date: 'Hace 3 días', amount: 15000, bank: 'BANDEC', account: '9224...2933', status: 'completado' },
    { id: 'PAY-3982', date: 'Hace 2 semanas', amount: 8000, bank: 'BPA', account: '9228...1204', status: 'completado' },
  ]);

  // States for the Billing registry & filter panel
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'beat' | 'sound_library'>('all');
  const [txTimeframeFilter, setTxTimeframeFilter] = useState<'recientes' | 'diarias' | 'semanales' | 'mensuales' | 'semestrales'>('recientes');

  const currentEarningsCUP = user?.totalEarningsCUP || 14250;

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Ingresa un monto de cobro válido', 'error');
      return;
    }
    if (parsedAmount > currentEarningsCUP) {
      addToast('Saldo insuficiente para retirar esta cantidad', 'error');
      return;
    }

    const newPayout = {
      id: `PAY-${Math.floor(4000 + Math.random() * 1000)}`,
      date: 'Solicitado hace un momento',
      amount: parsedAmount,
      bank: bankType,
      account: cardNumber.replace(/\s?/g, '').substring(0, 4) + '...' + cardNumber.slice(-4),
      status: 'pendiente'
    };

    setPayouts([newPayout, ...payouts]);
    setIsWithdrawModalOpen(false);
    addToast(`Solicitud de cobro por $${parsedAmount} CUP enviada a revisión`, 'success');
  };

  // Filter beats belonging to this producer
  const myBeats = useMemo(() => {
    return beats.filter(b => b.producerId === 'p2' || b.producerId === 'carlos_producer');
  }, [beats]);

  // Filter sales/orders belonging to this producer
  const myOrders = useMemo(() => {
    return orders.filter(o => o.producerId === 'p2' || o.producerId === 'carlos_producer');
  }, [orders]);

  // Combine live approved orders with beautiful seeds to represent solid history of beats and libraries
  const allTransactions = useMemo(() => {
    const lives = myOrders.filter(o => o.status === 'approved');
    const now = Date.now();
  
    // High-fidelity historical seeds for both beats and libraries
    const historic = [
      {
        id: 'CB-HIST-41',
        beatTitle: 'Malecón Sunset',
        buyerName: 'Yomil Oficial',
        buyerEmail: 'yomil.reparto@yahoo.com',
        buyerPhone: '+53 5 289 4012',
        amount: 4500,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '12 Jun 2026',
        hour: '16:45',
        timestamp: now - 8 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Exclusiva',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8389',
        beatTitle: 'Flow Repartero Vol. 2',
        buyerName: 'Yoandri García',
        buyerEmail: 'yoandrig7@gmail.com',
        buyerPhone: '+53 5 331 9904',
        amount: 1500,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '20 Jun 2026',
        hour: '12:15',
        timestamp: now - 3 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-40',
        beatTitle: 'Dembow King',
        buyerName: 'Chacal de Cuba',
        buyerEmail: 'chacalito.beats@nauta.cu',
        buyerPhone: '+53 5 440 1289',
        amount: 6500,
        currency: 'CUP' as const,
        method: 'QvaPay',
        date: '08 Jun 2026',
        hour: '21:05',
        timestamp: now - 12 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Exclusiva',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-39',
        beatTitle: 'Callejera Flow',
        buyerName: 'El Micha Oficial',
        buyerEmail: 'el_micha_flow@reparto.com',
        buyerPhone: '+53 5 125 3840',
        amount: 750,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '05 Jun 2026',
        hour: '10:30',
        timestamp: now - 15 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Básica',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8342',
        beatTitle: 'Varadero Blue Loop Kit',
        buyerName: 'Christian Delgado',
        buyerEmail: 'chris.delgado99@nauta.cu',
        buyerPhone: '+53 5 889 0281',
        amount: 800,
        currency: 'CUP' as const,
        method: 'EnZona',
        date: '01 Jun 2026',
        hour: '14:20',
        timestamp: now - 19 * 24 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-38',
        beatTitle: 'Urban Soul',
        buyerName: 'Danay Suárez',
        buyerEmail: 'danay_suarez_oficial@gmail.com',
        buyerPhone: '+53 5 512 8094',
        amount: 3800,
        currency: 'CUP' as const,
        method: 'EnZona',
        date: '28 May 2026',
        hour: '19:12',
        timestamp: now - 23 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Básica',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8316',
        beatTitle: 'Sublows & Reparto Drums Toolkit Vol. 4',
        buyerName: 'Estudio La Aldea',
        buyerEmail: 'la.aldea.studios@gmail.com',
        buyerPhone: '+53 5 918 3045',
        amount: 1800,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '29 May 2026',
        hour: '15:40',
        timestamp: now - 22 * 24 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-37',
        beatTitle: 'Callejera Flow',
        buyerName: 'Alex Duvall',
        buyerEmail: 'duvall_alex@gmail.com',
        buyerPhone: '+53 5 339 1221',
        amount: 5000,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '24 May 2026',
        hour: '11:00',
        timestamp: now - 27 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Exclusiva',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8119',
        beatTitle: 'Havana Golden Strings Loops',
        buyerName: 'Maikel Almira',
        buyerEmail: 'maikel_almira94@nauta.cu',
        buyerPhone: '+53 5 831 9284',
        amount: 950,
        currency: 'CUP' as const,
        method: 'EnZona',
        date: '11 May 2026',
        hour: '18:15',
        timestamp: now - 40 * 24 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1465847899084-5161dfdc397c?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop'
      }
    ];

    // Merge live approved orders on top of history log
    const merged = [
      ...lives.map(o => ({
        id: o.id,
        beatTitle: o.beatTitle,
        buyerName: o.buyerName || 'Cantante D\'Cuban Beats',
        buyerEmail: 'cantante.activo@dcubanbeats.com',
        buyerPhone: '+53 5 448 9121',
        amount: o.amount,
        currency: o.currency,
        method: o.method,
        date: o.date || 'Reciente',
        hour: '14:20',
        timestamp: now,
        licenceType: o.amount >= 3000 ? 'Licencia Exclusiva' : 'Licencia Básica',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      })),
      ...historic
    ];

    return merged.sort((a, b) => b.timestamp - a.timestamp);
  }, [myOrders]);

  // Apply filters exactly like AdminTransactions panel works
  const soldBeatsHistory = useMemo(() => {
    const now = Date.now();
    return allTransactions.filter(tx => {
      // 1. Text search index
      if (txSearchQuery) {
        const query = txSearchQuery.toLowerCase();
        const matchesQuery = 
          tx.id.toLowerCase().includes(query) ||
          tx.beatTitle.toLowerCase().includes(query) ||
          tx.buyerName.toLowerCase().includes(query) ||
          (tx.type === 'beat' ? 'beat' : 'libreria librería sound sound_library soundkit samplepack kit').includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Type selector
      if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) {
        return false;
      }

      // 3. Timeframe window
      const diffMs = now - tx.timestamp;
      if (txTimeframeFilter === 'diarias') {
        return diffMs <= 24 * 60 * 60 * 1000;
      } else if (txTimeframeFilter === 'semanales') {
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      } else if (txTimeframeFilter === 'mensuales') {
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      } else if (txTimeframeFilter === 'semestrales') {
        return diffMs <= 180 * 24 * 60 * 60 * 1000;
      }

      return true;
    });
  }, [allTransactions, txSearchQuery, txTypeFilter, txTimeframeFilter]);

  const totalSalesCount = useMemo(() => {
    return allTransactions.length;
  }, [allTransactions]);

  const totalEarningsHistoricalAndLive = useMemo(() => {
    return allTransactions.reduce((acc, sale) => acc + sale.amount, 0);
  }, [allTransactions]);

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg">
      
      {/* Header title */}
      <div className="border-b border-brand-border/40 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="text-[#7F77DD]" /> Control de Transacciones & Liquidaciones
          </h2>
          <p className="text-xs text-gray-400">Administra tanto el monedero disponible en CUP como el registro histórico de facturación de Beats o Librerías vendidas.</p>
        </div>
        
        {/* Rapid visual stats */}
        <div className="flex gap-4">
          <div className="bg-brand-surface border border-brand-border/30 px-3.5 py-1.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] block text-gray-400 font-bold uppercase tracking-wider">Flujo Total</span>
            <span className="text-sm font-mono font-extrabold text-[#53E0A3]">${totalEarningsHistoricalAndLive.toLocaleString()} CUP</span>
          </div>
          <div className="bg-brand-surface border border-brand-border/30 px-3.5 py-1.5 rounded-xl text-center min-w-[100px]">
            <span className="text-[9px] block text-gray-400 font-bold uppercase tracking-wider">Ventas</span>
            <span className="text-sm font-mono font-extrabold text-[#7F77DD]">{totalSalesCount} Unidades</span>
          </div>
        </div>
      </div>



      {/* CHIEF FINANCIAL SUMMARY & SOLD SALES REGISTRY (Facturación y Acreditados) */}
      <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-5 w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Registro de Facturación y Acreditados</span>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <Trophy size={16} className="text-[#EF9F27]" /> Ventas de Beats y Librerías de Sonido
            </h3>
          </div>
          
          {/* Legend for sales tracking status */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <span className="text-[10px] bg-[#534AB7]/15 border border-[#534AB7]/20 text-[#7F77DD] px-2.5 py-1 rounded-lg font-bold">
              {allTransactions.filter(t => t.type === 'beat').length} Beats Vendidos
            </span>
            <span className="text-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-bold">
              {allTransactions.filter(t => t.type === 'sound_library').length} Librerías
            </span>
            <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">
              {soldBeatsHistory.length} Filtrados
            </span>
          </div>
        </div>

        {/* FILTER CONTROLS BAR SECTION */}
        <div className="bg-[#131124]/40 p-4 rounded-xl border border-brand-border/20 space-y-4 text-left">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* SEARCH INPUT BAR */}
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={txSearchQuery}
                onChange={(e) => setTxSearchQuery(e.target.value)}
                placeholder="Buscar ventas por cantante, factura ID, beat o librería..."
                className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border bg-[#13131F]/90 border-brand-border/25 text-white placeholder-gray-500 focus:outline-none focus:border-[#7F77DD] font-sans"
              />
            </div>

            {/* TYPE SELECTOR DROPDOWN */}
            <div className="relative w-full md:w-52 flex-shrink-0">
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value as any)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border bg-[#13131F]/90 border-brand-border/25 text-white focus:outline-none focus:border-[#7F77DD] cursor-pointer appearance-none font-sans"
              >
                <option value="all">Todas las Ventas</option>
                <option value="beat">Solo Beats Instrumentales</option>
                <option value="sound_library">Solo Librerías de Sonido</option>
              </select>
            </div>

          </div>

          {/* Timeframe pill tabs and Reset links */}
          <div className="border-t border-brand-border/10 pt-3 flex flex-wrap items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
                <Calendar size={11} className="text-gray-550" /> Rango de Consulta:
              </span>
              
              <div className="inline-flex p-0.5 bg-[#13131F] rounded-lg border border-brand-border/15 flex-wrap gap-0.5 select-none animate-in fade-in">
                {(['recientes', 'diarias', 'semanales', 'mensuales', 'semestrales'] as const).map((timeframe) => {
                  const isActive = txTimeframeFilter === timeframe;
                  const label = timeframe === 'recientes' ? 'Todos' : timeframe === 'diarias' ? 'Hoy' : timeframe === 'semanales' ? 'Semanal' : timeframe === 'mensuales' ? 'Mensual' : 'Semestral';
                  return (
                    <button
                      key={timeframe}
                      onClick={() => setTxTimeframeFilter(timeframe)}
                      className={`text-[9.5px]/none font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer border-0 ${
                        isActive 
                          ? 'bg-[#534AB7] text-white shadow-sm' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset button action */}
            {(txSearchQuery || txTypeFilter !== 'all' || txTimeframeFilter !== 'recientes') && (
              <button
                onClick={() => {
                  setTxSearchQuery('');
                  setTxTypeFilter('all');
                  setTxTimeframeFilter('recientes');
                  addToast('Filtros comerciales restablecidos', 'info');
                }}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors bg-transparent border-0 cursor-pointer p-0 underline decoration-dotted"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        </div>

        {/* Sold Beats & Libraries Table */}
        <div className="overflow-x-auto min-w-full flex-grow">
          {soldBeatsHistory.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <Music size={28} className="mx-auto text-gray-600 animate-pulse" />
              <p className="text-xs">No posees registros que coincidan con la búsqueda de ventas.</p>
              <p className="text-[10px] text-gray-500">Intenta reajustar los filtros cronológicos o el buscador superior.</p>
            </div>
          ) : (
            <table className="min-w-full text-[11.5px] text-left">
              <thead>
                <tr className="border-b border-brand-border text-gray-400 font-bold uppercase tracking-wider select-none">
                  <th className="py-3">Producto</th>
                  <th className="py-3">Precio</th>
                  <th className="py-3">Categoría</th>
                  <th className="py-3">Pasarela</th>
                  <th className="py-3 text-right">Ver Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30 text-gray-300">
                {soldBeatsHistory.map((item, index) => (
                  <tr 
                    key={`${item.id}-${index}`} 
                    className={`hover:bg-brand-card/40 transition-colors ${
                      item.id.startsWith('CB-HIST') || item.id.startsWith('TX-81') ? 'opacity-90' : 'bg-[#534AB7]/5 hover:bg-[#534AB7]/10 font-medium'
                    }`}
                  >
                    <td className="py-3.5 md:py-4">
                      <span className="font-semibold text-white leading-tight block">
                        {item.beatTitle}
                      </span>
                    </td>
                    
                    <td className="py-3.5 md:py-4 font-mono font-black text-[#53E0A3]">
                      ${item.amount.toLocaleString()} {item.currency || 'CUP'}
                    </td>
                    
                    <td className="py-3.5 md:py-4">
                      {item.type === 'beat' ? (
                        <span className="px-2.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Beat
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Librería
                        </span>
                      )}
                    </td>
                    
                    <td className="py-3.5 md:py-4">
                      <span className="px-2.5 py-0.5 rounded bg-[#131124] text-gray-300 border border-brand-border text-[9px] font-bold tracking-wide font-mono">
                        {item.method}
                      </span>
                    </td>

                    <td className="py-3.5 md:py-4 text-right">
                      <button
                        onClick={() => setSelectedTx(item)}
                        className="p-1 px-2.5 rounded-lg bg-[#534AB7]/10 hover:bg-[#534AB7]/25 text-[#9B94EC] hover:text-white border border-[#534AB7]/10 hover:border-[#7F77DD]/30 transition-all font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        title="Ver detalles completos de transacción"
                      >
                        <Eye size={13} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: WITHDRAW CLAIMS INPUT */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Solicitud de Liquidación de Saldo"
        themeMode="dark"
      >
        <form onSubmit={handleWithdrawRequest} className="space-y-4 text-left pt-2">
          <div className="bg-brand-card border border-brand-border/40 p-3 rounded-lg text-xs leading-normal text-gray-300 mb-2">
            Importe disponible a liquidar: **${currentEarningsCUP} CUP**
          </div>

          <Input
            label="Monto a retirar (CUP)"
            placeholder="5000"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            themeMode="dark"
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Banco Emisor Tarjeta</label>
            <select
              value={bankType}
              onChange={(e) => setBankType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm focus:border-[#534AB7] outline-none"
            >
              <option value="BANDEC" className="bg-brand-surface">BANDEC (Banco de Crédito y Comercio)</option>
              <option value="BPA" className="bg-brand-surface">BPA (Banco Popular de Ahorro)</option>
              <option value="BANMET" className="bg-brand-surface">BANMET (Banco Metropolitano)</option>
            </select>
          </div>

          <Input
            label="Número de Tarjeta CUP (16 dígitos)"
            placeholder="9224 1029 4810 2933"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            themeMode="dark"
          />

          <div className="flex gap-2 justify-end pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsWithdrawModalOpen(false)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enviar Solicitud de Cobro
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL: CHIEF INVOICE & RECEIPT */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111119] border border-brand-border/65 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden scale-in">
            
            {/* Header detail */}
            <div className="p-5 border-b border-brand-border/30 flex items-center justify-between bg-white/[0.02] flex-shrink-0">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-[#7F77DD] tracking-wider block">Auditoría Legal de Transacción</span>
                <span className="text-xs font-mono font-bold text-gray-450 mt-0.5 block">NÚMERO DE CONSULTA: {selectedTx.id}</span>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer outline-none"
              >
                ✕
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto space-y-6 text-left text-xs text-slate-300 leading-normal">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white/[0.01] p-4.5 rounded-2xl border border-white/5">
                <div className="space-y-3 border-r border-white/5 pr-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase">Comprador (Intérprete/Músico)</span>
                    <strong className="text-white text-sm block font-sans">{selectedTx.buyerName}</strong>
                    <span className="text-slate-400 block font-mono">{selectedTx.buyerEmail}</span>
                    <span className="text-slate-400 block font-mono text-[10.5px]">{selectedTx.buyerPhone || '+53 5 448 9121'}</span>
                  </div>
                  <div className="space-y-1 pt-1.5 border-t border-white/5">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase">Licencia Asignada</span>
                    <strong className="text-amber-400 font-bold block">{selectedTx.licenceType || 'Licencia Regular'}</strong>
                  </div>
                </div>

                <div className="space-y-3 pl-1 sm:pl-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase">Monto Recibido</span>
                    <strong className="text-emerald-400 text-lg font-mono block">${selectedTx.amount.toLocaleString()} CUP</strong>
                    <span className="text-[11px] text-gray-450 block">Precio Netificado • Libre de I.V.A</span>
                  </div>
                  <div className="space-y-1 pt-1.5 border-t border-white/5 flex justify-between gap-2.5 flex-wrap">
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Fecha Operación</span>
                      <strong className="text-white font-mono">{selectedTx.date}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Canal Empleado</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[9.5px] font-bold bg-[#1B1832] text-indigo-300 border border-[#534AB7]/25 mt-0.5 block">{selectedTx.method}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="flex gap-4 items-center bg-brand-surface/70 p-3.5 rounded-2xl border border-brand-border/30">
                <img 
                  src={selectedTx.productImage} 
                  alt="Product Image" 
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Nombre del Producto</span>
                  <h4 className="text-xs font-extrabold text-white truncate block">{selectedTx.beatTitle}</h4>
                  <span className="text-[10px] text-indigo-300 font-semibold block">{selectedTx.type === 'beat' ? 'Beat Instrumental' : 'Librería de Sonidos / Sample Kit'}</span>
                </div>
              </div>

              {/* Receipt Evidence Block */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Evidencia del Comprobante Remitido</span>
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-brand-card border border-brand-border/60 shadow-inner">
                  <img 
                    src={selectedTx.receiptImage} 
                    alt="Evidencia/Comprobante de Transacción del Cliente"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl opacity-90 transition-transform duration-300 hover:scale-[1.01]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none flex flex-col justify-end p-3.5 text-left">
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                      Transacción Validada • {selectedTx.method}
                    </span>
                    <span className="text-[8px] font-mono tracking-wider text-gray-400 mt-0.5">
                      OPERACIÓN REF: {selectedTx.id} • HORA: {selectedTx.hour || '14:20'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* CTA action bottom */}
            <div className="p-4 bg-brand-bg/50 border-t border-brand-border/25 flex-shrink-0 flex gap-3">
              <button 
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-surface border border-brand-border text-gray-405 hover:text-white hover:bg-brand-surface/80 font-bold text-xs select-none transition-all text-center cursor-pointer"
              >
                Cerrar Consulta
              </button>
              <button 
                onClick={() => {
                  addToast(`Sección de comprobante de ${selectedTx.buyerName} descargada localmente`, 'success');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#534AB7] hover:bg-[#685FCD] text-white font-bold text-xs shadow-md select-none transition-all text-center cursor-pointer"
              >
                Imprimir Factura 📄
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
