import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  DollarSign, Music, Play, AlertOctagon, ArrowUpRight, 
  Sparkles, CheckCircle2, TrendingUp, Inbox, Users, MapPin, 
  Eye, Trophy, Calendar, RefreshCw, Landmark, Wallet 
} from 'lucide-react';

export const ProducerDashboard: React.FC = () => {
  const { 
    user, beats, orders, navigateTo, addToast,
    producerNotifications = [], markProducerNotificationRead, markAllProducerNotificationsRead, clearProducerNotifications
  } = useApp();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('all');

  const isVerified = user?.verified;

  // Filter beats belonging to this producer
  const myBeats = useMemo(() => {
    return beats.filter(b => b.producerId === 'p2' || b.producerId === 'carlos_producer');
  }, [beats]);

  // Filter sales/orders belonging to this producer
  const myOrders = useMemo(() => {
    return orders.filter(o => o.producerId === 'p2' || o.producerId === 'carlos_producer');
  }, [orders]);

  // Combine live approved orders with beautiful seeds to represent solid history
  const soldBeatsHistory = useMemo(() => {
    const lives = myOrders.filter(o => o.status === 'approved');
    
    // Seed high-fidelity completed orders conform with CubaBeats' catalog
    const historic = [
      {
        id: 'CB-HIST-41',
        beatTitle: 'Malecón Sunset',
        buyerName: 'Yomil Oficial',
        amount: 4500,
        currency: 'CUP',
        method: 'Transfermóvil',
        date: '12 Jun 2026',
        licenceType: 'Licencia Exclusiva'
      },
      {
        id: 'CB-HIST-40',
        beatTitle: 'Dembow King',
        buyerName: 'Chacal de Cuba',
        amount: 6500,
        currency: 'CUP',
        method: 'QvaPay Checkout',
        date: '08 Jun 2026',
        licenceType: 'Licencia Exclusiva'
      },
      {
        id: 'CB-HIST-39',
        beatTitle: 'Callejera Flow',
        buyerName: 'El Micha Oficial',
        amount: 750,
        currency: 'CUP',
        method: 'Transfermóvil',
        date: '05 Jun 2026',
        licenceType: 'Licencia Básica'
      },
      {
        id: 'CB-HIST-38',
        beatTitle: 'Urban Soul',
        buyerName: 'Danay Suárez',
        amount: 3800,
        currency: 'CUP',
        method: 'EnZona Direct',
        date: '28 May 2026',
        licenceType: 'Licencia Básica'
      },
      {
        id: 'CB-HIST-37',
        beatTitle: 'Callejera Flow',
        buyerName: 'Alex Duvall',
        amount: 5000,
        currency: 'CUP',
        method: 'Transfermóvil',
        date: '24 May 2026',
        licenceType: 'Licencia Exclusiva'
      }
    ];

    // Merge live approved orders on top of history log
    const merged = [
      ...lives.map(o => ({
        id: o.id,
        beatTitle: o.beatTitle,
        buyerName: o.buyerName || 'Cantante CubaBeats',
        amount: o.amount,
        currency: o.currency,
        method: o.method,
        date: o.date,
        licenceType: o.amount >= 3000 ? 'Licencia Exclusiva' : 'Licencia Básica'
      })),
      ...historic
    ];

    return merged;
  }, [myOrders]);

  // Sum total of all sold beats earnings (historic seeds + live approved orders)
  const totalEarningsHistoricalAndLive = useMemo(() => {
    return soldBeatsHistory.reduce((acc, sale) => acc + sale.amount, 0);
  }, [soldBeatsHistory]);

  const liveApprovedCount = useMemo(() => {
    return myOrders.filter(o => o.status === 'approved').length;
  }, [myOrders]);

  const totalSalesCount = useMemo(() => {
    return soldBeatsHistory.length;
  }, [soldBeatsHistory]);

  // Compute average beat listing price
  const averagePrice = useMemo(() => {
    if (myBeats.length === 0) return 0;
    return Math.round(myBeats.reduce((acc, b) => acc + b.priceBasic, 0) / myBeats.length);
  }, [myBeats]);

  // DETAILED CUBAN PROVINCE VISITS DATA
  const provincesDetailData = useMemo(() => [
    {
      id: 'habana',
      province: 'La Habana',
      visitas: 5412,
      color: '#534AB7',
      favGenre: 'Reggaetón / Trapton',
      activeClients: 1240,
      municipios: [
        { name: 'Plaza Rev.', visitas: 1540 },
        { name: 'Centro Habana', visitas: 1210 },
        { name: 'Playa', visitas: 980 },
        { name: '10 de Octubre', visitas: 870 },
        { name: 'Habana Vieja', visitas: 812 }
      ]
    },
    {
      id: 'santiago',
      province: 'Santiago de Cuba',
      visitas: 3120,
      color: '#7F77DD',
      favGenre: 'Dembow / Rap',
      activeClients: 890,
      municipios: [
        { name: 'Stgo Cabe.', visitas: 1450 },
        { name: 'Palma Soriano', visitas: 680 },
        { name: 'Contramaestre', visitas: 420 },
        { name: 'Songo-La Maya', visitas: 310 },
        { name: 'San Luis', visitas: 260 }
      ]
    },
    {
      id: 'holguin',
      province: 'Holguín',
      visitas: 2314,
      color: '#26215C',
      favGenre: 'Boom Bap / Rap',
      activeClients: 512,
      municipios: [
        { name: 'Holguín Cabe.', visitas: 1100 },
        { name: 'Banes', visitas: 450 },
        { name: 'Mayarí', visitas: 320 },
        { name: 'Moa', visitas: 254 },
        { name: 'Gibara', visitas: 190 }
      ]
    },
    {
      id: 'camaguey',
      province: 'Camagüey',
      visitas: 1845,
      color: '#EF9F27',
      favGenre: 'Trap / R&B',
      activeClients: 420,
      municipios: [
        { name: 'Cmg Cabe.', visitas: 950 },
        { name: 'Nuevitas', visitas: 320 },
        { name: 'Florida', visitas: 250 },
        { name: 'Guáimaro', visitas: 180 },
        { name: 'St Cruz Sur', visitas: 145 }
      ]
    },
    {
      id: 'villaclara',
      province: 'Villa Clara',
      visitas: 1612,
      color: '#E24B4A',
      favGenre: 'Hip Hop / Trap',
      activeClients: 380,
      municipios: [
        { name: 'Santa Clara', visitas: 890 },
        { name: 'Placetas', visitas: 280 },
        { name: 'Sagua Grande', visitas: 210 },
        { name: 'Caibarién', visitas: 142 },
        { name: 'Camajuaní', visitas: 90 }
      ]
    },
    {
      id: 'matanzas',
      province: 'Matanzas',
      visitas: 1490,
      color: '#7F77DD',
      favGenre: 'Trapton / Reggaetón',
      activeClients: 310,
      municipios: [
        { name: 'Matanzas Cabe.', visitas: 720 },
        { name: 'Cárdenas', visitas: 480 },
        { name: 'Colón', visitas: 150 },
        { name: 'Jovellanos', visitas: 90 },
        { name: 'Jagüey Grande', visitas: 50 }
      ]
    },
    {
      id: 'pinar',
      province: 'Pinar del Río',
      visitas: 1105,
      color: '#534AB7',
      favGenre: 'Rap / Boom Bap',
      activeClients: 215,
      municipios: [
        { name: 'Pinar Cabe.', visitas: 580 },
        { name: 'La Palma', visitas: 210 },
        { name: 'Viñales', visitas: 145 },
        { name: 'Sandino', visitas: 110 },
        { name: 'Guane', visitas: 60 }
      ]
    },
    {
      id: 'artemisa',
      province: 'Artemisa',
      visitas: 890,
      color: '#26215C',
      favGenre: 'Trap Latino',
      activeClients: 180,
      municipios: [
        { name: 'Artemisa Cabe.', visitas: 420 },
        { name: 'San Antonio', visitas: 190 },
        { name: 'Bauta', visitas: 140 },
        { name: 'Mariel', visitas: 90 },
        { name: 'Guanajay', visitas: 50 }
      ]
    }
  ], []);

  const provinceVisitsData = useMemo(() => {
    return provincesDetailData.map(p => ({
      id: p.id,
      province: p.province,
      visitas: p.visitas,
      color: p.color
    }));
  }, [provincesDetailData]);

  const selectedProvince = useMemo(() => {
    return provincesDetailData.find(p => p.id === selectedProvinceId);
  }, [provincesDetailData, selectedProvinceId]);

  // CHART DATA: Profile views over time (weekly stats)
  const profileViewsWeeklyData = [
    { day: 'Lunes', visitas: 340, auditores: 180 },
    { day: 'Martes', visitas: 420, auditores: 210 },
    { day: 'Miércoles', visitas: 610, auditores: 390 },
    { day: 'Jueves', visitas: 530, auditores: 280 },
    { day: 'Viernes', visitas: 890, auditores: 540 },
    { day: 'Sábado', visitas: 1250, auditores: 920 },
    { day: 'Domingo', visitas: 1120, auditores: 860 }
  ];

  // CHART DATA: Plays per Beat
  const playsPerBeatData = useMemo(() => {
    if (myBeats.length > 0) {
      return myBeats.map(beat => ({
        name: beat.title.length > 14 ? `${beat.title.substring(0, 12)}...` : beat.title,
        reproducciones: beat.plays || 0,
        playsFormatted: beat.plays ? beat.plays.toLocaleString() : '0'
      }));
    } else {
      // Fallback elegant list showing plays
      return [
        { name: 'Callejera Flow', reproducciones: 1254, playsFormatted: '1,254' },
        { name: 'Malecón Sunset', reproducciones: 842100, playsFormatted: '842,100' },
        { name: 'Dembow King', reproducciones: 5410, playsFormatted: '5,410' },
        { name: 'Urban Soul', reproducciones: 19412, playsFormatted: '19,412' },
        { name: 'Havana Drill', reproducciones: 9112, playsFormatted: '9,112' }
      ];
    }
  }, [myBeats]);

  const handleRefreshAnalytics = () => {
    addToast('Estadísticas y visitas del perfil reconstruidas en tiempo real', 'success');
  };

  return (
    <div className="space-y-8 text-left bg-brand-bg text-white p-5 md:p-8 rounded-3xl border border-brand-border/40 shadow-2xl min-h-[90vh] transition-all">
      
      {/* 1. Header Toolbar (Cosmic Style Dark Banner) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7F77DD]">Consola de Productor Activa</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Escritorio de Rythm Studio 👋
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Monitorea el consumo de tus beats, ventas cobradas en Transfermóvil/QvaPay y visitas de artistas cubanos.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleRefreshAnalytics}
            className="p-2.5 bg-brand-surface hover:bg-brand-card text-gray-300 border border-brand-border rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Refrescar Analíticas"
          >
            <RefreshCw size={13} className="animate-spin-slow hover:text-[#7F77DD]" />
            Sincronizar
          </button>

          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigateTo('/producer/beats')}
            className="text-xs font-bold gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Sparkles size={13} />
            Subir Beat Now
          </Button>
        </div>
      </div>

      {/* 2. KYC REQUIRED ALERT (if not verified) */}
      {!isVerified && (
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertOctagon size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-500">Pasarela Directa Inactiva • Verificación KYC Requerida</h4>
              <p className="text-[11px] text-amber-200/80 max-w-xl leading-relaxed">
                Para desplegar tus enlaces de Transfermóvil, EnZona y QvaPay en el catálogo oficial y recibir transacciones CUP instantáneas, debes certificar tu firma de identidad oficial cubana.
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="xs" 
            onClick={() => navigateTo('/producer/profile')}
            className="bg-amber-600 hover:bg-amber-700 text-white border-none py-2 px-4 shadow-sm font-bold whitespace-nowrap self-end sm:self-center text-[11px]"
          >
            Validar Identidad →
          </Button>
        </div>
      )}

      {/* LIKES & ACTIVITY NOTIFICATION CENTER */}
      <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/45 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/20 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-left">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Notificaciones del Studio (Likes de Beats & Actividad)
            </h3>
          </div>

          <div className="flex gap-3">
            {producerNotifications.some(n => !n.read) && (
              <button 
                onClick={() => {
                  markAllProducerNotificationsRead();
                  addToast('Notificaciones marcadas como leídas', 'success');
                }}
                className="text-[10px] bg-[#534AB7]/10 hover:bg-[#534AB7]/20 text-[#7F77DD] border border-[#534AB7]/25 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors"
              >
                Marcar leídas
              </button>
            )}
            <button 
              onClick={() => {
                clearProducerNotifications();
                addToast('Historial vaciado correctamente', 'info');
              }}
              className="text-[10px] text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Limpiar historial
            </button>
          </div>
        </div>

        {producerNotifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Inbox className="mx-auto text-slate-550 h-8 w-8" />
            <p className="text-xs">No tienes notificaciones de estudio por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-h-56 overflow-y-auto pr-1">
            {producerNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => {
                  markProducerNotificationRead(notif.id);
                }}
                className={`p-3 rounded-xl border transition-all text-left flex items-start gap-2.5 cursor-pointer ${
                  notif.read 
                    ? 'bg-brand-card/20 border-brand-border/20 opacity-75 hover:bg-brand-card/30' 
                    : 'bg-[#534AB7]/5 border-[#534AB7]/25 hover:border-[#7F77DD]/35 ring-1 ring-[#534AB7]/5'
                }`}
              >
                {/* Icon mapping */}
                <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                  notif.type === 'beat_liked'
                    ? 'bg-rose-500/10 text-rose-455 border border-rose-500/10'
                    : notif.type === 'beat_sold'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-550/15'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-550/10'
                }`}>
                  {notif.type === 'beat_liked' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  ) : notif.type === 'beat_sold' ? (
                    <DollarSign size={13} className="text-emerald-405" />
                  ) : (
                    <AlertOctagon size={13} className="text-amber-500" />
                  )}
                </div>

                <div className="space-y-0.5 flex-grow min-w-0">
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate block">{notif.title}</span>
                    <span className="text-[8.5px] text-slate-500 font-mono whitespace-nowrap">{notif.timestamp}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-normal font-sans">{notif.description}</p>
                </div>

                {!notif.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] m-1 animate-pulse flex-shrink-0" title="Nueva" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. KEY METRICS STATS BLOCKS (Elegant glow and fully dark themed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: CUP Gross Sales */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ganancias Generadas</span>
            <span className="p-2 bg-indigo-500/10 text-[#7F77DD] border border-indigo-500/10 rounded-xl">
              <DollarSign size={15} />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-white tracking-tight group-hover:text-[#7F77DD] transition-colors leading-none">
              ${totalEarningsHistoricalAndLive.toLocaleString()} CUP
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-2">
              <TrendingUp size={11} /> +18.2% este mes
            </span>
          </div>
        </div>

        {/* KPI 2: Beats active */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Beats Activos</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-xl">
              <Music size={15} />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-white leading-none">
              {myBeats.length || 5}
            </h3>
            <span className="text-[10px] text-gray-400 block mt-2">
              Precio promedio: <strong className="text-indigo-300 font-mono">${averagePrice || 600} CUP</strong>
            </span>
          </div>
        </div>

        {/* KPI 3: Sales Count approved */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Licencias Vendidas</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl">
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-white leading-none">
              {totalSalesCount}
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-2">
              Conversión: <strong className="font-mono text-emerald-300">5.4%</strong> (Top del país)
            </span>
          </div>
        </div>

        {/* KPI 4: Active listening clicks */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Audiciones Totales</span>
            <span className="p-2 bg-amber-500/10 text-[#EF9F27] border border-amber-500/10 rounded-xl">
              <Play size={14} fill="currentColor" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono text-white leading-none">
              {myBeats.reduce((acc, b) => acc + (b.plays || 0), 0 || 878200).toLocaleString()}
            </h3>
            <span className="text-[10px] text-[#7F77DD] font-bold block mt-2 truncate">
              Top: "Malecón Sunset" 🔥
            </span>
          </div>
        </div>
      </div>

      {/* 4. CHIEF FINANCIAL SUMMARY & SOLD BEATS REGISTRY (PRINICIPAL FEATURE requested by user) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Sub-Card A: Gano-Widget & Core Registry */}
        <div className="lg:col-span-8 bg-brand-surface p-6 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Registro e Historial Oficial</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <Trophy size={16} className="text-[#EF9F27]" /> Registro de Beats Vendidos
              </h3>
            </div>
            
            {/* Legend for sales tracking status */}
            <div className="flex items-center gap-2 self-start">
              <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/20 text-[#7F77DD] px-2.5 py-1 rounded-lg font-bold">
                {liveApprovedCount} Aprobados en vivo
              </span>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">
                {totalSalesCount - liveApprovedCount} Históricos
              </span>
            </div>
          </div>

          {/* Sold Beats Table list */}
          <div className="overflow-x-auto min-w-full flex-grow">
            {soldBeatsHistory.length === 0 ? (
              <div className="py-16 text-center text-gray-400 space-y-3">
                <Music size={28} className="mx-auto text-gray-500 animate-pulse" />
                <p className="text-xs">No posees registros de beats vendidos autorizados por el momento.</p>
              </div>
            ) : (
              <table className="min-w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-brand-border text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3">Factura / ID</th>
                    <th className="py-3">Beat Vendido</th>
                    <th className="py-3">Cantante / Intérprete</th>
                    <th className="py-3">Importe Transacción</th>
                    <th className="py-3">Licencia</th>
                    <th className="py-3 text-right">Canal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30 text-gray-200">
                  {soldBeatsHistory.map((item, index) => (
                    <tr 
                      key={`${item.id}-${index}`} 
                      className={`hover:bg-brand-card/40 transition-colors ${
                        item.id.startsWith('CB-HIST') ? 'opacity-85' : 'bg-indigo-500/5 hover:bg-indigo-500/10 font-medium'
                      }`}
                    >
                      <td className="py-3 md:py-4 font-mono font-bold text-gray-300">
                        {item.id}
                        {!(item.id.startsWith('CB-HIST')) && (
                          <span className="ml-1 text-[8px] bg-indigo-500/30 text-indigo-200 px-1 rounded uppercase font-extrabold animate-bounce">
                            Nuevo
                          </span>
                        )}
                      </td>
                      <td className="py-3 md:py-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD]" />
                          {item.beatTitle}
                        </div>
                      </td>
                      <td className="py-3 md:py-4 font-medium text-gray-300">{item.buyerName}</td>
                      <td className="py-3 md:py-4 font-mono font-bold text-[#7F77DD]">
                        ${item.amount.toLocaleString()} {item.currency || 'CUP'}
                      </td>
                      <td className="py-3 md:py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.licenceType === 'Licencia Exclusiva' 
                            ? 'bg-amber-500/10 text-[#EF9F27] border border-amber-500/20' 
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/10'
                        }`}>
                          {item.licenceType}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-brand-card text-gray-300 border border-brand-border text-[9px] font-bold">
                          {item.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sub-Card B: Suma Total de Ganancias Generadas Wrapper Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#1C1C2E] to-[#26215C] p-6 rounded-2xl border border-brand-border/50 text-left flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7F77DD] block">Resumen Financiero Total</span>
              <Calendar size={14} className="text-indigo-400" />
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-indigo-200 block">Suma Total de Ganancias</span>
              <h3 className="text-3xl font-extrabold font-mono text-white tracking-tight leading-none filter drop-shadow-sm">
                ${totalEarningsHistoricalAndLive.toLocaleString()} <span className="text-lg">CUP</span>
              </h3>
              <p className="text-[10px] text-indigo-305 pt-1">
                Equivalente aproximado: <strong className="font-mono text-gray-205">~${Math.round(totalEarningsHistoricalAndLive / 320).toLocaleString()} USD</strong> en base a QvaPay.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/10 mt-2">
              <span className="text-[10px] text-indigo-100 font-bold block uppercase tracking-wider">Distribución por Canales de Cobro</span>
              
              {/* TM channel */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-gray-200">
                  <span className="flex items-center gap-1"><Landmark size={12} className="text-indigo-350" /> Transfermóvil Directo</span>
                  <span className="font-mono">${(soldBeatsHistory.filter(x => x.method.toLowerCase().includes('transfer')).reduce((s,i)=>s+i.amount, 0)).toLocaleString()} CUP</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="gradient-primary h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              {/* QvaPay / MLC Gateways */}
              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-gray-200">
                  <span className="flex items-center gap-1"><Wallet size={12} className="text-cyan-400" /> QvaPay / EnZona Digital</span>
                  <span className="font-mono">${(soldBeatsHistory.filter(x => !x.method.toLowerCase().includes('transfer')).reduce((s,i)=>s+i.amount, 0)).toLocaleString()} CUP</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 space-y-3">
            <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-indigo-200 text-[10.5px] leading-relaxed">
              <strong>✓ Garantía de Cero Comisión:</strong> Gracias a tu membresía Elite, CubaBeats no retiene ningún porcentaje sobre tus transferencias bancarias de Transfermóvil. El 100% de las ventas son tuyas de manera líquida.
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigateTo('/producer/payment-methods')}
              className="w-full text-[11px] font-bold gap-1.5 bg-white text-brand-surface hover:bg-gray-100"
            >
              Configurar Mis Cuentas de Cobro
            </Button>
          </div>
        </div>
      </div>

      {/* 5. MULTI-CHART ANALYTICS GRID SECTION (provinces, visitors, playbacks) */}
      <div className="space-y-6 pt-4">
        
        <div className="flex items-center gap-2 border-b border-brand-border/40 pb-3">
          <TrendingUp className="text-[#7F77DD]" size={18} />
          <h3 className="text-base font-bold text-white tracking-tight">
            Métricas Analíticas de Tránsito & Popularidad
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart-Item I: Client visits by Cuba Province (Dynamic Breakdown) */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/30 pb-2">
              <div className="text-left">
                <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Alcance Geográfico</span>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5" title={selectedProvinceId === 'all' ? 'Tránsito de Clientes por Provincia' : `Desglose de procedencias para ${selectedProvince?.province}`}>
                  <MapPin size={13} className="text-[#7F77DD]" /> {selectedProvinceId === 'all' ? 'Tránsito por Provincia' : `Desglose: ${selectedProvince?.province}`}
                </h4>
              </div>
              
              <select
                value={selectedProvinceId}
                onChange={(e) => {
                  setSelectedProvinceId(e.target.value);
                  if (e.target.value !== 'all') {
                    const prov = provincesDetailData.find(p => p.id === e.target.value);
                    if (prov) {
                      addToast(`Mostrando datos de ${prov.province}`, 'info');
                    }
                  } else {
                    addToast('Mostrando comparativa de todas las provincias', 'info');
                  }
                }}
                className="bg-brand-bg hover:bg-brand-card text-white border border-brand-border/40 rounded-xl px-2 py-1 text-[11px] font-bold outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]/20 cursor-pointer text-left focus:bg-brand-surface"
              >
                <option value="all">Todas las Provincias</option>
                {provincesDetailData.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.province}
                  </option>
                ))}
              </select>
            </div>

            {selectedProvinceId === 'all' ? (
              <div className="h-52 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={provinceVisitsData} 
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" horizontal={true} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis type="category" dataKey="province" stroke="rgba(255,255,255,0.6)" fontSize={9} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '10px' }}
                      labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="visitas" radius={[0, 4, 4, 0]}>
                      {provinceVisitsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          onClick={() => {
                            setSelectedProvinceId(entry.id);
                            addToast(`Desglosando visitas para ${entry.province}`, 'info');
                          }}
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={selectedProvince?.municipios} 
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" horizontal={true} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={9} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '10px' }}
                      labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="visitas" fill={selectedProvince?.color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="space-y-2 pt-1 border-t border-brand-border/20">
              {selectedProvinceId !== 'all' && selectedProvince ? (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2 text-left bg-brand-bg/60 p-2 rounded-lg border border-brand-border/20">
                    <div>
                      <span className="text-[8px] text-gray-400 block uppercase font-semibold">Artistas Activos</span>
                      <span className="text-[11px] font-bold text-white block truncate">{selectedProvince.activeClients} artistas</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 block uppercase font-semibold">Estilo Favorito</span>
                      <span className="text-[11px] font-bold text-[#7F77DD] block truncate" title={selectedProvince.favGenre}>{selectedProvince.favGenre}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] bg-brand-bg/30 px-2 py-1 rounded">
                    <span className="text-gray-400">Total Visitas:</span>
                    <span className="font-mono font-bold text-[#7F77DD]">{selectedProvince.visitas.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProvinceId('all');
                      addToast('Mostrando comparativa general', 'info');
                    }}
                    className="w-full text-center text-[10px] font-bold text-[#7F77DD] hover:text-[#7f77dd]/85 hover:bg-[#534AB7]/5 py-1.5 rounded-lg border border-[#534AB7]/25 transition-all cursor-pointer"
                  >
                    ← Volver a Vista Comparativa
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-brand-bg/40 rounded-lg text-center text-[9px] text-[#7F77DD] border border-brand-border/10 leading-normal font-sans">
                    💡 <span className="font-semibold text-gray-300">Tip:</span> Pulsa en una barra del gráfico o usa el selector para ver el desglose por municipios.
                  </div>
                  <p className="text-[9.5px] text-gray-400 text-center leading-tight">
                    La Habana y Santiago concentran el 68% de las audiciones directas registradas en tus pistas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chart-Item II: Profile Views Daily Trend */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-3 shadow-lg">
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Auditoría de Cuenta</span>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Eye size={13} className="text-indigo-400" /> Visitas al Perfil Studio
              </h4>
            </div>

            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profileViewsWeeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="visitasColorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#534AB7" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#534AB7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="auditoresColorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF9F27" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#EF9F27" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '10px' }}
                    labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                  />
                  <Legend verticalAlign="top" height={24} iconSize={10} wrapperStyle={{ fontSize: '9px', color: '#ccc' }} />
                  <Area type="monotone" name="Visitas Totales" dataKey="visitas" stroke="#7F77DD" strokeWidth={2} fillOpacity={1} fill="url(#visitasColorGrad)" />
                  <Area type="monotone" name="Oyentes Únicos" dataKey="auditores" stroke="#EF9F27" strokeWidth={1.5} fillOpacity={1} fill="url(#auditoresColorGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[9.5px] text-gray-400 text-center leading-tight">
              Los picos máximos se originan todos los sábados tras los lanzamientos promocionales en redes sociales.
            </p>
          </div>

          {/* Chart-Item III: Plays per Beat */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-3 shadow-lg">
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Audición de Catálogo</span>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <PlayCircleIcon size={13} className="text-indigo-400" /> Reproducciones por Beat
              </h4>
            </div>

            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playsPerBeatData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.07)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={8.5} height={20} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '10px' }}
                    labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="reproducciones" fill="#7F77DD" radius={[4, 4, 0, 0]}>
                    {playsPerBeatData.map((entry, index) => (
                      <Cell key={`cell-playback-${index}`} fill={index === 1 ? '#EF9F27' : '#534AB7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[9.5px] text-gray-400 text-center leading-tight font-sans">
              "Malecón Sunset" domina de manera viral con un histórico acumulado superior a 840K playbacks.
            </p>
          </div>

        </div>
      </div>
      
    </div>
  );
};

// Helpfully declare custom play component
const PlayCircleIcon = ({ size = 15, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
  </svg>
);
