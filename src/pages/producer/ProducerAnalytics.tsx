import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';
import { 
  TrendingUp, MapPin, Eye, RefreshCw, Music, Sparkles, 
  Users, PlayCircle, BarChart3, HelpCircle, Activity, Heart, ArrowUpRight
} from 'lucide-react';

export const ProducerAnalytics: React.FC = () => {
  const { user, beats, navigateTo, addToast } = useApp();
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

  const handleRefreshAnalytics = () => {
    addToast('Métricas y telemetría de tránsito actualizadas al instante', 'success');
  };

  if (isLoading) {
    return <DashboardSkeleton variant="producer" />;
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

      </div>

    </div>
  );
};
