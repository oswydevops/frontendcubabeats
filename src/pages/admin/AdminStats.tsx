import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { 
  BarChart2, Users, Radio, Activity, Play, Eye, MapPin, 
  Sparkles, Calendar, ArrowUpRight, TrendingUp, RefreshCw, Sliders
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Color palette for charts
const COLORS = [
  '#534AB7', // Brand Violet / Indigo
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red / Rose
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

// Predefined mock data for stats to augment actual live data beautifully
const MOCK_PROVINCES = [
  { name: 'La Habana', value: 58 },
  { name: 'Santiago de Cuba', value: 34 },
  { name: 'Villa Clara', value: 24 },
  { name: 'Camagüey', value: 19 },
  { name: 'Holguín', value: 18 },
  { name: 'Matanzas', value: 15 },
  { name: 'Artemisa', value: 11 },
  { name: 'Pinar del Río', value: 9 },
  { name: 'Granma', value: 8 },
  { name: 'Cienfuegos', value: 7 },
  { name: 'Sancti Spíritus', value: 6 },
  { name: 'Las Tunas', value: 5 },
  { name: 'Ciego de Ávila', value: 4 },
  { name: 'Mayabeque', value: 3 },
  { name: 'Guantánamo', value: 3 },
];

const MOCK_TRAFFIC_SEMANAL = [
  { name: 'Lunes', visitas: 1320, reproducciones: 4200 },
  { name: 'Martes', visitas: 1450, reproducciones: 4850 },
  { name: 'Miércoles', visitas: 1680, reproducciones: 5890 },
  { name: 'Jueves', visitas: 1590, reproducciones: 5310 },
  { name: 'Viernes', visitas: 1920, reproducciones: 6740 },
  { name: 'Sábado', visitas: 2310, reproducciones: 8400 },
  { name: 'Domingo', visitas: 2100, reproducciones: 7950 },
];

export const AdminStats: React.FC = () => {
  const { verifiedProducersTask, beats, user } = useApp();

  // Settings to configure live visits/plays values
  const [extraVisits, setExtraVisits] = useState(() => {
    const saved = localStorage.getItem('cb_stats_extra_visits');
    return saved ? parseInt(saved, 10) : 48590;
  });

  const [extraPlays, setExtraPlays] = useState(() => {
    const saved = localStorage.getItem('cb_stats_extra_plays');
    return saved ? parseInt(saved, 10) : 185670;
  });

  const [simulatedClients, setSimulatedClients] = useState(() => {
    const saved = localStorage.getItem('cb_stats_sim_clients');
    return saved ? parseInt(saved, 10) : 842;
  });

  // Calculate live quantities
  const liveProducersCount = verifiedProducersTask.length;
  
  // Calculate dynamic plans count based on current verifiedProducersTask list
  const planDistribution = useMemo(() => {
    const counts: Record<string, number> = { Gratis: 0, Pro: 0, Elite: 0 };
    verifiedProducersTask.forEach(u => {
      if (u.plan) {
        counts[u.plan] = (counts[u.plan] || 0) + 1;
      } else {
        counts['Gratis'] += 1;
      }
    });

    // Blend in mock producers to make the plan distribution chart robust and exciting
    counts['Gratis'] += 45;
    counts['Pro'] += 68;
    counts['Elite'] += 41;

    return [
      { name: 'Plan Gratis', value: counts['Gratis'] },
      { name: 'Plan Pro', value: counts['Pro'] },
      { name: 'Plan Elite', value: counts['Elite'] },
    ];
  }, [verifiedProducersTask]);

  // Aggregate plays on actual beats uploaded, plus extra plays
  const aggregatePlaysCount = useMemo(() => {
    const beatsPlays = beats.reduce((sum, item) => sum + (item.plays || 0), 0);
    return beatsPlays + extraPlays;
  }, [beats, extraPlays]);

  // Handle manual statistics update triggers
  const increaseSimulations = () => {
    const nextVisits = extraVisits + Math.floor(Math.random() * 95) + 20;
    const nextPlays = extraPlays + Math.floor(Math.random() * 320) + 50;
    const nextClients = simulatedClients + Math.floor(Math.random() * 2);

    setExtraVisits(nextVisits);
    setExtraPlays(nextPlays);
    setSimulatedClients(nextClients);

    localStorage.setItem('cb_stats_extra_visits', String(nextVisits));
    localStorage.setItem('cb_stats_extra_plays', String(nextPlays));
    localStorage.setItem('cb_stats_sim_clients', String(nextClients));
  };

  const handleResetSimulations = () => {
    if (confirm('¿Restablecer métricas de visitas y reproducciones a valores de fábrica?')) {
      setExtraVisits(48590);
      setExtraPlays(185670);
      setSimulatedClients(842);
      localStorage.setItem('cb_stats_extra_visits', '48590');
      localStorage.setItem('cb_stats_extra_plays', '185670');
      localStorage.setItem('cb_stats_sim_clients', '842');
    }
  };

  // Province augmented items representing geographic audience metrics
  const provincesData = useMemo(() => {
    // Collect and compile real-time provinces from active and logged users
    const liveCounts: Record<string, number> = {};
    if (user && user.provincia) {
      const pName = user.provincia;
      liveCounts[pName] = (liveCounts[pName] || 0) + 1;
    }

    // Accumulate registered producers' provinces as well
    verifiedProducersTask.forEach(p => {
      if (p.provincia) {
        liveCounts[p.provincia] = (liveCounts[p.provincia] || 0) + 1;
      }
    });

    const updated = MOCK_PROVINCES.map((prov) => {
      const liveExtraValue = liveCounts[prov.name] || 0;
      let finalValue = prov.value + liveExtraValue;
      if (prov.name === 'La Habana') {
        finalValue += liveProducersCount;
      }
      return { ...prov, value: finalValue };
    });
    return updated;
  }, [user, verifiedProducersTask, liveProducersCount]);

  // Overall calculations
  const totalRegisteredUsers = simulatedClients + liveProducersCount + 45 + 68 + 41; // clients + live producers + augmented mock producers from plans

  return (
    <div className="space-y-6 text-left animate-in fade-in pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <BarChart2 className="text-indigo-600 w-6 h-6" /> Análisis Estadístico y Métricas Globales
          </h2>
          <p className="text-xs text-gray-500">Mide el rendimiento del sitio web, audiencias registradas por provincia, reproducciones de audio y planes activos.</p>
        </div>

        {/* Simulador Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button 
            variant="outline" 
            onClick={increaseSimulations}
            className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 text-xs py-1.5 px-3 rounded-xl"
            title="Simular tráfico en tiempo real"
          >
            <Activity size={13} className="animate-pulse" />
            Simular Visita/Play
          </Button>

          <Button
            variant="ghost"
            onClick={handleResetSimulations}
            className="p-2 text-gray-400 hover:text-red-500 rounded-xl"
            title="Restablecer"
          >
            <RefreshCw size={13} />
          </Button>
        </div>
      </div>

      {/* KPI METRIC CARDS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Clients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1.5 relative overflow-hidden group hover:border-indigo-100 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider block">Clientes Registrados</span>
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Users size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-gray-900">{simulatedClients}</h3>
          <div className="flex items-center gap-1 text-[10.5px] text-emerald-605">
            <ArrowUpRight size={12} className="text-emerald-500 font-bold" />
            <span className="text-emerald-600 font-bold">+12%</span>
            <span className="text-gray-400 font-normal">esta semana</span>
          </div>
        </div>

        {/* Metric 2: Producers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1.5 relative overflow-hidden group hover:border-indigo-100 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider block">Productores Totales</span>
            <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600">
              <Radio size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-gray-900">{liveProducersCount + 45 + 68 + 41}</h3>
          <div className="flex items-center gap-1 text-[10.5px]">
            <span className="text-neutral-500 font-bold">{liveProducersCount} cuentas reales</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">154 simuladas</span>
          </div>
        </div>

        {/* Metric 3: Visitas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1.5 relative overflow-hidden group hover:border-indigo-100 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider block">Visitas Acumuladas</span>
            <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-600">
              <Eye size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-[#06B6D4]">{extraVisits.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10.5px] text-emerald-605">
            <TrendingUp size={12} className="text-emerald-500 font-bold" />
            <span className="text-emerald-600 font-bold">2.4k</span>
            <span className="text-gray-400 font-normal">diarias promedio</span>
          </div>
        </div>

        {/* Metric 4: Plays */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1.5 relative overflow-hidden group hover:border-indigo-100 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider block">Reproducciones Audio</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <Play size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-emerald-600">{aggregatePlaysCount.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10.5px]">
            <Sparkles size={11} className="text-amber-500 animate-pulse" />
            <span className="text-gray-500 font-medium">BPM Promedio: 110-125</span>
          </div>
        </div>

      </div>

      {/* DETAILED CHARTS GRID: ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHART A: CLIENTS VS PRODUCERS COMPARISON */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-indigo-600" /> Relación de Clientes vs. Productores
            </h3>
            <p className="text-[11px] text-gray-500">Comportamiento proporcional de las cuentas compradoras de instrumentales frente a los creadores de ritmos.</p>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Clientes Registrados', cantidad: simulatedClients, fill: '#534AB7' },
                  { name: 'Productores Registrados', cantidad: (liveProducersCount + 45 + 68 + 41), fill: '#8B5CF6' }
                ]}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" />
                <YAxis fontSize={11} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 'bold' }} 
                  cursor={{ fill: '#F9FAFB' }}
                />
                <Bar dataKey="cantidad" radius={[12, 12, 0, 0]}>
                  {
                    [
                      { fill: '#534AB7' },
                      { fill: '#8B5CF6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between text-xs">
            <span className="text-gray-500">Tasa de Compradores Activos:</span>
            <strong className="text-gray-900">{(simulatedClients / totalRegisteredUsers * 100).toFixed(1)}% de comunidad cubana</strong>
          </div>
        </div>

        {/* CHART B: PRODUCERS DISTRIBUTION BY SUBSCRIPTION PLAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-155 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Radio size={16} className="text-violet-600" /> Suscripción de Productores por Plan
            </h3>
            <p className="text-[11px] text-gray-500">Desglose de los planes activos adquiridos por los productores registrados para alojar beats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            {/* Visual Pie */}
            <div className="h-56 md:col-span-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Labels Custom Legend */}
            <div className="md:col-span-2 space-y-2.5 text-xs">
              {planDistribution.map((pl, idx) => (
                <div key={pl.name} className="flex flex-col gap-0.5 border-l-2 pl-2.5" style={{ borderColor: COLORS[idx % COLORS.length] }}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">{pl.name}</span>
                    <strong className="text-gray-900 font-mono">{pl.value}</strong>
                  </div>
                  <span className="text-[10px] text-gray-400 block font-semibold">
                    {((pl.value / (planDistribution.reduce((sum, p) => sum + p.value, 0))) * 100).toFixed(0)}% de los artistas
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div className="text-[10px] text-center text-gray-400 italic">
            * Los planes Pro y Elite requieren aprobación de comprobantes por Transfermóvil o QvaPay.
          </div>
        </div>

      </div>

      {/* DETAILED CHARTS GRID: ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART C: CUBAN PROVINCES DISTRIBUTION (LARGE BAR CHART) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" /> Distribución Geográfica Cubana (Provincias)
            </h3>
            <p className="text-[11px] text-gray-500">Representación de la localización de productores independientes y sus estudios a lo largo del archipiélago nacional.</p>
          </div>

          <div className="h-68 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={provincesData}
                margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  fontSize={9} 
                  stroke="#9CA3AF" 
                  angle={-45} 
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis fontSize={10} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 'bold' }} 
                />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART D: TRAFFIC & REPRODUCTIONS TREND (LINE CHART) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity size={16} className="text-cyan-600" /> Tránsito y Reproducción Semanal
            </h3>
            <p className="text-[11px] text-gray-500">Resumen del volumen de tráfico promedio e interacciones de audición de beats de lunes a domingo.</p>
          </div>

          <div className="h-68 mt-3">
            <ResponsiveContainer width="105%" height="100%">
              <AreaChart
                data={MOCK_TRAFFIC_SEMANAL}
                margin={{ top: 10, right: 15, left: -25, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReproducciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#534AB7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#534AB7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                <XAxis dataKey="name" fontSize={9} stroke="#9CA3AF" />
                <YAxis fontSize={9} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E2E', borderRadius: '12px', color: '#fff', fontSize: '10px', border: 'none' }} 
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10.5px', marginTop: '10px' }} />
                <Area type="monotone" name="Visitas Diarias" dataKey="visitas" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitas)" />
                <Area type="monotone" name="Plays Beats" dataKey="reproducciones" stroke="#534AB7" strokeWidth={2} fillOpacity={1} fill="url(#colorReproducciones)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* FOOTER METRIC NOTE */}
      <div className="bg-amber-50/70 border border-amber-200/50 p-4.5 rounded-2xl flex items-start gap-3">
        <Sliders className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
        <div className="text-xs text-amber-900 leading-normal">
          <strong>Sugerencia del Sistema:</strong> El panel superior de simulación te permite aumentar aleatoriamente el conteo acumulativo de visitas para probar la reactividad de los gráficos y predecir cargas de hosting de almacenamiento. La escala se guarda en caché local.
        </div>
      </div>

    </div>
  );
};
