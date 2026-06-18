import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Music, Receipt, Activity, ShieldCheck, Landmark, Check, 
  Trash2, XCircle, AlertCircle, Eye, RefreshCw, BarChart3, TrendingUp, MapPin, Tag
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    beats, orders, verifiedProducersTask, approveProducer, rejectProducer, addToast 
  } = useApp();

  const [selectedVerificationProducer, setSelectedVerificationProducer] = useState<any | null>(null);

  // --- STATS DATASETS DEFINITIONS ---
  const userTypeData = useMemo(() => [
    { name: 'Clientes Oyentes', value: 1420 },
    { name: 'Productores Registrados', value: verifiedProducersTask.length || 420 }
  ], [verifiedProducersTask.length]);

  const planDistributionData = useMemo(() => {
    const gratis = verifiedProducersTask.filter(p => !p.plan || p.plan === 'Gratis').length + 210;
    const pro = verifiedProducersTask.filter(p => p.plan === 'Pro').length + 150;
    const elite = verifiedProducersTask.filter(p => p.plan === 'Elite').length + 65;
    return [
      { name: 'Plan Gratis', value: gratis, color: '#94A3B8' },
      { name: 'Plan Pro', value: pro, color: '#7F77DD' },
      { name: 'Plan Elite', value: elite, color: '#10B981' }
    ];
  }, [verifiedProducersTask]);

  const provincesDistributionData = [
    { name: 'La Habana', value: 184, fill: '#7F77DD' },
    { name: 'Santiago de Cuba', value: 87, fill: '#38BDF8' },
    { name: 'Villa Clara', value: 45, fill: '#10B981' },
    { name: 'Holguín', value: 41, fill: '#F59E0B' },
    { name: 'Camagüey', value: 35, fill: '#6366F1' },
    { name: 'Matanzas', value: 24, fill: '#EC4899' },
    { name: 'Pinar de Río', value: 14, fill: '#14B8A6' }
  ];

  const trafficGrowthData = [
    { month: 'Ene', visitas: 12400, reproducciones: 38200 },
    { month: 'Feb', visitas: 14800, reproducciones: 49100 },
    { month: 'Mar', visitas: 19100, reproducciones: 68600 },
    { month: 'Abr', visitas: 25400, reproducciones: 89400 },
    { month: 'May', visitas: 32000, reproducciones: 104500 },
    { month: 'Jun', visitas: 42100, reproducciones: 148200 }
  ];

  const COLORS_USER_TYPE = ['#38BDF8', '#7F77DD'];
  const COLORS_PLANS = ['#94A3B8', '#7F77DD', '#10B981'];

  // Filter producers awaiting verification (where verified: false)
  const pendingProducers = useMemo(() => {
    return verifiedProducersTask.filter(p => !p.verified);
  }, [verifiedProducersTask]);

  // Filter approved producers
  const approvedProducersCount = useMemo(() => {
    return verifiedProducersTask.filter(p => p.verified).length;
  }, [verifiedProducersTask]);

  const totalSalesCUP = useMemo(() => {
    return orders
      .filter(o => o.status === 'approved')
      .reduce((acc, o) => acc + o.amount, 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending').length;
  }, [orders]);

  const handleOpenKycDocDetail = (producer: any) => {
    setSelectedVerificationProducer(producer);
  };

  const handleQuickApprove = (pId: string) => {
    approveProducer(pId);
    setSelectedVerificationProducer(null);
  };

  const handleQuickReject = (pId: string) => {
    rejectProducer(pId);
    setSelectedVerificationProducer(null);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-brand-border/25 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#7F77DD]" /> Panel Administrativo CubaBeats
          </h2>
          <p className="text-xs text-gray-400">Métricas y cola de aprobación de seguridad para productores cubanos.</p>
        </div>

        <button 
          onClick={() => addToast('Métricas actualizadas en tiempo real', 'info')}
          className="p-2 bg-[#534AB7]/20 text-[#7F77DD] rounded-xl hover:bg-[#534AB7]/30 cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw size={14} />
          Refrescar Datos
        </button>
      </div>

      {/* KPI blocks global */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Facturación Global</span>
          <h3 className="text-xl md:text-2xl font-bold font-mono text-[#7F77DD]">${(totalSalesCUP + 420000).toLocaleString()} CUP</h3>
          <span className="text-[10.5px] text-emerald-400 font-bold block">● Pasarelas operativas</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Total Beats Activos</span>
          <h3 className="text-xl md:text-2xl font-bold font-mono text-white">{beats.length} Instrumentales</h3>
          <span className="text-[10.5px] text-gray-450 block">Descargables MP3 / WAV</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Productores Registrados</span>
          <h3 className="text-xl md:text-2xl font-bold font-mono text-white">{verifiedProducersTask.length} Creadores</h3>
          <span className="text-[10.5px] text-gray-450 block">Miembros: {approvedProducersCount} autorizados</span>
        </div>

      </div>

      {/* SECCIÓN DE ESTADÍSTICAS Y GRÁFICOS GLOBALES */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-1.5">
          <BarChart3 className="text-[#8D84F7]" size={20} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Estadísticas y Métricas Globales de la Plataforma</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gráfico 1: Clientes Oyentes vs Productores Registrados */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Users size={14} className="text-[#38BDF8]" /> Distribución de Usuarios Registrados
              </span>
              <span className="text-[10px] bg-sky-500/10 text-[#38BDF8] border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">Total: 1,840</span>
            </div>
            
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_USER_TYPE[index % COLORS_USER_TYPE.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127, 119, 221, 0.4)', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10.5px', color: '#94A3B8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Plan de Suscripción de los Productores */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Tag size={14} className="text-[#7F77DD]" /> Planes de Suscripción Activos (Membresías)
              </span>
              <span className="text-[10px] bg-indigo-500/10 text-[#7F77DD] border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">Monitoreo Real</span>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={75}
                    dataKey="value"
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PLANS[index % COLORS_PLANS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127, 119, 221, 0.4)', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10.5px', color: '#94A3B8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 3: Productores por Provincias de Cuba */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-400" /> Dispersión Territorial de Creadores Cubanos por Provincias
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Cobertura Nacional</span>
            </div>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provincesDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9.5} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9.5} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(12, 185, 129, 0.4)', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    cursor={{ fill: 'rgba(127, 119, 221, 0.05)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                    {provincesDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 4: Cantidad de Visitas vs Cantidad de Reproducciones Total */}
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#7F77DD]" /> Tráfico Web de Visitas vs Reproducción Total de Beats
              </span>
              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#38BDF8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /> Visitas
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#7F77DD]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7F77DD]" /> Reproducciones
                </div>
              </div>
            </div>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9.5} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9.5} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C2E', borderColor: 'rgba(127, 119, 221, 0.4)', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.26}/>
                      <stop offset="95%" stopColor="#7F77DD" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="visitas" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" name="Visitas a la Web" />
                  <Area type="monotone" dataKey="reproducciones" stroke="#7F77DD" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlays)" name="Reproducciones de Beats" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* COLA DE APROBACIÓN PRODUCTORES KYC */}
      <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border/20 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Cola de Verificación de Identidad (KYC)</h3>
        </div>

        {pendingProducers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-xs">No hay solicitudes KYC pendientes de revisión actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border/20 text-gray-400 font-semibold uppercase">
                  <th className="py-2.5">Productor</th>
                  <th className="py-2.5">Contacto</th>
                  <th className="py-2.5">Membresía</th>
                  <th className="py-2.5 text-center">Estatuto</th>
                  <th className="py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/10 text-gray-300">
                {pendingProducers.map((prod) => (
                  <tr key={prod.id} className="hover:bg-brand-card/25 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#534AB7]/20 flex items-center justify-center text-[#7F77DD] font-bold">
                          {prod.artistName?.[0] || prod.name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{prod.artistName || prod.name}</span>
                          <span className="text-[10px] text-gray-500">{prod.instagram || '@sinstudio'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono text-gray-400">{prod.email}</td>

                    <td className="py-3.5">
                      <Badge variant="purple" className="text-[9px] bg-brand-bg/50 text-[#7F77DD]">Plan {prod.plan}</Badge>
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="text-amber-500 font-bold text-[11px] animate-pulse">● Pendiente de Firma ID</span>
                    </td>

                    <td className="py-3.5 text-right whitespace-nowrap space-x-1">
                      <button 
                        onClick={() => handleOpenKycDocDetail(prod)}
                        className="p-1 px-2.5 bg-[#534AB7] text-white rounded-lg font-bold text-[11px] hover:bg-[#433A9B] cursor-pointer transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Revisar Exp.
                      </button>
                      <button 
                        onClick={() => handleQuickApprove(prod.id)}
                        className="p-1 px-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        title="Verificar al instante"
                      >
                        <Check size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL FOR ADMIN TO VERIFY DOCUMENTS */}
      <Modal
        isOpen={!!selectedVerificationProducer}
        onClose={() => setSelectedVerificationProducer(null)}
        title="Expediente KYC de Titularidad"
        themeMode="dark"
        maxWidth="max-w-lg"
      >
        {selectedVerificationProducer && (
          <div className="space-y-5 text-left pt-2 text-xs">
            <div className="space-y-0.5 border-b border-brand-border/20 pb-3">
              <span className="font-bold text-sm block text-white">{selectedVerificationProducer.name}</span>
              <span className="text-gray-400">Solicitado para artistName: {selectedVerificationProducer.artistName || 'Flow'}</span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Documentación Presentada</span>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Front ID mock visual box */}
                <div className="bg-brand-bg border border-brand-border/30 rounded-xl p-4 text-center space-y-1.5 select-none">
                  <span className="font-bold text-gray-300 block text-[10px]">Identidad (Delantera)</span>
                  <div className="w-full h-20 bg-brand-surface/50 rounded-lg flex items-center justify-center text-gray-400 font-mono text-[9px] border border-brand-border/20">
                    [Carné de Identidad]
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Cargado</span>
                </div>

                {/* Back ID mock visual box */}
                <div className="bg-brand-bg border border-brand-border/30 rounded-xl p-4 text-center space-y-1.5 select-none">
                  <span className="font-bold text-gray-300 block text-[10px]">Selfie con ID</span>
                  <div className="w-full h-20 bg-brand-surface/50 rounded-lg flex items-center justify-center text-gray-400 font-mono text-[9px] border border-brand-border/20">
                    [Retrato Rostro]
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Validado</span>
                </div>
              </div>
            </div>

            {/* Actions for Admin on the dossier */}
            <div className="flex gap-2 justify-end pt-4 border-t border-brand-border/20">
              <button
                onClick={() => handleQuickReject(selectedVerificationProducer.id)}
                className="px-4 py-2 border border-brand-accent-red/40 text-brand-accent-red hover:bg-brand-accent-red/5 font-bold rounded-xl cursor-pointer"
              >
                Rechazar Exp.
              </button>
              <button
                onClick={() => handleQuickApprove(selectedVerificationProducer.id)}
                className="px-5 py-2 bg-gradient-to-r from-[#534AB7] to-[#7F77DD] hover:opacity-90 text-white font-bold rounded-xl cursor-pointer shadow-md"
              >
                Aprobar y Verificar Productor
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
