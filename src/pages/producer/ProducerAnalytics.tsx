import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, MapPin, Eye, RefreshCw, Music, Sparkles, 
  Users, PlayCircle, BarChart3, HelpCircle, Activity, Heart, ArrowUpRight, Lock,
  DollarSign, Layers
} from 'lucide-react';

export const ProducerAnalytics: React.FC = () => {
  const { user, beats, navigateTo, addToast, plans, orders } = useApp();
  
  const activePlan = useMemo(() => {
    const planName = user?.plan || 'Gratis';
    return plans.find(p => p.name.toLowerCase() === planName.toLowerCase()) || plans[0];
  }, [user, plans]);

  const hasAccess = activePlan?.analyticsAccess ?? false;
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter beats belonging to this producer
  const myBeats = useMemo(() => {
    return beats.filter(b => b.producerId === 'p2' || b.producerId === 'carlos_producer');
  }, [beats]);

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
      color: '#3B82F6',
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
      color: '#9333EA',
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
      color: '#10B981',
      favGenre: 'Rap / Boom Bap',
      activeClients: 215,
      municipios: [
        { name: 'Pinar Cabe.', visitas: 580 },
        { name: 'La Palma', visitas: 210 },
        { name: 'Viñales', visitas: 145 },
        { name: 'Sandino', visitas: 110 },
        { name: 'Guane', stroke: '#10B981', visitas: 60 }
      ]
    },
    {
      id: 'artemisa',
      province: 'Artemisa',
      visitas: 890,
      color: '#F43F5E',
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
    { day: 'Jueves', stroke: '#7F77DD', visitas: 530, auditores: 280 },
    { day: 'Viernes', visitas: 890, auditores: 540 },
    { day: 'Sábado', visitas: 1250, auditores: 920 },
    { day: 'Domingo', visitas: 1120, auditores: 860 }
  ];

  // CHART DATA: Plays per Beat
  const playsPerBeatData = useMemo(() => {
    if (myBeats.length > 0) {
      return myBeats.map(beat => ({
        name: beat.title.length > 12 ? `${beat.title.substring(0, 10)}...` : beat.title,
        reproducciones: beat.plays || 0,
        playsFormatted: beat.plays ? beat.plays.toLocaleString() : '0'
      }));
    } else {
      return [
        { name: 'Callejera Flow', reproducciones: 1254, playsFormatted: '1,254' },
        { name: 'Malecón Sunset', reproducciones: 842100, playsFormatted: '842,100' },
        { name: 'Dembow King', reproducciones: 5410, playsFormatted: '5,410' },
        { name: 'Urban Soul', reproducciones: 19412, playsFormatted: '19,412' },
        { name: 'Havana Drill', reproducciones: 9112, playsFormatted: '9,112' }
      ];
    }
  }, [myBeats]);

  const totalPlays = useMemo(() => {
    return myBeats.reduce((acc, b) => acc + (b.plays || 0), 0) || 878200;
  }, [myBeats]);

  // CHART DATA: Revenue over the last 30 days
  const revenueData = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    // Use year 2026 as the mock year
    const refDate = today.getFullYear() === 2026 ? today : new Date(2026, 6, 15); // July 15, 2026
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      dates.push(`${day}-${month}-${year}`);
    }

    // Helper to format Date to DD-MM-YYYY
    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Helper to parse relative and absolute dates to DD-MM-YYYY
    const parseOrderDate = (dateStr: string): string => {
      if (!dateStr) return '';
      const dateLower = dateStr.toLowerCase();

      if (dateLower.includes('hoy') || dateLower.includes('hora')) {
        return formatDate(refDate);
      }
      if (dateLower.includes('ayer')) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - 1);
        return formatDate(d);
      }
      if (dateLower.includes('hace 1 día') || dateLower.includes('hace 1 dia')) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - 1);
        return formatDate(d);
      }
      if (dateLower.includes('hace 2 días') || dateLower.includes('hace 2 dias')) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - 2);
        return formatDate(d);
      }
      if (dateLower.includes('hace 3 días') || dateLower.includes('hace 3 dias')) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - 3);
        return formatDate(d);
      }
      if (dateLower.includes('hace 5 días') || dateLower.includes('hace 5 dias')) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - 5);
        return formatDate(d);
      }

      // Exact match DD-MM-YYYY
      const match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
      if (match) {
        return match[0];
      }
      
      return '';
    };

    // Filter verified/approved orders for this producer (p2/carlos_producer)
    const producerOrders = (orders || []).filter(o => 
      (o.producerId === 'p2' || o.producerId === 'carlos_producer') &&
      (o.status === 'verified' || o.status === 'approved')
    );

    return dates.map(dateStr => {
      const dailySum = producerOrders
        .filter(o => {
          const orderDateParsed = parseOrderDate(o.date);
          return orderDateParsed === dateStr;
        })
        .reduce((sum, o) => {
          let amountInCUP = o.amount;
          if (o.currency === 'MLC' || o.currency === 'USDT' || o.currency === 'USD') {
            amountInCUP = o.amount * 350; // standard mock exchange rate
          }
          return sum + amountInCUP;
        }, 0);

      const parts = dateStr.split('-');
      const day = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const monthsSpanish = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      const formattedLabel = `${day} ${monthsSpanish[monthNum - 1]}`;

      return {
        date: dateStr,
        label: formattedLabel,
        ingresos: dailySum
      };
    });
  }, [orders]);

  // CHART DATA: Top beats by revenue
  const topBeatsRevenueData = useMemo(() => {
    const producerOrders = (orders || []).filter(o => 
      (o.producerId === 'p2' || o.producerId === 'carlos_producer') &&
      (o.status === 'verified' || o.status === 'approved')
    );

    const revenueMap: Record<string, { title: string; total: number }> = {};

    // Initialize with producer beats
    myBeats.forEach(b => {
      revenueMap[b.id] = { title: b.title, total: 0 };
    });

    // Populate with actual sales
    producerOrders.forEach(o => {
      const beatId = o.beatId;
      let title = o.beatTitle;

      const matchingBeat = myBeats.find(b => b.id === beatId);
      if (matchingBeat) {
        title = matchingBeat.title;
      }

      let amountInCUP = o.amount;
      if (o.currency === 'MLC' || o.currency === 'USDT' || o.currency === 'USD') {
        amountInCUP = o.amount * 350;
      }

      if (revenueMap[beatId]) {
        revenueMap[beatId].total += amountInCUP;
      } else {
        revenueMap[beatId] = { title, total: amountInCUP };
      }
    });

    return Object.entries(revenueMap)
      .map(([id, info]) => ({
        id,
        name: info.title.length > 15 ? `${info.title.substring(0, 12)}...` : info.title,
        fullTitle: info.title,
        ingresos: info.total
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 8);
  }, [myBeats, orders]);

  // CHART DATA: Conversion Funnel (Plays -> Downloads -> Sales)
  const conversionFunnelData = useMemo(() => {
    const plays = myBeats.reduce((sum, b) => sum + (b.plays || 0), 0) || 842100;
    const downloads = myBeats.reduce((sum, b) => sum + (b.downloads || 0), 0) || 24700;
    
    const producerOrders = (orders || []).filter(o => 
      (o.producerId === 'p2' || o.producerId === 'carlos_producer') &&
      (o.status === 'verified' || o.status === 'approved')
    );
    const salesCount = producerOrders.length || 3;

    const pctDownloads = ((downloads / plays) * 100).toFixed(1);
    const pctSales = ((salesCount / downloads) * 100).toFixed(2);
    const pctOverall = ((salesCount / plays) * 100).toFixed(4);

    return [
      { 
        stage: '1. Reproducciones', 
        visualVal: 100, 
        realVal: plays, 
        info: `${plays.toLocaleString()} plays`, 
        convText: 'Punto de Partida (100%)',
        color: '#534AB7' 
      },
      { 
        stage: '2. Descargas', 
        visualVal: 60, 
        realVal: downloads, 
        info: `${downloads.toLocaleString()} descargas`, 
        convText: `${pctDownloads}% conv. de reproducciones`,
        color: '#7F77DD' 
      },
      { 
        stage: '3. Ventas', 
        visualVal: 25, 
        realVal: salesCount, 
        info: `${salesCount.toLocaleString()} compras`, 
        convText: `${pctSales}% conv. de descargas`,
        color: '#EF9F27' 
      }
    ];
  }, [myBeats, orders]);

  const handleRefreshAnalytics = () => {
    addToast('Métricas y telemetría de tránsito actualizadas al instante', 'success');
  };

  if (isLoading) {
    return <DashboardSkeleton variant="producer" />;
  }

  if (!hasAccess) {
    return (
      <div className="space-y-8 text-left bg-brand-bg text-white p-5 md:p-8 rounded-3xl border border-brand-border/40 shadow-2xl min-h-[90vh] transition-all">
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-brand-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7F77DD]">Módulo Estadístico Protegido</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
              Analítica y Métricas 📊
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Analiza el tráfico geográfico detallado por provincias de Cuba, tendencias de reproducción y oyentes activos en tu perfil de productor.
            </p>
          </div>
        </div>

        {/* Locked Feature Showcase Panel */}
        <div className="relative p-8 md:p-12 rounded-3xl border border-brand-border/40 bg-brand-surface/30 overflow-hidden flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-12 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#534AB7]/5 via-transparent to-transparent opacity-50"></div>
          
          {/* Animated decorative graphics */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/30 flex items-center justify-center mb-6 text-[#7F77DD] shadow-lg animate-pulse">
            <Lock size={36} className="text-[#7F77DD]" />
          </div>

          <h3 className="relative z-10 text-xl md:text-2xl font-black tracking-tight text-white max-w-lg leading-tight">
            Desbloquea el Análisis Geográfico y de Oyentes en Tiempo Real 🚀
          </h3>
          
          <p className="relative z-10 text-xs md:text-sm text-gray-400 mt-3 max-w-xl leading-relaxed">
            Tu plan actual (<strong>Plan {user?.plan || 'Gratis'}</strong>) no incluye el acceso a estadísticas avanzadas. Actualiza a los planes <strong>Pro</strong> o <strong>Elite</strong> para conocer dónde se escuchan tus instrumentales en Cuba, los géneros más exitosos y optimizar tus ventas de beats.
          </p>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
            <div className="p-4 bg-brand-surface/60 border border-brand-border/30 rounded-2xl text-left flex gap-3 items-start">
              <span className="p-1.5 rounded-lg bg-indigo-950/30 text-indigo-400 font-bold border border-indigo-900/25">📍</span>
              <div>
                <strong className="text-xs text-slate-100 block font-bold">Distribución Provincial</strong>
                <span className="text-[11px] text-gray-400 block mt-0.5">Visitas, compras y reproducciones filtradas por cada provincia de Cuba.</span>
              </div>
            </div>
            
            <div className="p-4 bg-brand-surface/60 border border-brand-border/30 rounded-2xl text-left flex gap-3 items-start">
              <span className="p-1.5 rounded-lg bg-indigo-950/30 text-indigo-400 font-bold border border-indigo-900/25">📈</span>
              <div>
                <strong className="text-xs text-slate-100 block font-bold">Tendencias Históricas</strong>
                <span className="text-[11px] text-gray-400 block mt-0.5">Gráficos interactivos semanales de descargas, audiciones y me gustas.</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 mt-10 w-full justify-center">
            <Button
              variant="primary"
              onClick={() => navigateTo('/producer/plans')}
              className="text-xs font-black tracking-wide uppercase px-6 py-3 shadow-md gap-1.5"
            >
              Ver Planes de Suscripción <ArrowUpRight size={14} />
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigateTo('/producer/beats')}
              className="text-xs font-bold px-6 py-3"
            >
              Volver a Mis Beats
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left bg-brand-bg text-white p-5 md:p-8 rounded-3xl border border-brand-border/40 shadow-2xl min-h-[90vh] transition-all">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7F77DD]">Módulo Estadístico en Alta Resolución</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Analítica y Métricas 📊
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Analiza el tráfico geográfico detallado por provincias de Cuba, tendencias de reproducción y oyentes activos en tu perfil de productor.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-center">
          <button 
            onClick={handleRefreshAnalytics}
            className="p-2.5 bg-brand-surface hover:bg-brand-card text-gray-300 border border-brand-border rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Sincronizar Datos"
          >
            <RefreshCw size={13} className="animate-spin-slow hover:text-[#7F77DD]" />
            Refrescar Live
          </button>
        </div>
      </div>

      {/* Top micro summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Total Audiciones</span>
            <PlayCircle size={15} className="text-[#7F77DD]" />
          </div>
          <h4 className="text-xl font-bold font-mono text-white">{totalPlays.toLocaleString()}</h4>
          <span className="text-[9.5px] text-emerald-400">Pistas reproducidas en CubaBeats</span>
        </div>
        
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Procedencia Líder</span>
            <MapPin size={15} className="text-amber-500" />
          </div>
          <h4 className="text-xl font-bold text-white">La Habana</h4>
          <span className="text-[9.5px] text-gray-400">5,412 visitas registradas</span>
        </div>

        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">Género Más Demandado</span>
            <Music size={15} className="text-cyan-400" />
          </div>
          <h4 className="text-xl font-bold text-white">Reggaetón Latino</h4>
          <span className="text-[9.5px] text-cyan-300">Dominando tendencias nacionales</span>
        </div>
      </div>

      {/* DETAILED RESPONSIVE CHARTS - Large layouts for proper spacing */}
      <div className="space-y-6">
        
        {/* Chart row 1: Profile visits and audit trend (FULL AREA CHART FOR ULTIMATE READABILITY) */}
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-brand-border/20 pb-3">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Comportamiento Semanal</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Eye size={16} className="text-indigo-400" /> Tránsito Historizado en Perfil Studio
              </h3>
            </div>
            <span className="text-[10px] bg-brand-bg px-2.5 py-1 rounded-lg border border-brand-border text-gray-400 font-semibold">
              Actualizado: En Vivo
            </span>
          </div>

          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profileViewsWeeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="visitasColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#534AB7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#534AB7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="auditoresColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF9F27" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF9F27" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={9.5} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.25)', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                />
                <Legend verticalAlign="top" height={32} iconSize={11} wrapperStyle={{ fontSize: '11px', color: '#ccc' }} />
                <Area type="monotone" name="Visitas Totales" dataKey="visitas" stroke="#7F77DD" strokeWidth={2.5} fillOpacity={1} fill="url(#visitasColorGrad)" />
                <Area type="monotone" name="Oyentes Únicos (Artistas)" dataKey="auditores" stroke="#EF9F27" strokeWidth={2} fillOpacity={1} fill="url(#auditoresColorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10.5px] text-gray-400 text-left pt-2 leading-relaxed">
            💡 <strong>Análisis:</strong> El incremento los fines de semana refleja de forma directa el lanzamiento de nuevas campañas de catálogo. Las visitas se disparan un 145% los sábados por la tarde.
          </p>
        </div>

        {/* Chart row 2: Double Column Breakdown for Province Reach & Beats Plays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Geográfico panel (Visits by Cuba Province) */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-[#7F77DD]/25 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border/30 pb-3 flex-wrap gap-2">
              <div className="text-left">
                <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Alcance Geográfico Cubano</span>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} className="text-[#7F77DD]" /> {selectedProvinceId === 'all' ? 'Seguimiento por Provincias' : `Provincia: ${selectedProvince?.province}`}
                </h4>
              </div>
              
              <select
                value={selectedProvinceId}
                onChange={(e) => {
                  setSelectedProvinceId(e.target.value);
                  if (e.target.value !== 'all') {
                    const prov = provincesDetailData.find(p => p.id === e.target.value);
                    if (prov) addToast(`Análisis geográfico enfocado en ${prov.province}`, 'info');
                  } else {
                    addToast('Comparativa nacional de todas las provincias cargada', 'info');
                  }
                }}
                className="bg-brand-bg hover:bg-brand-card text-white border border-brand-border/40 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]/20 cursor-pointer text-left focus:bg-brand-surface"
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
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={provinceVisitsData} 
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" horizontal={true} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis type="category" dataKey="province" stroke="rgba(255,255,255,0.6)" fontSize={9.5} width={90} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
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
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={selectedProvince?.municipios} 
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" horizontal={true} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={9.5} width={90} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                      labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="visitas" fill={selectedProvince?.color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="space-y-2 pt-2 border-t border-brand-border/20">
              {selectedProvinceId !== 'all' && selectedProvince ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-left bg-brand-bg/60 p-3 rounded-xl border border-brand-border/20">
                    <div>
                      <span className="text-[8px] tracking-wider text-gray-400 block uppercase font-bold">Artistas Locales</span>
                      <span className="text-xs font-extrabold text-white block mt-0.5">{selectedProvince.activeClients} cuentas</span>
                    </div>
                    <div>
                      <span className="text-[8px] tracking-wider text-gray-400 block uppercase font-bold">Género Popular</span>
                      <span className="text-xs font-extrabold text-[#7F77DD] block mt-0.5 truncate" title={selectedProvince.favGenre}>{selectedProvince.favGenre}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs bg-brand-bg/30 px-3 py-2 rounded-lg border border-brand-border/10">
                    <span className="text-gray-400">Total Tránsito Directo:</span>
                    <span className="font-mono font-bold text-emerald-400">+{selectedProvince.visitas.toLocaleString()} visitas</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProvinceId('all');
                      addToast('Filtro nacional de Cuba restaurado', 'info');
                    }}
                    className="w-full text-center text-xs font-semibold text-[#7F77DD] hover:bg-[#534AB7]/10 py-2 rounded-xl border border-[#534AB7]/25 transition-all cursor-pointer"
                  >
                    ← Volver a Comparativa Nacional
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-brand-bg/40 rounded-xl text-center text-[10.5px] text-[#7F77DD] border border-brand-border/10 leading-snug">
                    📌 <strong>Sugerencia de Producción:</strong> Los cantantes de <strong className="text-white">La Habana</strong> y <strong className="text-white">Santiago</strong> lideran la adquisición de pistas. Enfoca tus pautas de marketing en estos territorios para optimizar ventas.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plays per Beat (BAR CHART) */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border/30 pb-3">
              <div className="text-left">
                <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-cyan-400 block">Consumo de Catálogo</span>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Music size={14} className="text-cyan-400" /> Reproducciones por Pista Individual
                </h4>
              </div>
              <span className="text-[10px] text-gray-400 bg-brand-bg p-1 px-2.5 rounded-lg border border-brand-border">
                Beats: <strong className="font-mono">{playsPerBeatData.length}</strong>
              </span>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playsPerBeatData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} height={24} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9.5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '11px', fontSize: '11px' }}
                    labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="reproducciones" fill="#7F77DD" radius={[4, 4, 0, 0]}>
                    {playsPerBeatData.map((entry, index) => (
                      <Cell key={`cell-playback-${index}`} fill={index === 1 ? '#EF9F27' : (index % 2 === 0 ? '#534AB7' : '#3B82F6')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-cyan-950/20 rounded-xl border border-cyan-500/10 text-xs text-cyan-300 leading-snug">
              🚀 <strong>Éxito Viral:</strong> "Malecón Sunset" encabeza tus estadísticas de escucha con una tasa de retención superior al 78% en CubaBeats.
            </div>
          </div>

        </div>

        {/* 3 NEW PREMIUM CHARTS FOR RENDIMIENTO Y VENTAS */}
        
        {/* Chart row 3: Revenue over time (Line / Area Chart) */}
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-brand-border/20 pb-3">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Rendimiento Financiero</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <DollarSign size={16} className="text-emerald-400" /> Ingresos por Período (Últimos 30 días)
              </h3>
            </div>
            <span className="text-[10px] bg-brand-bg px-2.5 py-1 rounded-lg border border-brand-border text-gray-400 font-semibold">
              Solo Fondos Verificados/Aprobados
            </span>
          </div>

          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="ingresosColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#7F77DD" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={9.5} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9.5} unit=" CUP" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.25)', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()} CUP`, 'Ingresos']}
                />
                <Area type="monotone" name="Ingresos Diarios" dataKey="ingresos" stroke="#7F77DD" strokeWidth={2.5} fillOpacity={1} fill="url(#ingresosColorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10.5px] text-gray-400 text-left pt-2 leading-relaxed">
            💡 <strong>Análisis de Ingresos:</strong> Este gráfico computa la suma total facturada diariamente en CUP (convirtiendo pagos en MLC/USDT a la tasa de cambio de la plataforma de $350 CUP). Representa únicamente cobros reales aprobados por ti o confirmados de manera automatizada.
          </p>
        </div>

        {/* Chart row 4: Double Column Breakdown for Top Beats Revenue & Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Beats by Revenue Panel */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border/30 pb-3">
              <div className="text-left">
                <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Éxito en Ventas</span>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <BarChart3 size={14} className="text-[#7F77DD]" /> Top Beats por Ingresos Generados
                </h4>
              </div>
              <span className="text-[10px] text-gray-400 bg-brand-bg p-1 px-2.5 rounded-lg border border-brand-border">
                Máximo: 8 Beats
              </span>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topBeatsRevenueData} 
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" horizontal={true} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} unit=" CUP" />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={9.5} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    labelStyle={{ color: '#7F77DD', fontWeight: 'bold' }} 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()} CUP`, 'Total Facturado']}
                  />
                  <Bar dataKey="ingresos" fill="#534AB7" radius={[0, 4, 4, 0]}>
                    {topBeatsRevenueData.map((entry, index) => (
                      <Cell 
                        key={`cell-revenue-${index}`} 
                        fill={index === 0 ? '#EF9F27' : (index % 2 === 0 ? '#7F77DD' : '#534AB7')} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-3 bg-brand-bg/40 rounded-xl border border-brand-border/10 text-[10.5px] text-gray-400 leading-snug">
              ⭐ <strong>Rendimiento de Catálogo:</strong> Este gráfico ordena tus instrumentales según las ganancias reales que han aportado, cruzando el ID de cada beat con tus ventas verificadas de licencias básicas y exclusivas.
            </div>
          </div>

          {/* Conversion Funnel Panel */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border/30 pb-3">
              <div className="text-left">
                <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#EF9F27] block">Embudo de Conversión</span>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Layers size={14} className="text-[#EF9F27]" /> Embudo de Conversión del Catálogo
                </h4>
              </div>
              <span className="text-[10px] text-gray-400 bg-brand-bg p-1 px-2.5 rounded-lg border border-brand-border">
                Audiencia → Clientes
              </span>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={conversionFunnelData} 
                  layout="vertical"
                  margin={{ top: 15, right: 30, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.06)" horizontal={true} />
                  <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={9} unit="%" />
                  <YAxis type="category" dataKey="stage" stroke="rgba(255,255,255,0.6)" fontSize={9.5} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#13131F', borderColor: 'rgba(127,119,221,0.2)', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    labelStyle={{ color: '#EF9F27', fontWeight: 'bold' }}
                    formatter={(value: any, name: any, props: any) => [
                      `${props.payload.info}`, 
                      `${props.payload.convText}`
                    ]}
                  />
                  <Bar dataKey="visualVal" radius={[0, 4, 4, 0]}>
                    {conversionFunnelData.map((entry, index) => (
                      <Cell 
                        key={`cell-funnel-${index}`} 
                        fill={entry.color} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/10 text-xs text-amber-300 leading-snug">
              📈 <strong>Embudo Comercial:</strong> Muestra la pérdida de retención agregada de todos tus beats. Te permite identificar si necesitas optimizar el interés de escucha (plays) o incentivar la decisión final de compra (descargas a ventas).
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
